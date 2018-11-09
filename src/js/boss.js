/**
 * 加载建议列表
 * @autor zhang.xiaofei10
 * @return {[type]} [description]
 */
function bossPage() {
    AdviceMgr.initUI();
}

var AdviceMgr = {
    /**
     * 页面初始化
     * @return {[type]} [description]
     */
    initUI: function() {
        $("#adviceSendBtn").on("click", AdviceMgr.sendAdvice);
        $("#adviceInput").on("keyup", function(event) {
            if (event.keyCode == 13) {
                AdviceMgr.sendAdvice(event);
            }
        });

        AdviceMgr.loadAdvices();
    },
    loadAdvices: function() {
        var $adviceList = $("#adviceList");

        var opts = {
            url: GLOBAL.server_url + 'suggest?m=qrySuggest',
            bottomHeight: 110,
            pageSize: 10, //必须大于10，否则滚动效果无法实现
            successHandler: successHandler,
            failureHandler: failureHandler
        };

        function successHandler(data) {
            console.log(data);
            if (data.rs && data.msg.length) {
                $.each(data.msg, function(index, val) {
                    val.userName = val.userName || "";
                    val.date = DateUtil.format(val.date, "yyyy-MM-dd");
                });
                var listHtml = _.template($('#tpl-boss-item').html(), {
                    advices: data.msg
                });
                $("#adviceList .table-view").append(listHtml);
            }
        }

        function failureHandler() {
            tr('数据加载失败...');
        }

        new fish.zIScroll('#boss', opts);
    },
    /**
     * 新增建议
     */
    sendAdvice: function(event) {
        //1.判断一下用户有没有登录，没有登录的话，进入登录界面
        var isUserLogin = localStorage.getItem('USER_TOKEN');
        if (!isUserLogin) {
            fish.Router.navigate("login?redirectUrl=boss");
            return;
        }
        var val = $("#adviceInput").val();
        val = $.trim(val);
        if (!val) {
            return;
        }
        GLOBAL.async("suggest", "addSuggest", {
            suggest: val
        }, function(data) {
            var listHtml = _.template($('#tpl-boss-item').html(), {
                advices: [{
                    comment: val
                }]
            });
            $("#adviceList .table-view").prepend(listHtml);
        }, function(data) {
            tr('发表建议失败...');
        });
    }
};