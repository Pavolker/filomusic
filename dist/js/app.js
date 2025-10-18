// Estado global da aplicação

let appState = {
    items: [],
    filteredItems: [],
    currentCategory: '',
    searchTerm: '',
    isLoading: false,
    pagination: {
        currentPage: 1,
        pageSize: (typeof CONFIG !== 'undefined' && CONFIG.ui && CONFIG.ui.itemsPerPage) ? CONFIG.ui.itemsPerPage : 12
    }
};

// Dados de fallback
const FALLBACK_DATA = [
    {
        data: "1100",
        titulo: "CARMINA BURANA",
        autor: "CARL OFF",
        musica: "O FORTUNA, IMPERATRIX MUNDI",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1700",
        titulo: "BACH",
        autor: "BACH",
        musica: "TOCCATA & FUGUE IN DM",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1771",
        titulo: "MINUETO",
        autor: "BOCCHERINI",
        musica: "MINUET - STRING QUINTET",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1822",
        titulo: "ODE AN DIE FREUD",
        autor: "BEETHOVEN",
        musica: "ODE AN DIE FREUD",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1837",
        titulo: "SCHERZO N2",
        autor: "CHOPIN",
        musica: "SCHERZO Nº 2 EM SI BEMOL MENOR",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1881",
        titulo: "BARCAROLLE",
        autor: "JACQUES OFFENBACH",
        musica: "BELLE NUIT, Ô NUIT D'AMOUR",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1883",
        titulo: "AS FLORES",
        autor: "FLOWER DUET",
        musica: "LÉO DELIBES",
        genero: "Clássica",
        atracao: 3,
        introspeccao: 3,
        complexidade: 3,
        significacao: 9
    },
    {
        data: "1942",
        titulo: "ESTA CHEGANDO",
        autor: "CARMEN COSTA",
        musica: "ESTÁ CHEGANDO A HORA",
        genero: "Samba",
        atracao: 3,
        introspeccao: 2,
        complexidade: 1,
        significacao: 5
    },
    {
        data: "1956",
        titulo: "CÃO DE CAÇA",
        autor: "BIG MAMA THORNTON",
        musica: "HOUND DOG",
        genero: "Pop Rock",
        atracao: 3,
        introspeccao: 2,
        complexidade: 1,
        significacao: 6
    },
    {
        data: "1958",
        titulo: "VOLARE, NEL BLU DIPINTO DI BLU",
        autor: "DOMENICO MODUGNO",
        musica: "VOLARE, NEL BLU DIPINTO DI BLU",
        genero: "Pop Rock",
        atracao: 2,
        introspeccao: 2,
        complexidade: 2,
        significacao: 6
    },
    {
        data: "1960",
        titulo: "TRINI LOPEZ",
        autor: "TRINI LOPEZ",
        musica: "LA BAMBA",
        genero: "Pop Rock",
        atracao: 3,
        introspeccao: 1,
        complexidade: 1,
        significacao: 5
    },
    {
        data: "1961",
        titulo: "BELLA CIAO",
        autor: "RITA PAVONE",
        musica: "BELLA CIAO",
        genero: "Pop Rock",
        atracao: 2,
        introspeccao: 3,
        complexidade: 2,
        significacao: 7
    }
];

