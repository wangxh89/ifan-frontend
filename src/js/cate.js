/**
 * Title: cate.js
 * Description: cate.js
 * Author: wang.xiaohu
 * Created Date: 14-5-19 下午3:13
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

function CatePage() {
  this.$orderInfo = $('#orderInfo');
  this.$orderBtn = $('#btnOrder');
  this.$totalOrderInfo = $('#totalOrderInfo');
  this.$countdownWrapper = $('.countdown-wrapper');
  this.$countdownSecond = $('.countdown-second');
  this.$countdownHour = $('.countdown-hour');

  var that = this;
  GLOBAL.async('order', 'qryOrderMenu', null, function (data) {
    if (data.rs) {
      data = data.msg[0];
      that.totalAmount = data.total;
      that.leftAmount = data.left;

      //为龙虾节直接设置id
      localStorage.setItem('orderMenuId', data._id);

      GLOBAL.async('user', 'getServerTime', null, function (data) {
        if (data.rs) {
          that.serverTime = new Date(data.msg);
          that.initialize();
        }
      });
    }
  });

  /**
   * 美食节操作
   */
//    var CateMgr = {
//        cacheList: {},
//        userToken: "abc",
//        initUI: function () {
//
//            //1. 调用qryOrderList进行判断是否有订单，如果有才显示“我的订单”否则不显示
////            CateMgr.userToken = 'abc';
////            $("#myOrderDropMenu").hide();
////            CateMgr.qryOrderList({token:CateMgr.userToken},function(orderList){
////                if(orderList.length > 0) {
////                    //有订单的话 才显示“我的订单”
////                    $("#myOrderDropMenu").show();
////                }
////            });
//            //2. 查询美食列表,构造列表HTML
//
//            CateMgr.qryCateList(function(arrCateList){
//                var template = _.template($('#cate_rowTemplate').html());
//                var liList = "";
//                $.each(arrCateList, function(i,item){
//                    //必须要有图片才显示
//                    if(item.pics && item.pics[0]) {
//                        var imageURL = GLOBAL.server_url + "images/" + item.pics[0].path;
//                        liList += template({id:item._id, imgUrl:imageURL, title: item.desc});
//                        CateMgr.cacheList[item._id] = item;
//                    }
//                });
//                $(liList).appendTo($("#cate-list").children()[0]);
//                $(".rowLi").on('click',CateMgr.rowClick )
//            });
//        },
//
//        /**
//         * 查询美食节清单
//         * @param callback
//         */
//        qryCateList: function (callback) {
//            var result = null;
//            GLOBAL.async('order', 'qryOrderMenu', null, function (data) {
//                if (data.rs) {
//                    result = data.msg;
//                    callback(result);
//                }
//            }, function (err) {
//                do_alert('亲，网络异常，请稍后尝试！');
//            });
//        },
//
//
//        rowClick: function (e) {
//            //1.判断一下用户有没有登录，没有登录的话，进入登录界面
//            var isUserLogin = localStorage.getItem('USER_TOKEN');
//            if (!isUserLogin) {
//                fish.Router.navigate("login?redirectUrl=cate");
//                return;
//            }
//
//            var $a = $(e.currentTarget);
//            var item = CateMgr.cacheList[$a.attr('id')];
//            localStorage.setItem('orderMenuId', item._id || '');
//            localStorage.setItem('unitName', item.unit || '');
//            var imageList = "";
//            if(item.pics) {
//                var cnt = item.pics.length;
//
//                for (var i = 1; i < cnt; i++) {
//                    imageList += item.pics[i].path +",";
//                }
//                imageList = imageList.substring(0,imageList.length-1);
//                localStorage.setItem('imageList', imageList );
//            }
//            fish.Router.navigate("order");
//        },
//        qryOrderList: function(param,callback) {
//            var result = null;
//            GLOBAL.async('order', 'qryOrderList', param, function (data) {
//                if (data.rs) {
//                    result = data.msg;
//                    callback(result);
//                }
//            }, function (err) {
//                do_alert('亲，网络异常，请稍后尝试！');
//            });
//        }
//    };
//    CateMgr.initUI();

}

