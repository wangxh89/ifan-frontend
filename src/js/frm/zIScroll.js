//基于iScroll,进行封装

/***
 * 用法：
 * 基础目录结构HTML：
 * <div class="content bulletin-content" id="noticeContent">
 *   <div class="ui-refresh" id="noticeList">
 *      <ul class="table-view"></ul>
 *      <div class="bulletin-list-pull-up ziscroll-pull-up">
 *        <i class="fa fa-arrow-circle-up"></i>
 *        <span>上拉获取更多</span>
 *      </div>
 *    </div>
 * </div>
 *
 * var opts = {
 *     url: GLOBAL.server_url + 'notice?m=qryNotice',
 *     pageSize: 12,
 *     successHandler: successHandler,
 *     failureHandler: failureHandler
 *   };
 *
 * var ziscroll = new fish.zIScroll('#noticeContent', opts);
 *  console.log(ziscroll.iscroll); //如果需要原生的IScroll对象
 */

(function (fish, $, IScroll) {
  //默认配置参数
  var defaults = {
    url: '',//请求地址
    currentPage: 0, //当前已经加载的页数
    pageSize: 10, //每页条数
    isLoading: false, //标记，是否正在加载
    bottomHeight: 55, //底部是否有遮挡块，遮挡块的高度
    param: {}, //除页码外需要传递的额外参数
    successHandler: function () {
    }, //数据加载成功之后的处理函数
    failureHandler: function () {
    } //数据加载失败之后的处理函数
  };

  var RES = {
    NO_DATA: '没有更多了',
    PULL_UP_MORE: '上拉获取更多',
    PULL_DOWN_LOAD: '放开加载',
    LOADING_DATA: '数据加载中...'
  };

  /**
   * 加载数据
   */
  var loadData = function (context, callback) {
    var opts = context.opts;
    if (!opts.url) {
      setStatus(context, 2);
      return;
    }
    setStatus(context, 1);

    var params = $.extend({startIndex: opts.currentPage * opts.pageSize, pageSize: opts.pageSize}, opts.param);
    $.ajax({
      url: opts.url,
      type: 'POST',
      data: params
    }).done(function (data, textStatus, jqXHR) {
        opts.currentPage++;
        opts.isLoading = false;
        if (data.msg && data.msg.length != 0) {
          if (opts.successHandler && typeof(opts.successHandler) == "function") {
            opts.successHandler.call(window, data, opts);
          }
          if (data.msg.length < opts.pageSize) {
            setStatus(context, 2);
          } else {
            setStatus(context, 3);
          }

          if (callback) {
            callback();
          }

        } else {
          setStatus(context, 2);
        }
      }).fail(function () {
        opts.isLoading = false;
        console.log('滚动自动加载数据失败。错误！');
        if (callback) {
          callback();
        }
      });
  }


  /**
   * 设置Loading条的状态
   * @param {[type]} status [description]
   */
  var setStatus = function (context, status) {
    switch ('' + status) {
      case '1': //加载中
        context.$pullUpIcon.removeClass().addClass("fa fa-spinner");
        context.$pullUpSpan.removeClass('flip').addClass('menuloading').text(RES.LOADING_DATA);
        break;

      case '2': //没有更多了
        context.hasMore = false;
        context.$pullUpIcon.hide();
        context.$pullUpSpan.html(RES.NO_DATA);
        break;

      case '3': //上拉获取更多
        context.$pullUpIcon.removeClass().addClass("fa fa-arrow-circle-up");
        context.$pullUpSpan.removeClass("menuloading").text(RES.PULL_UP_MORE);
        break;

      case '4': //放开加载
        context.$pullUpIcon.removeClass().addClass("fa fa-arrow-circle-down");
        context.$pullUpSpan.addClass("flip").text(RES.PULL_DOWN_LOAD);
        break;
    }
  };


  //zIScroll插件
  var zIScroll = fish.zIScroll = function (element, options) {
    this.init(element, options);
//    console.log(this.iscroll);//
    return this;
  };

  zIScroll.prototype = {
    /**
     * 初始化函数
     * @param options
     */
    init: function (element, options) {
      var self = this;
      this.hasMore = true;
      this.opts = $.extend({}, defaults, options);
      this.$el = $(element);
      this.$pullUp = this.$el.find('.ziscroll-pull-up');

      this.$pullUpIcon = this.$pullUp.find('i');
      this.$pullUpSpan = this.$pullUp.find('span');


      var scroll = new IScroll(element, {click: true, probeType: 3});
      scroll.maxScrollY = scroll.maxScrollY - self.opts.bottomHeight;
      this.iscroll = scroll;

      //① 先加载一页数据
      loadData(self, function () {
        scroll.refresh();
        scroll.maxScrollY = scroll.maxScrollY - self.opts.bottomHeight;

        scroll.on("scrollEnd", function () {
          if (self.$pullUpSpan.hasClass('flip') && self.hasMore) {
            loadData(self, function () {
              scroll.refresh();
              scroll.maxScrollY = scroll.maxScrollY - self.opts.bottomHeight;
              if (!self.hasMore) {
                setStatus(self, 2);//没有更多了
              }
            });
          }
        });
        //手指拖动时
        scroll.on("scroll", function () {
          if (this.y < (this.maxScrollY - 5) && !self.$pullUpSpan.hasClass('flip') && self.hasMore) {
            setStatus(self, 4);//加载中...
          }
        });

        scroll.on("refresh", function () {
          if (self.$pullUpSpan.hasClass("menuloading")) {
            setStatus(self, 3);//上拉获取更多
          }
        });
      });

    }
  };


})(fish, Zepto, IScroll);
