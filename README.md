# 废星拾荒者 MVP 内容包

这是单机网页放置/增量游戏《废星拾荒者》的第一版开发资料包，目标是让后续开发可以直接进入原型实现。

## 文件结构

- `DESIGN_SPEC.md`：开发版策划案、核心循环、数值节奏、界面和实现建议。
- `index.html`：可玩的单页网页原型入口。
- `src/app.js`：探索、战斗、背包、设施、装备、图鉴和存档逻辑。
- `src/styles.css`：游戏界面样式。
- `data/game_schema.json`：存档结构、核心公式、数据字段约定。
- `data/planet_rust_mother.json`：第一颗星球“锈蚀母星”的区域、解锁和事件权重。
- `data/items.json`：第一版完整道具表，包含 300+ 道具。
- `data/enemies.json`：第一星球敌人和 Boss 表。
- `data/facilities.json`：补给站设施升级表。
- `data/loot_tables.json`：区域掉落池和事件权重。
- `tools/generate_data.mjs`：可重复生成数据表的脚本。
- `tools/validate_data.mjs`：校验数据引用是否断链。
- `tools/balance_check.mjs`：检查早期收益和设施升级曲线。
- `tools/server.mjs`：本地静态服务器。

## 第一版范围

- 初始外出时长：20 分钟。
- 第一星球：锈蚀母星。
- 区域数量：6 个。
- 道具数量：300+。
- 敌人数量：24 个，含 5 个 Boss。
- 设施数量：10 个，每个 5 级。
- 核心系统：自动拾荒、自动战斗、背包、出售、设施升级、装备、图鉴完成度、离线收益。

## 建议实现方式

第一版可以做成纯前端单页网页游戏：

- `HTML + CSS + JavaScript`
- 数据文件以 JSON 方式加载。
- 存档使用 `localStorage`。
- 探索进程使用时间戳结算，而不是依赖页面一直打开。
- 后续新增星球时，只新增 `planet_xxx.json`、扩展道具和掉落表。

## 本地运行

```powershell
C:\Users\24894\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\tools\server.mjs
```

打开：

```text
http://127.0.0.1:4173
```

## 数值校验

```powershell
C:\Users\24894\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\tools\balance_check.mjs
```

当前早期曲线目标：

- 初始 20 分钟探索约 96 次事件。
- 1 级设施升级期望约 2.08 次探索。
- 2 级设施升级期望约 4.16 次探索。

## 游戏测试员模式

浏览器打开：

```text
http://127.0.0.1:4173/?qa=1
```

它会用真实页面点击路径验证：

- 电池装备安装与卸下。
- 批量出售垃圾。
- 设施升级。
- 仓库分类筛选。
- 连续战斗后耐久不会直接压到 1。
- 战斗会产生可见日志或记录。
