# Eslint 配置及规则说明

## rules：规则的错误等级有三种

- "off"  或  0 - 关闭规则
- "warn"  或  1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
- "error"  或  2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)

## 配置代码注释方式

有时我们可能要在代码中忽略 eslint 的某种检查，或者加入某种特定检查，此时我们可以用如下的方式：
示例：

- 忽略 no-undef 检查 `/* eslint-disable no-undef */`

- 忽略 no-new 检查 `/* eslint-disable no-new */`

- 设置检查

  ```code
    /*eslint eqeqeq: off*/
    /*eslint eqeqeq: 0*/
  ```

- eslint 检查指令

1. 检查且修复 `eslint * --fix`

2. 检查指定文件 `eslint app.js --fix`
