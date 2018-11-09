/*!
 * =====================================================
 * fish-moblie v0.0.1
 * Copyright 2014 fish-team
 * =====================================================
 */
/**
 * Title: fish.js
 * Description: fish.js
 * Author: huang.xinghui
 * Created Date: 14-5-7 上午10:56
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

/**
 * @property fish 全局变量fish
 * @property fish.noop 空函数
 */
window.fish = {
  noop: function () {
  }
};
/**
 * Title: history.js
 * Description: history.js
 * Author: huang.xinghui
 * Created Date: 14-5-20 下午1:26
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

/* global fish: true, Zepto: true, _: true */
(function (fish, $, _) {

  /**
   * @class fish.History 根据路由配置处理hashchange事件
   *
   */
  var History = function () {
    this.handlers = [];
    this.location = window.location;
  };

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  History.prototype = {

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function () {
      var match = this.location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    /**
     * @method start 启动监听路由
     *
     */
    start: function () {
      if (History.started) throw new Error("History has already been started");
      History.started = true;

      $(window).on('hashchange', this.checkUrl.bind(this));

      this.fragment = this.getHash();

      return this.loadUrl();
    },

    /**
     * @method stop 停止监听路由
     *
     */
    stop: function () {
      $(window).off('hashchange', this.checkUrl);
      History.started = false;
    },

    /**
     * @method route 配置路由
     * @param route 路由正则表达式
     * @param callback 回调函数
     */
    route: function (route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    checkUrl: function () {
      var current = this.getHash();
      if (current === this.fragment) return false;
      var self = this;
      setTimeout(function () {
        self.loadUrl();
      }, 200);
    },

    loadUrl: function () {
      var fragment = this.fragment = this.getHash();
      return _.any(this.handlers, function (handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    /**
     * @method navigate 跳转路由
     * @param fragment 地址段
     */
    navigate: function (fragment) {
      if (!History.started) return false;

      if (this.fragment === fragment) return;

      this.location.hash = '#' + fragment;
    }
  };

  fish.History = new History();
})(fish, Zepto, _);
/**
 * Title: router.js
 * Description: router.js
 * Author: huang.xinghui
 * Created Date: 14-5-16 上午10:43
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

/* global fish: true, Zepto: true, _: true */
(function (fish, $, _) {

  var optionalParam = /\((.*?)\)/g;
  var namedParam = /(\(\?)?:\w+/g;
  var splatParam = /\*\w+/g;
  var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  /**
   * @class fish.Router 配置路由
   *
   */
  var Router = {
    /**
     * @method route 配置路由
     * @param route 路由字符串或者正则表达式
     * @param callback回调函数
     */
    route: function (route, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      var router = this;
      fish.History.route(route, function (fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
      });
      return this;
    },

    execute: function (callback, args) {
      if (callback) callback.apply(this, args);
    },

    navigate: function (fragment) {
      fish.History.navigate(fragment);
      return this;
    },

    _routeToRegExp: function (route) {
      route = route.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function (match, optional) {
          return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    _extractParameters: function (route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function (param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }
  };

  fish.Router = Router;
})(fish, Zepto, _);
/**
 * Title: pageslider.js
 * Description: pageslider.js
 * Author: huang.xinghui
 * Created Date: 14-5-20 上午10:37
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

/* global fish: true, Zepto: true */
(function (fish, $) {

  /**
   * @class fish.PageSlider 页面跳转，直接替换body内部内容
   *
   */
  var PageSlider = function (container) {
    this.container = container;
    this.currentPage = null;
    this.stateHistory = [];
  };

  PageSlider.prototype = {
    /**
     * @method back 页面返回
     */
    back: function () {
      window.location.hash = this.stateHistory[this.stateHistory.length - 2];
    },

    /**
     * @method 页面跳转
     * @param page 跳转的页面内容，需是Zepto对象
     * @param callback 跳转结束后回调函数
     */
    slidePage: function (page, callback) {
      var l = this.stateHistory.length,
        state = window.location.hash;

      if (l === 0) {
        this.stateHistory.push(state);
        this.slidePageFrom(page, null, callback);
      } else if (state === this.stateHistory[l - 2]) {
        this.stateHistory.pop();
        this.slidePageFrom(page, 'left', callback);
      } else {
        this.stateHistory.push(state);
        this.slidePageFrom(page, 'right', callback);
      }
    },

    slidePageFrom: function (page, from, callback) {
      this.container.append(page);

      if (!this.currentPage || !from) {
        this.currentPage = page;
        callback && callback();
        return;
      }

      // Position the page at the starting position of the animation
      page.addClass('sliding ' + from);
      this.currentPage.addClass('sliding');

      var to = (from === "left" ? "right" : "left");
      var slideEnd = function (e) {
        var $target = $(e.target);
        $target.removeClass('sliding ' + to);
        page.removeClass('sliding');
        $target.remove();
        callback && callback();
      };

      // Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
      this.currentPage[0].offsetWidth;
      page.removeClass(from);
      this.currentPage.addClass(from === "left" ? "right" : "left");
      this.currentPage.one('webkitTransitionEnd', slideEnd);
      this.currentPage = page;
    }
  };

  fish.PageSlider = new PageSlider($(document.body));
})(fish, Zepto);
/**
 * Title: dialog.js
 * Description: dialog.js
 * Author: huang.xinghui
 * Created Date: 14-5-6 下午11:03
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

/* global fish: true, Zepto: true, _: true */
(function (fish, $, _) {

  var confirm_template = _.template('<div class="dialog confirm">' +
      '<p><%= content %></p>' +
      '<div class="btn-group">' +
      '<button class="btn js-ok">确定</button>' +
      '<button class="btn">取消</button>' +
      '</div>' +
      '</div>'),
      alert_template = _.template('<div class="dialog confirm">' +
    '<p><%= content %></p>' +
    '<div class="btn-group">' +
    '<button class="btn js-ok">确定</button>' +
    '</div>' +
    '</div>'),
    $body = $(document.body);

  /**
   * @class fish.Dialog 弹出框
   *
   * @constructor 创建Dialog实例
   * @param {Dom} element 组件配置项
   * @param {Object} options 组件配置项，默认是{backdrop: true, autoHide: false}
   */
  var Dialog = fish.Dialog = function (element, options) {
    this.options = $.extend({}, Dialog.DEFAULTS, options);
    this.$element = $(element);
    this.$backdrop = null;
    this.isShown = null;
  };

  Dialog.DEFAULTS = {
    backdrop: true,
    autoHide: false
  };

  Dialog.alert = function (content, callback) {
    var dialog = new Dialog(alert_template({content: content}), Dialog.DEFAULTS);
    dialog.show();
    callback = callback || fish.noop;
    dialog.$element.on('click', '.btn', function (e) {
      var $target = $(e.target);
//      dialog.destroy();
      callback({result: $target.hasClass('js-ok')});
    });
  };

  Dialog.confirm = function (content, callback) {
    var dialog = new Dialog(confirm_template({content: content}), Dialog.DEFAULTS);
    dialog.show();
    callback = callback || fish.noop;
    dialog.$element.on('click', '.btn', function (e) {
      var $target = $(e.target);
      dialog.destroy();
      callback({result: $target.hasClass('js-ok')});
    });
  };

  Dialog.prototype = {
    /**
     * @method show 显示弹出框
     */
    show: function () {
      if (!this.$element.parent().length) {
        this.$element.appendTo($body);
      }
      this.center();
      this.$element.addClass('visible');
      this.backdrop();
      this.isShown = true;
    },

    /**
     * @method hide 隐藏弹出框
     */
    hide: function () {
      this.$element.removeClass('visible');
      this.removeBackdrop();
      this.isShown = false;
    },

    center: function () {
      var computedStyle = window.getComputedStyle(this.$element[0]),
        height = computedStyle.height;

      height = height.slice(0, height.length - 2);

      var top = (window.innerHeight / 2) - (height / 2);

      this.$element.css({
        'margin-top': top + 'px'
      });
    },

    /**
     * @method removeBackdrop 移除遮罩
     */
    removeBackdrop: function () {
      this.$backdrop && this.$backdrop.remove();
      this.$backdrop = null;
    },

    /**
     * @method backdrop 生成遮罩
     */
    backdrop: function () {
      if (this.options.backdrop) {
        this.$backdrop = $('<div class="backdrop"></div>').appendTo($body);

        if (this.options.autoHide) {
          this.$backdrop.on('click', $.proxy(this.hide, this));
        }
      }
    },
    /**
     * @method destroy 销毁弹出框
     */
    destroy: function () {
      this.removeBackdrop();
      this.$element.remove();
      this.$element = null;
      this.isShown = null;
    }
  };
})(fish, Zepto, _);
/**
 * Title: slider.js
 * Description: slider.js
 * Author: huang.xinghui
 * Created Date: 14-5-12 上午10:40
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */

/* global fish: true, Zepto: true */
(function (fish, $) {

  var pageX;
  var pageY;
  var deltaX;
  var deltaY;
  var offsetX;
  var startTime;
  var resistance;
  var isScrolling;
  var scrollableArea;

  /**
   * @class fish.Slider 图片轮播，支持自动播放和滑动播放
   *
   * @constructor 创建Slider实例
   * @param {Dom} element 组件配置项
   * @param {Object} options 组件配置项，默认是{autoPlay: true, interval: 3000}
   *
   */
  var Slider = fish.Slider = function (element, options) {
    this.options = $.extend({}, options, Slider.DEFAULTS);
    this.$element = $(element);
    this.$slideGroup = this.$element.find('.slide-group');
    this.$slideDots = this.$element.find('.slide-dots');

    this.$element.on('touchstart', $.proxy(this.onTouchStart, this));
    this.$element.on('touchmove', $.proxy(this.onTouchMove, this));
    this.$element.on('touchend', $.proxy(this.onTouchEnd, this));

    this.slideNumber = 0;
    this.sliderWidth = this.$slideGroup[0].offsetWidth;
    this.lastSlide = -(this.$slideGroup.children().length - 1);

    // 大于1个slide才能自动播放
    if (this.options.autoPlay && this.lastSlide < 0) {
      this.resumePlay();
    }
  };

  Slider.DEFAULTS = {
    autoPlay: true,
    interval: 3000
  };

  Slider.prototype = {
    onTouchStart: function (e) {
      this.stopPlay();

      var firstItem = this.$slideGroup.find('.slide')[0];

      scrollableArea = firstItem.offsetWidth * this.$slideGroup.children().length;
      isScrolling = false;
      resistance = 1;
      startTime = +new Date();
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
      deltaX = 0;
      deltaY = 0;

      this.$slideGroup.css('-webkit-transition-duration', 0);
    },

    onTouchMove: function (e) {
      deltaX = e.touches[0].pageX - pageX;
      deltaY = e.touches[0].pageY - pageY;
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;

      if (isScrolling) {
        isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
      }

      if (isScrolling) {
        return;
      }

      offsetX = (deltaX / resistance) + this.getScroll();

      e.preventDefault();

      resistance = this.slideNumber === 0 && deltaX > 0 ? (pageX / this.sliderWidth) + 1.25 :
        this.slideNumber === this.lastSlide && deltaX < 0 ? (Math.abs(pageX) / this.sliderWidth) + 1.25 : 1;

      this.$slideGroup.css('-webkit-transform', 'translate3d(' + offsetX + 'px,0,0)');
    },

    onTouchEnd: function () {
      var offset = (+new Date()) - startTime < 1000 && Math.abs(deltaX) > 15 ? (deltaX < 0 ? -1 : 1) : 0;
      var round = offset ? (deltaX < 0 ? 'ceil' : 'floor') : 'round';
      var slideNumber = Math[round](this.getScroll() / (scrollableArea / this.$slideGroup.children().length));

      this.slideTo(slideNumber + offset);

      this.resumePlay();
    },

    getScroll: function () {
      var webkitTransform = this.$slideGroup.css('-webkit-transform');
      if (webkitTransform) {
        var translate3d = webkitTransform.match(/translate3d\(([^,]*)/);
        var ret = translate3d ? translate3d[1] : 0;
        return parseInt(ret, 10);
      }
    },

    /**
     * @method slideTo 滚动到指定图片位置
     * @param to 图片位置索引，是负数
     */
    slideTo: function (to) {
      this.slideNumber = to;
      this.slideNumber = Math.min(this.slideNumber, 0);
      this.slideNumber = Math.max(this.lastSlide, this.slideNumber);

      offsetX = this.slideNumber * this.sliderWidth;

      this.$slideGroup.css({
        '-webkit-transition-duration': '.2s',
        '-webkit-transform': 'translate3d(' + offsetX + 'px,0,0)'
      });

      this.$slideDots.find('.active').removeClass('active');
      $(this.$slideDots.children().eq(Math.abs(this.slideNumber))).addClass('active');

      var e = $.Event('slide', {
        detail: {slideNumber: Math.abs(this.slideNumber) }
      });
      this.$element.trigger(e);
    },

    /**
     * @method 继续播放
     */
    resumePlay: function () {
      var that = this;
      that._timer = setTimeout(function () {
        if (that.slideNumber === that.lastSlide) {
          that.slideTo(0);
        } else {
          that.slideTo(that.slideNumber - 1);
        }

        that.resumePlay();
      }, that.options.interval);
    },

    /**
     * @method 停止播放
     */
    stopPlay: function () {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    }

    /**
     * @event slide 当图片轮播时触发
     * @param {Event} e Zepto.Event对象
     * @param {Object} data 属性detail就是滑动图片索引
     */
  };
})(fish, Zepto);
/* ========================================================================
 * Ratchet: modals.js v2.0.2
 * http://goratchet.com/components#modals
 * ========================================================================
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
  'use strict';

  var findModals = function (target) {
    var i;
    var modals = document.querySelectorAll('a');

    for (; target && target !== document; target = target.parentNode) {
      for (i = modals.length; i--;) {
        if (modals[i] === target) {
          return target;
        }
      }
    }
  };

  var getModal = function (event) {
    var modalToggle = findModals(event.target);

    if (!modalToggle || !modalToggle.hash || (modalToggle.hash.indexOf('/') > 0)) {
      return;
    }

    return document.querySelector(modalToggle.hash);
  };

  window.addEventListener('touchend', function (event) {
    var modal = getModal(event);
    if (modal) {
      if (modal && modal.classList.contains('modal')) {
        modal.classList.toggle('active');
        event.preventDefault(); // prevents rewriting url (apps can still use hash values in url)
      }
    }
  });
}());

/* ========================================================================
 * Ratchet: popovers.js v2.0.2
 * http://goratchet.com/components#popovers
 * ========================================================================
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
  'use strict';
  var popover;

  var findPopovers = function (target) {
    var i;
    var popovers = document.querySelectorAll('a');

    for (; target && target !== document; target = target.parentNode) {
      for (i = popovers.length; i--;) {
        if (popovers[i] === target) {
          return target;
        }
      }
    }
  };

  var onPopoverHidden = function () {
    popover.style.display = 'none';
    popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
  };

  var backdrop = (function () {
    var element = document.createElement('div');

    element.classList.add('backdrop');

    element.addEventListener('touchend', function () {
      popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
      popover.classList.remove('visible');
      popover.parentNode.removeChild(backdrop);
    });

    return element;
  }());

  var getPopover = function (e) {
    var anchor = findPopovers(e.target);

    if (!anchor || !anchor.hash || (anchor.hash.indexOf('/') > 0)) {
      return;
    }

    try {
      popover = document.querySelector(anchor.hash);
    }
    catch (error) {
      popover = null;
    }

    if (popover === null) {
      return;
    }

    if (!popover || !popover.classList.contains('popover')) {
      return;
    }

    return popover;
  };

  var showHidePopover = function (e) {
    var popover = getPopover(e);

    if (!popover) {
      return;
    }
    if ($(popover).hasClass("visible")) {
      $(backdrop).trigger("touchend");
    } else {
      popover.classList.add('visible');
      popover.style.display = 'block';
      popover.parentNode.appendChild(backdrop);
    }
  };

  window.addEventListener('touchend', showHidePopover);

}());

/* ========================================================================
 * Ratchet: toggles.js v2.0.2
 * http://goratchet.com/components#toggles
 * ========================================================================
 Adapted from Brad Birdsall's swipe
 * Copyright 2014 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 * ======================================================================== */

!(function () {
  'use strict';

  var start = {};
  var touchMove = false;
  var distanceX = false;
  var toggle = false;

  var findToggle = function (target) {
    var i;
    var toggles = document.querySelectorAll('.toggle');

    for (; target && target !== document; target = target.parentNode) {
      for (i = toggles.length; i--;) {
        if (toggles[i] === target) {
          return target;
        }
      }
    }
  };

  window.addEventListener('touchstart', function (e) {
    e = e.originalEvent || e;

    toggle = findToggle(e.target);

    if (!toggle) {
      return;
    }

    var handle = toggle.querySelector('.toggle-handle');
    var toggleWidth = toggle.clientWidth;
    var handleWidth = handle.clientWidth;
    var offset = toggle.classList.contains('active') ? (toggleWidth - handleWidth) : 0;

    start = { pageX: e.touches[0].pageX - offset, pageY: e.touches[0].pageY };
    touchMove = false;
  });

  window.addEventListener('touchmove', function (e) {
    e = e.originalEvent || e;

    if (e.touches.length > 1) {
      return; // Exit if a pinch
    }

    if (!toggle) {
      return;
    }

    var handle = toggle.querySelector('.toggle-handle');
    var current = e.touches[0];
    var toggleWidth = toggle.clientWidth;
    var handleWidth = handle.clientWidth;
    var offset = toggleWidth - handleWidth;

    touchMove = true;
    distanceX = current.pageX - start.pageX;

    if (Math.abs(distanceX) < Math.abs(current.pageY - start.pageY)) {
      return;
    }

    e.preventDefault();

    if (distanceX < 0) {
      return (handle.style.webkitTransform = 'translate3d(0,0,0)');
    }
    if (distanceX > offset) {
      return (handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)');
    }

    handle.style.webkitTransform = 'translate3d(' + distanceX + 'px,0,0)';

    toggle.classList[(distanceX > (toggleWidth / 2 - handleWidth / 2)) ? 'add' : 'remove']('active');
  });

  window.addEventListener('touchend', function (e) {
    if (!toggle) {
      return;
    }

    var handle = toggle.querySelector('.toggle-handle');
    var toggleWidth = toggle.clientWidth;
    var handleWidth = handle.clientWidth;
    var offset = (toggleWidth - handleWidth);
    var slideOn = (!touchMove && !toggle.classList.contains('active')) || (touchMove && (distanceX > (toggleWidth / 2 - handleWidth / 2)));

    if (slideOn) {
      handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';
    } else {
      handle.style.webkitTransform = 'translate3d(0,0,0)';
    }

    toggle.classList[slideOn ? 'add' : 'remove']('active');

    e = new CustomEvent('toggle', {
      detail: { isActive: slideOn },
      bubbles: true,
      cancelable: true
    });

    toggle.dispatchEvent(e);

    touchMove = false;
    toggle = false;
  });

}());

/**
 * Title: tabs.js
 * Description: tabs.js
 * Author: huang.xinghui
 * Created Date: 14-5-27 上午10:14
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
(function (fish, $) {
  var Tab = fish.Tab = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Tab.DEFAULTS, options);
    this.delegateEvent();
  };

  Tab.DEFAULTS = {
    onTabChanged: fish.noop
  }

  Tab.prototype = {
    delegateEvent: function () {
      this.$element.on('touchend', '.tab-item', this.onTouchEnd.bind(this));
      this.$element.on('click', '.tab-item', this.onClick.bind(this));
    },

    switchTo: function (index) {
      this.switchElement(this.$element.find('.tab-item')[index]);
    },

    switchElement: function (targetTab) {
      var activeTab;
      var activeBodies;
      var targetBody;
      var tabIndex;
      var className = 'active';
      var classSelector = '.' + className;

      if (!targetTab) {
        return;
      }

      activeTab = targetTab.parentNode.querySelector(classSelector);

      if (activeTab) {
        activeTab.classList.remove(className);
      }

      targetTab.classList.add(className);

      if (!targetTab.hash) {
        return;
      }

      targetBody = document.querySelector(targetTab.hash);

      if (!targetBody) {
        return;
      }

      activeBodies = targetBody.parentNode.querySelectorAll(classSelector);

      for (var i = 0; i < activeBodies.length; i++) {
        activeBodies[i].classList.remove(className);
      }

      targetBody.classList.add(className);

      tabIndex = this.$element.find(classSelector).index();
      this.options.onTabChanged(tabIndex);
    },

    onTouchEnd: function (e) {
      this.switchElement(e.currentTarget);
    },

    onClick: function (e) {
      e.preventDefault();
    }
  }
})(fish, Zepto);
