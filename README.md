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

## 开发

```bash
# 安装依赖
npm install

# 启动应用
npm start
```

## 打包

```bash
# 生成 Windows 安装包
ELECTRON_BUILDER_NSIS_DIR="你的NSIS路径" npx electron-builder --win nsis
```

安装包输出在 `release/` 目录下。

## 许可证

MIT
