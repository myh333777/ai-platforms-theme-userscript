<h1 align="center">AI 全平台视觉瘦身、18 套主题与品牌伪装</h1>

<p align="center">
  面向 ChatGPT、Gemini、NotebookLM、Google AI Studio 与 Google Antigravity 的一体化油猴脚本（Userscript），提供编辑级排版、18 套双模式主题、代码折叠、表格防截断与可选品牌伪装。
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/myh333777/ai-platforms-theme-userscript/main/ai-platforms-all-in-one.user.js"><img src="https://img.shields.io/badge/%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85_Userscript-v6.4.0-2B5B84?style=for-the-badge&logo=tampermonkey&logoColor=white" alt="一键安装 Userscript v6.4.0"></a>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/myh333777/ai-platforms-theme-userscript/main/ai-platforms-all-in-one.user.js"><img src="https://img.shields.io/badge/Version-v6.4.0-3776AB?style=flat-square" alt="Version v6.4.0"></a>
  <img src="https://img.shields.io/badge/Platforms-5_AI_Workbenches-4B5563?style=flat-square" alt="支持 5 大 AI 平台">
  <img src="https://img.shields.io/badge/Themes-18_Light%2FDark-0891B2?style=flat-square" alt="18 套日夜间主题">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-22C55E?style=flat-square" alt="License: MIT"></a>
</p>

## 支持平台

| 平台 | 匹配域名 | 专项适配要点 |
|---|---|---|
| ChatGPT | `chatgpt.com` / `chat.openai.com` | 居中宽度锁定、DIL 卡片/KPI 标题隔离、表格斑马纹、输入框高度保护 |
| Google Gemini | `gemini.google.com` | 侧栏与顶栏瘦身、`.enable-luminous-code-block` 对比度与内边距修正、`<sequence>` 主题化、追问建议控制 |
| Google NotebookLM | `notebook.google.com` / `notebooklm.google.com` | `<notebook-header>` 瘦身、思维链与引用角标对齐、Luminous `.dark-mode` 自动跟随 |
| Google AI Studio | `aistudio.google.com` | `<ms-cmark-node>` 无 `tbody` 表格与 `tr.table-header` 适配、`ms-code-block` 折叠按钮与面板收纳 |
| Google Antigravity | `antigravity.google.com` / `antigravity.static.usercontent.goog` | 跨源 iframe 实时配置同步、Shadow DOM 样式穿透、暗色模式双向联动 |

## 核心特性

- **黄金比例排版与宽度控制**：统一字号、行间率、段落间距、字距、四级标题比例与中英字体（无衬线 / 等宽 / 学术宋体），支持标准列宽、全宽铺满与像素级滑块调节。
- **18 套日/夜间双模式主题**：自动识别站点浅色与深色模式，分「中对比 / 低对比 / 高对比」三档，覆盖 1~4 级标题徽章、加粗高亮（纯正 / 暖金底线 / 薄荷微底）、引用块、序号徽章、行内代码与表格斑马纹。
- **代码块智能折叠与限高**：支持「智能折叠（超过 8 行）/ 全部折叠 / 全部展开」及面板内直接调节最大高度（220px / 300px / 460px / 不限）。
- **表格与长链接优化**：自动识别紧凑短列居中防折行、保留首列标签最小宽度避免挤压，并对 URL、路径、CamelCase 等长标识符智能插入 `<wbr>` 断点。
- **可选品牌伪装（摸鱼模式）**：默认保持原生品牌，支持在面板或扩展菜单一键切换 DeepSeek、Kimi、豆包或恢复原生，无刷新替换 Logo、标签页标题、Favicon 与输入框提示词。
- **独立站点配置 & 多站同步**：各站点独立保存偏好，支持在设置面板底部一键「同步到5站」或通过 `Alt + A` 快捷键随时呼出面板。

## 一键安装

1. 先在浏览器安装任意用户脚本管理器：[Tampermonkey](https://www.tampermonkey.net/)、[Violentmonkey](https://violentmonkey.github.io/) 或 [ScriptCat](https://docs.scriptcat.org/)。
2. 点击下方按钮即可弹出扩展安装确认页（仓库为公开状态时直接生效，后续也会通过 `@updateURL` 自动检查更新）：

[![点击一键安装 v6.4.0](https://img.shields.io/badge/%E7%82%B9%E5%87%BB%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85-ai--platforms--all--in--one.user.js-2B5B84?style=for-the-badge)](https://raw.githubusercontent.com/myh333777/ai-platforms-theme-userscript/main/ai-platforms-all-in-one.user.js)

3. 手动安装备选：打开 [`ai-platforms-all-in-one.user.js`](ai-platforms-all-in-one.user.js) 点击 **Raw**，或复制全文到脚本管理器新建保存。

## 快速上手

1. 安装后打开上述任意支持的 AI 网站并刷新页面。
2. 按快捷键 `Alt + A` 或点击右下角悬浮按钮 `Aa 排版·主题`（可自由拖拽位置）打开设置中心。
3. 在「排版比例 / 版面瘦身 / 18套主题」三个分页按需调节字号、列宽、代码块折叠策略、主题或品牌伪装；如需全平台统一风格，点击底部「同步到5站」。

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。
