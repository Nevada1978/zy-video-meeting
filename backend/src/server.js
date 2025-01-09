import express from 'express';
import path from 'path';
import os from 'os';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, '../../frontend/src')));
app.use('/static', express.static(path.join(__dirname, '../../frontend/public')));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const localIP = getLocalIP();

// 读取证书
const options = {
    key: fs.readFileSync(path.join(__dirname, '../cert/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../cert/cert.pem'))
};

// 创建 HTTPS 服务器
https.createServer(options, app).listen(PORT, () => {
    console.log(`服务器运行在以下地址：`);
    console.log(`- 本地访问: https://localhost:${PORT}`);
    console.log(`- 局域网访问: https://${localIP}:${PORT}`);
    console.log('注意：首次访问时需要在浏览器中接受自签名证书的安全警告');
});
