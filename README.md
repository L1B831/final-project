# 扬帆手账 · 个人生活数据站

《软件开发综合实践指南》第七部分课后实践任务：个人技术整合练习，作为期末大作业的原型。

主题延续课堂六个人看板（消费月报）与课堂七个人三维场景（扬帆·自由之海），整合为海洋风的"个人生活数据站"。

## 项目简介

- **页面模块**：统一入口 `index.html`，Bootstrap 5.3.3 栅格搭建导航栏（首页 / 支出看板 / 明细查询 / 扬帆三维）与首页卡片
- **样式模块**：`css/style.css` 海洋风自定义样式（深海蓝渐变横幅、类别色顶边卡片），在 Bootstrap 之后引入保证可覆盖
- **交互模块**：明细查询按月份 / 类别联动筛选，实时显示合计（课堂五事件委托 + `data-*` 模式）
- **数据模块**：`data/expenses.json` 消费月报（月度汇总 + 逐笔明细，两处数据严格一致），fetch 三状态加载（加载中 / 暂无数据 / 加载失败）
- **可视化模块**：ECharts 柱状图（各月各类支出）+ Chart.js 折线图（消费趋势），有标题、单位与数据来源标注
- **三维进阶模块**：`three-d/scene.html` 复用课堂七个人场景"扬帆·自由之海"，从导航进入、可一键返回

各模块通过同一份 `expenses.json` 与贯穿全站的海洋主题衔接，不是四个孤立页面。

## 运行方法

本项目使用 `fetch` 加载本地 JSON 数据，**需要本地服务器运行，不能直接双击 `index.html` 打开**（`file://` 协议下浏览器会拦截 fetch 请求，导致看板空白）。

```bash
# 方法一：Python 内置服务器
cd final-project
python -m http.server 8000
# 浏览器访问 http://localhost:8000

# 方法二：VS Code Live Server 插件
# 右键 index.html → Open with Live Server
```

## 目录说明

```
final-project/
├── index.html            统一入口（导航 + 首页 + 支出看板 + 明细查询）
├── css/style.css         海洋风自定义样式（在Bootstrap之后引入）
├── js/app.js             交互逻辑（三状态加载 + 双图表 + 明细筛选）
├── data/
│   ├── expenses.json     消费月报（months/series/records）
│   └── empty.json        空数据文件（演示"暂无数据"状态）
├── docs/
│   ├── 实施计划.md       任务分解表 / 时间表 / 风险清单 三张表
│   └── 质量自查记录.md   断网 / 空数据 / 三档宽度 / Console 四项自查
└── three-d/
    ├── scene.html        扬帆·自由之海 三维页（A-Frame）
    └── libs/aframe.min.js  A-Frame 本地库（来自课堂七）
```

## 数据与资源来源

- **数据**：`data/expenses.json` 为自建教学数据（虚构），月度汇总（series）与逐笔明细（records）金额一致；`data/empty.json` 仅用于演示空数据状态
- **Bootstrap 5.3.3**：https://getbootstrap.com/ (MIT License)
- **jQuery 3.7.1**：https://jquery.com/ (MIT License)
- **ECharts 5.5.0**：https://echarts.apache.org/ (Apache License 2.0)
- **Chart.js 4.4.1**：https://www.chartjs.org/ (MIT License)
- **A-Frame**：https://aframe.io/ (MIT License)，本地库复用自课堂七

## 质量自查

按指南质量清单完成四项自查并记录：断网提示、空数据、三档宽度、Console。检查方法、预期结果与实测记录见 [docs/质量自查记录.md](docs/质量自查记录.md)。
