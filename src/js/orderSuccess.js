/**
 * Title: orderSuccess.js
 * Description: 美食节成功页面
 * Author: wang.xiaohu
 * Created Date: 14-5-19 下午3:13
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
function orderSuccessPage() {
    /**
     *  美食节成功页面
     */
    var OrderSuccessMgr = {
        orderList: [],
        fTotal : 0,
        /**
         * 初始化
         */
        initUI: function () {
            var orderInfo = localStorage.getItem('orderInfo');
            OrderSuccessMgr.orderList = JSON.parse(orderInfo);

            OrderSuccessMgr.fTotal = localStorage.getItem('fTotal');

            var template = _.template($('#orderSuccess_rowTemplate').html());
            var liList = "";
            $.each(OrderSuccessMgr.orderList, function(i,item){
                liList += template({id:item.id, name:item.name, price: item.price, price:item.price,count:item.count});
            });

            $(liList).appendTo($("#content"));
            $('#successTotalPrice').html(OrderSuccessMgr.fTotal);
        }
    };
    // 头 + 内容
  var titleOpt = { showMoreBtn: false};
  var header = HeaderMgr.createTitle(titleOpt);
  var page ='<div class="page">' + header + $('#tpl-orderSuccess').html() + '</div>';
    fish.PageSlider.slidePage($(page), function(){
        OrderSuccessMgr.initUI();
    });
}


