/* $('#header .tool-drop-toggle').attr('href', 'javascript' + String.fromCharCode(58) + 'void(0);'); */

var _tab_action = false;
var st_active_name = "js-tab-focus";

$(document).on("keydown", function (e) {
  if (Number(e.keyCode) === 9) {
    _tab_action = true;
  }
});

$(document)
  .on("focusin", function (e) {
    var $target = $(e.target);
    if (!_tab_action) {
      return false;
    }
    $("." + st_active_name).removeClass(st_active_name);
    _tab_action = false;
    $target.addClass("js-tab-focus");
    if ($target.parents("li.dropdown").length > 0) {
      var $par_li = $target.parents("li.dropdown");
      var $targrt_ele = $par_li.find("ul.drop-menu-box");
      if ($targrt_ele.is(":hidden")) {
        $("ul.webex-nav-list li").find("ul.drop-menu-box").hide();
        $targrt_ele.show();
      }
    } else {
      if ($("ul.webex-nav-list li").find("ul.drop-menu-box").is(":visible")) {
        $("ul.webex-nav-list li").find("ul.drop-menu-box").hide();
      }
    }
  })
  .on("focusout", function () {
    $("." + st_active_name).removeClass(st_active_name);
  });
/**
    Tab feature  ------end--------ziyuan----------20180327
    */
