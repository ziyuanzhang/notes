export function checkPhone(rule: IString, value: string, callbackFn: Function) {
  const reg =
    /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
  if (value) {
    if (!reg.test(value)) {
      return Promise.reject("请输入正确的公司电话");
    } else {
      return Promise.resolve();
    }
  } else {
    return Promise.reject("请输入公司电话");
  }
}