CatePage.prototype = {
  initialize: function () {
    var serverDay = this.serverTime.getDay();

    // 周五周六周日不接受预订
    if (serverDay === 0 || serverDay === 6 || serverDay === 5) {
      this.$totalOrderInfo.text('周五周六周日不接受预订');
    } else {
      this.$totalOrderInfo.text('今日供应' + this.totalAmount + '斤');

      // 设置订购开始时间 9:00:00
      this.startTime = new Date(this.serverTime);
      this.startTime.setHours(9);
      this.startTime.setMinutes(0);
      this.startTime.setSeconds(0);

      // 设置订购结束时间 12:30:00
      this.endTime = new Date(this.serverTime);
      this.endTime.setHours(12);
      this.endTime.setMinutes(30);
      this.endTime.setSeconds(0);

      // 活动开始剩余时间
      this.timeLeft = this.startTime.getTime() - this.serverTime.getTime();
      // 活动时长
      this.timeRange = this.startTime.getTime() - this.endTime.getTime();

      this.checkTime();
    }

    this.$orderBtn.on('touchend', $.proxy(this.orderButtonTouchEnd, this));
    this.checkLogin();
  },

  checkTime: function () {
    if (this.serverTime.getTime() > this.endTime.getTime()) {
      this.$orderInfo.addClass('visible');
      this.$orderInfo.text('预订已结束');
      this.orderEnable = false;
    } else if (this.serverTime.getTime() >= this.startTime.getTime()) {
      this.$orderInfo.addClass('visible');
      this.$orderInfo.text('正在抢购中...');
      this.orderEnable = true;
      this.startTimeRangeTimer();
      this.startAmountTimer();
    } else {
      this.orderEnable = false;
      this.startTimeLeftTimer();
    }
  },

  // 查询订购剩余量定时器
  startAmountTimer: function () {
    // 订购结束之前查询
    if (this.timeLeft > this.timeRange) {
      var that = this;
      GLOBAL.async('order', 'qryOrderMenu', null, function (data) {
        if (data.rs) {
          data = data.msg[0];
          that.leftAmount = data.left;
          that.setOrderInfo();

          // 10s一次查询订单剩余量
          setTimeout($.proxy(that.startAmountTimer, that), 10000);
        }
      }, function () { //失败时处理，比如网络断开
        setTimeout($.proxy(that.startAmountTimer, that), 10000);
      });
    }
  },

  setOrderInfo: function () {
    if (this.leftAmount === 0) {
      this.orderEnable = false;
      this.$orderInfo.text('已售罄');
      this.checkLogin();
//    } else {
//      this.$orderInfo.text('已售' + (this.totalAmount - this.leftAmount) + '斤，还剩' + this.leftAmount + '斤');
    }
  },

  // 订购结束定时器
  startTimeRangeTimer: function() {
    var that = this;

    if (this.timeLeft <= this.timeRange) { // 预订结束
      this.$orderInfo.text('预订已结束');
      this.orderEnable = false;
      this.checkLogin();
    } else {
      setTimeout(function () {
        that.timeLeft -= 1000;
        that.startTimeRangeTimer();
      }, 1000);
    }
  },

  // 订购开始定时器
  startTimeLeftTimer: function () {
    var that = this;

    // 开始倒计时
    if (this.timeLeft > 0) {
      var hours = Math.floor(this.timeLeft / (60 * 60 * 1000));
      var minutes = Math.floor(this.timeLeft / (60 * 1000)) - (hours * 60);
      var seconds = Math.floor(this.timeLeft / 1000) - (hours * 60 * 60) - (minutes * 60);

      this.$countdownWrapper.addClass('visible');
      this.$countdownHour.text(hours + '小时' + minutes + '分');
      this.$countdownSecond.text(seconds + '秒');

      setTimeout(function () {
        that.timeLeft -= 1000;
        that.startTimeLeftTimer();
      }, 1000);
    } else { // 开始预订
      this.$countdownWrapper.removeClass('visible');
      this.$orderInfo.addClass('visible');
      this.$orderInfo.text('正在抢购中...');
//      this.$orderInfo.text('已售' + (this.totalAmount - this.leftAmount) + '斤，还剩' + this.leftAmount + '斤');
      this.orderEnable = true;
      this.checkLogin();

      this.startTimeRangeTimer();
      this.startAmountTimer();
    }
  },

  checkLogin: function () {
    if (localStorage.USER_TOKEN) {
      this.$orderBtn.text('抢购');
      if (this.orderEnable) {
        this.$orderBtn.css('background-color', '#009fe3');
      } else {
        this.$orderBtn.css('background-color', '#ddd');//灰色
      }
    } else {
      this.$orderBtn.css('background-color', '#009fe3');
      this.$orderBtn.text('请先登录');
    }
  },

  orderButtonTouchEnd: function () {
    if (localStorage.USER_TOKEN) {
      if (this.orderEnable) {
        fish.History.navigate('order');
      } else {
        return;
      }
    } else {
      fish.History.navigate('login');
    }
  }
}