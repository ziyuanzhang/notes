npm install serve -g ; 本地服务：serve

## vscode 插件 https://github.com/varHarrie/YmxvZw/issues/10

1. Auto Close Tag: 自动补全标签； （新版已内置-2023-09-19）
2. Auto Rename Tag: 同步修改标签； （新版已内置-2023-09-19）
3. Auto import: 自动导入；（新版已内置-需开启-2023-09-19）
4. trailing Spaces: 删除结尾空格；（新版已内置-需开启-2023-09-19）
5. HTML boilerplate: HTML 模版； （新版已内置-2023-09-19）
6. path intellisense: 自动提示文件路径;（新版已内置-2023-09-19）
7. Image preview: 图片预览
8. Bracket Pair Colorizer: 给括号加上不同的颜色，便于区分不同的区块（新版已内置-需开启-2023-09-19）
9. vscode-pigments: 实时显示 css, sass, jsx 中的颜色
10. vetur: Vue 多功能集成插件; Vetur + Prettier + ESLint 解决冲突后配合使用完美格式化代码
11. Vue Language Features (Volar): vue3.0
12. ES7+ React/Redux/React-Native snippets
13. esLint
14. Prettier - Code formatter: 格式化 html/css/less/js/json/ts/react/vue
15. live server
16. project Manager
17. git history: 提交记录
18. GitLens — Git supercharged: 显示谁提交的
19. Node.js Modules Intellisense: 提供 JavaScript 和 TypeScript 导入声明时的自动补全
20. rest client: http 请求
21. Chinese (Simplified) Language Pack for Visual Studio Code
22. Code Spell Checker: 单词拼写检查
23. NGINX Configuration Language Support: nginx 配置格式化
24. easy less: less 转 css;
25. Comment Translate: 插件使用 Google Translate API 翻译注释
26. open in browser
27. Quokka.js: 非常厉害的调试工具
28. px to rem & rpx & vw (cssrem): 将 px 转化为 rem
29. sourcetree
30. MarkDown All in One：开发+预览（右键-打开预览）
31. Debugger for Chrome

## 检测

1. commitlint/cli + commitlint/config-conventional: git 提交检测
2. stylelint / stylelint-order / stylelint-config-standard: css 检测
3. stylelint-scss / stylelint-config-recommended-scss: 支持 scss 检测
4. husky / lint-staged: git 提交前回调
5. conventional-changelog-cli: 约定式提交和自动生成 changelog

## 用户设置配置

{
  "workbench.iconTheme": "material-icon-theme",
  "window.zoomLevel": 0,
  "editor.formatOnSave": true,
  "editor.wordWrap": "on",
  "git.confirmSync": false,
  "git.autofetch": true,
  "terminal.integrated.rendererType": "dom",
  "workbench.activityBar.visible": true,
  "workbench.sideBar.location": "left",
  "vsicons.dontShowNewVersionMessage": true,
  "sync.forceUpload": true,
  "sync.gist": "681738001926e4a0cdd54a3daa2c5636",
  "liveServer.settings.donotShowInfoMsg": true,
  "prettier.jsxBracketSameLine": true,
  "prettier.trailingComma": "none",
  "prettier.bracketSpacing": false,
  "prettier.arrowParens": "avoid",
  "files.autoSave": "off",
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    // "editor.defaultFormatter": "vscode.html-language-features"
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[javascript|react]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript|react]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
