/**
 * 系统参数配置
 * @type {{checkUpdate: Function}}
 */
var SystemMgr = {
  /**
   * 检查是否有新版本
   */
  checkUpdate: function () {

    GLOBAL.async('ver', 'getVersion', null, function (data) {
      if (data) {
        if (data.msg && data.msg.length != 0) {
          var latest = data.msg[0];
          //id,date,desc,forceUpdate,version
          //force 是否强制升级 0否/1是
          var currentPackageTime = parseInt(GLOBAL.package_time, 10);

          tr('current package time is ' + currentPackageTime);
          tr(' latest package time is ' + latest.date);
          if (currentPackageTime < latest.date) {
            switch ('' + latest.forceUpdate) {
              case '0': //可选择升级

                new fish.Dialog.confirm(latest.desc, function (e) {
                  if (e.result) {
                    tr('goto ifan download page by user choice');
//                    navigator.app.loadUrl("http://10.45.5.173:7788/", { openExternal: true });
                    window.open('http://10.45.5.173:7788/', '_system');
                  }
                  else {
                    this.close();
                  }
                });

//                var config = {title: '爱饭升级'};
//                do_confirm(latest.desc, config, function (buttonIndex) {
//                  switch (buttonIndex) {
//                    case do_confirm.OK:
//                      tr('goto ifan download page by user choice');
//                      navigator.app.loadUrl("http://10.45.5.173:7788/", { openExternal: true });
//                      break;
//                    case do_confirm.CANCEL:
//                      break;
//                  }
//                });

                break;
              case '1': //强制升级
                new fish.Dialog.alert(latest.desc, function (e) {
                  if (e.result) {
                    tr('goto ifan download page by force');
//                    navigator.app.loadUrl("http://10.45.5.173:7788/", { openExternal: true });
                    window.open('http://10.45.5.173:7788/', '_system');
                  }
                });
                break;
            }
          }
        } else {
          tr('get version data.msg is null');
        }
      } else {
        tr('get version data is null');
      }
    });


  }
};