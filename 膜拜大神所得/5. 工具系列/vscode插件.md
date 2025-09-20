npm install serve -g ; 本地服务：serve

# vscode 插件 https://github.com/varHarrie/YmxvZw/issues/10

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

## 用户设置配置

```json
{
  "workbench.iconTheme": "material-icon-theme",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit" //自动进行 ESlint 修复代码
  },
  // #每次保存的时候自动格式化
  "editor.formatOnSave": true,
  "editor.wordWrap": "on",
  "git.confirmSync": false,
  "git.autofetch": true,
  "terminal.integrated.rendererType": "dom",
  "prettier.trailingComma": "none",
  "prettier.singleQuote": false,
  "prettier.semi": true,
  "prettier.jsxBracketSameLine": true,
  "files.autoSave": "off",
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
    //"editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "[javascript|react]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript|react]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "update.mode": "manual",
  "diffEditor.ignoreTrimWhitespace": false,
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "bracketPairColorizer.depreciation-notice": false,
  "less.compile": {
    "compress": true, // true => remove surplus whitespace
    "sourceMap": false, // true => generate source maps (.css.map files)
    "out": true // false => DON'T output .css files (overridable per-file, see below)
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "git.suggestSmartCommit": false,
  "security.workspace.trust.untrustedFiles": "open",
  "leek-fund.stocks": [
    "sh000001",
    "sh000300",
    "sh000016",
    "sh000688",
    "hk03690",
    "hk00700",
    "usr_ixic",
    "usr_dji",
    "usr_inx",
    "nf_IF0",
    "nf_IH0",
    "nf_IC0",
    "nf_IM0",
    "hf_OIL",
    "hf_CHA50CFD"
  ],
  "yaml.schemas": {
    "file:///c%3A/Users/26615/.vscode/extensions/docsmsft.docs-yaml-1.0.5/dist/toc.schema.json": "/toc\\.yml/i"
  },
  "[yaml]": {
    "editor.defaultFormatter": "redhat.vscode-yaml"
  },
  "window.customTitleBarVisibility": "windowed",
  "path-intellisense.mappings": {
    "/": "${workspaceFolder}/public/", // ”/“ 系统根目录
    "@": "${workspaceFolder}/src" // ”.“ 设置 VScode 的 workspaceFolder，作为插件的 workspaceFolder
  },
  "settingsSync.ignoredExtensions": ["vue.volar"],
  "vsicons.dontShowNewVersionMessage": true,
  "Codegeex.License": "",
  "Codegeex.Privacy": false,
  "breadcrumbs.enabled": false,
  "git.openRepositoryInParentFolders": "never"
}
```
