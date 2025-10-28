const DEBUG_DIAL = false;
const DATA_LOAD_MAX_RETRIES = 50;
const DATA_LOAD_RETRY_INTERVAL = 100;

const debugLog = (...args) => {
    if (DEBUG_DIAL) {
        console.log(...args);
    }
};

// Dial de Rádio - Controle Interativo
class DialRadio {
    constructor() {
        this.currentValue = 1;
        this.musicData = [];
        this.currentMusic = null;
        this.dialInput = null;
        this.visual = null;
        
        this.retryCount = 0;

        this.init();
    }

    init() {
        const globalData = (typeof window !== 'undefined') ? window.musicData : null;

        if (Array.isArray(globalData) && globalData.length > 0) {
            this.musicData = globalData;
            debugLog('✅ Dados de música carregados:', this.musicData.length);
            this.clearDataLoadError();
            this.setupDial();
            return;
        }

        this.retryCount += 1;
        if (this.retryCount <= DATA_LOAD_MAX_RETRIES) {
            setTimeout(() => this.init(), DATA_LOAD_RETRY_INTERVAL);
            return;
        }

        console.error('❌ Timeout: dados não carregaram após a espera.');
        this.showDataLoadError();
    }

    showDataLoadError() {
        const stationEl = document.getElementById('stationName');
        if (stationEl) {
            stationEl.textContent = 'Dados indisponíveis';
        }

        const infoPanel = document.getElementById('musicInfo');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }

        if (document.getElementById('dialDataError')) {
            return;
        }

        const container = document.querySelector('.dial-container');
        if (!container) {
            return;
        }

        const message = document.createElement('div');
        message.id = 'dialDataError';
        message.className = 'dial-error-banner';
        message.textContent = 'Não foi possível carregar a lista de músicas. Recarregue a página ou tente novamente mais tarde.';

