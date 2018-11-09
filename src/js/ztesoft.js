/**
 *create date shi.pengyan 2014-4-17 16:20:46
 */
// 应用变量
var app = {};

/**
 *全局参数
 * @type {{server_url: string}}
 */
var GLOBAL = {
  server_url: 'http://10.45.30.10/', //请求服务器地址 10.45.12.34
  package_time: '@PACKAGE_TIME', //打包时间
  /**
   * 同步调用后端方法
   * @param ns 命名空间（模块名）
   * @param method 方法名
   * @param data 数据
   * @param success 成功回调函数
   * @param error 失败回调函数
   */
  sync: function (ns, method, data, success, error) {
    $.ajax({
      url: GLOBAL.server_url + ns + '?m=' + method,
      type: 'POST',
      async: false,
      data: data,
      success: success || function () {
      },
      error: error || function () {
      }
    });
  },

  /**
   *异步调用后端方法
   * @param ns 命名空间（模块名）
   * @param method 方法名
   * @param data 数据
   * @param success 成功回调函数
   * @param error 失败回调函数
   */
  async: function (ns, method, data, success, error) {
    $.ajax({
      url: GLOBAL.server_url + ns + '?m=' + method,
      type: 'POST',
      data: data,
      success: success || function () {
      },
      error: error || function () {
      }
    });
  },
  /**
   * 获取参数
   * @returns {{}}
   */
  getRequestParams: function () {
    var urlParams = {};
    var url = window.location.search; //获取url中"?"符后的字串
    if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      var strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        urlParams[strs[i].split("=")[0]] = unescape(decodeURIComponent(strs[i].split("=")[1]));
      }
    }
    return urlParams;
  },
  /**
   * 取hash中传递的参数
   * @returns {{}}
   */
  getHashParams: function () {
    var urlParams = {};
    var url = window.location.hash; //获取url中"?"符后的字串
    var index = url.indexOf("?");
    if (index != -1) {
      var str = url.substr(index + 1);
      var strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        urlParams[strs[i].split("=")[0]] = unescape(decodeURIComponent(strs[i].split("=")[1]));
      }
    }
    return urlParams;
  }


};

/**
 * 校验器
 */
var ValidateUtil = {
  /**
   * 判断对象是否为空
   * @param str
   * @returns {boolean}
   */
  isEmpty: function (str) {
    var val = $.trim(str);
    return val == null || val.length == 0;
  },
  /**
   * 判断字符串不为空
   * @param str
   * @returns {*|boolean}
   */
  isNotEmpty: function (str) {
    var val = $.trim(str);
    return str && str.length != 0;
  },

  isNumber: function (str) {
    var reg = /^\d+$/;
    return reg.test(str);
  }
};


var DateUtil = {
  /**
   * 格式化日期
   * @param ms 毫秒数
   * @param format 格式话，默认格式YYYY-MM-DD hh24:mm:ss
   */
  format: function (ms, format) {
    format = format || 'yyyy-MM-dd hh:mm:ss';
    var date = new Date(ms);
    var o = {
      "M+": date.getMonth() + 1, //month
      "d+": date.getDate(), //day
      "h+": date.getHours(), //hour
      "m+": date.getMinutes(), //minute
      "s+": date.getSeconds(), //second
      "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
      "S": date.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  }
}


var tr = function () {
    if (console && console.log)
      console.log(Array.prototype.join.apply(arguments, [' ']));
  },
  isAndroid = (/android/gi).test(navigator.appVersion),
  isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
  RES = {
    APP_NAME: '爱饭',
    OK: '确定',
    CANCEL: '取消',
    CONFIRM: '确认'
  };

/**
 * 提示信息框
 * @param str 内容
 * @param title 标题
 */
window.do_alert = function (str, title, cb) {
  if (typeof title == "function") {
    cb = title;
    title = RES.APP_NAME;
  }
  if(typeof cb == "undefined"){
    cb=function(){};
  }

  title = title || RES.APP_NAME;
  if (isAndroid || isIDevice) {
    if (navigator.notification) {
      navigator.notification.alert(str, cb, title, RES.OK);
    } else {
      alert(str);
      cb();
    }
  } else {
    alert(str);
    cb();
  }
}
/**
 *确认对话框
 * @param str 确认内容
 * @param config 配置{title,choice:[取消，确认]}
 * @param cb 回调函数
 */
window.do_confirm = function (str, config, cb) {
  if (typeof config == 'function') {
    cb = config;
    config = {};
  }
  var title = config['title'] || RES.APP_NAME,
    choice = config['choice'] || [RES.CANCEL, RES.OK];

  if (isAndroid || isIDevice) {
    if (navigator.notification) {
      navigator.notification.confirm(str, cb, title, choice);
    } else {
      cb(confirm(str) ? 2 : 1);
    }
  } else {
    cb(confirm(str) ? 2 : 1);
  }
}
do_confirm.OK = 2;
do_confirm.CANCEL = 1;

/**
 * 检查网络连接
 */

function check_connection() {
  if (navigator.network) {
    var networkState = navigator.network.connection.type;
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.NONE] = 'No network connection';

    if (networkState == Connection.NONE) {
      do_alert('请连接网络', '没有网络连接');
    }
  }
}

