import selfsigned from 'selfsigned';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 生成证书
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
    algorithm: 'sha256',
    days: 365,
    keySize: 2048,
});

// 确保证书目录存在
const certPath = path.join(__dirname, '../cert');
if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath);
}

// 写入证书文件
fs.writeFileSync(path.join(certPath, 'key.pem'), pems.private);
fs.writeFileSync(path.join(certPath, 'cert.pem'), pems.cert);

console.log('证书生成成功！');
