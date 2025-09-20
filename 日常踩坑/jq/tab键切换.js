(function (win, $) {
  /**
        Tab feature
    */
  $("header nav.global .country-selector").prop("href", "javascript:void(0)");
  var _tab_action = false;
  var jq_drop_menu = $(
    ".navbar-fixed-top .megamenu.drop-menu-toggle .drop-menu"
  );
  var jq_drop_menu_current = null;
  var st_active_name = "js-tab-focus";
  $(document).on("keydown", function (e) {
    if (Number(e.keyCode) === 9) {
      //press tab key
      _tab_action = true;
    }
  });

  $(document)
    .on("focusin", function (e) {
      //console.log(e.target)
      if (!_tab_action) return;
      _tab_action = false;
      var jq_target = $(e.target);
      $("." + st_active_name).removeClass(st_active_name);
      jq_target.addClass("js-tab-focus");
      if (jq_target.hasClass("menu-title")) {
        if (jq_drop_menu_current) {
          jq_drop_menu_current.find(".drop-menu").hide(0);
        }
        jq_drop_menu_current = jq_target.parent();
        var jq_submenu = jq_target.parent().find(".drop-menu");
        if (jq_submenu[0] && jq_submenu.is(":hidden")) {
          jq_submenu.show(0);
        }
      } else if (
        jq_drop_menu_current &&
        $.contains(jq_drop_menu_current[0], jq_target[0])
      ) {
        var jq_submenu = jq_drop_menu_current.find(".drop-menu");
        if (jq_submenu[0] && jq_submenu.is(":hidden")) {
          jq_submenu.show(0);
        }
      } else {
        if (jq_drop_menu_current) {
          jq_drop_menu_current.find(".drop-menu").hide(0);
        }
        jq_drop_menu_current = null;
      }
    })
    .on("focusout", function (e) {
      if (!_tab_action || $(e.target).hasClass(st_active_name)) {
        $("." + st_active_name).removeClass(st_active_name);
      }
    });
})(window, jQuery);
