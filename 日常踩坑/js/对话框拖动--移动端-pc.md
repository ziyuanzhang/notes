```
/*------------------对话框拖动------移动端/PC--------------*/
mobileDragEvent: function(dragTarget, moveTarget) {
    var dragextend = {
        //判断设备是否支持touch事件
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        slider: document.getElementById(dragTarget),
        //事件
        events: {
            handleEvent: function (event) {
                var self = this; //this指events对象
                if (event.type == 'touchstart') {
                    self.start(event);
                } else if (event.type == 'touchmove') {
                    self.move(event);
                } else if (event.type == 'touchend') {
                    self.end(event);
                }
            },
            //开始
            start: function (event) {
                var touch = event.targetTouches[0]; //touches数组对象获得屏幕上所有的touch，取第一个touch
                startPos = {
                    x: touch.pageX - $("#" + dragTarget).offset().left,
                    y: touch.pageY - $("#" + dragTarget).offset().top
                }; //取第一个touch的坐标值
                document.getElementById(dragTarget).addEventListener('touchmove', this, false);
                document.getElementById(dragTarget).addEventListener('touchend', this, false);
            },
            //移动
            move: function (event) {
                event.preventDefault();
                //当屏幕有多个touch或者页面被缩放过，就不执行move操作
                if (event.targetTouches.length > 1 || event.scale && event.scale !== 1) return;
                var touch = event.targetTouches[0];
                endPos = {
                    x: touch.pageX - startPos.x - $(document).scrollLeft(),
                    y: touch.pageY - startPos.y - $(document).scrollTop()
                };
                var obj = $("#" + moveTarget);
                obj.css({
                    'left': endPos.x,
                    'top': endPos.y
                });
            },
            //释放
            end: function (event) {
                //解绑事件
                document.getElementById(dragTarget).removeEventListener('touchmove', this, false);
                document.getElementById(dragTarget).removeEventListener('touchend', this, false);
            }
        },
        //初始化
        init: function () {
            var self = this; //this指slider对象
            if (!!self.touch) self.slider.addEventListener('touchstart', self.events, false); //addEventListener第二个参数可以传一个对象，会调用该对象的handleEvent属性
        }
    };
    dragextend.init();
}

dragEvent: function(dragTarget, moveTarget) {
    $(dragTarget).mousedown(function (e) {
        var isMove = true;
        var abs_x = e.pageX - $(moveTarget).offset().left;
        var abs_y = e.pageY - $(moveTarget).offset().top;
        $(document).mousemove(function (e) {
            $.IM.isClick = false;
            if (isMove) {
                var obj = $(moveTarget);
                obj.css({
                    'left': e.pageX - abs_x,
                    'top': e.pageY - (abs_y + $(document).scrollTop())
                });
            }
            return false;
        }).mouseup(function (e) {
            $.IM.isClick = true;
            isMove = false;
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
        });
        //return false;
    });
}

```

```
      function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return unescape(r[2]);
            return null;
        }
```
