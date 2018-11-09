/**
 * 公告路由入口
 */
function bulletinPage() {
  NoticeMgr.initUI();
}

/**
 *公告业务
 */
var NoticeMgr = {
  /**
   * 将数据加载到内存
   */
  noticeList: {},
  /**
   * 初始化界面
   */
  initUI: function () {
    var $noticeList = $("#noticeList");
    $noticeList.on('click', 'li', NoticeMgr.rowClick);
    $noticeList.find('ul').empty();

    var opts = {
      url: GLOBAL.server_url + 'notice?m=qryNotice',
      pageSize: 12, //必须大于10，否则滚动效果无法实现
      successHandler: successHandler,
      failureHandler: failureHandler
    };

    new fish.zIScroll('#bulletin', opts);

    function successHandler(data) {
      var noticeList = data.msg;
      $.each(noticeList, function (index, obj) {
        obj.id = obj._id;
        obj.date = DateUtil.format(obj.date, 'yyyy-MM-dd');
        NoticeMgr.noticeList[obj._id] = obj;
      });

      var tmpl = _.template($('#tmpl-bulletin-item').html());
      $(tmpl({notices: noticeList})).appendTo($noticeList.children()[0]);
    }

    function failureHandler() {
      tr('数据加载失败...');
    }

  },

  rowClick: function (e) {
    var $a, $target = $(e.target);
    $a = $target.attr('href') ? $target : $target.parent();

    var notice = NoticeMgr.noticeList[$a.attr('id')];
    localStorage.setItem('NOTICE_ID', notice._id || '');
    localStorage.setItem('NOTICE_TITLE', notice.title || '');

    var body = notice.body;
    body = body.replace(/\/ueditor\/dialogs/g, GLOBAL.server_url + 'ueditor/dialogs');
    body = body.replace(/\/kindeditor\/plugins\/emoticons/g, GLOBAL.server_url + 'kindeditor/plugins/emoticons');
    localStorage.setItem('NOTICE_BODY', body || '');

    fish.Router.navigate('bullet_detail');
  }

};