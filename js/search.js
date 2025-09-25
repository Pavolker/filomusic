// Funcionalidade de Busca - Integrada aos Cards Principais
class MusicSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.musicData = [];
        
        this.init();
    }
    
    init() {
        // Aguarda o carregamento dos dados de música
        this.waitForMusicData();
        
        // Event listeners
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.searchInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    }
    
    waitForMusicData() {
        // Verifica se os dados de música estão disponíveis
        const checkData = () => {
            if (window.musicData && Array.isArray(window.musicData)) {
                this.musicData = window.musicData;
                console.log('Dados de música carregados para busca:', this.musicData.length, 'itens');
            } else {
                // Tenta novamente em 100ms
                setTimeout(checkData, 100);
            }
        };
        checkData();
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.performSearch(this.searchInput.value.trim());
        }
    }
    
    handleSearch(event) {
        const query = event.target.value.trim();
        this.performSearch(query);
    }
    
    performSearch(query) {
        if (!this.musicData || this.musicData.length === 0) {
            console.warn('Dados de música não disponíveis para busca');
            return;
        }
        
        // Atualiza o estado global de busca
        if (window.appState) {
            window.appState.searchTerm = query;
        }
        
        if (query.length < 2) {
            this.showAllItems();
            return;
        }
        
        // Se há filtros avançados ativos, usa o sistema integrado
        if (window.advancedFilters && window.advancedFilters.hasActiveFilters()) {
            window.advancedFilters.applyWithSearch(query);
        } else {
            // Busca tradicional sem filtros
            const results = this.searchMusic(query);
            this.filterCards(results);
        }
    }
    
    searchMusic(query) {
        const searchTerm = query.toLowerCase();
        
        return this.musicData.filter(music => {
            // Busca no título
            const titleMatch = music.titulo && music.titulo.toLowerCase().includes(searchTerm);
            
            // Busca no autor
            const authorMatch = music.autor && music.autor.toLowerCase().includes(searchTerm);
            
            // Busca no ano (convertido para string)
            const yearMatch = music.data && music.data.toString().includes(searchTerm);
            
            return titleMatch || authorMatch || yearMatch;
        });
    }
    
    filterCards(filteredResults) {
        // Atualiza o appState com os resultados filtrados
        if (typeof window.appState !== 'undefined') {
            window.appState.filteredItems = filteredResults;
            
            // Re-renderiza os cards com os resultados filtrados
            if (typeof window.renderItems === 'function') {
                window.renderItems();
            } else if (typeof renderItems === 'function') {
                renderItems();
            }
        }
        
        console.log(`Busca realizada: ${filteredResults.length} resultados encontrados`);
    }
    
    showAllItems() {
        // Limpa o termo de busca
        if (window.appState) {
            window.appState.searchTerm = '';
        }
        
        // Se há filtros ativos, aplica apenas os filtros
        if (window.advancedFilters && window.advancedFilters.hasActiveFilters()) {
            window.advancedFilters.applyFilters();
        } else {
            // Mostra todos os itens quando não há busca nem filtros
            if (window.appState) {
                window.appState.filteredItems = [...this.musicData];
            }
            
            if (window.renderItems) {
                window.renderItems();
            }
        }
        
        console.log('Mostrando todos os itens');
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.showAllItems();
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Inicializa a busca quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new MusicSearch();
});