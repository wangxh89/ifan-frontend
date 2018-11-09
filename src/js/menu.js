function menu() {
    var hasMore = true;
    var menuItemTemplate = _.template($('#tpl-menu-item').html());
    var typeDefinition = {
        "0":"咸鲜",
        "1":"微辣",
        "2": "辣"
    };

    function loadMenus(data) {
        var arrMenu = data.msg;
        _.map(arrMenu, function(menuItem) {
            if(menuItem.menupics && menuItem.menupics.length > 0){
                menuItem.pic = GLOBAL.server_url + menuItem.menupics[0].path;
            }else{
                menuItem.pic = "img/menu/menu_default.png";
            }
            menuItem.menuType = menuItem.type ? menuItem.type : 0;
            menuItem.menuFlavorName = typeDefinition[menuItem.menuType];
            var menuItemState = menuItem.state ? parseInt(menuItem.state) : 0;
            if(menuItemState > 0 && (menuItemState & 1 || menuItemState & 2 || menuItemState & 4)){
                menuItem.todayReady = true;
            }
        });

        var htmlStr = menuItemTemplate({'menus': arrMenu});
        $("#menuItemList").children("ul").append(htmlStr);
    };

    var opts = {
      url: GLOBAL.server_url + 'menu?m=qryMenusByPage',
      pageSize: 10,
      successHandler: loadMenus,
      failureHandler: function() {
        console.log("数据加载失败");
      }
    };

    new fish.zIScroll('#menuContent', opts);
    $("#menuSearch").filterable();
}
