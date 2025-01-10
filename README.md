# 视频会议系统

## 项目介绍
一个基于 WebRTC 和 WebSocket 的实时视频会议系统，支持多人视频通话、实时聊天和文件共享。

## 功能特点

### 🎥 视频会议
- 多人实时视频/音频通话
- 摄像头开关控制
- 麦克风开关控制
- 屏幕共享功能
- 参会人数显示
- 用户名显示

### 💬 即时通讯
- 实时文字聊天
- 消息发送者和时间显示
- 聊天记录实时同步
- 支持回车快捷发送

### 📁 文件共享
- 支持文件上传/下载
- 显示文件大小和上传时间
- 文件列表实时同步
- 按房间隔离文件共享

### 🎨 界面特点
- 现代化深色主题
- 响应式布局设计
- 圆滑的动画效果
- 直观的操作按钮
- 清晰的用户界面

## 技术栈

### 前端技术
- HTML5
- CSS3 
- JavaScript (ES6+)
- Agora WebRTC SDK
- WebSocket

### 后端技术
- Node.js
- Express
- WebSocket (ws)
- Multer (文件上传)

## 快速开始

### 1. 安装部署

#### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0
- 支持 WebRTC 的现代浏览器（Chrome、Firefox、Edge等）

#### 克隆项目
```bash
git clone [项目地址]
cd tengcent-chat
```

#### 安装依赖
```bash
# 安装后端依赖
cd backend
npm install
```

#### 配置证书
```bash
# 在 backend 目录下生成自签名证书
cd backend
node src/generateCert.js
```

### 2. 启动运行

#### 开发模式
```bash
cd backend
npm run dev  # 使用 nodemon，支持热重载
```

#### 生产模式
```bash
cd backend
npm start
```

### 3. 访问使用

#### 本地访问
- 打开浏览器访问：https://localhost:3000
- 首次访问需要接受自签名证书的安全警告

#### 局域网访问
- 访问地址：https://[本机IP]:3000
- 确保防火墙允许 3000 端口访问

### 4. 使用说明

#### 加入会议
1. 在登录页面输入：
   - 会议 ID（房间号）
   - 这个 ID 是从Agora 控制台中创建应用，获取 appId 和 token
   - 这个 ID 是临时的，需要从Agora 控制台中创建应用，获取 appId 和 token
   - 把这个appId 和 token 填入到 frontend/src/js/agoraManager.js 中
2. 点击"加入会议"按钮
3. 默认的会议ID是：`123456`
#### 基本操作
- 🎤 点击麦克风图标：开启/关闭音频
- 📹 点击摄像头图标：开启/关闭视频
- 🖥️ 点击屏幕图标：开始/停止屏幕共享
- ❌ 点击挂断图标：离开会议

#### 聊天功能
- 在右侧聊天区域输入消息
- 按回车键或点击发送按钮发送消息
- 点击回形针图标上传文件
- 点击文件列表中的下载按钮下载文件

### 5. 常见问题

#### 视频/音频问题
- 确保已授予浏览器摄像头和麦克风权限
- 检查设备是否被其他应用占用
- 确认设备驱动是否正确安装

#### 网络问题
- 确保网络连接稳定
- 检查防火墙设置
- 验证端口是否被占用

#### 证书问题
- 首次访问时接受自签名证书
- 如果证书过期，重新生成证书

## 项目结构

```
tengcent-chat/
├── backend/                 # 后端项目目录
│   ├── src/                # 源代码目录
│   │   ├── server.js       # 主服务器文件，处理HTTP和WebSocket请求
│   │   └── generateCert.js # 生成SSL证书的脚本
│   ├── cert/               # SSL证书目录
│   │   ├── key.pem         # SSL私钥
│   │   └── cert.pem        # SSL证书
│   ├── uploads/            # 文件上传存储目录
│   ├── package.json        # 后端依赖配置
│   └── package-lock.json   # 后端依赖版本锁定
│
├── frontend/               # 前端项目目录
│   ├── public/            # 公共资源目录
│   │   └── index.html     # 主页面HTML
│   └── src/               # 源代码目录
│       ├── css/           # 样式文件目录
│       │   └── styles.css # 全局样式文件
│       └── js/            # JavaScript源码目录
│           ├── main.js           # 主程序入口
│           ├── agoraManager.js   # Agora SDK管理模块
│           └── uiManager.js      # UI交互管理模块
│
└── README.md              # 项目说明文档

```

### 文件说明

#### 后端文件
- `server.js`: 
  - Express服务器配置
  - WebSocket服务器实现
  - 文件上传下载处理
  - 静态文件服务
  - HTTPS配置

- `generateCert.js`: 
  - 生成自签名SSL证书
  - 用于HTTPS服务器
  - 本地开发环境配置

#### 前端文件
- `index.html`: 
  - 主页面结构
  - 视频会议界面
  - 聊天界面
  - 文件共享界面

- `styles.css`:
  - 全局样式定义
  - 响应式布局
  - 深色主题
  - 动画效果

- `main.js`:
  - 应用程序入口
  - WebSocket客户端
  - 事件处理
  - 文件上传下载

- `agoraManager.js`:
  - Agora SDK初始化
  - 视频流处理
  - 音频控制
  - 屏幕共享

- `uiManager.js`:
  - UI状态管理
  - 界面更新
  - 事件绑定
  - 交互处理

#### 配置文件
- `package.json`: 
  - 项目依赖
  - 启动脚本
  - 项目信息

#### 资源目录
- `cert/`: SSL证书存储
- `uploads/`: 上传文件存储
- `public/`: 静态资源托管

### 目录职责

#### backend/
- 提供HTTPS服务
- 处理WebSocket连接
- 管理文件上传下载
- 实现实时通信

#### frontend/
- 实现用户界面
- 处理视频会议
- 管理实时聊天
- 处理文件共享
