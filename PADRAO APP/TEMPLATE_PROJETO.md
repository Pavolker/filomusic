# Template de Projeto - Aplicação Web Estática


Este template fornece uma estrutura inicial para criar aplicações web estáticas com funcionalidades dinâmicas, seguindo os padrões estabelecidos  


## 📁 Estrutura de Arquivos

```
projeto-nome/
├── index.html                 # Página principal
├── config.js                  # Configurações centralizadas
├── app.js                     # Lógica principal da aplicação
├── .cursorrules              # Regras para Cursor IDE
├── netlify.toml              # Configuração de deploy
├── README.md                 # Documentação do projeto
├── PROJETO_COMPLETO.md       # Documentação técnica detalhada
├── js/
│   ├── components/           # Componentes reutilizáveis
│   ├── utils/               # Funções utilitárias
│   └── services/            # Serviços e integrações
├── css/
│   ├── custom.css           # Estilos customizados
│   └── components.css       # Estilos de componentes
├── content/
│   ├── articles/            # Artigos em Markdown
│   ├── pages/               # Páginas estáticas
│   └── data/                # Dados estruturados
├── assets/
│   ├── images/              # Imagens (SVG preferível)
│   ├── icons/               # Ícones
│   └── fonts/               # Fontes customizadas
└── docs/
    ├── PADROES_DE_TRABALHO.md
    ├── DEPLOYMENT.md
    └── TROUBLESHOOTING.md
```

## 🚀 Setup Inicial

### 1. Configuração do Ambiente

```bash
# Criar estrutura de pastas
mkdir -p projeto-nome/{js/{components,utils,services},css,content/{articles,pages,data},assets/{images,icons,fonts},docs,"arquivos md"}

# Navegar para o projeto
cd projeto-nome

# Inicializar git
git init

# Criar arquivos base
touch index.html config.js app.js .cursorrules netlify.toml README.md
```

### 2. Estrutura para Carrossel com Cards e MD

```bash
# Estrutura específica para carrossel
projeto-nome/
├── index.html                 # Página principal com carrossel
├── arquivos md/               # Arquivos Markdown para conteúdo
│   ├── 1100 - ITEM1.md
│   ├── 1700 - ITEM2.md
│   └── ...
├── assets/                    # Imagens e recursos
│   ├── header-image.jpg
│   └── logo.png
└── js/
    ├── carousel.js           # Lógica do carrossel
    ├── md-loader.js          # Carregamento de MD
    └── modal.js              # Sistema de modal
```

### 2. HTML Base (index.html)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nome do Projeto</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#10b981',
                        secondary: '#374151',
                        accent: '#f59e0b'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Header -->
    <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <h1 class="text-3xl font-bold text-green-400">Nome do Projeto</h1>
            <p class="text-gray-300 mt-2">Descrição breve do projeto</p>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <!-- Search and Filters -->
        <div class="mb-8">
            <div class="flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Buscar..." 
                    class="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                >
                <select 
                    id="categoryFilter" 
                    class="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-400"
                >
                    <option value="">Todas as categorias</option>
                </select>
            </div>
        </div>

        <!-- Content Grid -->
        <div id="contentGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Conteúdo será inserido dinamicamente -->
        </div>

        <!-- Loading State -->
        <div id="loadingState" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p class="mt-4 text-gray-400">Carregando...</p>
        </div>

        <!-- Empty State -->
        <div id="emptyState" class="text-center py-12 hidden">
            <p class="text-gray-400">Nenhum resultado encontrado</p>
        </div>
    </main>

    <!-- Modal -->
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div class="sticky top-0 bg-gray-800 border-b border-gray-600 p-4 flex justify-between items-center">
                    <h2 id="modalTitle" class="text-xl font-bold text-green-400"></h2>
                    <button id="closeModal" class="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div id="modalContent" class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <!-- Conteúdo do modal -->
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="config.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 3. Configuração Base (config.js)

