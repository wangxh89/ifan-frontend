/**
 *
 */

(function ($, undefined) {

  var Refresh = function(element, options) {
    this._options = $.extend({}, options);
    this.$el = $(element);
    this._create();
    this._init();
  };

  Refresh.prototype = {
    _init: function () {
      var me = this,
          opts = me._options;

      $.each(['up', 'down'], function (i, dir) {
        var $elem = opts['$' + dir + 'Elem'],
            elem = $elem.get(0);

        if ($elem.length) {
          me._status(dir, true);    //初始设置加载状态为可用
          if (!elem.childNodes.length || ($elem.find('.ui-refresh-icon').length && $elem.find('.ui-refresh-label').length)) {    //若内容为空则创建，若不满足icon和label的要求，则不做处理
            !elem.childNodes.length && me._createBtn(dir);
            opts.refreshInfo || (opts.refreshInfo = {});
            opts.refreshInfo[dir] = {
              $icon: $elem.find('.ui-refresh-icon'),
              $label: $elem.find('.ui-refresh-label'),
              text: $elem.find('.ui-refresh-label').html()
            }
          }
          $elem.on('click', function () {
            if (!me._status(dir) || opts._actDir) return;         //检查是否处于可用状态，同一方向上的仍在加载中，或者不同方向的还未加载完成 traceID:FEBASE-569
            me._setStyle(dir, 'loading');
            me._loadingAction(dir, 'click');
          });
        }
      });
    },

    _create: function () {
      var me = this,
          opts = me._options,
          $el = me.$el;

      opts.$upElem = $el.find('.ui-refresh-up');
      opts.$downElem = $el.find('.ui-refresh-down');
      $el.addClass('ui-refresh');
    },

    _createBtn: function (dir) {
      this._options['$' + dir + 'Elem'].html('<span class="ui-refresh-icon"></span><span class="ui-refresh-label">加载更多</span>');

      return this;
    },

    _setStyle: function (dir, state) {
      var me = this;

      return me._changeStyle(dir, state);
    },

    _changeStyle: function (dir, state) {
      var opts = this._options,
          refreshInfo = opts.refreshInfo[dir];

      switch (state) {
        case 'loaded':
          refreshInfo['$label'].html(refreshInfo['text']);
          refreshInfo['$icon'].removeClass();
          opts._actDir = '';
          break;
        case 'loading':
          refreshInfo['$label'].html('加载中...');
          refreshInfo['$icon'].addClass('ui-loading');
          opts._actDir = dir;
          break;
        case 'disable':
          refreshInfo['$label'].html('没有更多内容了');
          break;
      }

      return this;
    },

    _loadingAction: function (dir, type) {
      var me = this,
          opts = me._options,
          loadFn = opts.load;

      $.isFunction(loadFn) && loadFn.call(me, dir, type);
      me._status(dir, false);

      return me;
    },

    /**
     * 当组件调用load，在load中通过ajax请求内容回来后，需要调用此方法，来改变refresh状态。
     * @method afterDataLoading
     * @param {String} dir 加载的方向（'up' | 'down'）
     * @chainable
     * @return {self} 返回本身。
     */
    afterDataLoading: function (dir) {
      var me = this,
          dir = dir || me._options._actDir;

      me._setStyle(dir, 'loaded');
      me._status(dir, true);

      return me;
    },

    /**
     * 用来设置加载是否可用，分方向的。
     * @param {String} dir 加载的方向（'up' | 'down'）
     * @param {String} status 状态（true | false）
     */
    _status: function (dir, status) {
      var opts = this._options;

      return status === undefined ? opts['_' + dir + 'Open'] : opts['_' + dir + 'Open'] = !!status;
    },

    _setable: function (able, dir, hide) {
      var me = this,
          opts = me._options,
          dirArr = dir ? [dir] : ['up', 'down'];

      $.each(dirArr, function (i, dir) {
        var $elem = opts['$' + dir + 'Elem'];
        if (!$elem.length) return;
        //若是enable操作，直接显示，disable则根据text是否是true来确定是否隐藏
        able ? $elem.show() : (hide ? $elem.hide() : me._setStyle(dir, 'disable'));
        me._status(dir, able);
      });

      return me;
    },

    /**
     * 如果已无类容可加载时，可以调用此方法来，禁用Refresh。
     * @method disable
     * @param {String} dir 加载的方向（'up' | 'down'）
     * @param {Boolean} hide 是否隐藏按钮。如果此属性为false，将只有文字变化。
     * @chainable
     * @return {self} 返回本身。
     */
    disable: function (dir, hide) {
      return this._setable(false, dir, hide);
    },

    /**
     * 启用组件
     * @method enable
     * @param {String} dir 加载的方向（'up' | 'down'）
     * @chainable
     * @return {self} 返回本身。
     */
    enable: function (dir) {
      return this._setable(true, dir);
    },

    destroy: function() {
      this.$el.remove();
    }
  }

  var old = $.fn.filterable;

  $.fn.refresh = function(option) {
    this.each(function() {
      new Refresh(this, option)
    });
  }

  $.fn.refresh.Constructor = Refresh
  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.refresh.noConflict = function () {
    $.fn.refresh = old
    return this
  }
})(Zepto);