/**
 * Condova device Ready
 */
var onDeviceReady = function () {

  //fix ios7状态和webview重叠
  if ((typeof StatusBar) != 'undefined') {
    StatusBar.overlaysWebView(false);
    StatusBar.backgroundColorByHexString('#242429');
    //  StatusBar.backgroundColorByName('black');
  }

  //  check_connection();

  document.addEventListener("online", function () {
    tr('online!');
  }, false);

  document.addEventListener("offline", function () {
    do_alert('请连接网络', '没有网络连接');
  }, false);

//The event fires when an application is retrieved from the background.
  document.addEventListener("resume", function () {
    CatePage.calculateAmountLeft();
  }, false);


  //iphone
  if (isIDevice) {
    //fix输入法弹出后缩小页面大小
    function isTextInput(node) {
      return ['INPUT', 'TEXTAREA'].indexOf(node.nodeName) !== -1;
    }

    document.addEventListener('touchstart', function (e) {
      if (!isTextInput(e.target) && isTextInput(document.activeElement)) {
        document.activeElement.blur();
        e.preventDefault();
      }
    }, false);
  }

  //android
  if (isAndroid) {


    //返回按钮事件
    document.addEventListener('backbutton', function () {
      switch (location.hash) {
        case "":
        case "#menu":
        case "#cate":
        case "#bulletin":
        case "#boss":
          exit_app();
          break;
        case '#popover':
          if ($('#popover').is(":visible")) {
            $('#popover').hide();
          } else {
            exit_app();
          }
          break;
        default:
          fish.PageSlider.back();
          break;
      }

    });

    //菜单按钮事件
    document.addEventListener("menubutton", function () {
    }, false);
  }

  $(document).on('ajaxStart',function () {
    //if loading icon is set, don't add another
    if ($(".fa-spinner:visible").length < 1) {
      $('.loading-container').show();
    }
  }).on("ajaxComplete", function () {
      $('.loading-container').hide();
    });

  //页面路由
  fish.Router.route('', home);
  fish.Router.route('home/:tabIndex', home);
  fish.Router.route('login', loginPage);
  fish.Router.route('logout', logoutPage);
  fish.Router.route('menuDetail/:menuId', menuDetail);
  fish.Router.route('order', orderPage);
  fish.Router.route('confirm', orderConfirmPage);
  fish.Router.route('success', orderSuccessPage);
  fish.Router.route('myOrder', myOrderPage);
  fish.Router.route('cancelOrderResult', cancelOrderResultPage);
  fish.Router.route('bullet_detail', bulletinDetailPage);
  fish.Router.route('menuTop10', menuTop10);
  fish.Router.route('shake', shakePage);

  fish.History.start();

  ShakeMgr.initMedia();

  SystemMgr.checkUpdate();
};


//DOM Ready
$(function () {
  if ('ontouchstart' in window) {
    document.addEventListener('deviceready', onDeviceReady, false);
  } else {
    $(onDeviceReady);
  }
});