// YouTube Player para reprodução de músicas - Cache busting comment - Debug 2024
class YouTubePlayer {
    constructor() {
        this.player = null;
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isPlayerReady = false;
        this.youtubeUrls = {};
        this.youtubeDisplayNames = {};
        this.currentFileName = '';
        
        // Proteção contra loops infinitos
        this.consecutiveErrors = 0;
        this.maxConsecutiveErrors = 3;
        this.lastErrorTime = 0;
        this.errorCooldown = 2000; // 2 segundos

        this.initializeElements();
        this.loadYouTubeUrls();
        this.setupEventListeners();
        this.loadYouTubeAPI();
    }

    initializeElements() {
        this.elements = {
            currentFileName: document.getElementById('currentFileName'),
            currentTrackTitle: document.getElementById('currentTrackTitle'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            stopBtn: document.getElementById('stopBtn'),
            currentTrackNumber: document.getElementById('currentTrackNumber'),
            totalTracks: document.getElementById('totalTracks'),
            playlistProgress: document.getElementById('playlistProgress'),
            loadingProgress: document.getElementById('loadingProgress'),
            loadingText: document.getElementById('loadingText'),
            loadingBar: document.getElementById('loadingBar'),
            loadingPercentage: document.getElementById('loadingPercentage')
        };
        
    }

    async loadYouTubeUrls() {
        try {
            // Usa dados incorporados para evitar problemas de CORS
            if (typeof window !== 'undefined' && window.YOUTUBE_URLS_DATA) {
                this.youtubeUrls = this.buildNormalizedYoutubeMap(window.YOUTUBE_URLS_DATA);
                console.log('URLs do YouTube carregadas dos dados incorporados (normalizadas):', Object.keys(this.youtubeUrls).length, 'arquivos');
            } else {
                console.warn('Dados do YouTube não encontrados, usando dados vazios');
                this.youtubeUrls = {};
            }
        } catch (error) {
            console.error('Erro ao carregar URLs do YouTube:', error);
            // Fallback: tenta carregar dados vazios para evitar erros
            this.youtubeUrls = {};
        }
    }

    loadYouTubeAPI() {
        console.log('Carregando API do YouTube...');
        
        // Verifica se já existe uma função global definida
        if (window.onYouTubeIframeAPIReady && typeof window.onYouTubeIframeAPIReady === 'function') {
            console.log('API do YouTube já está sendo carregada...');
            return;
        }
        
        // Carrega a API do YouTube se ainda não foi carregada
        if (!window.YT) {
            console.log('Criando script tag para API do YouTube...');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            tag.defer = true;
            
            // Adiciona listeners para debug
            tag.onload = () => console.log('Script da API do YouTube carregado');
            tag.onerror = (error) => console.error('Erro ao carregar API do YouTube:', error);
            
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            // Define a função global para quando a API estiver pronta
            window.onYouTubeIframeAPIReady = () => {
                console.log('API do YouTube pronta!');
                setTimeout(() => {
                    this.initializePlayer();
                }, 200);
            };
        } else if (window.YT && window.YT.Player) {
            console.log('API do YouTube já disponível, inicializando player...');
            this.initializePlayer();
        } else {
            console.log('Aguardando API do YouTube estar completamente carregada...');
            // Aguarda a API estar completamente carregada
            setTimeout(() => {
                this.loadYouTubeAPI();
            }, 200);
        }
    }

    initializePlayer() {
        try {
            console.log('Inicializando player do YouTube...');
            
            // Detecta se estamos em ambiente local ou servidor
            const isLocalFile = window.location.protocol === 'file:';
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            let originConfig = {};
            let widgetReferrer = '';
            
            if (isLocalFile) {
                console.warn('Detectado protocolo file://. O player do YouTube pode não funcionar corretamente.');
                console.warn('Por favor, acesse através de http://localhost:8000');
                // Para protocolo file://, não definimos origin
                widgetReferrer = 'http://localhost:8000';
            } else if (isLocalhost) {
                originConfig.origin = window.location.origin;
                widgetReferrer = window.location.href;
            } else {
                originConfig.origin = window.location.origin;
                widgetReferrer = window.location.href;
            }
            
            console.log('Configuração do player:', {
                protocol: window.location.protocol,
                hostname: window.location.hostname,
                origin: originConfig.origin,
                widgetReferrer: widgetReferrer
            });
            
            this.player = new YT.Player('youtubePlayer', {
                height: '0',
                width: '0',
                videoId: '',
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'enablejsapi': 1,
                    'widget_referrer': widgetReferrer,
                    ...originConfig
                },
                events: {
                    'onReady': (event) => this.onPlayerReady(event),
                    'onStateChange': (event) => this.onPlayerStateChange(event),
                    'onError': (event) => this.onPlayerError(event)
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar player:', error);
            // Tenta novamente após 2 segundos
            setTimeout(() => this.initializePlayer(), 2000);
        }
    }

    onPlayerReady(event) {
        console.log('Player do YouTube pronto');
        this.isPlayerReady = true;
        
        // Habilita os controles
        this.enableControls();
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            this.hideLoadingProgress();
            this.playNext();
        } else if (event.data === YT.PlayerState.PLAYING) {
            // Completar progresso e esconder barra quando começar a tocar
            this.updateLoadingProgress(100);
            setTimeout(() => this.hideLoadingProgress(), 500);
            
            // Resetar contador de erros quando música toca com sucesso
            this.consecutiveErrors = 0;
            
            this.isPlaying = true;
            this.elements.playPauseBtn.innerHTML = '⏸️';
            this.updateTrackInfo();
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.elements.playPauseBtn.innerHTML = '▶️';
        } else if (event.data === YT.PlayerState.BUFFERING) {
            // Mostrar progresso durante buffering se não estiver visível
            if (this.elements.loadingProgress && this.elements.loadingProgress.classList.contains('hidden')) {
                this.showLoadingProgress('Carregando...');
                this.updateLoadingProgress(50);
            }
        }
    }

    onPlayerError(event) {
        console.warn('Erro no player do YouTube:', event.data);
        this.hideLoadingProgress();
        
        const currentTime = Date.now();
        
        // Verificar se estamos em um loop de erros
        if (currentTime - this.lastErrorTime < this.errorCooldown) {
            this.consecutiveErrors++;
        } else {
            this.consecutiveErrors = 1;
        }
        
        this.lastErrorTime = currentTime;
        
        // Se excedeu o limite de erros consecutivos, parar o player
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
            console.warn(`Muitos erros consecutivos (${this.consecutiveErrors}). Parando reprodução para evitar loop infinito.`);
            this.stop();
            this.showNoMusicMessage('Erro: Não foi possível reproduzir as músicas desta playlist');
            return;
        }
        
        // Tenta próxima música se houver erro e não excedeu o limite
        if (this.currentPlaylist.length > 1) {
            console.log(`Tentativa ${this.consecutiveErrors} de ${this.maxConsecutiveErrors}. Tentando próxima música...`);
            setTimeout(() => this.playNext(), 1000); // Pequeno delay para evitar spam
        }
    }

    setupEventListeners() {
        // Lista de elementos e suas funções
        const eventHandlers = [
            {
                element: 'playPauseBtn',
                handler: () => {
                    if (this.player && this.player.getPlayerState) {
                        const state = this.player.getPlayerState();
                        if (state === YT.PlayerState.PLAYING) {
                            this.pause();
                        } else {
                            this.play();
                        }
                    }
                }
            },
            {
                element: 'prevBtn',
                handler: () => this.playPrevious()
            },
            {
                element: 'nextBtn',
                handler: () => this.playNext()
            },
            {
                element: 'stopBtn',
                handler: () => this.stop()
            }
        ];

        // Configurar event listeners de forma segura
        eventHandlers.forEach(({ element, handler }) => {
            const el = this.elements[element];
            
            if (el && typeof el.addEventListener === 'function') {
                try {
                    el.addEventListener('click', handler);
                } catch (error) {
                    console.error(`Erro ao configurar event listener para ${element}:`, error);
                }
            }
        });
    }

    // Função para carregar playlist de um arquivo específico
    loadPlaylistFromFile(fileName) {
        const cleanFileName = fileName.replace('.md', '');
        const playlistEntry = this.findPlaylistEntry(cleanFileName);
        const urls = playlistEntry ? playlistEntry.urls : null;

        if (!urls || urls.length === 0) {
            console.log('Nenhuma URL encontrada para:', cleanFileName);
            this.showNoMusicMessage(cleanFileName);
            return;
        }

        // Resetar contador de erros ao carregar nova playlist
        this.consecutiveErrors = 0;
        this.lastErrorTime = 0;

        this.currentPlaylist = urls.map(url => this.extractVideoId(url)).filter(id => id);
        this.currentTrackIndex = 0;
        this.currentFileName = (playlistEntry && playlistEntry.displayName) || cleanFileName;

        if (this.currentPlaylist.length > 0) {
            this.enableControls();
            this.updatePlaylistInfo();
            this.loadCurrentTrack();
            console.log(`Playlist carregada: ${this.currentPlaylist.length} músicas de ${cleanFileName}`);
        } else {
            this.showNoMusicMessage(cleanFileName);
        }
    }

    extractVideoId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    loadCurrentTrack() {
        if (this.currentPlaylist.length === 0) {
            console.log('Playlist vazia');
            return;
        }
        
        if (!this.player || !this.isPlayerReady) {
            console.log('Player não está pronto, tentando novamente em 1 segundo...');
            setTimeout(() => this.loadCurrentTrack(), 1000);
            return;
        }
        
        // Verifica se a função loadVideoById existe
        if (!this.player.loadVideoById || typeof this.player.loadVideoById !== 'function') {
            console.log('Função loadVideoById não disponível, tentando novamente...');
            setTimeout(() => this.loadCurrentTrack(), 1000);
            return;
        }

        // Mostrar barra de progresso
        this.showLoadingProgress('Carregando música...');
        this.simulateLoadingProgress();

        const videoId = this.currentPlaylist[this.currentTrackIndex];
        console.log('Carregando vídeo:', videoId);

        try {
            if (typeof this.player.stopVideo === 'function') {
                try {
                    this.player.stopVideo();
                } catch (stopError) {
                    console.warn('Não foi possível parar o vídeo anterior antes de carregar o próximo:', stopError);
                }
            }

            this.player.loadVideoById(videoId);
            if (typeof this.player.playVideo === 'function') {
                // Solicita reprodução imediata após o carregamento
                this.player.playVideo();
            }

            this.isPlaying = true;
            this.elements.playPauseBtn.innerHTML = '⏸️';
            this.updateTrackInfo();
        } catch (error) {
            console.error('Erro ao carregar vídeo:', error);
            this.hideLoadingProgress();
            setTimeout(() => this.loadCurrentTrack(), 2000);
        }
    }

    play() {
        if (this.player && this.isPlayerReady && this.currentPlaylist.length > 0) {
            try {
                this.player.playVideo();
            } catch (error) {
                console.error('Erro ao reproduzir vídeo:', error);
            }
        }
    }

    pause() {
        if (this.player && this.isPlayerReady) {
            try {
                this.player.pauseVideo();
            } catch (error) {
                console.error('Erro ao pausar vídeo:', error);
            }
        }
    }

    stop() {
        if (this.player && this.isPlayerReady) {
            try {
                this.player.stopVideo();
                this.isPlaying = false;
                this.elements.playPauseBtn.innerHTML = '▶️';
                
                // Resetar contador de erros quando parar manualmente
                this.consecutiveErrors = 0;
                this.lastErrorTime = 0;
            } catch (error) {
                console.error('Erro ao parar vídeo:', error);
            }
        }
    }

    playNext() {
        if (this.currentPlaylist.length === 0) return;
        
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        this.loadCurrentTrack();
    }

    playPrevious() {
        if (this.currentPlaylist.length === 0) return;
        
        this.currentTrackIndex = this.currentTrackIndex === 0 
            ? this.currentPlaylist.length - 1 
            : this.currentTrackIndex - 1;
        this.loadCurrentTrack();
    }



    updateTrackInfo() {
        this.elements.currentFileName.textContent = this.currentFileName;
        this.elements.currentTrackTitle.textContent = `Reproduzindo música ${this.currentTrackIndex + 1} de ${this.currentPlaylist.length}`;
        
        this.elements.currentTrackNumber.textContent = this.currentTrackIndex + 1;
        this.elements.totalTracks.textContent = this.currentPlaylist.length;
    }

    updatePlaylistInfo() {
        this.elements.playlistProgress.classList.remove('hidden');
        this.updateTrackInfo();
    }

    // Métodos para controle da barra de progresso
    showLoadingProgress(text = 'Carregando música...') {
        if (this.elements.loadingProgress) {
            this.elements.loadingProgress.classList.remove('hidden');
            if (this.elements.loadingText) {
                this.elements.loadingText.textContent = text;
            }
            this.updateLoadingProgress(0);
        }
    }

    hideLoadingProgress() {
        if (this.elements.loadingProgress) {
            this.elements.loadingProgress.classList.add('hidden');
        }
    }

    updateLoadingProgress(percentage) {
        if (this.elements.loadingBar && this.elements.loadingPercentage) {
            const clampedPercentage = Math.max(0, Math.min(100, percentage));
            this.elements.loadingBar.style.width = `${clampedPercentage}%`;
            this.elements.loadingPercentage.textContent = `${Math.round(clampedPercentage)}%`;
        }
    }

    simulateLoadingProgress() {
        let progress = 0;
        const increment = Math.random() * 15 + 5; // 5-20% por vez
        
        const updateProgress = () => {
            progress += increment;
            
            if (progress < 90) {
                this.updateLoadingProgress(progress);
                setTimeout(updateProgress, Math.random() * 300 + 200); // 200-500ms
            } else {
                this.updateLoadingProgress(90);
            }
        };
        
        updateProgress();
    }

    enableControls() {
        Object.values(this.elements).forEach(element => {
            if (element && element.disabled !== undefined) {
                element.disabled = false;
            }
        });
    }

    disableControls() {
        Object.values(this.elements).forEach(element => {
            if (element && element.disabled !== undefined) {
                element.disabled = true;
            }
        });
        this.elements.playlistProgress.classList.add('hidden');
    }

    showNoMusicMessage(fileName) {
        this.elements.currentFileName.textContent = fileName;
        this.elements.currentTrackTitle.textContent = 'Nenhuma música disponível para este arquivo';
        this.disableControls();
        this.currentPlaylist = [];
    }

    // Método público para ser chamado pelos cards
    playFromCard(fileName) {
        this.loadPlaylistFromFile(fileName);
    }

    normalizeFileName(name) {
        if (!name) return '';

        const normalized = typeof name.normalize === 'function'
            ? name.normalize('NFD')
            : name;

        return normalized
            .replace(/\.[mM][dD]$/, '')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '')
            .toLowerCase();
    }

