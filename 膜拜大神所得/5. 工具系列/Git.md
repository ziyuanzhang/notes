# Git 提交规范

现在社区一般都大致遵循这个规范：

- feat: 增加新的业务功能
- fix: 修复业务问题/BUG
- perf: 优化性能
- style: 更改代码风格, 不影响运行结果
- refactor: 重构代码
- revert: 撤销更改
- test: 测试相关, 不涉及业务代码的更改
- docs: 文档和注释相关
- chore: 更新依赖/修改脚手架配置等琐事
- workflow: 工作流改进
- ci: 持续集成相关
- types: 类型定义文件更改
- wip: 开发中

## package.json 文件

```code
"lint-staged": {
  "*.{vue,js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,less,scss,html,md}": [
    "prettier --write"
  ],
  "package.json": [
    "prettier --write"
  ]
}
```

## 检测

1. commitlint/cli + commitlint/config-conventional: git 提交检测
2. stylelint / stylelint-order / stylelint-config-standard: css 检测
3. stylelint-scss / stylelint-config-recommended-scss: 支持 scss 检测
4. husky / lint-staged: git 提交前回调
5. conventional-changelog-cli: 约定式提交和自动生成 changelog
