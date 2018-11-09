/**
 * 公告详情路由入口
 */
function bulletinDetailPage() {
  var titleOpt = {showBackBtn: true, title: '公告', showMoreBtn: false};
  var header = HeaderMgr.createTitle(titleOpt);
  var detail = _.template($('#tmpl-bulletin-detail').html())({content: localStorage.getItem('NOTICE_BODY')});

  var page = '<div class="page">' + header + detail + '</div>';

  fish.PageSlider.slidePage($(page));
}
