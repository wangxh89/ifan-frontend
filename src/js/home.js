/**
 * Title: home.js
 * Description: home.js
 * Author: huang.xinghui
 * Created Date: 14-5-28 上午10:00
 * Copyright: Copyright 2014 ZTESOFT, Inc.
 */
function home(tabIndex) {
  var popoverHidden = function() {
    if($("#popover").hasClass("visible")){
        tr("into ");
        var onPopoverHidden = function () {
            popover.style.display = 'none';
            popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
        };
        var popover = document.getElementById("popover");
        popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
        popover.classList.remove('visible');
        popover.parentNode.removeChild($(".backdrop")[0]);
    }
  }
  if (!app.homeView) {
    var headerHtml = HeaderMgr.createTitleHtml();
    var menuPageHtml = '<div class="page">' +
      headerHtml + $('#tpl-tab').html() +
      '<div class="homeContent">' +
      $('#tpl-menu').html() +
      $('#tpl-cate').html() +
      $('#tpl-bulletin').html() +
      $('#tpl-boss').html() +
      '</div></div>';

    app.homeView = $(menuPageHtml);

    fish.PageSlider.slidePage(app.homeView, function () {
      function onTabChanged(tabIndex) {
        if (isAndroid) {
          if ((typeof SoftKeyboard) != 'undefined')
            SoftKeyboard.hide();
        }

        // 当页面切换的时候，把下拉列表给删除
          popoverHidden();

//        if (tabIndex === 1 && !app.cateInitial) {
//          catePage();
//          app.cateInitial = true;
//        } else if (tabIndex === 2 && !app.bulletinInitial) {
//          bulletinPage();
//          app.bulletinInitial = true;
//        } else if (tabIndex === 3 && !app.bossInitial) {
//          bossPage();
//          app.bossInitial = true;
//        }

        if(tabIndex ===1 && !app.bulletinInitial){
          bulletinPage();
          app.bulletinInitial = true;
        }

      }

      app.tab = new fish.Tab(document.querySelector('.bar-tab'), {
        onTabChanged: onTabChanged
      });
    });

    app.cateController = new CatePage();
//    app.cateInitial = true;

    $('.showKeyBoardBtn').on('click', function () {
      console.log('showKeyBoardBtn');
      if (isAndroid) {
        SoftKeyboard.show();
      }
    });
    $('.hideKeyBoardBtn').on('click', function () {
      console.log('hideKeyBoardBtn');
      if (isAndroid) {
        SoftKeyboard.hide();
      }
    });
  }
  else {
    fish.PageSlider.slidePage(app.homeView, function () {
      if (ValidateUtil.isNumber(tabIndex)) {
        app.tab.switchTo(tabIndex);
      }
        // 当页面切换的时候，把下拉列表给删除
       setTimeout(popoverHidden,300);
    });

    app.cateController.checkLogin();
  }
}

function historyBack() {
  console.log('historyBack');
  if (isAndroid) {
    SoftKeyboard.hide();
  }

  fish.PageSlider.back();
}

var HomeMgr = {
  refreshTitle: function () {
    app.homeView.find('header').html($(HeaderMgr.createTitleHtml()).html());
  }
}
