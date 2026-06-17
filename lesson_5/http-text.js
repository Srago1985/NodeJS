import http from 'node:http';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name') || 'Guest';
    res.end(`Hello, ${name}!`);
    
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});