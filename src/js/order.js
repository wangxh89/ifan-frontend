/**
 * Title: order.js
 * Description: 定购业务操作
 * Author: wang.xiaohu
 * Created Date: 14-5-19 下午3:13
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
function orderPage() {
    /**
     * 定购业务操作
     */
    var OrderMgr = {
        orderList: [],
        fTotal : 0,
        totalAmount : 0,
        leftAmount : 0,
        saleAmount : 0,
        limit : 4,  // 限额
        fQuantity : 0,  //订购数量
        /**
         * 初始化界面UI
         */
        initUI: function () {
            //1.轮播,
            var strImages = localStorage.getItem('imageList');
            //3.查询口味
            var orderMenuId = localStorage.getItem('orderMenuId');
            var unitName = localStorage.getItem('unitName');
            OrderMgr.qryOrderItemList({omId:orderMenuId},function(resultMsg){
                var orderItemList = resultMsg.list;
                OrderMgr.totalAmount = resultMsg.total;
                OrderMgr.leftAmount = resultMsg.left;
                OrderMgr.limit = resultMsg.limit;
                OrderMgr.saleAmount = parseInt(OrderMgr.totalAmount) -parseInt(OrderMgr.leftAmount);
                OrderMgr.initialize();
                var template = _.template($('#order_rowTemplate').html());
                var liList = "";
                $.each(orderItemList, function(i,item){
                    liList += template({id:item._id, name:item.name, price: item.price, unitName:unitName});
                });

                $(liList).appendTo($("#formOrder").children()[0]);

                $("#btnOrder").on("click", OrderMgr.preOrder);

                //加载页面完全后，统一设置输入文本框

                $(".twojin").click(function() {
                    var ischeck = $(this).prop("checked");
                    if (ischeck) {
                        $(this).closest("li").find(".fourjin").prop("checked",false);
                    }
                    OrderMgr.addTotal();    //计算总价格
                });


                $(".fourjin").click(function() {
                    var ischeck = $(this).prop("checked");
                    if (ischeck) {
                        $(this).closest("li").find(".twojin").prop("checked",false);
                    }
                    OrderMgr.addTotal();    //计算总价格
                });

            });
        },

        initialize: function(){
//            $("#saleInfo").text('已售' + OrderMgr.saleAmount + '斤');
//            $('#remainInfo').text('剩' + OrderMgr.leftAmount + "斤");
        },
        /**
         * 查询口味
         * @param data 参数
         * @param callback
         */
        qryOrderItemList: function (data,callback) {
            var result = null;
            GLOBAL.async('order', 'qryOrderItem', data, function (data) {
                if (data.rs) {
                    result = data.msg;
                    callback(result);
                }
            }, function (err) {
                do_alert('网络异常，请稍后尝试！');
            });
        },

        preOrder: function (e) {
            //1.校验参数
            if (OrderMgr.orderList.length == 0) {
                return;
            }
            //2.如果超过限额，则提示，并返回
            if (OrderMgr.fQuantity > OrderMgr.limit) {
                do_alert("预定数量超过限额(" + OrderMgr.limit + "斤)，请重新选择");
                return;
            }
            //3.获取参数
            //localStorage.setItem('orderMenuId', item._id || '');
            localStorage.setItem('fTotal', OrderMgr.fTotal);
            localStorage.setItem('orderInfo', JSON.stringify(OrderMgr.orderList));
            //4.传给下个页面
            fish.Router.navigate("confirm");
        },

        /**
         * 计算总价格的函数
         */
        addTotal: function () {
            OrderMgr.fTotal = 0;
            OrderMgr.fQuantity = 0;
            OrderMgr.orderList = [];
            //1.对于选中了的复选项进行遍历
            $("input[type=checkbox]").each(function(){

                var ischeck = $(this).prop("checked");
                if (ischeck) {
                    var txtQty = $(this).val();
                    //获取每一个的数量
                    var iNum = parseInt(txtQty);
                    OrderMgr.fQuantity += iNum;
                    //获取每一个的单价
                    var fPrice = parseFloat($(this).closest("li").find(".price").text());
                    OrderMgr.fTotal += iNum * fPrice;
                    //放到orderList中
                    var orderItemId = $(this).closest("li").attr("id");
                    var orderItemName = $(this).closest("li").find(".teateName").text();

                    OrderMgr.orderList.push({id:orderItemId,name:orderItemName,price:fPrice,count:iNum});
                }
            });
            $("#totalPrice").html(OrderMgr.fTotal);

            //2. 如果有输入数量的话，才让按钮可点击
            if (OrderMgr.orderList.length == 0) {
                //$("#btnOrder").off("click", OrderMgr.preOrder);
                OrderMgr.setBtnLoginDisabled(true);
            }
            else {
                //$("#btnOrder").on("click", OrderMgr.preOrder);
                OrderMgr.setBtnLoginDisabled(false);
            }
        },

        /**
         * 是否禁用登录按钮
         * @param isDisable
         */
        setBtnLoginDisabled: function (isDisable) {
            var btnOrder = $('#btnOrder');
            btnOrder.attr('disabled', isDisable);
            if (isDisable) {
                btnOrder.css('background-color', '#dddddd');//灰色
            } else {
                btnOrder.css('background-color', '#009fe3');//橘黄色
            }
        }
    };


    // 头 + 内容
  var titleOpt = {showBackBtn: true, showMoreBtn: false,title:"龙虾节"};
  var header = HeaderMgr.createTitle(titleOpt);
  var page ='<div class="page">' + header  + $('#tpl-order').html() + '</div>';
    fish.PageSlider.slidePage($(page), function(){
        OrderMgr.initUI();
    });
}

