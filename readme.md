# p3a7k

一个用于最小化 npm CLI 的学习示例：**一条命令启动本地 Web 服务，并自动打开浏览器**。

发布到 npm 后，任何安装了 Node.js 或 Bun 的机器都可以直接运行，无需先克隆仓库：

```sh
npx p3a7k
# 或使用 Bun
bunx p3a7k
```

运行后服务默认监听 `http://localhost:3000`，浏览器会自动打开，页面显示 `⚡️ Tadaa!`。

## 环境要求

- Node.js `>= 20.11.1`（由 `h3` 依赖决定，见 [package-lock.json](./package-lock.json)），或 Bun
- 依赖：仅 [`h3`](https://h3.dev)（v2 发布候选版）

## 快速开始（本地开发）

```sh
# 安装依赖
npm install

# 直接运行 CLI（等价于用户 npx 的效果）
node cli.mjs
```

自定义端口：

```sh
# Windows PowerShell
$env:PORT=4000; node cli.mjs

# macOS / Linux
PORT=4000 node cli.mjs
```

## 工作原理

核心逻辑全部在 [cli.mjs](./cli.mjs) 中，只做三件事：

1. **创建应用**：用 `h3` 新建应用，并注册一个根路由，访问 `/` 时返回字符串 `"⚡️ Tadaa!"`。
2. **启动服务**：`serve(app, { port })` 在 `PORT`（默认 `3000`）上监听。
3. **打开浏览器**：延迟 500ms（等服务就绪）后，根据当前操作系统调用系统命令打开页面：
   - macOS → `open <url>`
   - Windows → `cmd /c start <url>`
   - 其他（Linux 等）→ `xdg-open <url>`

`spawn(..., { detached: true, stdio: 'ignore' })` 让浏览器进程与 CLI 分离，CLI 退出后不影响已打开的页面。

## 为什么 `npx p3a7k` 就能跑起来？

关键在 [package.json](./package.json) 的 `bin` 字段：

```json
{
  "type": "module",
  "bin": {
    "p3a7k": "./cli.mjs"
  }
}
```

- `bin` 声明了包提供的可执行命令名 `p3a7k`，入口是 `./cli.mjs`。
- `npx p3a7k` 会先从 npm 源下载该包，然后在临时目录执行 `node ./cli.mjs`。
- `"type": "module"` 让 `.mjs` 文件以 ESM 方式解析，因此可以使用 `import` 语法。
- [cli.mjs](./cli.mjs) 首行的 `#!/usr/bin/env node` 是 shebang，保证在类 Unix 系统上作为可执行脚本被正确调用。

## 项目结构

```
p3a7k/
├─ cli.mjs            # CLI 入口：起服务 + 打开浏览器
├─ package.json       # 包元信息、bin 声明、依赖
├─ package-lock.json  # 依赖锁定（随仓库提交，保证可复现）
├─ .gitignore         # git 忽略规则
├─ LICENSE            # MIT 许可证
└─ readme.md          # 本文档
```

## 发布

包通过 `package.json` 的 `files` 字段声明**白名单**，只有 `cli.mjs` 会被打包；`package.json`、`readme.md`、`LICENSE` 由 npm 强制包含，`node_modules` 与 `package-lock.json` 默认排除。

发布前先复核打包内容：

```sh
npm pack --dry-run
```

然后更新版本并发布：

```sh
npm login            # 未登录时先登录
npm version patch    # 或 minor / major，会同步打 git tag
npm publish
npx p3a7k@latest     # 验证
```

注意：npm 不支持单独更新 readme，改动只会随新版本发布生效；版本号不能与线上已有版本重复。

## License

[MIT](./LICENSE)

## 学习要点

这个小项目适合用来理解以下概念：

- **npm 包的可执行文件分发**：`bin` 字段 + shebang 如何让一个 JS 文件变成全局命令。
- **零安装运行体验**：`npx` / `bunx` 如何临时拉取并执行包。
- **跨平台差异处理**：用 `process.platform` 分发到 `open` / `start` / `xdg-open`。
- **Node 内置模块**：`child_process.spawn` 启动外部进程，`process.env` 读取环境变量。
- **最小 Web 服务**：用 `h3` 定义路由与响应。