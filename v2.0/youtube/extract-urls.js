const fs = require('fs');
const path = require('path');

// Diretório onde estão os arquivos .md
const directoryPath = './arquivo md';

// Array para armazenar todas as URLs
let allUrls = [];

// Função para extrair URLs do YouTube de um texto
function extractYouTubeUrls(text) {
    // Expressão regular para encontrar URLs do YouTube
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const urls = [];
    let match;
    
    while ((match = youtubeRegex.exec(text)) !== null) {
        urls.push(match[0]);
    }
    
    return urls;
}

// Lê todos os arquivos do diretório
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Não foi possível ler o diretório: ' + err);
    }
    
    // Filtra apenas os arquivos .md
    const mdFiles = files.filter(file => path.extname(file) === '.md');
    
    console.log(`Encontrados ${mdFiles.length} arquivos .md`);
    
    // Processa cada arquivo
    mdFiles.forEach((file, index) => {
        const filePath = path.join(directoryPath, file);
        
        // Lê o conteúdo do arquivo
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return console.log('Erro ao ler o arquivo ' + file + ': ' + err);
            }
            
            // Extrai URLs do YouTube
            const urls = extractYouTubeUrls(data);
            allUrls = allUrls.concat(urls);
            
            console.log(`Processado ${file}: ${urls.length} URLs encontradas`);
            
            // Quando todos os arquivos forem processados, salva as URLs em um novo arquivo
            if (index === mdFiles.length - 1) {
                // Remove URLs duplicadas
                const uniqueUrls = [...new Set(allUrls)];
                
                // Cria o conteúdo do novo arquivo
                let fileContent = '# Lista de URLs do YouTube\n\n';
                fileContent += 'Total de URLs únicas encontradas: ' + uniqueUrls.length + '\n\n';
                
                uniqueUrls.forEach((url, i) => {
                    fileContent += (i + 1) + '. ' + url + '\n';
                });
                
                // Salva o arquivo
                fs.writeFile('lista url.md', fileContent, (err) => {
                    if (err) {
                        return console.log('Erro ao salvar o arquivo: ' + err);
                    }
                    
                    console.log('Arquivo "lista url.md" criado com sucesso!');
                    console.log('Total de URLs únicas: ' + uniqueUrls.length);
                });
            }
        });
    });
});