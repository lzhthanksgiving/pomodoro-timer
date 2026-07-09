# 🍅 番茄钟

简洁高效的番茄工作法计时器，基于 Electron 构建。

## 功能

- 🍅 **25分钟专注** + ☕ **5分钟休息**，自动循环切换
- 🔄 **开始/暂停/重置**，操作简单直观
- 🔊 计时结束**声音提醒**
- 📊 圆环进度条，剩余时间一目了然
- 🔢 番茄完成计数

## 技术栈

- Electron
- 原生 HTML / CSS / JavaScript
- 零额外运行时依赖

## 项目结构

```
├── main.js          # Electron 主进程
├── index.html       # 界面结构
├── style.css        # 样式
├── renderer.js      # 计时逻辑
└── package.json     # 项目配置
```

## 前置要求

- [Node.js](https://nodejs.org/) >= 18

## 开发

```bash
# 克隆仓库
git clone https://github.com/lzhthanksgiving/pomodoro-timer.git
cd pomodoro-timer

# 安装依赖
npm install

# 启动应用
npm start
```

## 下载

最新版本：[v1.0.1 安装包](https://github.com/lzhthanksgiving/pomodoro-timer/releases/latest)

## 许可证

MIT
