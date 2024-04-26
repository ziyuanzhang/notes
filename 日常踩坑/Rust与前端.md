# Rust 与前端

前端工程化、可视化

Vite 的底层即将用 Rust 重写，即开发一个基于 Rust 的打包工具 Rolldown，以此替换掉原有的 Esbuild 和 Rollup。

## Vercel（Next.js 背后的公司）的 CEO Lee Robinson 老哥在两年前写过一篇文章——《Rust 是前端基建的未来》指出了以下的几个基建方向会被 Rust 所颠覆：

- webpack。即底层构建工具层。
- Babel。即 JavaScript 编译器。
- ESLint。即代码检查器。
- Prettier。即代码格式化工具。
- Terser。即代码压缩器。

2022 年 10 月底，Next.js 首先推出了第一款基于 Rust 的构建工具 Turbopack。Turbopack 由于本身的一些问题，比如不支持插件机制、和 Next.js 绑定太死，后来就一直不温不火了
2023 年 3 月，字节跳动 Web Infra 团队正式宣布发布了 Rspack（字节的不用关注）

## 编译器---JavaScript 编译器和 CSS 编译器

1.  JavaScript 编译器

    - Babel /SWC ：随着项目规模的扩大，Babel 的性能问题也逐渐暴露出来，随后基于 Rust 的 JavaScript 编译器 SWC 也应运而生。
    - SWC 的性能在单核机器上比 Babel 快 20 倍，而在多核机器上比 Babel 快 70 倍，相当惊人

2.  CSS 编译器
    这个领域当中 Lightning CSS 可以说一骑绝尘，它的性能比原有的 JS 开发的 CSS 工具链快了 100 多倍！

## 代码检查器

ESLint 本身是基于 JavaScript 开发的，但是它的性能一直是个问题，随着项目规模的扩大，ESLint 的性能问题也逐渐暴露出来。因此近几年诞生了基于 Rust 的 Lint 工具 OxcLint（字节的不用关注）。
ESLint 新版放弃“代码格式化”
