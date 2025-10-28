const DEBUG_PLAYER = false;
const playerDebug = (...args) => {
    if (DEBUG_PLAYER) {
        console.log(...args);
    }
};

// YouTube Player para reprodução de músicas - versão simplificada 2024
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

        this.cacheKey = 'fdm_youtube_playlist_cache_v1';
        this.cacheEnabled = this.checkLocalStorageSupport();
        this.playlistCache = this.cacheEnabled ? this.readCachedPlaylists() : {};
        this.isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
        this.alertTimeout = null;
        this.shouldResumeAfterReconnect = false;
        this.hasShownInitialNetworkStatus = false;
        this.statusContext = null;

        this.ui = this.initializeUi();
        this.monitorNetworkStatus();
        this.loadYouTubeUrls();
        this.setupEventListeners();
        this.loadYouTubeAPI();
    }

    initializeUi() {
        const statusEl = document.getElementById('playerStatus');
        const playButton = document.getElementById('playBtn');
        const stopButton = document.getElementById('stopBtn');

        return {
            status: statusEl,
            playButton,
            stopButton,
            baseStatusClass: statusEl ? statusEl.className : ''
        };
    }

    checkLocalStorageSupport() {
        try {
            const testKey = '__fdm_player_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('LocalStorage indisponível para cache de playlists:', error);
            return false;
        }
    }

    readCachedPlaylists() {
        if (!this.cacheEnabled) {
            return {};
        }

        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (!raw) {
                return {};
            }

            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        } catch (error) {
            console.warn('Falha ao ler cache de playlists:', error);
        }

        return {};
    }

    persistPlaylistCache() {
        if (!this.cacheEnabled) {
            return;
        }

        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(this.playlistCache));
        } catch (error) {
            console.warn('Falha ao salvar cache de playlists:', error);
        }
    }

    showAlert(message, variant = 'info') {
        const statusEl = this.ui.status;
        if (!statusEl) {
            if (variant === 'error') {
                console.error(message);
            } else if (variant === 'warning') {
                console.warn(message);
            } else {
                playerDebug('[YouTubePlayer]', message);
            }
            return;
        }

        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
            this.alertTimeout = null;
        }

        statusEl.textContent = message || '';
        statusEl.dataset.variant = variant;
        statusEl.classList.remove('hidden');
    }

    clearAlert() {
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
            this.alertTimeout = null;
        }

        const statusEl = this.ui.status;
        if (!statusEl) {
            return;
        }

        statusEl.textContent = '';
        statusEl.dataset.variant = 'info';
        if (this.ui.baseStatusClass) {
            statusEl.className = this.ui.baseStatusClass;
        }
        statusEl.classList.add('hidden');
        this.statusContext = null;
    }

    scheduleAlertClear(delay = 4000) {
        if (!this.ui.status) {
            return;
        }

        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
        }

        this.alertTimeout = setTimeout(() => {
            this.clearAlert();
        }, delay);
    }

    monitorNetworkStatus() {
        if (typeof window === 'undefined') {
            return;
        }

        window.addEventListener('online', () => {
            this.updateNetworkStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateNetworkStatus(false);
        });

        this.updateNetworkStatus(this.isOnline);
    }

    updateNetworkStatus(isOnline) {
        this.isOnline = isOnline;
        const isInitialCall = !this.hasShownInitialNetworkStatus;
        this.hasShownInitialNetworkStatus = true;

        if (isInitialCall && isOnline) {
            this.clearAlert();
            return;
        }

        if (isOnline) {
            this.showAlert('Conexão restabelecida. Você pode retomar a reprodução.', 'info');
            if (this.currentPlaylist.length > 0) {
                this.enableControls();
                if (this.shouldResumeAfterReconnect) {
                    this.shouldResumeAfterReconnect = false;
                    this.loadCurrentTrack();
                }
            }
            this.scheduleAlertClear();
        } else {
            this.showAlert('Sem conexão com a internet. A reprodução do YouTube requer acesso online.', 'warning');
            this.disableControls();
        }
    }

    showOfflinePlaybackMessage(fileName) {
        this.shouldResumeAfterReconnect = true;
        this.disableControls();
        const message = fileName
            ? `Sem conexão com a internet para reproduzir "${fileName}".`
            : 'Sem conexão com a internet para reproduzir as músicas.';
        this.showAlert(message, 'warning');
    }

    async loadYouTubeUrls() {
        try {
            console.log('📊 Carregando URLs do YouTube...');
            
            // Usa dados incorporados para evitar problemas de CORS
            if (typeof window === 'undefined') {
                console.error('❌ window não está disponível');
                this.youtubeUrls = {};
                return;
            }
            
            // Aguardar um pouco caso o script ainda não tenha carregado
            let retries = 0;
            while (!window.YOUTUBE_URLS_DATA && retries < 10) {
                console.log(`⏳ Aguardando YOUTUBE_URLS_DATA carregar... (tentativa ${retries + 1}/10)`);
                await new Promise(resolve => setTimeout(resolve, 200));
                retries++;
            }
            
            if (!window.YOUTUBE_URLS_DATA) {
                console.error('❌ YOUTUBE_URLS_DATA não encontrado em window após 2 segundos');
                console.error('💡 Verifique se youtube-data.js foi carregado antes de youtube-player.js');
                console.error('💡 Ordem no HTML:', 'data.js → youtube-data.js → youtube-player.js');
                this.youtubeUrls = {};
                // Não mostrar alerta para não poluir a UI
                return;
            }
            
            const dataKeys = Object.keys(window.YOUTUBE_URLS_DATA);
            console.log('✅ YOUTUBE_URLS_DATA encontrado:', dataKeys.length, 'entradas');
            
            if (dataKeys.length === 0) {
                console.warn('⚠️ YOUTUBE_URLS_DATA está vazio! Nenhuma música terá URLs configuradas.');
                console.warn('💡 Execute: node scripts/build-content.js para incorporar as URLs');
                this.youtubeUrls = {};
                return;
            }
            
            console.log('📋 Primeiras 5 chaves disponíveis:', dataKeys.slice(0, 5));
            
            this.youtubeUrls = this.buildNormalizedYoutubeMap(window.YOUTUBE_URLS_DATA);
            const normalizedKeys = Object.keys(this.youtubeUrls);
            console.log('✅ YouTube URLs normalizadas:', normalizedKeys.length, 'entradas');
            
            if (normalizedKeys.length === 0) {
                console.warn('⚠️ Nenhuma URL foi normalizada! Verifique o formato dos dados.');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar URLs do YouTube:', error);
            console.error('Stack:', error.stack);
            // Fallback: tenta carregar dados vazios para evitar erros
            this.youtubeUrls = {};
        }
    }

    loadYouTubeAPI() {
        playerDebug('Carregando API do YouTube...');
        
        // Verifica se já existe uma função global definida
        if (window.onYouTubeIframeAPIReady && typeof window.onYouTubeIframeAPIReady === 'function') {
            playerDebug('API do YouTube já está sendo carregada...');
            return;
        }
        
        // Carrega a API do YouTube se ainda não foi carregada
        if (!window.YT) {
            playerDebug('Criando script tag para API do YouTube...');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            tag.defer = true;
            
            // Adiciona listeners para debug
            tag.onload = () => playerDebug('Script da API do YouTube carregado');
            tag.onerror = (error) => console.error('Erro ao carregar API do YouTube:', error);
            
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            // Define a função global para quando a API estiver pronta
            window.onYouTubeIframeAPIReady = () => {
                playerDebug('API do YouTube pronta!');
                setTimeout(() => {
                    this.initializePlayer();
                }, 200);
            };
        } else if (window.YT && window.YT.Player) {
            playerDebug('API do YouTube já disponível, inicializando player...');
            this.initializePlayer();
        } else {
            playerDebug('Aguardando API do YouTube estar completamente carregada...');
            // Aguarda a API estar completamente carregada
            setTimeout(() => {
                this.loadYouTubeAPI();
            }, 200);
        }
    }

    initializePlayer() {
        try {
            playerDebug('🎬 Inicializando player do YouTube...');
            
            // Verificar se o elemento existe
            const playerElement = document.getElementById('youtubePlayer');
            if (!playerElement) {
                console.error('❌ Elemento youtubePlayer não encontrado no DOM!');
                setTimeout(() => this.initializePlayer(), 1000);
                return;
            }
            
            // Verificar se YT.Player está disponível
            if (!window.YT || !window.YT.Player) {
                console.error('❌ YouTube API (YT.Player) não está disponível ainda!');
                setTimeout(() => this.initializePlayer(), 1000);
                return;
            }
            
            // Detecta se estamos em ambiente local ou servidor
            const isLocalFile = window.location.protocol === 'file:';
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            let originConfig = {};
            let widgetReferrer = '';
            
            if (isLocalFile) {
                // Suprimir aviso repetitivo - o player funciona mas com limitações
                playerDebug('ℹ️ Protocolo file:// detectado. Algumas funcionalidades podem ter limitações.');
                // Para protocolo file://, não definimos origin
                widgetReferrer = 'http://localhost:8000';
            } else if (isLocalhost) {
                originConfig.origin = window.location.origin;
                widgetReferrer = window.location.href;
            } else {
                originConfig.origin = window.location.origin;
                widgetReferrer = window.location.href;
            }
            
            playerDebug('⚙️ Configuração do player:', {
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
        playerDebug('✅ Player do YouTube pronto e inicializado!');
        this.isPlayerReady = true;
        
        // Habilita os controles (se existirem)
        this.enableControls();
        
        // Disparar evento customizado para notificar que o player está pronto
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('youtubePlayerReady', { 
                detail: { player: this } 
            }));
        }
    }

    onPlayerStateChange(event) {
        if (!event || typeof event.data === 'undefined') {
            return;
        }

        if (event.data === YT.PlayerState.ENDED) {
            this.hideLoadingProgress();
            this.updatePlayingIndicator(false);
            this.isPlaying = false;
            this.playNext();
            return;
        }

        if (event.data === YT.PlayerState.PLAYING) {
            this.updateLoadingProgress(100);
            setTimeout(() => this.hideLoadingProgress(), 500);
            this.consecutiveErrors = 0;
            this.isPlaying = true;
            playerDebug('▶️ Música tocando:', this.currentFileName);
            this.updatePlayingIndicator(true);
            this.updateTrackInfo();
            return;
        }

        if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.updatePlayingIndicator(false);
            playerDebug('⏸️ Reprodução pausada.');
            return;
        }

        if (event.data === YT.PlayerState.BUFFERING) {
            this.showLoadingProgress('Carregando música...');
        }
    }

    onPlayerError(event) {
        console.warn('Erro no player do YouTube:', event.data);
        this.hideLoadingProgress();
        this.updatePlayingIndicator(false);
        
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
            this.showPlaybackError('Erro: Não foi possível reproduzir as músicas desta playlist.');
            return;
        }
        
        // Tenta próxima música se houver erro e não excedeu o limite
        if (this.currentPlaylist.length > 1) {
            playerDebug(`Tentativa ${this.consecutiveErrors} de ${this.maxConsecutiveErrors}. Tentando próxima música...`);
            setTimeout(() => this.playNext(), 1000); // Pequeno delay para evitar spam
        }
    }

    setupEventListeners() {
        // Os controles visíveis são gerenciados pelo componente DialRadio.
        // Este método permanece para futuras integrações.
    }

    // Função para carregar playlist de um arquivo específico
    loadPlaylistFromFile(fileName) {
        console.log('🎵 loadPlaylistFromFile chamado com:', fileName);
        const cleanFileName = fileName.replace('.md', '').trim();
        const normalizedKey = this.normalizeFileName(cleanFileName);
        console.log('🔧 cleanFileName:', cleanFileName);
        console.log('🔧 normalizedKey:', normalizedKey);
        
        // Verificar se há dados disponíveis
        if (!window.YOUTUBE_URLS_DATA || Object.keys(window.YOUTUBE_URLS_DATA).length === 0) {
            console.error('❌ YOUTUBE_URLS_DATA está vazio ou não existe');
            // Mensagem de erro removida da UI - apenas log no console
            // this.showAlert('Nenhuma URL do YouTube foi cadastrada. Adicione URLs em youtube-data.js', 'error');
            this.showNoMusicMessage(cleanFileName);
            return;
        }
        
        const playlistEntry = this.findPlaylistEntry(cleanFileName);
        const urls = playlistEntry ? playlistEntry.urls : null;
        
        console.log('📦 playlistEntry encontrado:', !!playlistEntry);
        console.log('📦 URLs encontradas:', urls ? urls.length : 0);
        
        if (playlistEntry) {
            console.log('✅ Playlist encontrada:', playlistEntry.displayName);
            console.log('✅ URLs da playlist:', urls);
        } else {
            console.warn('⚠️ Nenhuma playlist encontrada para:', cleanFileName);
            if (window.YOUTUBE_URLS_DATA) {
                const allKeys = Object.keys(window.YOUTUBE_URLS_DATA);
                console.warn('💡 Total de chaves em YOUTUBE_URLS_DATA:', allKeys.length);
                console.warn('💡 Primeiras 10 chaves:', allKeys.slice(0, 10));
                
                // Tentar encontrar chave similar
                const similar = allKeys.filter(k => {
                    const kLower = k.toLowerCase();
                    const fLower = cleanFileName.toLowerCase();
                    return kLower.includes(fLower.substring(0, 15)) || fLower.includes(kLower.substring(0, 15));
                });
                if (similar.length > 0) {
                    console.warn('💡 Chaves similares encontradas:', similar.slice(0, 3));
                }
            } else {
                console.error('❌ YOUTUBE_URLS_DATA não está definido!');
            }
        }

        let playlistIds = [];
        let displayName = (playlistEntry && playlistEntry.displayName) || cleanFileName;
        let fromCache = false;

        if (urls && urls.length) {
            playlistIds = urls.map(url => this.extractVideoId(url)).filter(id => id);
        } else {
            const cached = this.getCachedPlaylist(normalizedKey);
            if (cached) {
                playlistIds = [...cached.ids];
                displayName = cached.displayName || displayName;
                fromCache = true;
            }
        }

        if (playlistIds.length === 0) {
            console.warn('❌ Nenhuma URL encontrada para:', cleanFileName);
            console.warn('💡 Dicas de debug:');
            console.warn('   - Verifique se o nome corresponde exatamente a uma chave em YOUTUBE_URLS_DATA');
            console.warn('   - Formato esperado: "ANO - TÍTULO" (ex: "1100 - CARMINA BURANA")');
            this.showNoMusicMessage(cleanFileName);
            return;
        }

        // Resetar contador de erros ao carregar nova playlist
        this.consecutiveErrors = 0;
        this.lastErrorTime = 0;

        this.currentPlaylist = playlistIds;
        this.currentTrackIndex = 0;
        this.currentFileName = displayName;
        this.updatePlaylistInfo();

        if (!this.isOnline) {
            this.shouldResumeAfterReconnect = true;
            this.showOfflinePlaybackMessage(displayName);
            return;
        }

        this.shouldResumeAfterReconnect = false;

        if (fromCache) {
            this.showAlert('Usando playlist salva anteriormente. Atualize os links se necessário.', 'info');
            this.scheduleAlertClear(5000);
        } else {
            this.clearAlert();
        }

        this.cachePlaylist(normalizedKey, {
            ids: this.currentPlaylist,
            displayName: this.currentFileName
        });

        this.enableControls();
        this.loadCurrentTrack();
        playerDebug(`Playlist carregada: ${this.currentPlaylist.length} músicas de ${cleanFileName}`);
    }

    getCachedPlaylist(normalizedKey) {
        if (!this.cacheEnabled || !normalizedKey) {
            return null;
        }

        const entry = this.playlistCache[normalizedKey];

        if (!entry || !Array.isArray(entry.ids) || entry.ids.length === 0) {
            return null;
        }

        return entry;
    }

    cachePlaylist(normalizedKey, data) {
        if (
            !this.cacheEnabled ||
            !normalizedKey ||
            !data ||
            !Array.isArray(data.ids) ||
            data.ids.length === 0
        ) {
            return;
        }

        this.playlistCache[normalizedKey] = {
            ids: [...data.ids],
            displayName: data.displayName || '',
            timestamp: Date.now()
        };

        this.persistPlaylistCache();
    }

    extractVideoId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    loadCurrentTrack() {
        console.log('🎬 loadCurrentTrack chamado');
        console.log('🎬 Playlist length:', this.currentPlaylist.length);
        console.log('🎬 Track index:', this.currentTrackIndex);
        console.log('🎬 Online?', this.isOnline);
        console.log('🎬 Player ready?', this.isPlayerReady);
        console.log('🎬 Player exists?', !!this.player);
        
        if (!this.isOnline) {
            console.warn('⚠️ Sem conexão com internet');
            this.showOfflinePlaybackMessage(this.currentFileName || 'Playlist offline');
            return;
        }

        if (this.currentPlaylist.length === 0) {
            console.error('❌ Playlist vazia!');
            console.error('💡 Isso significa que nenhuma URL foi encontrada ou convertida para videoId');
            return;
        }
        
        if (!this.player || !this.isPlayerReady) {
            console.warn('⚠️ Player não está pronto, tentando novamente em 1 segundo...');
            console.warn('⚠️ Player:', !!this.player, '| Ready:', this.isPlayerReady);
            setTimeout(() => this.loadCurrentTrack(), 1000);
            return;
        }
        
        // Verifica se a função loadVideoById existe
        if (!this.player.loadVideoById || typeof this.player.loadVideoById !== 'function') {
            console.error('❌ Função loadVideoById não disponível!');
            console.error('❌ Métodos do player:', Object.keys(this.player).filter(k => typeof this.player[k] === 'function'));
            setTimeout(() => this.loadCurrentTrack(), 1000);
            return;
        }

        // Mostrar barra de progresso
        this.showLoadingProgress('Carregando música...');
        this.simulateLoadingProgress();

        const videoId = this.currentPlaylist[this.currentTrackIndex];
        console.log('🎵 Carregando vídeo ID:', videoId);
        console.log('🎵 Vídeo na posição', this.currentTrackIndex + 1, 'de', this.currentPlaylist.length);

        try {
            if (typeof this.player.stopVideo === 'function') {
                try {
                    this.player.stopVideo();
                    console.log('⏹️ Vídeo anterior parado');
                } catch (stopError) {
                    console.warn('⚠️ Não foi possível parar o vídeo anterior:', stopError);
                }
            }

            console.log('▶️ Chamando loadVideoById com:', videoId);
            this.player.loadVideoById(videoId);
            
            console.log('▶️ Vídeo carregado, tentando reproduzir...');
            if (typeof this.player.playVideo === 'function') {
                // Solicita reprodução imediata após o carregamento
                this.player.playVideo();
                console.log('▶️ playVideo() chamado');
            } else {
                console.error('❌ playVideo não é uma função!');
            }

            this.isPlaying = true;
            this.updateTrackInfo();
            console.log('✅ loadCurrentTrack concluído com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar vídeo:', error);
            console.error('❌ Stack:', error.stack);
            this.hideLoadingProgress();
            setTimeout(() => this.loadCurrentTrack(), 2000);
        }
    }

    play() {
        if (!this.isOnline) {
            this.showOfflinePlaybackMessage(this.currentFileName || 'Playlist offline');
            return;
        }

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
                this.updatePlayingIndicator(false);
                
                // Resetar contador de erros quando parar manualmente
                this.consecutiveErrors = 0;
                this.lastErrorTime = 0;
                this.shouldResumeAfterReconnect = false;
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
        if (!this.currentPlaylist.length) {
            return;
        }

        const total = this.currentPlaylist.length;
        const normalized = this.normalizeFileName(this.currentFileName);
        const displayName = this.youtubeDisplayNames[normalized] || this.currentFileName;
        const message = total > 1
            ? `Reproduzindo ${this.currentTrackIndex + 1}/${total}: ${displayName}`
            : `Reproduzindo: ${displayName}`;

        this.statusContext = 'playing';
        this.showAlert(message, 'info');
        playerDebug(`📊 Track: ${this.currentTrackIndex + 1}/${total} - ${displayName}`);
    }

    updatePlaylistInfo() {
        this.updateTrackInfo();
    }

    // Métodos para controle da barra de progresso
    showLoadingProgress(text = 'Carregando música...') {
        this.statusContext = 'loading';
        this.showAlert(text, 'info');
    }

    hideLoadingProgress() {
        if (this.statusContext === 'loading') {
            this.statusContext = null;
            this.clearAlert();
        }
    }

    updateLoadingProgress() {
        // Mantido para compatibilidade; progresso visual não é exibido.
    }

    simulateLoadingProgress() {
        // Mantido para compatibilidade; progresso visual não é exibido.
    }

    enableControls() {
        if (!this.isOnline) {
            return;
        }

        ['playButton', 'stopButton'].forEach((key) => {
            const button = this.ui[key];
            if (button) {
                button.disabled = false;
            }
        });
    }

    disableControls() {
        ['playButton', 'stopButton'].forEach((key) => {
            const button = this.ui[key];
            if (button) {
                button.disabled = true;
            }
        });
    }

    showNoMusicMessage(fileName) {
        this.disableControls();
        this.currentPlaylist = [];
        this.shouldResumeAfterReconnect = false;
        const musicLabel = fileName ? ` para "${fileName}"` : '';
        
        const message = `Nenhuma URL do YouTube foi cadastrada${musicLabel}.\n\n` +
                       `Para adicionar, edite o arquivo js/youtube-data.js e adicione:\n\n` +
                       `"${fileName}": [\n` +
                       `  "https://www.youtube.com/watch?v=VIDEO_ID"\n` +
                       `]`;
        
        console.warn('⚠️', message);
        console.warn('💡 Abra o arquivo js/youtube-data.js e adicione a URL no formato mostrado acima');
        
        // Mensagem de erro removida da UI - apenas log no console
        // this.showAlert(`Nenhuma URL do YouTube foi cadastrada${musicLabel}. Veja o console para instruções.`, 'warning');
    }

    showPlaybackError(message) {
        const errorMessage = message || 'Erro ao reproduzir esta playlist.';
        this.disableControls();
        this.currentPlaylist = [];
        this.shouldResumeAfterReconnect = false;
        this.updatePlayingIndicator(false);
        console.warn('⚠️ Erro de reprodução:', errorMessage);
        
        // Mensagem de erro removida da UI - apenas log no console
        // this.showAlert(errorMessage, 'error');
    }

    updatePlayingIndicator(isPlaying) {
        const indicator = document.getElementById('playingIndicator');
        if (!indicator) {
            return;
        }

        if (isPlaying) {
            indicator.style.display = 'flex';
            indicator.classList.add('playing');
            playerDebug('🔴 Indicador "TOCANDO" ativado');
        } else {
            indicator.classList.remove('playing');
            // Esconder após um pequeno delay para transição suave
            setTimeout(() => {
                if (!this.isPlaying) {
                    indicator.style.display = 'none';
                }
            }, 300);
            playerDebug('⚫ Indicador "TOCANDO" desativado');
        }
    }

    // Método público para ser chamado pelos cards
    playFromCard(fileName) {
        console.log('🎵 playFromCard chamado com:', fileName);
        console.log('🎵 Player pronto?', this.isPlayerReady);
        console.log('🎵 Player existe?', !!this.player);
        console.log('🎵 Online?', this.isOnline);
        console.log('🎵 YOUTUBE_URLS_DATA disponível?', !!(window.YOUTUBE_URLS_DATA && Object.keys(window.YOUTUBE_URLS_DATA).length > 0));
        
        if (!fileName || typeof fileName !== 'string') {
            console.error('❌ playFromCard recebeu um fileName inválido:', fileName);
            return;
        }
        
        if (!this.isPlayerReady) {
            console.warn('⚠️ Player não está pronto ainda. Aguardando...');
            // Aguardar o player estar pronto
            let attempts = 0;
            const maxAttempts = 20; // 10 segundos (20 * 500ms)
            
            const checkReady = setInterval(() => {
                attempts++;
                if (this.isPlayerReady) {
                    clearInterval(checkReady);
                    console.log('✅ Player agora está pronto, carregando playlist...');
                    this.loadPlaylistFromFile(fileName);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkReady);
                    console.error('❌ Timeout: Player não ficou pronto após 10 segundos');
                    console.error('💡 Tentando carregar playlist mesmo assim...');
                    // Tentar carregar mesmo sem estar pronto - pode funcionar
                    this.loadPlaylistFromFile(fileName);
                }
            }, 500);
            
            return;
        }
        
        console.log('✅ Player está pronto, carregando playlist...');
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
            console.warn('findPlaylistEntry: fileName vazio');
            return null;
        }

        const cleanFileName = fileName.replace('.md', '').trim();
        const fallbackDisplay = cleanFileName;

        playerDebug('🔍 Procurando playlist para:', cleanFileName);

        // 1. Tentar correspondência direta no YOUTUBE_URLS_DATA original (case-insensitive)
        if (window.YOUTUBE_URLS_DATA) {
            const directMatch = Object.keys(window.YOUTUBE_URLS_DATA).find(key => 
                key.toUpperCase().trim() === cleanFileName.toUpperCase().trim()
            );

            if (directMatch) {
                playerDebug('✅ Correspondência direta encontrada:', directMatch);
                // Adicionar ao mapa normalizado se não existir
                const normalized = this.normalizeFileName(directMatch);
                if (!this.youtubeUrls[normalized]) {
                    this.youtubeUrls[normalized] = window.YOUTUBE_URLS_DATA[directMatch];
                    this.youtubeDisplayNames[normalized] = directMatch;
                }
                return {
                    urls: this.youtubeUrls[normalized],
                    displayName: this.youtubeDisplayNames[normalized] || directMatch
                };
            }
        }

        // 2. Tentar normalização e buscar no mapa normalizado
        const normalizedKey = this.normalizeFileName(cleanFileName);
        playerDebug('🔍 Chave normalizada:', normalizedKey);

        if (normalizedKey && this.youtubeUrls[normalizedKey]) {
            playerDebug('✅ Correspondência normalizada encontrada');
            return {
                urls: this.youtubeUrls[normalizedKey],
                displayName: this.youtubeDisplayNames[normalizedKey] || fallbackDisplay
            };
        }

        if (!normalizedKey) {
            console.warn('❌ Não foi possível normalizar o nome');
            return null;
        }

        // 3. Tentar correspondência parcial nas chaves normalizadas
        const partialMatch = Object.keys(this.youtubeUrls).find(key => {
            return key === normalizedKey || 
                   key.includes(normalizedKey) || 
                   normalizedKey.includes(key);
        });

        if (partialMatch) {
            playerDebug('✅ Correspondência parcial normalizada encontrada:', partialMatch);
            return {
                urls: this.youtubeUrls[partialMatch],
                displayName: this.youtubeDisplayNames[partialMatch] || fallbackDisplay
            };
        }

        // 4. Última tentativa: buscar por substring no YOUTUBE_URLS_DATA original
        if (window.YOUTUBE_URLS_DATA) {
            const searchUpper = cleanFileName.toUpperCase();
            // Extrair título (parte após " - ")
            const titlePart = cleanFileName.includes(' - ') 
                ? cleanFileName.split(' - ')[1].toUpperCase().trim()
                : searchUpper;
            
            const substringMatch = Object.keys(window.YOUTUBE_URLS_DATA).find(key => {
                const keyUpper = key.toUpperCase().trim();
                // Verificar correspondência exata do título ou substring
                return keyUpper === searchUpper ||
                       keyUpper.includes(titlePart) || 
                       titlePart.includes(keyUpper.split(' - ')[1] || '');
            });

            if (substringMatch) {
                playerDebug('✅ Correspondência por substring encontrada:', substringMatch);
                // Adicionar ao mapa normalizado
                const normalized = this.normalizeFileName(substringMatch);
                if (!this.youtubeUrls[normalized]) {
                    this.youtubeUrls[normalized] = window.YOUTUBE_URLS_DATA[substringMatch];
                    this.youtubeDisplayNames[normalized] = substringMatch;
                }
                return {
                    urls: this.youtubeUrls[normalized],
                    displayName: this.youtubeDisplayNames[normalized] || substringMatch
                };
            }
        }

        console.warn('❌ Nenhuma correspondência encontrada para:', cleanFileName);
        if (window.YOUTUBE_URLS_DATA) {
            playerDebug('📋 Exemplos de chaves disponíveis:', Object.keys(window.YOUTUBE_URLS_DATA).slice(0, 10));
        }
        return null;
    }
}

// Inicializa o player quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.youtubePlayer = new YouTubePlayer();
});