```javascript
// Configurações da aplicação
const CONFIG = {
    // Configurações gerais
    app: {
        name: 'Nome do Projeto',
        version: '1.0.0',
        description: 'Descrição do projeto'
    },

    // Configurações de API (se aplicável)
    api: {
        baseUrl: 'https://api.exemplo.com',
        timeout: 5000,
        retries: 3
    },

    // Configurações de UI
    ui: {
        itemsPerPage: 12,
        searchDebounce: 300,
        animationDuration: 300
    },

    // Configurações de conteúdo
    content: {
        categories: [
            'categoria1',
            'categoria2',
            'categoria3'
        ],
        defaultCategory: 'todas'
    },

    // Configurações de desenvolvimento
    dev: {
        enableLogs: true,
        mockData: true
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
```

### 4. Lógica Principal (app.js)

```javascript
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
        id: 1,
        title: 'Item Exemplo 1',
        category: 'categoria1',
        description: 'Descrição do item exemplo',
        content: 'Conteúdo detalhado do item...',
        tags: ['tag1', 'tag2']
    },
    {
        id: 2,
        title: 'Item Exemplo 2',
        category: 'categoria2',
        description: 'Outra descrição de exemplo',
        content: 'Mais conteúdo detalhado...',
        tags: ['tag2', 'tag3']
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
    try {
        // Tentar carregar dados da API
        if (!CONFIG.dev.mockData) {
            const response = await fetch(`${CONFIG.api.baseUrl}/items`);
            if (response.ok) {
                appState.items = await response.json();
                return;
            }
        }
        
        // Fallback para dados locais
        appState.items = FALLBACK_DATA;
        console.log('Usando dados de fallback');
    } catch (error) {
        console.warn('Erro ao carregar dados, usando fallback:', error);
        appState.items = FALLBACK_DATA;
    }
    
    appState.filteredItems = [...appState.items];
}

// Configuração de event listeners
function setupEventListeners() {
    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e.target.value);
            }, CONFIG.ui.searchDebounce);
        });
    }

    // Filtro de categoria
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            handleCategoryFilter(e.target.value);
        });
    }

    // Modal
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeModalHandler);
    }

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });
    }
}

// Renderização da UI
function renderUI() {
    renderItems();
    renderCategoryFilter();
    updateEmptyState();
}

// Renderização de itens
function renderItems() {
    const grid = document.getElementById('contentGrid');
    if (!grid) return;

    grid.innerHTML = appState.filteredItems.map(item => `
        <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105 cursor-pointer" 
             onclick="openItem(${item.id})">
            <h3 class="text-xl font-semibold text-green-400 mb-2">${item.title}</h3>
            <p class="text-gray-300 mb-4">${item.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${item.tags.map(tag => `
                    <span class="bg-green-400 text-gray-900 px-2 py-1 rounded text-sm">${tag}</span>
                `).join('')}
            </div>
            <span class="text-green-400 text-sm">${item.category}</span>
        </div>
    `).join('');
}

// Busca
function handleSearch(term) {
    appState.searchTerm = term.toLowerCase();
    filterItems();
}

// Filtro por categoria
function handleCategoryFilter(category) {
    appState.currentCategory = category;
    filterItems();
}

// Aplicar filtros
function filterItems() {
    appState.filteredItems = appState.items.filter(item => {
        const matchesSearch = !appState.searchTerm || 
            item.title.toLowerCase().includes(appState.searchTerm) ||
            item.description.toLowerCase().includes(appState.searchTerm) ||
            item.content.toLowerCase().includes(appState.searchTerm);
        
        const matchesCategory = !appState.currentCategory || 
            item.category === appState.currentCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderItems();
    updateEmptyState();
}

// Abrir item no modal
function openItem(id) {
    const item = appState.items.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalContent').innerHTML = formatContent(item.content);
    document.getElementById('modal').classList.remove('hidden');
}

// Fechar modal
function closeModalHandler() {
    document.getElementById('modal').classList.add('hidden');
}

// Formatação de conteúdo
function formatContent(content) {
    const lines = content.split('\n');
    let formattedContent = '';
    let inList = false;
    
    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('# ')) {
            formattedContent += `<h1 class="text-2xl font-bold text-green-400 mb-4">${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
            formattedContent += `<h2 class="text-xl font-semibold text-green-400 mb-3">${line.substring(3)}</h2>`;
        } else if (line.startsWith('- ')) {
            if (!inList) {
                formattedContent += '<ul class="list-disc list-inside mb-4 text-gray-300">';
                inList = true;
            }
            formattedContent += `<li class="mb-1">${line.substring(2)}</li>`;
        } else {
            if (inList) {
                formattedContent += '</ul>';
                inList = false;
            }
            if (line) {
                formattedContent += `<p class="mb-4 text-gray-300">${line}</p>`;
            }
        }
    }
    
    if (inList) {
        formattedContent += '</ul>';
    }
    
    return formattedContent;
}

