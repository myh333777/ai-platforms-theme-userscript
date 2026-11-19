# AI 全平台视觉瘦身、18 套主题与品牌伪装（All-in-One Userscript）

一款面向主流 AI 对话与研究工作台的 Tampermonkey / Violentmonkey 油猴脚本，提供统一的编辑级排版、18 套日/夜间双模式主题、代码块智能折叠、表格防截断与无刷新品牌伪装。

## 支持平台

- **ChatGPT**：`https://chatgpt.com/*`、`https://chat.openai.com/*`
- **Google Gemini**：`https://gemini.google.com/*`
- **Google NotebookLM**：`https://notebook.google.com/*`
- **Google AI Studio**：`https://aistudio.google.com/*`
- **Google Antigravity**：`https://antigravity.google.com/*`（含内部 `antigravity.static.usercontent.goog` iframe 跨域同步）

## 核心特性

- **排版与宽度控制**：统一字号、行高、段距、字距、标题比例与正文字体（无衬线 / 等宽 / 衬线），支持标准宽度、全宽铺满与自定义像素宽度。
- **18 套双模式主题**：自动跟随站点深浅色切换，覆盖 1~4 级标题徽章、加粗重点样式（纯正 / 暖金底线 / 薄荷底）、引用块、列表序号徽章、行内代码与表格斑马纹。
- **代码块智能折叠**：支持自动（超过 8 行折叠）/ 全部折叠 / 全部展开三种策略；针对 Gemini 新版 `.enable-luminous-code-block` 强制修正浅色模式对比度与标题栏按钮位置。
- **无刷新品牌伪装**：支持一键伪装为 DeepSeek、Kimi、豆包或恢复原生，同步替换页头 Logo、输入框占位提示词与浏览器标签页 Title / Favicon。
- **独立站点配置 & 多站同步**：各站点独立持久化偏好，支持面板内一键「同步到5站」或使用快捷键 `Alt + A` 呼出/收起设置面板。

## 安装

1. 安装浏览器扩展 [Tampermonkey](https://www.tampermonkey.net/) 或 Violentmonkey。
2. 在本仓库点击 [`ai-platforms-all-in-one.user.js`](ai-platforms-all-in-one.user.js) 的 **Raw** 按钮，扩展会自动弹出安装界面。
3. 也可直接复制本地或仓库中的 `.user.js` 文件内容新建脚本保存。
