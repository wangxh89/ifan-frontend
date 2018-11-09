/**
 * @class StarRating
 *
 * 评价组件
 * TODO 支持是否允许半颗星
 */
(function($,undefined){

    function addHandlerForRatingStar(item){
        $(item).click(function(e) {
            $(this).removeClass('rating').siblings().removeClass('rating');
            var $prev = $(this);
            while($prev.size() > 0){
                $prev.addClass('rating');
                $prev = $prev.prev();
            }
            e.preventDefault();
        });
    };

    var StarRating = function(element) {
        this.$el = $(element);
        if(!this.$el.is("div")){
            throw "filterable must be setup on a div";
        };
        this._options = {
            starNum: 5
        };

        var starNum = this._options['starNum'];
        for(var i=0; i<starNum; i++) {
            var $item = $('<i class="fa fa-star-o"></i>')
            /*var $item = $('<a href="#"></a>')
                .addClass(i%2 == 1 ? 'rating-right' :'');*/
            addHandlerForRatingStar($item);
            this.$el.append($item);
        }
    };

    StarRating.prototype = {
        /**
         * 返回评价的星级
         */
        getRate:function() {
            var rateNum = this.$el.children("i.rating").size();
            return rateNum;
        },
        /**
         * 设置星级数量
         * @param rate 星级，比如3.5表示三星半
         */
        setRate:function(rate) {
            var rate = rate/2;
            if(rate - this._options['starNum'] >0){
                throw "rate should samller than star number"
            }
            var allStar = this.$el.children("i");
            allStar.removeClass("rating fa-star fa-star-o");
            allStar.each(function(index){
                if(index < rate) {
                    $(this).addClass("rating fa-star");
                    if(parseInt(rate)!= rate && index == Math.floor(rate)){
                        $(this).removeClass("fa-star-o").addClass("fa-star-half-full");
                    }
                }else{
                    $(this).addClass("fa-star-o");
                }
            });
        },
        /**
         * 设置是否可以编辑
         * @param flag 为true表示可编辑
         */
        setEditable:function(flag) {
            var allStars = this.$el.children("i");
            allStars.off("click");
            if(flag) {
                allStars.each(function(index) {
                    addHandlerForRatingStar(this);
                })
            } else {
                allStars.on("click",function(e){
                    e.preventDefault();
                });
            }
        }
    };

    var old = $.fn.starRating;
    $.fn.starRating = function(option) {
        var params = [].slice.call(arguments).slice(1);
        return this.each(function(){
            var instance = $(this).data('star-rating');
            if (!instance) {
                $(this).data('star-rating',(instance = new StarRating(this)));
            }
            if (typeof option == 'string') {
                instance[option].apply(instance,params);
            }
        });
    };

    $.fn.starRating.Constructor = StarRating;

    $.fn.starRating.noConflict = function(){
        $.fn.starRating = old;
        return this;
    };
})(Zepto);
