# 极简行业观察池

一个只使用 HTML、CSS、原生 JavaScript 实现的极简行业观察池，用于在选股前记录已筛选出的三级行业。

## 文件结构

```text
industry-watchlist/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## 如何打开

无需安装依赖、无需启动服务器。

1. 用 VS Code 或文件管理器打开 `industry-watchlist` 文件夹。
2. 直接双击 `index.html`。
3. 浏览器打开后即可使用。

## 如何编辑行业数据

行业树数据位于 `script.js` 顶部的 `industryData` 变量中。

你可以按下面的三级结构直接替换或扩展：

```js
const industryData = [
  {
    id: "tech",
    name: "信息技术",
    children: [
      {
        id: "semiconductor",
        name: "半导体",
        children: [
          { id: "power-semiconductor", name: "功率半导体" }
        ]
      }
    ]
  }
];
```

## 数据保存

观察池记录会自动保存到浏览器 `localStorage` 中。刷新页面后记录仍会保留。

如果换浏览器、清理浏览器数据，或使用隐私模式，保存的数据可能无法继续保留。

## 已实现功能

- 展开 / 收起一级行业和二级行业。
- 点击三级行业右侧 `+` 加入观察池。
- 已加入的三级行业显示“已加入”，不可重复添加。
- 观察池支持搜索、一级行业筛选、状态筛选、星标筛选。
- 每条记录支持星标、状态切换、备注编辑和删除。
- 删除前会弹窗确认。
- 桌面端左右分栏，移动端上下排列。