        container.appendChild(message);
    }

    clearDataLoadError() {
        const errorBanner = document.getElementById('dialDataError');
        if (errorBanner && errorBanner.parentNode) {
            errorBanner.parentNode.removeChild(errorBanner);
        }
    }

    setupDial() {
        debugLog('🔵 setupDial() chamado');
        this.dialInput = document.getElementById('dialInput');
        
        // Event listeners
        if (this.dialInput) {
            this.dialInput.addEventListener('input', (e) => this.handleDialMove(e));
            this.dialInput.addEventListener('change', (e) => this.handleDialStop(e));
        }
        
        // Botões
        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        const readBtn = document.getElementById('readBtn');
        const closeModal = document.getElementById('closeModal');
        
        if (playBtn) playBtn.addEventListener('click', () => this.playMusic());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopMusic());
        if (readBtn) readBtn.addEventListener('click', () => this.readText());
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        
        // Criar 200 pontos na régua
        this.createRulerPoints();
        
        // Carregar primeira música
        this.updateDisplay(1);
        // Também exibir painel com botões imediatamente
        this.loadMusicData(1);
    }

    createRulerPoints() {
        debugLog('🔵 Função createRulerPoints() chamada');
        const pointsContainer = document.querySelector('.ruler-points-container');
        debugLog('🔵 Container encontrado:', pointsContainer);
        if (!pointsContainer) {
            console.error('❌ Container de pontos não encontrado');
            return;
        }
        
        debugLog('🟢 Criando 200 pontos na régua...');
        
        // Limpar pontos existentes
        pointsContainer.innerHTML = '';
        
        // Criar 200 pontos (marcas pequenas na régua)
        for (let i = 1; i <= 200; i++) {
            const point = document.createElement('div');
            point.className = 'ruler-point';
            point.dataset.number = i;
            point.setAttribute('title', `Música ${i}`);
            
            // Posicionar ponto ao longo da régua
            const percentage = ((i - 1) / 199) * 100;
            point.style.left = `${percentage}%`;
            
            // Pintar alguns anos importantes com cor diferente
            if (this.musicData && this.musicData[i - 1]) {
                const year = parseInt(this.musicData[i - 1].data);
                if (year) {
                    // Anos históricos especiais
                    if (year <= 1500) {
                        point.style.background = '#8b5cf6';
                    } else if (year >= 1950 && year <= 1975) {
                        point.style.background = '#10b981';
                    } else if (year >= 2000) {
                        point.style.background = '#3b82f6';
                    }
                }
            }
            
            pointsContainer.appendChild(point);
        }
        
        // Marcar primeiro ponto como ativo
        if (pointsContainer.children.length > 0) {
            pointsContainer.children[0].classList.add('active');
        }
        
        debugLog('✅ 200 pontos criados na régua', pointsContainer.children.length);
        
        // Verificar se os pontos estão visíveis no DOM
        const firstPoint = pointsContainer.children[0];
        if (firstPoint) {
            debugLog('Primeiro ponto:', firstPoint.className, firstPoint.style.left);
            debugLog('Computed styles:', window.getComputedStyle(firstPoint).display);
        }
    }

    handleDialMove(e) {
        const value = parseInt(e.target.value);
        this.updateDisplay(value);
    }

    handleDialStop(e) {
        const value = parseInt(e.target.value);
        this.currentValue = value;
        this.loadMusicData(value);
    }

    updateDisplay(value) {
        // Atualizar valor atual
        const valueEl = document.getElementById('currentDialValue');
        const stationEl = document.getElementById('stationName');
        
        if (valueEl) {
            valueEl.textContent = value;
        }
        
        // Atualizar nome da estação e período se houver dados
        if (this.musicData && this.musicData[value - 1]) {
            const music = this.musicData[value - 1];
            // IMPORTANTE: Atualizar currentMusic para que o modal possa acessar
            this.currentMusic = music;
            
            if (stationEl) {
                const title = (music && (music['título'] || music.musica)) || 'Música';
                const year = music.data || '';
                stationEl.textContent = `${title} - ${year}`;
            }
            
            // Atualizar marcador de período ativo
            this.updateTimeMarker(music.data);
        }
        
        // Atualizar ponto ativo na régua
        this.updateActivePoint(value);
        
        // Mover luzes (efeito visual)
        const percentage = ((value - 1) / 199) * 100;
        const lightsContainer = document.querySelector('.dial-lights-container');
        if (lightsContainer) {
            lightsContainer.style.left = `${percentage}%`;
        }
    }

    updateActivePoint(value) {
        const points = document.querySelectorAll('.ruler-point');
        points.forEach((point, index) => {
            if (index + 1 === value) {
                point.classList.add('active');
            } else {
                point.classList.remove('active');
            }
        });
    }

    updateTimeMarker(year) {
        if (!year) return;
        
        const yearNum = parseInt(year);
        const markers = document.querySelectorAll('.time-marker');
        
        // Determinar qual período corresponde
        let activeMarker = null;
        if (yearNum <= 1500) {
            activeMarker = markers[0]; // 1100
        } else if (yearNum <= 1750) {
            activeMarker = markers[1]; // 1500
        } else if (yearNum <= 1850) {
            activeMarker = markers[2]; // 1750
        } else if (yearNum <= 1950) {
            activeMarker = markers[3]; // 1850
        } else if (yearNum <= 1980) {
            activeMarker = markers[4]; // 1950
        } else if (yearNum <= 2025) {
            activeMarker = markers[5]; // 1980
        } else {
            activeMarker = markers[6]; // 2025
        }
        
        // Remover ativo de todos e adicionar ao marcador correspondente
        markers.forEach(marker => marker.classList.remove('active'));
        if (activeMarker) {
            activeMarker.classList.add('active');
        }
    }

    loadMusicData(value) {
        if (!this.musicData || this.musicData.length === 0) {
            console.warn('Dados de música não carregados');
            return;
        }
        
        const music = this.musicData[value - 1];
        if (!music) {
            console.warn('Música não encontrada para o valor:', value);
            return;
        }
        
        this.currentMusic = music;
        this.showMusicInfo(music);
    }

    showMusicInfo(music) {
        const infoPanel = document.getElementById('musicInfo');
        const title = document.getElementById('musicTitle');
        const author = document.getElementById('musicAuthor');
        const date = document.getElementById('musicDate');
        
        if (!infoPanel || !title || !author || !date) return;
        
        title.textContent = (music && (music['título'] || music.musica)) || 'Sem título';
        author.textContent = `Por: ${music.autor || 'Desconhecido'}`;
        date.textContent = `Data: ${music.data || ''}`;
        
        infoPanel.classList.remove('hidden');
        
        // Scroll suave até o painel
        setTimeout(() => {
            infoPanel.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 300);
    }

    playMusic() {
        if (!this.currentMusic) {
            console.warn('⚠️ Nenhuma música selecionada');
            return;
        }
        
        // Construir nome de arquivo no formato esperado: "ANO - TÍTULO"
        const year = (this.currentMusic.data || '').toString().trim();
        const title = (this.currentMusic['título'] || this.currentMusic.musica || '').toString().trim().toUpperCase();
        const filename = `${year} - ${title}`;
        
        console.log('🎵 Tentando reproduzir música:', filename);
        console.log('🎵 Dados da música:', this.currentMusic);
        
        // Verificar se youtubePlayer está disponível
        if (!window.youtubePlayer) {
            console.error('❌ window.youtubePlayer não existe!');
            alert('Player do YouTube não está disponível. Verifique se o script youtube-player.js foi carregado.');
            return;
        }
        
        if (typeof window.youtubePlayer.playFromCard !== 'function') {
            console.error('❌ window.youtubePlayer.playFromCard não é uma função!');
            console.error('❌ Métodos disponíveis:', Object.keys(window.youtubePlayer));
            alert('O método playFromCard não está disponível. O player pode não estar inicializado corretamente.');
            return;
        }
        
        console.log('✅ Chamando playFromCard com:', filename);
        try {
            window.youtubePlayer.playFromCard(filename);
        } catch (error) {
            console.error('❌ Erro ao chamar playFromCard:', error);
            alert(`Erro ao reproduzir música: ${error.message}`);
        }
    }

    stopMusic() {
        debugLog('⏹️ Parando música...');
        if (window.youtubePlayer && typeof window.youtubePlayer.stop === 'function') {
            window.youtubePlayer.stop();
        } else {
            console.warn('Player do YouTube não disponível para parar');
        }
    }

    async readText() {
        if (!this.currentMusic) return;
        
        const modal = document.getElementById('textModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalSubtitle = document.getElementById('modalSubtitle');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalTitle || !modalSubtitle || !modalContent) return;
        
        modalTitle.textContent = (this.currentMusic && (this.currentMusic['título'] || this.currentMusic.musica)) || 'Sem título';
        modalSubtitle.textContent = `${this.currentMusic.autor || 'Desconhecido'} - ${this.currentMusic.data || ''}`;
        
        // Carregar conteúdo do arquivo markdown
        debugLog('📖 ===== readText() CHAMADA =====');
        debugLog('📖 this.currentMusic:', this.currentMusic);
        
        // Tentar mapear o arquivo correto usando MD_FILE_MAPPING
        const year = (this.currentMusic?.data || '').toString().trim();
        const title = ((this.currentMusic && (this.currentMusic['título'] || this.currentMusic.musica)) || '').toString().trim();
        const expectedFilename = `${year} - ${title}.md`;
        debugLog('📖 Tentando localizar arquivo para título:', title, '| filename esperado:', expectedFilename);
        
        let content = null;
        let resolvedFilename = null;
        
        try {
            const normalizedTitle = (typeof window !== 'undefined' && typeof window.normalizeTitle === 'function')
                ? window.normalizeTitle(title)
                : String(title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

            if (typeof window !== 'undefined' && window.MD_FILE_MAPPING && normalizedTitle) {
                resolvedFilename = window.MD_FILE_MAPPING[normalizedTitle] || null;
                debugLog('🗂️ MD_FILE_MAPPING resolvedFilename:', resolvedFilename);
            }
        } catch (mapError) {
            debugLog('⚠️ Falha ao normalizar/mapejar título:', mapError);
        }

        // 1) Tentar conteúdo incorporado usando filename resolvido
        if (!content && resolvedFilename && window.MARKDOWN_CONTENT && window.MARKDOWN_CONTENT[resolvedFilename]) {
            content = window.MARKDOWN_CONTENT[resolvedFilename];
            debugLog('✅ Conteúdo encontrado em MARKDOWN_CONTENT com mapeamento');
        }

        // 2) Tentar buscar arquivo físico com filename resolvido
        if (!content && resolvedFilename) {
            try {
                const url = `./arquivo md/${resolvedFilename}`;
                debugLog('📁 Tentando carregar arquivo mapeado:', url);
                const response = await fetch(url);
                debugLog('📁 Response status:', response.status);
                if (response.ok) {
                    content = await response.text();
                    debugLog('✅ Conteúdo carregado do arquivo .md mapeado, tamanho:', content.length);
                }
            } catch (error) {
                debugLog('❌ Erro ao carregar arquivo mapeado:', error);
            }
        }

        // 3) Fallback: tentar pelo filename esperado direto
        if (!content) {
            // Primeiro embutido
            if (window.MARKDOWN_CONTENT && window.MARKDOWN_CONTENT[expectedFilename]) {
                content = window.MARKDOWN_CONTENT[expectedFilename];
                resolvedFilename = expectedFilename;
                debugLog('✅ Conteúdo encontrado em MARKDOWN_CONTENT pelo nome esperado');
            } else {
                // Depois via fetch
                debugLog('📁 Tentando carregar arquivo esperado:', `./arquivo md/${expectedFilename}`);
                try {
                    const url = `./arquivo md/${expectedFilename}`;
                    const response = await fetch(url);
                    debugLog('📁 Response status:', response.status);
                    if (response.ok) {
                        content = await response.text();
                        resolvedFilename = expectedFilename;
                        debugLog('✅ Conteúdo carregado do arquivo .md esperado, tamanho:', content.length);
                    }
                } catch (error) {
                    debugLog('❌ Erro ao carregar arquivo esperado:', error);
                }
            }
        }
        
        if (content) {
            debugLog('✅ Conteúdo encontrado!');
            debugLog('📖 Tamanho do conteúdo:', content?.length || 0);
            debugLog('📖 Primeiros 200 caracteres:', content?.substring(0, 200) || 'N/A');
            // Converter markdown para HTML
            const html = this.convertMarkdownToHTML(content);
            debugLog('📖 HTML gerado, tamanho:', html.length);
            modalContent.innerHTML = html;
        } else {
            debugLog('❌ Conteúdo NÃO encontrado');
            const title = this.currentMusic['título'] || this.currentMusic.musica || 'Sem título';
            modalContent.innerHTML = `
                <p style="color: white;">Informações sobre a música:</p>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <p style="color: #bfdbfe;"><strong>Título:</strong> ${title}</p>
                    <p style="color: #bfdbfe;"><strong>Autor:</strong> ${this.currentMusic.autor || 'Desconhecido'}</p>
                    <p style="color: #bfdbfe;"><strong>Música:</strong> ${this.currentMusic.musica || 'N/A'}</p>
                    <p style="color: #bfdbfe;"><strong>Gênero:</strong> ${this.currentMusic.genero || 'N/A'}</p>
                    <p style="color: #bfdbfe;"><strong>Data:</strong> ${this.currentMusic.data || 'N/A'}</p>
                    <p style="color: #fbbf24; margin-top: 1rem; font-style: italic;">Texto completo não disponível no momento.</p>
                </div>
            `;
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('textModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    convertMarkdownToHTML(markdown) {
        if (!markdown) return '';
        
        // Dividir em parágrafos (linhas vazias indicam separação)
        let html = markdown
            // Links do YouTube
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #60a5fa; text-decoration: underline;">$1</a>')
            // Negrito
            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
            // Itálico
            .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
        
        // Dividir por quebras de linha duplas para criar parágrafos
        const paragraphs = html.split(/\n\s*\n/).filter(p => p.trim());
        
        return paragraphs.map(p => {
            // Processar cada parágrafo
            return `<p style="margin-bottom: 1rem; color: #e0e7ff; line-height: 1.75;">${p.trim()}</p>`;
        }).join('\n');
    }
}

// Inicializar quando DOM estiver pronto
debugLog('🔵 Iniciando DialRadio...');
if (document.readyState === 'loading') {
    debugLog('🔵 Document ainda carregando, aguardando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        debugLog('✅ DOMContentLoaded disparado');
        window.dialRadio = new DialRadio();
    });
} else {
    debugLog('✅ Document já pronto');
    window.dialRadio = new DialRadio();
}