const normalizeTitleFn = typeof window !== 'undefined' && typeof window.normalizeTitle === 'function'
    ? window.normalizeTitle
    : (value) => {
        if (!value && value !== 0) {
            return '';
        }

        return String(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();
    };

function resolveMarkdownFileName(title) {
    if (!title) {
        return null;
    }

    const mapping = (typeof window !== 'undefined' && window.MD_FILE_MAPPING) || {};
    const normalizedTitle = normalizeTitleFn(title);

    return mapping[normalizedTitle] || null;
}

function resetPagination() {
    if (!appState.pagination) {
        appState.pagination = {
            currentPage: 1,
            pageSize: 12
        };
        return;
    }

    appState.pagination.currentPage = 1;
}

function updatePaginationControls(totalItems, renderedItems) {
    const container = document.getElementById('loadMoreContainer');
    const button = document.getElementById('loadMoreBtn');

    if (!container || !button) {
        return;
    }

    if (totalItems > renderedItems) {
        container.classList.remove('hidden');
        button.disabled = false;
    } else {
        container.classList.add('hidden');
    }
}

// Função principal de inicialização
async function initApp() {
    try {
        await loadData();
        setupEventListeners();
        renderUI();
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
    }
}

// Carregamento de dados
async function loadData() {
    console.log('=== INICIANDO CARREGAMENTO DE DADOS ===');
    
    if (CONFIG.dev.mockData) {
        console.log('Usando dados mock');
        appState.items = FALLBACK_DATA;
        appState.filteredItems = [...appState.items];
        resetPagination();
        return;
    }

    try {
        // Usar dados incorporados se disponíveis
        if (typeof CSV_DATA !== 'undefined') {
            console.log('Usando dados incorporados, tamanho:', CSV_DATA.length);
            appState.items = parseCSV(CSV_DATA);
            console.log('Itens parseados dos dados incorporados:', appState.items.length);
            
            if (appState.items.length > 0) {
                appState.filteredItems = [...appState.items];
                resetPagination();
                // Disponibiliza os dados globalmente para a funcionalidade de busca
                window.musicData = appState.items;
                return;
            }
        }

        // Fallback: tentar carregar via fetch (para compatibilidade com servidor)
        console.log('Tentando carregar CSV de:', CONFIG.content.csvFile);
        const response = await fetch(CONFIG.content.csvFile);
        
        if (response.ok) {
            const csvText = await response.text();
            console.log('CSV carregado com sucesso via fetch, tamanho:', csvText.length);
            
            appState.items = parseCSV(csvText);
            console.log('Itens parseados do CSV:', appState.items.length);
            
            if (appState.items.length > 0) {
                appState.filteredItems = [...appState.items];
                resetPagination();
                // Disponibiliza os dados globalmente para a funcionalidade de busca
                window.musicData = appState.items;
                return;
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }

    console.log('Usando dados de fallback, quantidade:', FALLBACK_DATA.length);
    appState.items = FALLBACK_DATA;
    appState.filteredItems = [...appState.items];
    resetPagination();
    
    // Disponibiliza os dados globalmente para a funcionalidade de busca
    window.musicData = appState.items;
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        return [];
    }
    
    const items = [];
    
    // Processar cada linha de dados (pular cabeçalho)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Dividir por ponto e vírgula, mas cuidar com aspas
        const fields = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ';' && !inQuotes) {
                fields.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        
        // Adicionar o último campo
        fields.push(currentField.trim());
        
        // Verificar se temos pelo menos 9 campos
        if (fields.length >= 9) {
            const item = {
                data: fields[0].trim(),
                titulo: fields[1].trim(),
                autor: fields[2].trim(),
                musica: fields[3].trim(),
                genero: fields[4].trim(),
                atracao: parseInt(fields[5]) || 0,
                introspeccao: parseInt(fields[6]) || 0,
                complexidade: parseInt(fields[7]) || 0,
                significacao: parseInt(fields[8]) || 0
            };
            
            items.push(item);
        }
    }
    
    console.log('CSV parseado com sucesso:', items.length, 'itens');
    return items;
}

// Configuração de event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.searchTerm = e.target.value;
            renderItems();
        });
    }
    
    // Delegação de eventos para cards de música e botões de play
    // Isso garante que os event listeners funcionem mesmo após re-renderização
    const musicGrid = document.getElementById('musicGrid');
    if (musicGrid) {
        musicGrid.addEventListener('click', function(e) {
            // Clique no botão de play
            if (e.target.closest('.play-btn')) {
                e.stopPropagation();
                const playBtn = e.target.closest('.play-btn');
                const filename = playBtn.dataset.filename;
                
                console.log('Botão de play clicado para:', filename);
                
                // Chama o player do YouTube se estiver disponível
                if (window.youtubePlayer) {
                    window.youtubePlayer.playFromCard(filename);
                    
                    // Scroll suave para o player
                    const playerSection = document.querySelector('#youtubePlayer').closest('section');
                    if (playerSection) {
                        playerSection.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }
                } else {
                    console.log('Player do YouTube ainda não está carregado');
                }
                return;
            }
            
            // Clique no card (mas não no botão de play)
            const musicCard = e.target.closest('.music-card');
            if (musicCard) {
                const title = musicCard.dataset.title;
                const author = musicCard.dataset.author;
                const date = musicCard.dataset.date;
                openModal(title, author, date);
            }
        });
        
        // Efeitos hover para botões de play usando delegação
        musicGrid.addEventListener('mouseenter', function(e) {
            if (e.target.closest('.play-btn')) {
                const playBtn = e.target.closest('.play-btn');
                playBtn.style.background = 'rgba(34, 197, 94, 1)';
                playBtn.style.transform = 'scale(1.1)';
            }
        }, true);
        
        musicGrid.addEventListener('mouseleave', function(e) {
            if (e.target.closest('.play-btn')) {
                const playBtn = e.target.closest('.play-btn');
                playBtn.style.background = 'rgba(34, 197, 94, 0.8)';
                playBtn.style.transform = 'scale(1)';
            }
        }, true);
    }

    // Modal
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeModalHandler);
    }

    const modal = document.getElementById('contentModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModalHandler();
        }
    });

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (!appState.pagination) {
                return;
            }

            appState.pagination.currentPage += 1;
            renderItems(appState.filteredItems);
        });
    }
}

