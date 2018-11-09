/**
 * Title: orderConfirm.js
 * Description: 美食节确认预定界面
 * Author: wang.xiaohu
 * Created Date: 14-5-19 下午3:13
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
function orderConfirmPage() {
    var OrderConfirmMgr = {
        orderList: [],
        orderMenuId: "",
        userToken: "",
        fTotal : 0,
        /**
         * 初始化
         */
        initUI: function () {

            var $menuItemList = $("#lst").children("ul");
            $menuItemList.empty();

            OrderConfirmMgr.userToken = localStorage.getItem('USER_TOKEN');//'0027003476NSVJDW';
            OrderConfirmMgr.fTotal = localStorage.getItem('fTotal');
            OrderConfirmMgr.orderMenuId = localStorage.getItem('orderMenuId');
            var strImages = localStorage.getItem('imageList');
            var imageArr = [];
            //2.如果为空则取默认图片
            if (ValidateUtil.isEmpty(strImages)) {
                imageArr.push("img/menu/menu_default.png");
            }
            else {
                var strArr = strImages.split(',');
                for (var i = 0; i < strArr.length; i++) {
                    imageArr.push(GLOBAL.server_url + "images/" + strArr[i]);
                }
            }
            var orderInfo = localStorage.getItem('orderInfo');
            OrderConfirmMgr.orderList = JSON.parse(orderInfo);

            var template = _.template($('#orderConfirm_rowTemplate').html());
            var liList = "";
            $.each(OrderConfirmMgr.orderList, function(i,item){

                liList += template({id:item.id, imgUrl:imageArr[i%imageArr.length], name:item.name, price: item.price, price:item.price,count:item.count});
            });

            $(liList).appendTo($("#lst").children()[0]);
            $("#confirmOrder").on("click", OrderConfirmMgr.submitOrder)

            $("#confirmTotalPrice").html(OrderConfirmMgr.fTotal);

            $("input[type=text]").on("input", function(){
                OrderConfirmMgr.addTotal();    //计算总价格
            });

            $('#btnCancelOrder').click(function(){
                tr("cancel order")
                fish.Dialog.confirm('确定取消此次预定吗？', function(e) {
                    if (e.result) {
                        do_alert('取消成功');
                        fish.Router.navigate('');
                    }
                });
            });

            OrderConfirmMgr.initConcact();
        },
        /**
         * 初始化联系方式
         */
        initConcact: function() {
            var name = localStorage.getItem('USER_NAME')+ "(" + localStorage.getItem('USER_WORK_ID') + ")";
            $('#userName').text(name);
            $('#txtTelephone').val(localStorage.getItem('USER_TELEPHONE'));
        },
        /**
         * 真正向后台提交订单的地方
         */
        submitOrder: function() {
            //1.校验参数
            if (OrderConfirmMgr.orderList.length == 0) {
                return;
            }
            //2.获取参数
            localStorage.setItem('fTotal', OrderConfirmMgr.fTotal);
            localStorage.setItem('orderInfo', JSON.stringify(OrderConfirmMgr.orderList));
            var paramObj = {token:OrderConfirmMgr.userToken,
                orderId:OrderConfirmMgr.orderMenuId,
                orderList:OrderConfirmMgr.orderList};
            //3.发送请求，成功跳转到成功界面
            GLOBAL.async('order', 'addOrder', paramObj, function (data) {
                if (data.rs) {
                  fish.Router.navigate("success");
                }
                else {
                    do_alert(data.error);
                }
            }, function (err) {
                do_alert('预定失败，请稍后尝试！');
            });
        },
        /**
         * 计算总价格的函数
         */
        addTotal: function () {
            OrderConfirmMgr.fTotal = 0;
            OrderConfirmMgr.orderList = [];
            //1.对于选中了的复选项进行遍历
            $("input[type=text]").each(function(){
                var txtQty = $(this).val();
                if (ValidateUtil.isNotEmpty(txtQty) && ValidateUtil.isNumber(txtQty))
                {
                    //获取每一个的数量
                    var iNum = parseInt(txtQty);
                    //获取每一个的单价
                    var fPrice = parseFloat($(this).closest("li").find(".itemPrice").text());                        OrderConfirmMgr.fTotal += iNum * fPrice;

                    //放到orderList中
                    var orderItemId = $(this).closest("li").attr("id");
                    var orderItemName = $(this).closest("li").find(".itemName").text();

                    OrderConfirmMgr.orderList.push({id:orderItemId,name:orderItemName,price:fPrice,count:iNum});
                }
            });
            $("#totalPrice").html(OrderConfirmMgr.fTotal);

            //2. 如果有输入数量的话，才让按钮可点击
            if (OrderConfirmMgr.orderList.length == 0) {
                OrderConfirmMgr.setBtnLoginDisabled(true);//TODO 将按钮给置灰，样式
            }
            else {
                OrderConfirmMgr.setBtnLoginDisabled(false);//TODO 将按钮给置可用;
            }
        },
        /**
         * 是否禁用登录按钮
         * @param isDisable
         */
        setBtnLoginDisabled: function (isDisable) {
            var confirmOrder = $('#confirmOrder');
            confirmOrder.attr('disabled', isDisable);
            if (isDisable) {
                confirmOrder.css('background-color', '#dddddd');//灰色
            } else {
                confirmOrder.css('background-color', '#F97307');//橘黄色
            }
        }
    };

    // 头 + 内容
  var titleOpt = {showBackBtn: true, showMoreBtn: false,title:"龙虾节"};
  var header = HeaderMgr.createTitle(titleOpt);
  var page ='<div class="page">' + header + $('#tpl-orderConfirm').html() + '</div>';
    fish.PageSlider.slidePage($(page), function(){
        OrderConfirmMgr.initUI();
    });
}