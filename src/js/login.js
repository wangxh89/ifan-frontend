if (isAndroid) {

  //退出应用
  function exit_app() {
    do_confirm('退出' + RES.APP_NAME + '?', function (choice) {
      if (choice == do_confirm.OK) {
        navigator.app.exitApp();
      }
    })
  }

  //如果有‘从底部弹出的菜单’，则隐藏
  $(document).bind('touching', function (e, touch_ev) {
  });

}
/**
 * 登录，路由入口
 */
function loginPage() {
  if (!LoginMgr[location.hash]) {
    LoginMgr[location.hash] = $('#tmpl-login').html();
  }
  var page = '<div class="page">' + LoginMgr[location.hash] + '</div>';

  fish.PageSlider.slidePage($(page), function () {
    LoginMgr.initUI();
    LoginMgr.initEvent();
  });
}

/**
 * 注销，路由入口
 */
function logoutPage() {
  do_confirm('确认注销当前用户吗?', function (choice) {
    if (choice == do_confirm.OK) {
      localStorage.removeItem('USER_TOKEN');
      HomeMgr.refreshTitle();
      app.cateController.checkLogin();
      do_alert('注销成功！ ^_^');
    }
  });
}

/**
 * 登录业务操作
 */
var LoginMgr = {
  /**
   *状态
   */
  state: null,
  /**
   * 初始化界面UI
   */
  initUI: function () {
    var username = localStorage.getItem('USER_WORK_ID');
    if (ValidateUtil.isNotEmpty(username) && username != 'undefined') {
      $('#username').val(username);
    }
  },

  /**
   * 初始化事件
   */
  initEvent: function () {
    $('#btnLogin').on('click', LoginMgr.login);
    var $username = $('#username'), $password = $('#password');

    $username.on('input', function (e) {

      if ($(this).val().length == 0) {
        LoginMgr.setBtnLoginDisabled(true);
      } else {
        if ($password.val().length != 0) {
          LoginMgr.setBtnLoginDisabled(false);
        } else {
          LoginMgr.setBtnLoginDisabled(true);
        }
      }
    });

    $username.on('focus', function (e) {
      LoginMgr.showLogo(false);
    });

    $password.on('input', function (e) {
      if ($(this).val().length == 0) {
        LoginMgr.setBtnLoginDisabled(true);
      } else {
        if ($username.val().length != 0) {
          LoginMgr.setBtnLoginDisabled(false);
        } else {
          LoginMgr.setBtnLoginDisabled(true);
        }
      }
    });
    $password.on('focus', function (e) {
      LoginMgr.showLogo(false);
    });

  },

  /**
   * login bll
   */
  login: function () {
    if ($('#btnLogin').attr('disabled') == 'true') {
      return;
    }

    if (LoginMgr.state == 'LOGINING') {
      return;
    }

    var $username = $('#username');
    var $pwd = $('#password');

    var username = '' + $.trim($username.val());
    var pwd = $.trim($pwd.val());

    if (ValidateUtil.isEmpty(username)) {
      do_alert('请输入工号');
      $username[0].focus(); // ztepo不支持$username.focus();使用原生替代
      return;
    }

    if (!ValidateUtil.isNumber(username)) {
      do_alert('工号输入有误哦！');
      $username[0].select();
      $username[0].focus();
      return;
    }

    if (ValidateUtil.isEmpty(pwd)) {
      do_alert('请输入密码');
      $pwd[0].focus();
      return;
    }

    if (pwd.length > 16) {
      do_alert('密码太长了');
      $pwd[0].focus();
      return;
    }

    switch (username.length) {
      case 6:
      case 8:
        if (username.charAt(0) == '0' || username.charAt(0) == '1') {
        } else {
          do_alert('工号输入错误');
          $username[0].select();
          $username[0].focus();
          return;
        }
        break;
      case 10:
        if (username.substr(0, 4) == '0027') {
        } else {
          do_alert('工号输入错误');
          $username[0].select();
          $username[0].focus();
          return;
        }
        break;
      default:
        do_alert('工号输入错误');
        $username[0].select();
        $username[0].focus();
        return;
        break;
    }


    LoginMgr.state = 'LOGINING';

    var param = {no: '' + username, password: pwd};
    GLOBAL.async('user', 'login', param, function (data) {
      console.log(data);
      if (data.rs) {
        var result = data.msg;
        localStorage.setItem('USER_WORK_ID', result.code);
        localStorage.setItem('USER_NAME', result.name);
        localStorage.setItem('USER_EMAIL', result.mail || '');
        localStorage.setItem('USER_TELEPHONE', result.telephone || '');
        localStorage.setItem('USER_DEPARTMENT', result.department || '');
        localStorage.setItem('USER_TOKEN', result.token);

        //①将‘登录’改成退出，同时将‘#login’改成‘loginOut’
        HomeMgr.refreshTitle();
        //success
        LoginMgr.state = null;
        fish.PageSlider.back();
      } else {
        LoginMgr.state = '';

        $pwd.val('');
        $pwd[0].focus();
        LoginMgr.setBtnLoginDisabled(true);
        do_alert(data.error || '登录失败');
      }
    }, function (err) {
      do_alert('网络异常，请稍后尝试！');
    });
    LoginMgr.showLogo(true);
  },
  /**
   * 是否禁用登录按钮
   * @param a
   */
  setBtnLoginDisabled: function (a) {
    var $btnLogin = $('#btnLogin');
    $btnLogin.attr('disabled', a);
    if (a) {
      $btnLogin.css('background-color', '#dddddd');//灰色
    } else {
      $btnLogin.css('background-color', '#00A0E2');//橘黄色
    }
  },
  /**
   *  是否显示logo
   *  @para flag
   */
  showLogo: function (flag) {
    var $logo = $('.logo');
    if (flag) {
      $logo.show();
    } else {
      $logo.hide();
    }
  }

};