    buildNormalizedYoutubeMap(data) {
        const normalizedMap = {};
        this.youtubeDisplayNames = {};

        Object.entries(data).forEach(([key, urls]) => {
            const normalizedKey = this.normalizeFileName(key);

            if (!normalizedKey || !Array.isArray(urls)) {
                return;
            }

            if (!normalizedMap[normalizedKey]) {
                normalizedMap[normalizedKey] = [...urls];
                this.youtubeDisplayNames[normalizedKey] = key;
            } else {
                const existing = new Set([...normalizedMap[normalizedKey], ...urls]);
                normalizedMap[normalizedKey] = Array.from(existing);
            }
        });

        return normalizedMap;
    }

    findPlaylistEntry(fileName) {
        if (!fileName) {
            return null;
        }

        const normalizedKey = this.normalizeFileName(fileName);
        const fallbackDisplay = fileName.replace('.md', '');

        if (normalizedKey && this.youtubeUrls[normalizedKey]) {
            return {
                urls: this.youtubeUrls[normalizedKey],
                displayName: this.youtubeDisplayNames[normalizedKey] || fallbackDisplay
            };
        }

        if (!normalizedKey) {
            return null;
        }

        const fallbackKey = Object.keys(this.youtubeUrls).find(key =>
            key.includes(normalizedKey) || normalizedKey.includes(key)
        );

        if (fallbackKey) {
            return {
                urls: this.youtubeUrls[fallbackKey],
                displayName: this.youtubeDisplayNames[fallbackKey] || fallbackDisplay
            };
        }

        return null;
    }
}

// Inicializa o player quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.youtubePlayer = new YouTubePlayer();
});