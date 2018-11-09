/**
 * 摇一摇，路由入口
 */
function shakePage() {
  var titleOpt = {showBackBtn: true, title: '摇一摇', showMoreBtn: false};
  var header = HeaderMgr.createTitle(titleOpt);
  ShakeMgr.template = _.template($('#tmpl-shake-dialog-row').html());
  var page = '<div class="page">' + header + $('#tmpl-shake').html() + '</div>';

  fish.PageSlider.slidePage($(page), function () {
    ShakeMgr.initUI();
    ShakeMgr.initEvent();
  });
}


/**
 * 摇一摇业务逻辑
 */
var ShakeMgr = {
  /**
   * 当前状态，
   * SHAKING     正在摇晃
   * SHAKING-END 摇晃结束
   * LOADING-DATA 正在查询数据
   */
  state: '',
  /**
   *
   */
  stateVal: {
    'SHAKING': 'SHAKING'
  },
  /**弹出对话框*/
  dialog: null,
  /**弹出的对话框，行模板文件*/
  template: null,
  media: null,
  oldValue: { x: null, y: null, z: null},
  /**
   * 初始化界面
   */
  initUI: function () {
    //初始化弹出对话框
    ShakeMgr.dialog = new fish.Dialog(document.getElementById('shake_result'), {autoHide: true});
  },
  /**
   * 初始化事件
   */
  initEvent: function () {
  },
  /**
   * 播放动画
   */
  animate: function () {
    if (ShakeMgr.dialog.isShown) {
      ShakeMgr.state = '';
      ShakeMgr.dialog.hide();
    }

    ShakeMgr.state = 'SHAKING';
//css3
    var $shake_up = $('.shake-up');
    var $shake_up_line = $shake_up.find('.shake-up-line');

    var $shake_down = $('.shake-down');
    var $shake_down_line = $shake_down.find('.shake-down-line');

    $shake_up_line.show();
    $shake_down_line.show();
    $shake_up.addClass('shake-up-style');
    $shake_down.addClass('shake-down-style');

    setTimeout(function () {
      $shake_up.removeClass('shake-up-style').addClass('shake-orgin-style');
      $shake_down.removeClass('shake-down-style').addClass('shake-orgin-style');
      setTimeout(function () {
        $shake_up.removeClass('shake-orgin-style');
        $shake_up.removeClass('shake-orgin-style');
        $shake_up_line.hide();
        $shake_down_line.hide();

        //animate done
        console.log('animate done');
        ShakeMgr.loadData();
      }, 600);
    }, 600);

  },
  /**
   * 播放音乐
   */
  playAudio: function () {
    ShakeMgr.media.play();
  },

  /**
   * 查询后端返回的数据
   */
  loadData: function () {
    console.log('loading data');

    var param = {token: localStorage.getItem('USER_TOKEN')};

//    param.token = '0027000297CUMPZG'; //just for test
    GLOBAL.async('order', 'lotte', param, function (data) {
      console.log(data);
      var tip = null;
      if (data && data.rs) {
        tip = "<i class='fa fa-smile-o fa-award'></i>" + data.msg;
      } else {
        tip = "<i class='fa fa-frown-o fa-award'></i>" + data.error;
      }
      $('#shake_result').find('ul').html(tip);
      ShakeMgr.dialog.show();
      ShakeMgr.state = '';

    }, function () {
      do_alert('查询出错了！');
    });


//    GLOBAL.async('menu', 'shake', null, function (data) {
//      console.log(data);
//      if (data && data.rs) {
//        if (data.msg && data.msg.length == 0) {
//          ShakeMgr.state = ''; //清空状态
//          do_alert('食堂没菜了。。。');
//          return;
//        }
//
////imgPath使用绝对地址
////        var data = [
////          {_id: 1, imgPath: 'http://10.45.14.49:3000/img/test.png', name: '葱油鸡大腿', taste: '清蒸', price: 6},
////        ];
//        var lis = '';
//        $.each(data.msg, function (index, obj) {
//          var taste = '';
//          switch ('' + obj.type) {
//            case '0':
//              taste = '咸鲜';
//              break;
//            case '1':
//              taste = '微辣';
//              break;
//            case '2':
//              taste = '辣';
//              break;
//          }
//
//          var imgPath = GLOBAL.server_url.substr(0, GLOBAL.server_url.length - 1);
//          if (obj.menupics && obj.menupics.length != 0) {
//            imgPath += obj.menupics[0].path;
//          } else {
//            imgPath = 'img/menu/menu_default.png';
//          }
//          lis += ShakeMgr.template({ id: obj._id, imgPath: imgPath, name: obj.menuname, taste: taste, price: obj.price });
//        });
//
//        $('#shake_result').find('ul').html(lis);
//        ShakeMgr.dialog.show();
//        ShakeMgr.state = '';
//      }
//
//
//    }, function () {
//      do_alert('查询出错了！');
//    });
  },


  /**
   *初始化媒体
   */
  initMedia: function () {
    tr('shake initMedia');
    //初始化动力感应
    var options = { frequency: 1000 };

    //onWatchSuccess和onWatchError是获取加速信息成功或失败的回调函数
    if (navigator.accelerometer) {
      navigator.accelerometer.watchAcceleration(function (newValue) {
        // 获取加速度信息成功后的回调函数
        var changes = {}, bound = 3, factor = 1;
        if (ShakeMgr.oldValue.x !== null) {
          changes.x = Math.abs(ShakeMgr.oldValue.x - newValue.x) * factor;
          changes.y = Math.abs(ShakeMgr.oldValue.y - newValue.y) * factor;
          changes.z = Math.abs(ShakeMgr.oldValue.z - newValue.z) * factor;
        }
        if (changes.x > bound || changes.y > bound) {
          if (location.hash == '#shake') { //只有在当前页面时才可以进行摇一摇效果
            if (ShakeMgr.state == 'SHAKING') {
            } else {
              if (ShakeMgr.dialog.isOpen) {
                ShakeMgr.state = '';
                ShakeMgr.dialog.close();
              }
              ShakeMgr.animate(); //播放动画
              ShakeMgr.playAudio();//播放音乐
            }
          }
        }
        ShakeMgr.oldValue = {
          x: newValue.x,
          y: newValue.y,
          z: newValue.z
        };
      }, function () {
        do_alert('shake onError!');
      }, options);
    }


    //初始化媒体信息
    var mediaPath, src = 'shake_sound_male.mp3';
    if (isAndroid) {
      mediaPath = '/android_asset/www/sound/' + src;// or 'file:///android_asset'
    }
    if (isIDevice) {
      mediaPath = 'sound/' + src;
    }
    try {
      ShakeMgr.media = new Media(mediaPath, function () {
        tr("playAudio():Audio Success");
      }, function (err) {
        do_alert(" deivce ready  " + JSON.stringify(err));
      });
    } catch (e) {
      tr(e);
    }
  }
};