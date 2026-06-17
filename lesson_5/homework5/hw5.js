import http from 'node:http';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name') || 'Guest';
    const responseBody = { message: `Hello, ${name}!` };
    res.end(JSON.stringify(responseBody));
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, CTRL-C to stop`);
});