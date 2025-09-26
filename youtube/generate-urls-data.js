const fs = require('fs');
const path = require('path');

// Diretório onde estão os arquivos .md
const directoryPath = './arquivo md';

// Objeto para armazenar todas as URLs agrupadas por arquivo
let urlsByFile = {};

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
            
            // Adiciona as URLs ao objeto, usando o nome do arquivo como chave
            // Remove a extensão .md do nome do arquivo
            const fileNameWithoutExt = path.basename(file, '.md');
            urlsByFile[fileNameWithoutExt] = urls;
            
            console.log(`Processado ${file}: ${urls.length} URLs encontradas`);
            
            // Quando todos os arquivos forem processados, salva os dados em um arquivo JSON
            if (index === mdFiles.length - 1) {
                // Salva o objeto em um arquivo JSON
                fs.writeFile('urls-data.json', JSON.stringify(urlsByFile, null, 2), (err) => {
                    if (err) {
                        return console.log('Erro ao salvar o arquivo JSON: ' + err);
                    }
                    
                    console.log('Arquivo "urls-data.json" criado com sucesso!');
                    console.log('Total de arquivos processados: ' + Object.keys(urlsByFile).length);
                });
            }
        });
    });
});