const http = require('http');
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const filePath = path.join(appDir, safePath);

  if (!filePath.startsWith(appDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(data);
  });
});

const port = 4173;
server.listen(port, '127.0.0.1', () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
