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

## 打包

生成 Windows 安装包需要 NSIS。由于网络限制，electron-builder 可能无法自动下载 NSIS，需手动下载：

1. 下载 NSIS：https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z
2. 解压到本地目录（如 `C:\nsis`）
3. 设置环境变量后打包：

```bash
# 生成 Windows 安装包
ELECTRON_BUILDER_NSIS_DIR="C:\nsis" npx electron-builder --win nsis
```

安装包输出在 `release/` 目录下。

## 许可证

MIT