// Renderização da UI
function renderUI() {
    renderItems();
}

// Função para renderizar os itens musicais
function renderItems(items) {
    const musicGrid = document.getElementById('musicGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const emptyState = document.getElementById('emptyState');
    
    if (!musicGrid) {
        console.error('Elemento musicGrid não encontrado!');
        return;
    }

    const dataset = Array.isArray(items)
        ? items
        : (Array.isArray(appState.filteredItems) ? appState.filteredItems : []);

    const totalItems = dataset.length;
    const pagination = appState.pagination || { currentPage: 1, pageSize: 12 };
    const pageSize = Math.max(1, pagination.pageSize || 12);
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
    
    if (pagination.currentPage > totalPages) {
        pagination.currentPage = totalPages;
    } else if (pagination.currentPage < 1) {
        pagination.currentPage = 1;
    }

    const visibleCount = totalItems > 0
        ? Math.min(totalItems, pagination.currentPage * pageSize)
        : 0;
    const itemsToRender = dataset.slice(0, visibleCount);

    // Oculta todos os estados
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    updatePaginationControls(totalItems, itemsToRender.length);

    if (!itemsToRender || itemsToRender.length === 0) {
        // Mostra estado vazio
        musicGrid.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    // Remove a classe 'hidden' e garante que o grid seja visível
    musicGrid.classList.remove('hidden');
    musicGrid.style.display = 'grid';

    const html = itemsToRender.map(item => createMusicCard(item)).join('');
    musicGrid.innerHTML = html;
}

// Função para criar um card de música
function createMusicCard(music, index) {
    return `
        <div class="music-card scroll-snap-start" 
             style="background: linear-gradient(135deg, #1e40af, #312e81); border-radius: 8px; padding: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(59, 130, 246, 0.3); cursor: pointer; min-height: 70px; max-height: 70px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease; position: relative;"
             data-title="${music.titulo}" data-author="${music.autor}" data-date="${music.data}">
            <div style="color: #93c5fd; font-size: 12px; font-weight: 500; margin-bottom: 4px;">${music.data}</div>
            <h3 style="color: white; font-size: 14px; font-weight: bold; margin-bottom: 4px; line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${music.titulo}</h3>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <p style="color: #bfdbfe; font-size: 12px; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${music.autor}</p>
                <button class="play-btn" 
                        style="background: rgba(34, 197, 94, 0.8); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; margin-left: 8px;"
                        data-filename="${music.data} - ${music.titulo}"
                        title="Reproduzir músicas deste arquivo">
                    <span style="color: white; font-size: 10px;">▶️</span>
                </button>
            </div>
        </div>
    `;
}

// Função para abrir o modal e carregar conteúdo MD
async function openModal(title, author, date) {
    const modal = document.getElementById('contentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalContent = document.getElementById('modalContent');
    const modalLoading = document.getElementById('modalLoading');

    // Configurar título e subtítulo
    modalTitle.textContent = title;
    modalSubtitle.textContent = `${author} - ${date}`;

    // Mostrar modal e loading
    modal.classList.remove('hidden');
    modalContent.classList.add('hidden');
        modalLoading.classList.remove('hidden');

    try {
        // Buscar arquivo MD correspondente
        const mdFileName = resolveMarkdownFileName(title);
        
        if (!mdFileName) {
            throw new Error(`Mapeamento não encontrado para: "${title}"`);
        }

        // Obter conteúdo do arquivo incorporado
        let mdContent = null;
        
        // Primeiro tentar obter do conteúdo incorporado
        if (typeof getMarkdownContent === 'function') {
            mdContent = getMarkdownContent(mdFileName);
        }
        
        // Se não encontrou no conteúdo incorporado, tentar fetch (para compatibilidade com servidor)
        if (!mdContent) {
            const filePath = `${CONFIG.content.mdFolder}${encodeURIComponent(mdFileName)}`;
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            mdContent = await response.text();
        }
        
        // Converter Markdown para HTML com formatação mais completa
        let html = mdContent
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold e Italic
            .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
            // Listas
            .replace(/^\* (.+)$/gim, '<li>$1</li>')
            .replace(/^- (.+)$/gim, '<li>$1</li>')
            // Quebras de linha
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>');
        
        // Envolver listas em <ul>
        html = html.replace(/(<li>.*?<\/li>)/gims, '<ul>$1</ul>');
        
        // Envolver parágrafos
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<div')) {
            html = '<p>' + html + '</p>';
        }
        
        // Exibir conteúdo com metadados
        modalContent.innerHTML = `
            <div class="modal-metadata" style="color: #e5e7eb; padding: 20px; border-bottom: 1px solid rgba(59, 130, 246, 0.3); margin-bottom: 20px;">
                <p style="margin-bottom: 8px;"><strong>Título:</strong> ${title}</p>
                <p style="margin-bottom: 8px;"><strong>Autor:</strong> ${author}</p>
                <p style="margin-bottom: 8px;"><strong>Data:</strong> ${date}</p>
            </div>
            <div class="modal-markdown-content" style="color: #e5e7eb; padding: 0 20px 20px; line-height: 1.6;">
                ${html}
            </div>
        `;
        modalLoading.classList.add('hidden');
        modalContent.classList.remove('hidden');

    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        
        // Fallback para funcionamento local - mostrar informações básicas e instruções
        const fallbackContent = `
            <div style="color: #e5e7eb; padding: 20px; line-height: 1.6;">
                <div class="modal-metadata" style="border-bottom: 1px solid rgba(59, 130, 246, 0.3); margin-bottom: 20px; padding-bottom: 20px;">
                    <p style="margin-bottom: 8px;"><strong>Título:</strong> ${title}</p>
                    <p style="margin-bottom: 8px;"><strong>Autor:</strong> ${author}</p>
                    <p style="margin-bottom: 8px;"><strong>Data:</strong> ${date}</p>
                </div>
                <div class="modal-info" style="text-align: center;">
                    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1)); padding: 24px; border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <h3 style="color: #60a5fa; margin: 0 0 16px 0; font-size: 18px;">📖 Conteúdo Completo Disponível</h3>
                        <p style="margin-bottom: 16px; color: #d1d5db;">
                            Para visualizar o conteúdo detalhado desta composição musical, 
                            é necessário executar a aplicação através de um servidor HTTP.
                        </p>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 8px; margin: 16px 0; font-family: monospace; font-size: 14px;">
                            <p style="margin: 0; color: #93c5fd;">🚀 Como executar:</p>
                            <p style="margin: 8px 0 0 0; color: #e5e7eb;">python3 -m http.server 8001</p>
                        </div>
                        <p style="margin: 16px 0 8px 0; color: #d1d5db; font-size: 14px;">
                            Depois acesse: 
                            <a href="http://localhost:8000" style="color: #60a5fa; text-decoration: none; font-weight: bold;">
                                http://localhost:8000
                            </a>
                        </p>
                        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(59, 130, 246, 0.2);">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                💡 Esta aplicação funciona perfeitamente com servidor HTTP para acessar todos os arquivos markdown
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modalContent.innerHTML = fallbackContent;
        modalLoading.classList.add('hidden');
        modalContent.classList.remove('hidden');
    }
}

// Função básica para converter Markdown para HTML
function convertMarkdownToHTML(markdown) {
    if (typeof window !== 'undefined' && typeof window.markdownToHtml === 'function') {
        return window.markdownToHtml(markdown);
    }

    return markdown || '';
}

// Fechar modal
function closeModalHandler() {
    document.getElementById('contentModal').classList.add('hidden');
}

// Estados da UI
function showLoading(show) {
    const grid = document.getElementById('musicGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const emptyState = document.getElementById('emptyState');
    
    if (show) {
        // Mostra loading e oculta outros elementos
        if (grid) grid.classList.add('hidden');
        if (errorState) errorState.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (loadingState) loadingState.classList.remove('hidden');
    } else {
        // Oculta loading
        if (loadingState) loadingState.classList.add('hidden');
        // O grid será mostrado pela função renderItems se houver dados
    }
    
    appState.isLoading = show;
}

// Tratamento de erros
function handleError(error) {
    console.error('Erro na aplicação:', error);
    // Implementar notificação de erro para o usuário
}

// Exportar funções globais
window.openModal = openModal;
window.closeModalHandler = closeModalHandler;
window.renderItems = renderItems;
window.appState = appState;
window.resetPagination = resetPagination;

// Inicializar quando DOM estiver pronto


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
