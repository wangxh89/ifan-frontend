/**
 * 头部部分封装
 * @type {Object}
 */
var HeaderMgr = {
  /**
   *
   * @param showBackBtn 是否显示回退按钮，默认不显示
   * @param title 标题，默认RES.APP_NAME
   * @returns {*}
   */
  createTitleHtml: function (showBackBtn, title, showMyOrder) {
    var opt = {
      showBackBtn: !!showBackBtn,
      title: title || RES.APP_NAME,
      showMyOrder: !!showMyOrder
    };
    return HeaderMgr.createTitle(opt);
  },
  /**
   * 获取头部HTML
   * @param opt 参数对象
   */
  createTitle: function (option) {
    var opt = {
      showBackBtn: false,
      title: RES.APP_NAME,
      showMoreBtn: true,
      showMyOrder: false
    };

    $.extend(opt, option);
    return _.template($('#tpl-header').html())(opt);
  }
};