// Estados da UI
function showLoading(show) {
    const loading = document.getElementById('loadingState');
    const grid = document.getElementById('contentGrid');
    
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (grid) grid.style.display = show ? 'none' : 'grid';
    
    appState.isLoading = show;
}

function updateEmptyState() {
    const empty = document.getElementById('emptyState');
    const grid = document.getElementById('contentGrid');
    
    if (empty && grid) {
        const isEmpty = appState.filteredItems.length === 0 && !appState.isLoading;
        empty.classList.toggle('hidden', !isEmpty);
        grid.style.display = isEmpty ? 'none' : 'grid';
    }
}

function renderCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    const categories = [...new Set(appState.items.map(item => item.category))];
    filter.innerHTML = `
        <option value="">Todas as categorias</option>
        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
    `;
}

// Tratamento de erros
function handleError(error) {
    console.error('Erro na aplicação:', error);
    // Implementar notificação de erro para o usuário
}

// Exportar funções globais
window.openItem = openItem;
window.closeModalHandler = closeModalHandler;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
```

### 5. Configuração Netlify (netlify.toml)

```toml
[build]
  publish = "."
  command = "echo 'No build step required'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 6. README Base

```markdown
# Nome do Projeto

Descrição breve do projeto e seus objetivos.

## 🚀 Tecnologias

- HTML5
- JavaScript ES6+
- Tailwind CSS
- Python HTTP Server (desenvolvimento)
- Netlify (deploy)

## 📦 Instalação

1. Clone o repositório
2. Navegue para a pasta do projeto
3. Execute: `python3 -m http.server 8000`
4. Acesse: `http://localhost:8000`

## 🎯 Funcionalidades

- [ ] Busca em tempo real
- [ ] Filtros por categoria
- [ ] Modal de detalhes
- [ ] Design responsivo
- [ ] Fallback para dados locais

## 📝 Desenvolvimento

Este projeto segue os padrões estabelecidos em `PADROES_DE_TRABALHO.md`.

## 🚀 Deploy

Configurado para deploy automático no Netlify.
```

## ✅ Checklist de Implementação

### Configuração Inicial
- [ ] Estrutura de pastas criada
- [ ] Arquivos base configurados
- [ ] Git inicializado
- [ ] .cursorrules copiado

### Desenvolvimento
- [ ] HTML estruturado
- [ ] CSS responsivo implementado
- [ ] JavaScript funcional
- [ ] Dados de fallback configurados
- [ ] Sistema de busca implementado
- [ ] Filtros funcionais
- [ ] Modal implementado

### Testes
- [ ] Funciona localmente
- [ ] Responsivo testado
- [ ] Busca funcionando
- [ ] Filtros funcionando
- [ ] Modal funcionando
- [ ] Fallback testado

### Deploy
- [ ] Netlify configurado
- [ ] Deploy funcionando
- [ ] URL de produção testada
- [ ] Performance verificada

### Documentação
- [ ] README atualizado
- [ ] Comentários no código
- [ ] Padrões documentados
- [ ] Troubleshooting documentado

## 🎯 Próximos Passos

1. Personalizar conteúdo e design
2. Implementar funcionalidades específicas
3. Configurar integrações necessárias
4. Otimizar performance
5. Implementar analytics
6. Configurar SEO

---

**Nota**: Este template é baseado nos padrões desenvolvidos no projeto Casa Segura - Biblioteca. Adapte conforme necessário para seu caso específico.