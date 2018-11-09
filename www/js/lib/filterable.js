/**
 * @class jQuery.Filterable
 *
 * 过滤组件，现在只能用于过滤ul select table的数据
 * TODO 提供事件(beforefilter,filter)
 * TODO 样式
 */
(function ($, undefined) {

	/**
	*	默认是根据节点的text()值进行过滤，如果指定了filtertext属性，则根据属性值过滤
	*/
	function defaultFilterCallback( index, searchValue ) {
		return (($(this).attr("filtertext") || $(this).text() )
			.toLowerCase().indexOf( searchValue ) === -1 );
	};

  var Filterable = function(element, options) {
    this._options = $.extend({}, {
      filterCallback: defaultFilterCallback,
          children: " li,  option,  optgroup option,  tbody tr"
    }, options);

    var $el = this.$el = $(element);
    if(!$el || !$el.is("input")) {
      throw "filterable must be setup on a input element";
    };
    //data-target指定过滤的目标控件选择器
    var $target = $(this.$el.data("target"));
    if(!$target){
      throw "should use 'data-target' attribute to setup filter target"
    }

    this._target = $target;

    this._setInput();
  }

  Filterable.prototype = {
    _setInput: function ( selector ) {
      var $el = this.$el;
      $el.off("keyup").off("change").off("input");
      $el.on({
        keydown: $.proxy(this._onKeyDown,this),
        keypress: $.proxy(this._onKeyPress,this),
        keyup: $.proxy(this._onKeyUp,this),
        change: $.proxy(this._onKeyUp,this),
        input: $.proxy(this._onKeyUp,this)
      })
    },

    _getFilterableItems: function() {
      var children = this._options.children,
          items = !children ? { length: 0 }:
              $.isFunction( children ) ? children():
                  children.nodeName ? $( children ):
                      children.zepto ? children:
                          this._target.find( children );

      return items;
    },

    _filterItems: function( val ) {
      var idx, callback, length, dst,
          show = [],
          hide = [],
          opts = this._options,
          filterItems = this._getFilterableItems();

      if ( val != null ) {
        callback = opts.filterCallback || defaultFilterCallback;
        length = filterItems.length;

        // Partition the items into those to be hidden and those to be shown
        for ( idx = 0 ; idx < length ; idx++ ) {
          dst = ( callback.call( filterItems[ idx ], idx, val ) ) ? hide : show;
          dst.push( filterItems[ idx ] );
        }
      }
      //$( hide ).addClass( "ui-screen-hidden" );
      //$( show ).removeClass( "ui-screen-hidden" );

      $(hide).css({display:'none'});
      $(show).css({display:''});

      /*this._trigger( "filter", null, {
       items: filterItems
       });*/
    },

    _onKeyUp: function() {
      var val, lastval,
          $el = this.$el;
      val = $el.val().toLowerCase(),
          lastval = $el.data("lastval") + "";

      if ( lastval && lastval === val ) {
        // 值没有发生变化
        return;
      }

      if ( this._timer ) {
        window.clearTimeout( this._timer );
        this._timer = 0;
      }

      var that = this;
      this._timer = setTimeout( function() {
        /*if ( this._trigger( "beforefilter", null, { input: search } ) === false ) {
         return false;
         }*/

        $el.data("lastval",val);
        that._filterItems( val );
        that._timer = 0;
      }, 250 );
    },

    _onKeyDown: function( event ) {
      if ( event.keyCode === "13" ) {
        event.preventDefault();
        this._preventKeyPress = true;
      }
    },

    _onKeyPress: function( event ) {
      if ( this._preventKeyPress ) {
        event.preventDefault();
        this._preventKeyPress = false;
      }
    },

    destroy:function(){
      var items = this._getFilterableItems();
      items.removeClass( "ui-screen-hidden" );

      return this.$super('destroy');
    },

    refresh: function() {
      if ( this._timer ) {
        window.clearTimeout( this._timer);
        this._timer = 0;
      }
      this._filterItems( ( this.$el.val() || "" ).toLowerCase() );
    }
  }

  var old = $.fn.filterable;

  $.fn.filterable = function(option) {
    this.each(function() {
      new Filterable(this, option)
    });
  }

  $.fn.filterable.Constructor = Filterable
  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.filterable.noConflict = function () {
    $.fn.filterable = old
    return this
  }
})(Zepto)