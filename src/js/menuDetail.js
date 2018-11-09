function menuDetail(menuId) {
  var commentTemplate = _.template($('#tpl-menu-comment').html());
  var menuDetailPageTpl = _.template($('#tpl-menuDetail').html());
  var commetScroll;
  var typeDefinition = {
    "0": "咸鲜",
    "1": "微辣",
    "2": "辣"
  };

  /**
   * 根据传入的菜品id查询菜品信息，并且执行传入的回调函数
   * @param menuId 菜品id
   * @param callback 查询成功后执行的回调函数
   * @returns {*}
   */
  function qryMenuItem(menuId, callback) {
    var result;
    GLOBAL.async('menu', 'qryMenuById', {menuId: menuId}, function (data) {
      result = data.msg[0];
      callback(result);
    }, function (err) {
      console.log(err);
    });
  };

  /**
   * load comments
   * @param data
   */
  function loadComments(data) {
    console.log("data:" + data);
    var arrComments = data.msg;
    if (arrComments && arrComments.length > 0) {
      var $commentList = $("#menuCommentList ul");
      $.each(arrComments, function (i1, comment) {
        var index = Math.floor(Math.random() * 5 + 1);
        var src = "img/boss/m_" + index + ".png";
        var li = commentTemplate({
          userIcon: src,
          comment: comment.comment
        });
        $commentList.append(li);
      });
    }
    ;
  };
  /**
   * 提交评论
   */
  function commentMenu(menuObj) {
    if ($.trim(menuObj["comment"]) == "") {
      $("#commentInput").val("");
      return;
    }
    GLOBAL.async("menu", "commentMenu", menuObj, function (data) {
      if (data.rs) {
        //新增加的评论加到评论列表的上方
        var li = commentTemplate({
          userIcon: "img/boss/m_" + Math.floor(Math.random() * 5 + 1) + ".png",
          comment: menuObj.comment
        });
        $("#menuCommentList ul").prepend(li);
        if (commetScroll.iscroll) {
          commetScroll.iscroll.refresh();
          commetScroll.iscroll.maxScrollY = commetScroll.iscroll.maxScrollY - 55;
          commetScroll.iscroll.scrollToElement("#menuCommentList ul li:nth-child(1)", 1000, null, true, IScroll.utils.ease.elastic);
        }
        $("#commentInput").val("");
      } else {
        console.log(data.error);
      }
    }, function (err) {
      console.log(err);
    });
  };
  /**
   *计算评分
   */
  function calRate(menuItem) {
    var good = menuItem.good;
    var bad = menuItem.bad;

    if (good + bad == 0) {
      return 0;
    } else {
      return Math.round(good / (good + bad) * 10);
    }
  };
  /**
   * 评价菜品
   * @param action A:赞  X:踩
   */
  function gradeMenu(action) {
    GLOBAL.async("menu", "gradeMenu", {
      menuId: menuId,
      score: action
    }, function (data) {
      if (data.rs) {
        console.log("评价成功");
        //成功后需要重新计算评分
        qryMenuItem(menuId, function (curMenuItem) {
          //评分
          var rate = calRate(curMenuItem);
          $("#divStarRating").starRating("setRate", rate)
        });
      } else {
        console.log(data.error);
      }
    }, function (err) {
      console.log(err);
    });
  }

  //加载图片、展示菜品的信息和打星
  qryMenuItem(menuId, function (curMenuItem) {
    curMenuItem.typeName = typeDefinition[curMenuItem.type];
    if (curMenuItem.menupics && curMenuItem.menupics.length > 0) {
      var coverImg = curMenuItem.menupics[0];
      curMenuItem.coverImg = {
        'path': GLOBAL.server_url + coverImg['path'],
        'alt': coverImg["name"]
      };
    } else {
      curMenuItem.coverImg = {
        'path': "img/menu/menu_default.png"
      };
    }
    ;

    var titleOpt = {showBackBtn: true, title: '菜单详情', showMoreBtn: false};
    var headerHtml = HeaderMgr.createTitle(titleOpt);

    var menuDetailPageHtml = '<div class="page">' + headerHtml + menuDetailPageTpl({"curMenuItem": curMenuItem}) + '</div>';
    fish.PageSlider.slidePage($(menuDetailPageHtml), function () {
      //评分
      var rate = calRate(curMenuItem);
      $("#divStarRating").starRating("setRate", rate).starRating("setEditable", false);

      $("#btnGood").on("click", function () {
        gradeMenu("A");
      });
      $("#btnBad").on("click", function () {
        gradeMenu("X");
      });

      //menu comments
      var opts = {
        url: GLOBAL.server_url + 'menu?m=qryComment',
        pageSize: 10,
        param: {'menuId': menuId},
        successHandler: loadComments,
        failureHandler: function () {
          console.log("数据加载失败");
        }
      };

      commetScroll = new fish.zIScroll('.menu-detail-content', opts);

      //提交评论的事件处理
      $("#btnSubmitComment").on("click", function (event) {
        var obj = {
          menuId: menuId,
          comment: $("#commentInput").val()
        };
        commentMenu(obj);
        event.preventDefault();
      });
      $("#commentInput").on("keypress", function (e) {
        if (e.which == 13) {
          var obj = {
            menuId: menuId,
            comment: $("#commentInput").val()
          };
          commentMenu(obj);
        }
      });
    });
  });
}
