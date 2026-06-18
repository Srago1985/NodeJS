import http from 'node:http';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/hello') {        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        const name = url.searchParams.get('name') || 'Guest';
        const responseBody = { message: `Hello, ${name}!` };
        return res.end(JSON.stringify(responseBody));
    }

    if (req.method === 'POST' && url.pathname === '/hello') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const person = JSON.parse(body);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                const responseBody = { message: `Hello, ${person.firstName} ${person.lastName}!` };
                res.end(JSON.stringify(responseBody));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                const responseBody = { error: 'Invalid JSON' };
                res.end(JSON.stringify(responseBody));
            }
        });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/feed') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const person = JSON.parse(body);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                const personFeed = { 
                    fullName: `${person.firstName} ${person.lastName}`,
                    foods: ['Candy', 'Pizza', 'Sushi'] 
                };
                res.end(JSON.stringify(personFeed));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                const responseBody = { error: 'Invalid JSON' };
                res.end(JSON.stringify(responseBody));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    const responseBody = { error: 'Not Found' };
    res.end(JSON.stringify(responseBody));
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}, CTRL-C to stop`);
});