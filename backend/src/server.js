import express from 'express';
import path from 'path';
import os from 'os';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置文件上传
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 解码原始文件名，确保中文文件名正确保存
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // 使用时间戳和原始文件名，避免文件名冲突
        const timestamp = Date.now();
        const safeName = timestamp + '-' + encodeURIComponent(decodedName);
        cb(null, safeName);
    }
});

const upload = multer({ storage: storage });

// 获取局域网 IP 地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // 跳过内部 IP 和非 IPv4 地址
            if (iface.internal || iface.family !== 'IPv4') continue;
            return iface.address;
        }
    }
    return 'localhost';
}

const app = express();
const PORT = process.env.PORT || 3000;
const localIP = getLocalIP();

// 存储连接的客户端
const clients = new Map();

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, '../../frontend/src')));
app.use('/static', express.static(path.join(__dirname, '../../frontend/public')));
app.use('/uploads', express.static(uploadDir));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// 读取证书
const options = {
    key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem'))
};

// 创建 HTTPS 服务器
const httpsServer = https.createServer(options, app);

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server: httpsServer });

// WebSocket连接处理
wss.on('connection', (ws) => {
    console.log('新的客户端连接');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 根据消息类型处理
            switch (data.type) {
                case 'join':
                    // 存储用户信息
                    clients.set(ws, {
                        name: data.name,
                        channel: data.channel
                    });
                    break;

                case 'chat':
                    // 广播消息给同一频道的其他用户
                    const sender = clients.get(ws);
                    const messageData = {
                        type: 'chat',
                        sender: sender.name,
                        content: data.content,
                        time: new Date().toISOString()
                    };

                    // 向同一频道的所有客户端广播消息
                    clients.forEach((client, clientWs) => {
                        if (client.channel === sender.channel && clientWs.readyState === WebSocket.OPEN) {
                            clientWs.send(JSON.stringify(messageData));
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('消息处理错误:', error);
        }
    });

    // 处理连接关闭
    ws.on('close', () => {
        clients.delete(ws);
        console.log('客户端断开连接');
    });
});

// 文件上传路由
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有文件被上传' });
    }

    // 从请求头中获取房间信息
    const channel = req.headers['x-channel'];
    const username = req.headers['x-username'];

    const fileInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        time: new Date().toISOString(),
        uploader: username,
        channel: channel
    };

    // 广播文件信息给同一房间的客户端
    const broadcastData = {
        type: 'file',
        ...fileInfo
    };

    clients.forEach((client, ws) => {
        if (client.channel === channel && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(broadcastData));
        }
    });

    res.json(fileInfo);
});

// 文件下载路由
app.get('/download/:filename', (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filePath = path.join(uploadDir, filename);

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.error('文件不存在:', filePath);
            return res.status(404).json({ error: '文件不存在' });
        }

        // 获取原始文件名（去掉时间戳前缀）
        const originalname = decodeURIComponent(filename.substring(filename.indexOf('-') + 1));

        // 设置响应头
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(originalname)}`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // 直接发送文件
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('文件发送错误:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: '文件发送失败' });
                }
            }
        });
    } catch (error) {
        console.error('下载处理错误:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: '下载处理失败' });
        }
    }
});

// 启动服务器
httpsServer.listen(PORT, () => {
    console.log(`服务器运行在以下地址：`);
    console.log(`- 本地访问: https://localhost:${PORT}`);
    console.log(`- 局域网访问: https://${localIP}:${PORT}`);
    console.log('注意：首次访问时需要在浏览器中接受自签名证书的安全警告');
});
