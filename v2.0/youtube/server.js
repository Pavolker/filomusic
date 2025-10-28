const http = require('http');
const fs = require('fs');
const path = require('path');

// Porta do servidor
const PORT = 3000;

// Tipos de conteúdo para diferentes extensões
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Função para servir arquivos
function serveFile(filePath, res) {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Arquivo não encontrado
        fs.readFile(path.join(__dirname, '404.html'), (err, notFoundContent) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('404 Not Found', 'utf-8');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(notFoundContent, 'utf-8');
          }
        });
      } else {
        // Erro no servidor
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Sucesso
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

// Criar o servidor
const server = http.createServer((req, res) => {
  // Definir cabeçalhos CORS para permitir acesso ao JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Determinar o caminho do arquivo solicitado
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Se for um diretório, servir index.html
  if (filePath.endsWith('/')) {
    filePath += 'index.html';
  }
  
  // Resolver extensões de arquivo implícitas
  const extname = path.extname(filePath);
  if (!extname) {
    filePath += '.html';
  }
  
  // Servir o arquivo
  serveFile(filePath, res);
});

// Iniciar o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Pressione Ctrl+C para parar o servidor');
});