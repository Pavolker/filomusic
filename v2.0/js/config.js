// Configurações da aplicação
const CONFIG = {
    // Configurações gerais
    app: {
        name: 'Filosofia da Música',
        version: '1.0.0',
        description: 'Aplicação de carrossel com composições musicais'
    },

    // Configurações de UI
    ui: {
        cardHeight: '70px',
        cardMinWidth: '280px',
        gridRows: 2,
        scrollSnap: true,
        hoverEffect: true,
        itemsPerPage: 12,
        searchDebounce: 300,
        animationDuration: 300
    },

    // Configurações de conteúdo
    content: {
        csvFile: './MUSICA_9.csv',
        mdFolder: './arquivo md/',
        defaultCategory: 'todas',
        // Para funcionamento local sem servidor
        localMode: true
    },

    // Configurações de carregamento
    loading: {
        timeout: 5000,
        retryAttempts: 3,
        fallbackEnabled: true
    },

    // Configurações de desenvolvimento
    dev: {
        enableLogs: true,
        mockData: false
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
