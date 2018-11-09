/**
 * Title: cancelOrderResult.js
 * Description: cancelOrderResult.js
 * Author: wang.xiaohu
 * Created Date: 14-5-19 下午3:13
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
function cancelOrderResultPage() {
  tr("cancelOrderResultPage");
  // 头 + 内容
  var titleOpt = {showBackBtn: true, showMoreBtn: false};
  var header = HeaderMgr.createTitle(titleOpt);

  var page = '<div class="page">' + header + $('#tpl-cancelOrder').html() + '</div>';
  fish.PageSlider.slidePage($(page));
}