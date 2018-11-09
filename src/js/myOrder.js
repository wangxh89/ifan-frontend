/**
 * Title: myOrder.js
 * Description: myOrder.js
 * Author: wang.xiaohu
 * Created Date: 14-5-19 下午3:13
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
function myOrderPage() {
  /**
   *   我的订单
   */
  var MyOrderMgr = {
    orderList: [],
    userToken: "",

    /**
     * 界面初始化
     */
    initUI: function () {
      $("#divOrderList").empty();

      MyOrderMgr.userToken = localStorage.getItem('USER_TOKEN');
      MyOrderMgr.qryOrderList({token: MyOrderMgr.userToken}, function (orderList) {
        console.log("-------------------");
        console.log(orderList);
        //1. 判断有没有数据，如果没有数据的话，则显示为暂无数据
        if (!orderList || (orderList && orderList.length == 0)) {
          $(".order-content").empty();
          $(".order-content").html($('#myOrder_noOrder').html());
          return;
        }
        var template = _.template($('#myOrder_rowTemplate').html());
        var liList = [];

        var imageArr = [];
        //2.如果为空则取默认图片
        if (orderList && orderList[0].pics && orderList[0].pics.length >= 2) {
          $.each(orderList[0].pics, function (i, item) {
            imageArr.push(GLOBAL.server_url + "images/" + item.path);
          })
        }
        else {
          imageArr.push("img/menu/menu_default.png");
        }
        ;

        var now = new Date();
        var nowStr = DateUtil.format(now, 'yyyy-MM-dd');
        var cancelEndTime = new Date();
        cancelEndTime.setHours(12);
        cancelEndTime.setMinutes(30);
        $.each(orderList, function (i, item) {
          var orderDate = DateUtil.format(item.date, 'yyyy-MM-dd');
          var orderInADay = _.findWhere(liList,{orderDate:orderDate});
          if(orderInADay == null) {
              orderInADay =  {
                  orders : [{
                      id: item.id,
                      name: item.name,
                      imgUrl: imageArr[i % imageArr.length],
                      price: item.price,
                      count: item.count,
                      state: item.state
                  }],
                  orderDate: DateUtil.format(item.date, 'yyyy-MM-dd'),
                  totalInADay:parseFloat(item.price) * parseFloat(item.count),
                  isCancelable:orderDate == nowStr && (now - cancelEndTime) < 0  ? true : false,
                  isTodayOrder:orderDate == nowStr ? true : false
              };
              liList.push(orderInADay);
          } else {
              orderInADay.orders.push({
                  id: item.id,
                  name: item.name,
                  imgUrl: imageArr[i % imageArr.length],
                  price: item.price,
                  count: item.count,
                  state: item.state
              });
              orderInADay.totalInADay = orderInADay.totalInADay + parseFloat(item.price) * parseFloat(item.count);
          }

            $.each(orderInADay.orders,function(k,oneOrder){
                if(oneOrder.state == '2') {
                    //这个订单已经被抽中，减掉2斤的钱
                    orderInADay.totalInADay = orderInADay.totalInADay - parseFloat(item.price) * 2;
                    orderInADay.isDiscountOrder = true;
                }
            });
        });

        MyOrderMgr.orderList = liList;
        document.getElementById("divOrderList").innerHTML = template({liList: liList});

          $('.btn-cancel').click(function () {
              fish.Dialog.confirm('确定取消此次预定吗？', function (e) {
                  if (e.result) {
                      MyOrderMgr.cancelOrder();
                  }
                  else {
                      this.close();
                  }
              });
          });
      });
    },
    /**
     * 取消订单
     */
    cancelOrder: function () {
        var cacelAbleOrders = _.findWhere(MyOrderMgr.orderList,{isCancelable:true});
        var orderListIds = [];
        _.each(cacelAbleOrders.orders,function(order){
            orderListIds.push(order.id);
        });

      console.log("cancel Orders:" + orderListIds);
      var paramObj = {token: MyOrderMgr.userToken, orderIdList: orderListIds};
      GLOBAL.async('order', 'cancelOrder', paramObj, function (data) {
        if (data.rs) {
          fish.Router.navigate("cancelOrderResult");
        }
        else {
          do_alert(data.error);
        }
      }, function (err) {
        do_alert('取消订单失败，请稍后尝试！');
      });
    },

    qryOrderList: function (param, callback) {
      var result = null;
      param.startDate = new Date(2014,5,1).getTime();
      GLOBAL.async('order', 'qryOrderList', param, function (data) {
        if (data.rs) {
          result = data.msg;
          callback(result);
        }
      }, function (err) {
        do_alert('网络异常，请稍后尝试！');
      });
    }
  };
  // 头 + 内容
  var titleOpt = {showBackBtn: true, title: '我的订单', showMoreBtn: false};
  var header = HeaderMgr.createTitle(titleOpt);

  var page = '<div class="page">' + header + $('#tpl-myOrder').html() + '</div>';
  fish.PageSlider.slidePage($(page), function () {
    MyOrderMgr.initUI();
  });
}
