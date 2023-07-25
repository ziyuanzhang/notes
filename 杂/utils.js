import qs from "qs";
export const checkEmail = (mail) => {
  const strRegex = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
  return strRegex.test(mail);
};
export const checkPhone = (tel) => {
  return /^1[3456789]\d{9}$/.test(tel);
};
export const checkFixesTel = (tel) => {
  tel = tel.replace(/[^-|\d]/g, "");
  return /^((\+86)|(86))?(1)\d{10}$/.test(tel) || /^0[0-9-]{10,13}$/.test(tel);
};
export const checkNumber = (val) => {
  return /^\d+$/.test(val);
};
export const checkNumber2 = (val) => {
  return /(^[0-9]\d*$)/.test(val);
};
export const checkPostCode = (val) => {
  if (val.length === 6) {
    return /^\d+$/.test(val);
  } else {
    return false;
  }
};
//-----验证码---------
export const checkVerificationCode = (val) => {
  if (val.length !== 4) {
    return false;
  }
  return /(^[0-9]\d*$)/.test(val);
};
//-----正整数---------
export const checkPositiveInteger = (val) => {
  return /(^[1-9]\d*$)/.test(val);
};
/* 校验身份证号  */
export const checkIdCard = (id) => {
  let flag = true;

  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (reg.test(id) === false) {
    flag = false;
  }
  return flag;
};
export const getBase64Image = (img) => {
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
  let dataURL = canvas.toDataURL("image/" + ext);
  return dataURL;
};
export const uuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
};
export let guid = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
};
export const getUrlParams = (url) => {
  var params = url.split("?")[1].split("&");
  var obj = {};
  params.map((item) => (obj[item.split("=")[0]] = item.split("=")[1]));
  return obj;
};
export let getUrlParams2 = (key) => {
  let url = window.location.href;
  let arr = url.split("?");
  if (arr[1]) {
    let data = qs.parse(arr[1]);
    return data[key] ? data[key] : "";
  } else {
    return "";
  }
};
export const getQueryString = (name) => {
  var query = window.location.href.split("?")[1];
  if (query) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] === name) {
        return pair[1];
      }
    }
    return false;
  } else {
    return false;
  }
};
