# cookie

```js 设置cookie
function cookie() {
  if (document.cookie == "") {
    var str = "usename=ddd,pass=ww";
    var shi = new Date();
    shi.setHours(shi.getHours() + 1);
    document.cookie = str + ";expires=" + shi.toGMTString();
  } else {
    document.getElementById("mask").style.display = "none";
    document.getElementById("pic1").style.display = "none";
    console.log(document.cookie);
  }
}
```

```js 设置cookie
function setCookie(name, value, expiretimes) {
  var exp = new Date();
  exp.setTime(exp.getTime() + 12 * 60 * 60 * 1000);
  document.cookie =
    name +
    "=" +
    escape(value) +
    (expiretimes == null ? "" : ";expires=" + exp.toGMTString());
}
```

```js 读取cookies
function getCookie(name) {
  var arr,
    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
  else return null;
}
```

```js 删除cookies
function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
```
