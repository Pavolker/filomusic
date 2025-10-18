// Sistema de Filtros Avançados
class AdvancedFilters {
    constructor() {
        this.activeFilters = {
            data: '',
            genero: '',
            atracao: '',
            introspeccao: '',
            complexidade: '',
            significacao: ''
        };
        
        this.init();
    }

    init() {
        this.populateGenreFilter();
        this.setupEventListeners();
    }

    // Popula o filtro de gênero com valores únicos do dataset
    populateGenreFilter() {
        const genreSelect = document.getElementById('filterGenero');
        if (!genreSelect || !window.musicData) return;

        const genres = [...new Set(window.musicData.map(item => item.genero))].sort();
        
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
    }

    // Configura os event listeners para todos os filtros
    setupEventListeners() {
        const filterIds = ['filterData', 'filterGenero', 'filterAtracao', 'filterIntrospeccao', 'filterComplexidade', 'filterSignificacao'];
        
        filterIds.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', (e) => this.handleFilterChange(e));
            }
        });

        // Botão para limpar filtros
        const clearButton = document.getElementById('clearFilters');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearAllFilters());
        }
    }

    // Manipula mudanças nos filtros
    handleFilterChange(event) {
        const filterId = event.target.id;
        const filterKey = filterId.replace('filter', '').toLowerCase();
        const value = event.target.value;

        // Atualiza o estado do filtro
        this.activeFilters[filterKey] = value;

        // Adiciona/remove classe visual de filtro ativo
        if (value) {
            event.target.classList.add('filter-active');
        } else {
            event.target.classList.remove('filter-active');
        }

        // Aplica os filtros
        this.applyFilters();
    }

    // Aplica todos os filtros ativos
    applyFilters() {
        if (!window.musicData || !window.appState) return;

        let filteredData = [...window.musicData];

        // Aplica filtro de data
        if (this.activeFilters.data) {
            const [startYear, endYear] = this.activeFilters.data.split('-').map(Number);
            filteredData = filteredData.filter(item => {
                const itemYear = parseInt(item.data);
                return itemYear >= startYear && itemYear <= endYear;
            });
        }

        // Aplica filtro de gênero
        if (this.activeFilters.genero) {
            filteredData = filteredData.filter(item => 
                item.genero === this.activeFilters.genero
            );
        }

        // Aplica filtro de atração musical
        if (this.activeFilters.atracao) {
            filteredData = filteredData.filter(item => 
                item.atracao == this.activeFilters.atracao
            );
        }

        // Aplica filtro de introspecção
        if (this.activeFilters.introspeccao) {
            filteredData = filteredData.filter(item => 
                item.introspeccao == this.activeFilters.introspeccao
            );
        }

        // Aplica filtro de complexidade emocional
        if (this.activeFilters.complexidade) {
            filteredData = filteredData.filter(item => 
                item.complexidade == this.activeFilters.complexidade
            );
        }

        // Aplica filtro de significação
        if (this.activeFilters.significacao) {
            filteredData = filteredData.filter(item => 
                item.significacao == this.activeFilters.significacao
            );
        }

        // Verifica se há busca ativa e aplica também
        if (window.appState.searchTerm) {
            const searchTerm = window.appState.searchTerm.toLowerCase();
            filteredData = filteredData.filter(item => 
                item.titulo.toLowerCase().includes(searchTerm) ||
                item.autor.toLowerCase().includes(searchTerm) ||
                item.data.toString().includes(searchTerm) ||
                item.musica.toLowerCase().includes(searchTerm)
            );
        }

        // Atualiza o estado global e re-renderiza
        window.appState.filteredItems = filteredData;
        if (typeof window.resetPagination === 'function') {
            window.resetPagination();
        }
        window.renderItems(filteredData);

        // Atualiza contador de resultados
        this.updateResultsCounter(filteredData.length);
    }

    // Atualiza contador de resultados
    updateResultsCounter(count) {
        const totalItems = window.musicData ? window.musicData.length : 0;
        
        // Cria ou atualiza o contador se não existir
        let counter = document.getElementById('resultsCounter');
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'resultsCounter';
            counter.className = 'text-center text-blue-200 mt-4 font-medium';
            
            const filtersSection = document.querySelector('.py-8.bg-gradient-to-br');
            if (filtersSection) {
                filtersSection.appendChild(counter);
            }
        }

        if (count === totalItems) {
            counter.textContent = `Exibindo todas as ${totalItems} músicas`;
        } else {
            counter.textContent = `Exibindo ${count} de ${totalItems} músicas`;
        }
    }

    // Limpa todos os filtros
    clearAllFilters() {
        // Reset do estado dos filtros
        Object.keys(this.activeFilters).forEach(key => {
            this.activeFilters[key] = '';
        });

        // Reset dos elementos HTML
        const filterIds = ['filterData', 'filterGenero', 'filterAtracao', 'filterIntrospeccao', 'filterComplexidade', 'filterSignificacao'];
        
        filterIds.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.value = '';
                element.classList.remove('filter-active');
            }
        });

        // Se há busca ativa, mantém apenas a busca
        if (window.appState.searchTerm) {
            // Aplica apenas a busca
            const searchTerm = window.appState.searchTerm.toLowerCase();
            const filteredData = window.musicData.filter(item => 
                item.titulo.toLowerCase().includes(searchTerm) ||
                item.autor.toLowerCase().includes(searchTerm) ||
                item.data.toString().includes(searchTerm) ||
                item.musica.toLowerCase().includes(searchTerm)
            );
            window.appState.filteredItems = filteredData;
        } else {
            // Mostra todos os itens
            window.appState.filteredItems = [...window.musicData];
        }

        if (typeof window.resetPagination === 'function') {
            window.resetPagination();
        }

        window.renderItems(window.appState.filteredItems);
        this.updateResultsCounter(window.appState.filteredItems.length);
    }

    // Método para integração com o sistema de busca
    applyWithSearch(searchTerm) {
        window.appState.searchTerm = searchTerm;
        this.applyFilters();
    }

    // Verifica se há filtros ativos
    hasActiveFilters() {
        return Object.values(this.activeFilters).some(value => value !== '');
    }
}

// Inicializa o sistema de filtros quando o DOM estiver pronto
let advancedFilters;

function initAdvancedFilters() {
    if (window.musicData) {
        advancedFilters = new AdvancedFilters();
        window.advancedFilters = advancedFilters;
    } else {
        // Aguarda os dados serem carregados
        setTimeout(initAdvancedFilters, 100);
    }
}

// Inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdvancedFilters);
} else {
    initAdvancedFilters();
}
