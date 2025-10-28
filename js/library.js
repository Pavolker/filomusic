// Biblioteca da Filosofia da Música - Carrega e exibe os textos da biblioteca

(function () {
  // Lista dos 19 textos da biblioteca (nomes dos arquivos sem extensão)
  const LIBRARY_FILES = [
    "1- Dedicatória para a Musa",
    "2- Para uma conceituação",
    "3- Elementos Fundamentais da Música",
    "4- Natureza e Filosofia da Música",
    "5- Música, Memória e Filosofia",
    "6- Acessibilidade Musical e o Projeto Pessoal",
    "7- A Relação Humana com a Música Inerente, Inervada e Inesgotável",
    "8- Extremos da Sensação Musical",
    "9- A Transição Histórica da Música",
    "10- Memória e o Refrão como Estratégia de Mercado",
    "11- Repetição e Sucesso Matematicamente Demonstrados",
    "12- A História",
    "13- A Playlist Gregoriana",
    "14- A Playlist dos Goliardos",
    "15- Madrigal",
    "16- Bach",
    "17 - Ópera",
    "18- O Preço da Música Clássica",
    "19- A Indústria da Música"
  ];

  function buildButtons() {
    const container = document.getElementById('libraryButtons');
    if (!container) {
      console.error('❌ Elemento libraryButtons não encontrado!');
      return;
    }

    console.log('📚 Construindo botões da biblioteca...');

    LIBRARY_FILES.forEach((fileName, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-dial quote-btn library-btn';
      btn.setAttribute('aria-label', `Ler ${fileName}`);
      
      // Extrair o número e título para exibir
      const match = fileName.match(/^(\d+)[-\s]+(.+)$/);
      const title = match ? match[2] : fileName;
      
      btn.textContent = title;
      btn.dataset.fileName = fileName + '.md';
      btn.addEventListener('click', () => showLibraryText(fileName));
      
      container.appendChild(btn);
    });

    console.log('✅', LIBRARY_FILES.length, 'botões da biblioteca criados');
  }

  function showLibraryText(fileName) {
    const card = document.getElementById('libraryCard');
    const content = document.getElementById('libraryContent');
    
    if (!card || !content) {
      console.error('❌ Elementos do card da biblioteca não encontrados!');
      return;
    }

    console.log('📖 Carregando texto da biblioteca:', fileName);

    // Tentar buscar no MARKDOWN_CONTENT (se os arquivos foram processados)
    const markdownFileName = fileName + '.md';
    let text = null;

    if (typeof window !== 'undefined' && window.MARKDOWN_CONTENT) {
      console.log('📚 MARKDOWN_CONTENT disponível, buscando:', markdownFileName);
      console.log('📚 Total de arquivos em MARKDOWN_CONTENT:', Object.keys(window.MARKDOWN_CONTENT).length);
      
      // Buscar exatamente pelo nome do arquivo
      text = window.MARKDOWN_CONTENT[markdownFileName];
      
      if (text) {
        console.log('✅ Texto encontrado exatamente no MARKDOWN_CONTENT:', markdownFileName);
      } else {
        console.log('⚠️ Busca exata falhou, tentando busca normalizada...');
        
        // Normalizar nome para busca (remover acentos, espaços, etc)
        const normalize = (str) => {
          if (!str) return '';
          return String(str)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ');
        };
        
        const normalizedSearch = normalize(fileName);
        console.log('🔍 Buscando nome normalizado:', normalizedSearch);
        
        // Obter todas as chaves e mostrar algumas para debug
        const allKeys = Object.keys(window.MARKDOWN_CONTENT);
        const libraryKeys = allKeys.filter(k => /^\d+-/.test(k));
        console.log('📋 Arquivos da biblioteca encontrados no MARKDOWN_CONTENT:', libraryKeys.length);
        console.log('📋 Primeiros 5:', libraryKeys.slice(0, 5));
        
        // Tentar buscar com variações do nome
        let foundKey = null;
        
        // 1. Busca exata normalizada
        foundKey = allKeys.find(key => {
          const keyWithoutExt = key.replace(/\.md$/i, '');
          return normalize(keyWithoutExt) === normalizedSearch;
        });
        
        // 2. Busca parcial (contém)
        if (!foundKey) {
          foundKey = allKeys.find(key => {
            const keyWithoutExt = key.replace(/\.md$/i, '');
            const normalizedKey = normalize(keyWithoutExt);
            return normalizedKey.includes(normalizedSearch) || 
                   normalizedSearch.includes(normalizedKey) ||
                   // Buscar por número no início (ex: "11-")
                   (fileName.match(/^\d+-/) && key.match(/^\d+-/) && 
                    fileName.match(/^\d+-/)[0] === key.match(/^\d+-/)[0]);
          });
        }
        
        // 3. Busca por número (última tentativa)
        if (!foundKey && fileName.match(/^\d+-/)) {
          const numberMatch = fileName.match(/^(\d+)-/);
          if (numberMatch) {
            const fileNumber = numberMatch[1]; // Apenas o número, sem o traço
            // Buscar chave que começa com o mesmo número
            const keysWithNumber = allKeys.filter(key => {
              const keyMatch = key.match(/^(\d+)-/);
              return keyMatch && keyMatch[1] === fileNumber;
            });
            console.log('🔢 Buscando por número:', fileNumber);
            console.log('🔢 Chaves encontradas com esse número:', keysWithNumber);
            foundKey = keysWithNumber[0]; // Pegar a primeira correspondência
          }
        }
        
        if (foundKey) {
          text = window.MARKDOWN_CONTENT[foundKey];
          console.log('✅ Texto encontrado com nome alternativo:', foundKey);
          console.log('✅ Tamanho do texto:', text ? text.length : 0, 'caracteres');
        } else {
          console.warn('⚠️ Texto não encontrado no MARKDOWN_CONTENT após todas as tentativas');
          console.warn('🔍 Procurando por:', fileName);
          console.warn('📋 Chaves que começam com "11":', allKeys.filter(k => k.includes('11')).slice(0, 5));
        }
      }
    } else {
      console.warn('⚠️ MARKDOWN_CONTENT não está disponível');
    }

    if (text) {
      // Converter Markdown básico para HTML
      console.log('✅ Exibindo texto encontrado, tamanho:', text.length, 'caracteres');
      content.innerHTML = convertMarkdownToHTML(text);
      card.classList.remove('hidden');
      
      // Scroll suave até o card
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      // Texto não encontrado - tentar carregar do arquivo diretamente
      console.warn('⚠️ Texto não encontrado no MARKDOWN_CONTENT');
      console.log('📁 Tentando carregar diretamente do arquivo:', `./biblioteca/${markdownFileName}`);
      
      // Verificar se estamos em protocolo file:// (não funciona com fetch)
      const isFileProtocol = window.location.protocol === 'file:';
      
      if (isFileProtocol) {
        console.warn('⚠️ Protocolo file:// detectado. Fetch não funciona localmente.');
        console.warn('💡 Os arquivos da biblioteca devem estar incorporados no markdown-content.js');
        console.warn('💡 Execute: node scripts/build-content.js');
        console.warn('💡 Ou acesse através de um servidor HTTP (http://localhost:8000)');
        
        // Mostrar mensagem mais útil com informações de debug
        const allKeys = window.MARKDOWN_CONTENT ? Object.keys(window.MARKDOWN_CONTENT) : [];
        const similarKeys = allKeys.filter(k => {
          const fileNameLower = fileName.toLowerCase();
          const keyLower = k.toLowerCase();
          return keyLower.includes(fileNameLower.substring(0, 10)) || 
                 fileNameLower.includes(keyLower.substring(0, 10));
        });
        
        content.innerHTML = `
          <div style="color: #fbbf24; padding: 2rem; text-align: center;">
            <p style="margin-bottom: 1rem;">
              <strong>Texto não disponível no momento.</strong>
            </p>
            <p style="color: #bfdbfe; font-size: 0.9rem;">
              Para visualizar este texto, é necessário executar o script de build ou acessar através de um servidor HTTP.
            </p>
            <p style="color: #93c5fd; font-size: 0.85rem; margin-top: 1rem;">
              Arquivo: "${fileName}"
            </p>
            ${similarKeys.length > 0 ? `<p style="color: #60a5fa; font-size: 0.8rem; margin-top: 0.5rem;">Arquivos similares encontrados: ${similarKeys.slice(0, 3).join(', ')}</p>` : ''}
          </div>
        `;
        card.classList.remove('hidden');
        return;
      }
      
      fetch(`./biblioteca/${markdownFileName}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
          }
          return res.text();
        })
        .then(markdownText => {
          console.log('✅ Arquivo carregado com sucesso via fetch');
          content.innerHTML = convertMarkdownToHTML(markdownText);
          card.classList.remove('hidden');
          
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        })
        .catch(err => {
          console.error('❌ Erro ao carregar texto da biblioteca:', err);
          console.error('❌ Erro completo:', err.message, err.stack);
          
          content.innerHTML = `
            <div style="color: #fbbf24; padding: 2rem; text-align: center;">
              <p style="margin-bottom: 1rem;">
                <strong>Texto não disponível no momento.</strong>
              </p>
              <p style="color: #bfdbfe; font-size: 0.9rem;">
                Este texto ainda está sendo processado. Tente recarregar a página ou verifique o console para mais informações.
              </p>
              <p style="color: #93c5fd; font-size: 0.85rem; margin-top: 1rem;">
                Arquivo: "${fileName}"
              </p>
            </div>
          `;
          card.classList.remove('hidden');
        });
    }
  }

  function convertMarkdownToHTML(markdown) {
    if (!markdown) return '<p>Conteúdo não disponível.</p>';

    let html = markdown;

    // Converter quebras de linha duplas em parágrafos
    html = html.split(/\n\n+/).map(paragraph => {
      paragraph = paragraph.trim();
      if (!paragraph) return '';
      
      // Converter URLs do YouTube em links clicáveis
      paragraph = paragraph.replace(
        /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/g,
        '<a href="https://www.youtube.com/watch?v=$4" target="_blank" style="color: #60a5fa; text-decoration: underline;">https://www.youtube.com/watch?v=$4</a>'
      );
      
      // Converter negrito **texto** ou __texto__
      paragraph = paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      paragraph = paragraph.replace(/__(.+?)__/g, '<strong>$1</strong>');
      
      // Converter itálico *texto* ou _texto_
      paragraph = paragraph.replace(/\*(.+?)\*/g, '<em>$1</em>');
      paragraph = paragraph.replace(/_(.+?)_/g, '<em>$1</em>');
      
      return `<p>${paragraph}</p>`;
    }).filter(p => p).join('\n');

    // Converter títulos (# Título)
    html = html.replace(/^### (.+)$/gm, '<h3 style="color: #93c5fd; margin-top: 1.5rem; margin-bottom: 0.5rem;">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 style="color: #93c5fd; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 style="color: #bfdbfe; margin-top: 2rem; margin-bottom: 1rem; font-size: 2rem;">$1</h1>');

    return html;
  }

  function closeLibraryCard() {
    const card = document.getElementById('libraryCard');
    if (card) {
      card.classList.add('hidden');
    }
  }

  function init() {
    console.log('📚 Inicializando sistema da biblioteca...');
    
    // Construir botões
    buildButtons();
    
    // Adicionar event listener ao botão de fechar
    const closeBtn = document.getElementById('closeLibraryCard');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLibraryCard);
    }
    
    console.log('✅ Sistema da biblioteca inicializado');
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

