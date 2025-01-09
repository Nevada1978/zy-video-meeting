# 实时视频会议应用

这是一个基于 Agora SDK 的实时视频会议应用，支持多人视频通话、屏幕共享等功能。

## 功能特点

- 多人视频会议
- 音视频控制
- 屏幕共享
- HTTPS 安全连接
- 响应式设计

## 技术栈

- 前端：原生 JavaScript、HTML5、CSS3
- 后端：Node.js、Express
- 实时通信：Agora SDK
- 安全：HTTPS、自签名证书

## 项目结构

```
project/
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── js/
│       │   ├── agoraManager.js
│       │   ├── uiManager.js
│       │   └── main.js
│       └── css/
│           └── styles.css
└── backend/
    ├── src/
    │   ├── server.js
    │   └── generateCert.js
    ├── cert/
    │   ├── key.pem
    │   └── cert.pem
    └── package.json
```

## 安装和运行

1. 安装后端依赖：
   ```bash
   cd backend
   npm install
   ```

2. 生成 HTTPS 证书：
   ```bash
   node src/generateCert.js
   ```

3. 启动服务器：
   ```bash
   npm start
   ```

4. 在浏览器中访问：
   - 本地访问：https://localhost:3000
   - 局域网访问：https://[你的IP地址]:3000

## 注意事项

- 首次访问时需要在浏览器中接受自签名证书的安全警告
- 确保摄像头和麦克风权限已授予
- 建议使用最新版本的 Chrome、Firefox 或 Safari 浏览器
