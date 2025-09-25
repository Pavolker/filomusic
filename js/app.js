// Estado global da aplicação
let appState = {
    items: [],
    filteredItems: [],
    currentCategory: '',
    searchTerm: '',
    isLoading: false
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

// Inicialização da aplicação
async function initApp() {
    try {
        showLoading(true);
        await loadData();
        setupEventListeners();
        renderUI();
    } catch (error) {
        console.error('Erro na inicialização:', error);
        handleError(error);
    } finally {
        showLoading(false);
    }
}

// Carregamento de dados
async function loadData() {
    console.log('=== INICIANDO CARREGAMENTO DE DADOS ===');
    
    if (CONFIG.dev.mockData) {
        console.log('Usando dados mock');
        appState.items = FALLBACK_DATA;
        appState.filteredItems = [...appState.items];
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
                return;
            }
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }

    console.log('Usando dados de fallback, quantidade:', FALLBACK_DATA.length);
    appState.items = FALLBACK_DATA;
    appState.filteredItems = [...appState.items];
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
}

// Renderização da UI
function renderUI() {
    renderItems();
}

// Renderização de itens no carrossel
function renderItems() {
    const grid = document.getElementById('musicGrid');
    
    if (!grid) {
        console.error('Elemento musicGrid não encontrado');
        return;
    }

    grid.innerHTML = appState.items.map((item, index) => createMusicCard(item, index)).join('');
    
    // Adicionar event listeners aos cards
    const cards = document.querySelectorAll('.music-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.dataset.title;
            const author = this.dataset.author;
            const date = this.dataset.date;
            openModal(title, author, date);
        });
    });
}

// Função para criar um card de música
function createMusicCard(music, index) {
    return `
        <div class="music-card scroll-snap-start" 
             style="background: linear-gradient(135deg, #1e40af, #312e81); border-radius: 8px; padding: 8px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(59, 130, 246, 0.3); cursor: pointer; min-height: 70px; max-height: 70px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; transition: all 0.3s ease;"
             data-title="${music.titulo}" data-author="${music.autor}" data-date="${music.data}">
            <div style="color: #93c5fd; font-size: 12px; font-weight: 500; margin-bottom: 4px;">${music.data}</div>
            <h3 style="color: white; font-size: 14px; font-weight: bold; margin-bottom: 4px; line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${music.titulo}</h3>
            <p style="color: #bfdbfe; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${music.autor}</p>
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
        const mdFileName = MD_FILE_MAPPING[title];
        if (!mdFileName) {
            throw new Error(`Mapeamento não encontrado para: "${title}"`);
        }

        // Codificar a URL corretamente para lidar com espaços
        const filePath = `${CONFIG.content.mdFolder}${encodeURIComponent(mdFileName)}`;
        console.log('Tentando carregar arquivo:', filePath);
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const mdContent = await response.text();
        console.log('Arquivo carregado com sucesso:', mdFileName);
        
        // Converter Markdown para HTML (básico)
        const htmlContent = convertMarkdownToHTML(mdContent);
        
        // Exibir conteúdo
        modalContent.innerHTML = htmlContent;
        modalLoading.classList.add('hidden');
        modalContent.classList.remove('hidden');

    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        
        // Fallback para funcionamento local - mostrar informações básicas
        const fallbackContent = `
            <div style="color: #e5e7eb; padding: 20px; line-height: 1.6;">
                <h3 style="color: #3b82f6; margin-bottom: 16px;">${title}</h3>
                <p style="margin-bottom: 12px;"><strong>Autor:</strong> ${author}</p>
                <p style="margin-bottom: 12px;"><strong>Data:</strong> ${date}</p>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #93c5fd; font-size: 14px; margin: 0;">
                        Para visualizar o conteúdo completo desta música, acesse através do servidor HTTP em 
                        <a href="http://localhost:8001" style="color: #60a5fa;">http://localhost:8001</a>
                    </p>
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
    return markdown
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 text-blue-300">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-4 text-blue-400">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-3 text-blue-500">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-blue-200">$1</em>')
        .replace(/https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/g, '<div class="my-4"><a href="$&" target="_blank" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">🎵 Assistir no YouTube</a></div>')
        .replace(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g, '<div class="my-4"><a href="$&" target="_blank" class="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">🎵 Assistir no YouTube</a></div>')
        .replace(/\n\n/g, '</p><p class="mb-4 text-gray-200 leading-relaxed">')
        .replace(/^(.+)$/gm, '<p class="mb-4 text-gray-200 leading-relaxed">$1</p>')
        .replace(/<p class="mb-4 text-gray-200 leading-relaxed"><\/p>/g, '');
}

// Fechar modal
function closeModalHandler() {
    document.getElementById('contentModal').classList.add('hidden');
}

// Estados da UI
function showLoading(show) {
    const grid = document.getElementById('musicGrid');
    if (grid) grid.style.display = show ? 'none' : 'grid';
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

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}