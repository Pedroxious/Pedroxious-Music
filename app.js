/* ===== Apple-grade Carousel Controller (Momento, Inércia e Prevenção de Clique Acidental) ===== */

function makeAppleCarousel(el, btnLeft, btnRight) {
    if (!el) return;

    let isPointerDown = false;
    let isDragging = false;
    let startX = 0;
    let startScroll = 0;
    let history = []; // Array de { x, time } para calcular velocidade
    let animId = null;
    let ignoreClickUntil = 0;

    // Cancela qualquer inércia ativa
    function stopInertia() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    // Aplica desaceleração suave estilo Apple (iOS / macOS Safari)
    function startInertia(initialVelocity) {
        stopInertia();
        let velocity = initialVelocity;
        const friction = 0.94; // Coeficiente de atrito contínuo
        const minVelocity = 0.2;

        function step() {
            if (Math.abs(velocity) < minVelocity) {
                stopInertia();
                return;
            }

            const maxScroll = el.scrollWidth - el.clientWidth;
            el.scrollLeft += velocity;
            velocity *= friction;

            // Se atingir as bordas, encerra a animação
            if (el.scrollLeft <= 0 || el.scrollLeft >= maxScroll) {
                stopInertia();
                return;
            }

            animId = requestAnimationFrame(step);
        }
        animId = requestAnimationFrame(step);
    }

    // Pressionar o cursor
    el.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Apenas botão principal
        const rect = el.getBoundingClientRect();
        // Não intercepta se o usuário clicou na área da scrollbar nativa na borda inferior
        if (e.clientY >= rect.top + el.clientHeight) return;

        stopInertia();
        isPointerDown = true;
        isDragging = false;
        startX = e.clientX;
        startScroll = el.scrollLeft;
        history = [{ x: e.clientX, time: performance.now() }];
    });

    // Mover o cursor
    window.addEventListener('mousemove', (e) => {
        if (!isPointerDown) return;

        const delta = startX - e.clientX;
        const now = performance.now();

        // Se mover mais de 5px, entra no modo de arrasto
        if (!isDragging && Math.abs(delta) > 5) {
            isDragging = true;
            el.classList.add('is-dragging');
        }

        if (isDragging) {
            e.preventDefault();
            const maxScroll = el.scrollWidth - el.clientWidth;
            el.scrollLeft = Math.max(0, Math.min(maxScroll, startScroll + delta));

            history.push({ x: e.clientX, time: now });
            // Guarda apenas os últimos 100ms para precisão de flick
            while (history.length > 1 && now - history[0].time > 100) {
                history.shift();
            }
        }
    });

    // Soltar o cursor
    window.addEventListener('mouseup', () => {
        if (!isPointerDown) return;
        isPointerDown = false;
        el.classList.remove('is-dragging');

        if (isDragging) {
            // Janela de proteção de 180ms para impedir qualquer clique acidental pós-arrasto
            ignoreClickUntil = performance.now() + 180;

            const now = performance.now();
            if (history.length >= 2) {
                const oldest = history[0];
                const newest = history[history.length - 1];
                const dt = newest.time - oldest.time;
                if (dt > 10) {
                    const dx = oldest.x - newest.x;
                    const v = (dx / dt) * 16; // Converte para pixels por frame
                    if (Math.abs(v) > 1.2) {
                        startInertia(v);
                    }
                }
            }
            isDragging = false;
        }
    });

    // Bloqueia qualquer clique durante ou imediatamente após arrastar (fase de captura)
    el.addEventListener('click', (e) => {
        if (isDragging || performance.now() < ignoreClickUntil) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // Rolagem com roda do mouse (wheel) fluida com inércia
    el.addEventListener('wheel', (e) => {
        e.preventDefault();
        stopInertia();
        const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 1.35;
        startInertia(delta * 0.4);
    }, { passive: false });

    // Botões de navegação lateral (setas)
    if (btnLeft) {
        btnLeft.addEventListener('click', (e) => {
            e.stopPropagation();
            stopInertia();
            el.scrollBy({ left: -360, behavior: 'smooth' });
        });
    }
    if (btnRight) {
        btnRight.addEventListener('click', (e) => {
            e.stopPropagation();
            stopInertia();
            el.scrollBy({ left: 360, behavior: 'smooth' });
        });
    }
}

// Inicialização dos carrosséis
let pop_song_left = document.getElementById('pop_song_left');
let pop_song_right = document.getElementById('pop_song_right');
let pop_song = document.getElementsByClassName('pop_song')[0];

let btn_left = pop_song_left ? (pop_song_left.closest('svg') || pop_song_left) : null;
let btn_right = pop_song_right ? (pop_song_right.closest('svg') || pop_song_right) : null;

makeAppleCarousel(pop_song, btn_left, btn_right);

let pop_art_left = document.getElementById('pop_art_left');
let pop_art_right = document.getElementById('pop_art_right');
let pop_art = document.getElementsByClassName('pop_song')[1];

let btn_art_left = pop_art_left ? (pop_art_left.closest('svg') || pop_art_left) : null;
let btn_art_right = pop_art_right ? (pop_art_right.closest('svg') || pop_art_right) : null;

makeAppleCarousel(pop_art, btn_art_left, btn_art_right);

/* ===== Base de Músicas do Sistema ===== */

const songs = [
    { id: 1, name: 'Final Lap', subtitle: 'Pedro Azevedo', poster: 'img/FinalLap.jpg', file: 'Music/FinalLap.mp3', album: 'Prime Tracks EP', dateAdded: 'Aug 30, 2026', duration: '3:42' },
    { id: 2, name: 'Signal', subtitle: 'Pedro Azevedo', poster: 'img/Signal.jpg', file: 'Music/Signal.mp3', album: 'Phronesis', dateAdded: 'Aug 16, 2026', duration: '2:57' },
    { id: 3, name: 'Tempest', subtitle: 'Pedro Azevedo', poster: 'img/Tempest.png', file: 'Music/Tempest.mp3', album: 'Tempest EP', dateAdded: 'Jun 28, 2026', duration: '3:59' },
    { id: 4, name: 'Cavaquinho', subtitle: 'Pedro Azevedo', poster: 'img/Cavaquinho.jpg', file: 'Music/Cavaquinho.mp3', album: 'Brasileirinho', dateAdded: 'Jun 25, 2026', duration: '3:52' },
    { id: 5, name: 'Brisa do Mar', subtitle: 'Pedro Azevedo', poster: 'img/BrisaDoMar.jpg', file: 'Music/BrisaDoMar.mp3', album: 'Serenata', dateAdded: 'Jun 23, 2026', duration: '3:58' },
    { id: 6, name: 'Areias do Destino', subtitle: 'Pedro Azevedo', poster: 'img/AreiasdoDestino.png', file: 'Music/AreiasdoDestino.mp3', album: 'Destinos', dateAdded: 'Jun 23, 2026', duration: '4:30' },
    { id: 7, name: 'Golden Hour', subtitle: 'Pedro Azevedo', poster: 'img/GoldenHour.jpg', file: 'Music/GoldenHour.mp3', album: 'Phronesis', dateAdded: 'Jun 15, 2026', duration: '3:15' },
    { id: 8, name: 'Amber Skies', subtitle: 'Pedro Azevedo', poster: 'img/CoralSkies.jpg', file: 'Music/Amber Skies.mp3', album: 'Coral Skies', dateAdded: 'Jun 10, 2026', duration: '3:24' },
    { id: 9, name: 'Selva de Concreto', subtitle: 'Pedro Azevedo', poster: 'img/SelvaDeConcreto.jpg', file: 'Music/SelvaDeConcreto.mp3', album: 'Urban Vibes', dateAdded: 'May 29, 2026', duration: '4:05' },
    { id: 10, name: '808s', subtitle: 'Pedro Azevedo', poster: 'img/808s.jpg', file: 'Music/808s.mp3', album: 'Night Bass', dateAdded: 'May 22, 2026', duration: '2:48' },
    { id: 11, name: 'Uma Última Flor', subtitle: 'Pedro Azevedo', poster: 'img/UmaUltimaFlor.jpg', file: 'Music/Uma Última Flor.mp3', album: 'Saudade', dateAdded: 'May 14, 2026', duration: '3:35' },
    { id: 12, name: 'A Gente Se Fala', subtitle: 'Pedro Azevedo', poster: 'img/A Gente Se Fala.png', file: 'Music/A Gente Se Fala.mp3', album: 'Diálogos', dateAdded: 'May 08, 2026', duration: '3:12' },
    { id: 13, name: 'Barquinhos de Papel', subtitle: 'Pedro Azevedo', poster: 'img/Barquinhos de Papel.jpg', file: 'Music/Barquinhos de Papel.mp3', album: 'Navegações', dateAdded: 'Apr 25, 2026', duration: '3:44' },
    { id: 14, name: 'Xote do Fole', subtitle: 'Pedro Azevedo', poster: 'img/XoteDoFole.jpg', file: 'Music/XoteDoFole.mp3', album: 'Nordeste Vivo', dateAdded: 'Apr 18, 2026', duration: '2:55' },
    { id: 15, name: 'Conta Pendurada', subtitle: 'Pedro Azevedo', poster: 'img/ContaPendurada.jpg', file: 'Music/Conta Pendurada.mp3', album: 'Boemia', dateAdded: 'Apr 10, 2026', duration: '3:20' },
    { id: 16, name: 'Classic', subtitle: 'Pedro Azevedo', poster: 'img/Bloco7.jpg', file: 'Music/Classic.mp3', album: 'Bloco 7', dateAdded: 'Mar 30, 2026', duration: '3:50' },
    { id: 17, name: 'Neon Boulevard', subtitle: 'Pedro Azevedo', poster: 'img/NeonBoulevard.jpg', file: 'Music/NeonBoulevard.mp3', album: 'Synthetica', dateAdded: 'Mar 22, 2026', duration: '4:12' },
    { id: 18, name: 'Mirage', subtitle: 'Pedro Azevedo', poster: 'img/Mirage.jpg', file: 'Music/Mirage.mp3', album: 'Oásis', dateAdded: 'Mar 15, 2026', duration: '3:38' },
    { id: 19, name: 'Born for the Night', subtitle: 'Pedro Azevedo', poster: 'img/BornForTheNight.jpg', file: 'Music/Born for the Night.mp3', album: 'Midnight Dreams', dateAdded: 'Feb 28, 2026', duration: '3:45' },
    { id: 20, name: 'Silence', subtitle: 'Pedro Azevedo', poster: 'img/Silence.jpg', file: 'Music/silence.mp3', album: 'Quiet Storm', dateAdded: 'Feb 14, 2026', duration: '3:10' }
];

/* ===== Resolução de Álbuns e Fila de Reprodução Sequencial ===== */

let playbackQueue = [];
let queueCurrentIndex = -1;
let isQueueActive = false;
let queueAlbumName = '';

function getAlbumForSong(song) {
    if (!song) return null;
    const albumName = song.album || song.name || 'Álbum Desconhecido';
    let albumSongs = songs.filter(s => s.album && s.album.toLowerCase() === albumName.toLowerCase());
    if (albumSongs.length === 0) albumSongs = [song];
    return {
        name: albumName,
        poster: song.poster || (albumSongs[0] ? albumSongs[0].poster : 'img/psa.jpg'),
        artist: song.subtitle || 'Pedro Azevedo',
        songs: albumSongs
    };
}

function getAlbumByName(name) {
    if (!name) return null;
    const clean = name.trim().toLowerCase();
    const albumSongs = songs.filter(s => s.album && s.album.toLowerCase() === clean);
    if (albumSongs.length > 0) {
        return {
            name: albumSongs[0].album,
            poster: albumSongs[0].poster,
            artist: albumSongs[0].subtitle || 'Pedro Azevedo',
            songs: albumSongs
        };
    }
    const matchedSong = songs.find(s => s.name.toLowerCase() === clean);
    if (matchedSong) {
        return getAlbumForSong(matchedSong);
    }

    let domPoster = 'img/psa.jpg';
    let domArtist = 'Pedro Azevedo';
    try {
        const domCard = document.querySelector(`li[data-name="${name.trim()}" i]`);
        if (domCard) {
            domPoster = domCard.dataset.poster || domCard.querySelector('img')?.getAttribute('src') || domPoster;
            domArtist = domCard.dataset.subtitle || domCard.querySelector('.subtitle')?.textContent?.trim() || domArtist;
        }
    } catch (e) {}

    return {
        name: name.trim(),
        poster: domPoster,
        artist: domArtist,
        songs: []
    };
}

function addAlbumToQueue(albumSongs, albumName = 'Álbum', autoPlay = true) {
    if (!albumSongs || albumSongs.length === 0) return;
    playbackQueue = [...albumSongs];
    queueCurrentIndex = 0;
    isQueueActive = true;
    queueAlbumName = albumName;

    const firstSong = playbackQueue[0];
    const globalIdx = songs.findIndex(s => s.id === firstSong.id || s.file === firstSong.file);
    if (globalIdx !== -1) {
        setSong(globalIdx, autoPlay);
    }
    showToast(`Álbum "${albumName}" (${albumSongs.length} faixas) adicionado à fila sequencial!`);
}

/* ===== Elementos do Player Footer ===== */

const music = new Audio();
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRadioStreaming = false;
let activeRadioStation = null;
let radioStationsData = [];

const playPauseBtn = document.getElementById('play_pause_btn');
const playIcon = document.getElementById('play_icon');
const pauseIcon = document.getElementById('pause_icon');
const wave = document.querySelector('.master_play .wave');
const posterMasterPlay = document.getElementById('poster_master_play');
const titleMasterPlay = document.getElementById('title');
const currentStart = document.getElementById('currentStart');
const currentEnd = document.getElementById('currentEnd');
const seek = document.getElementById('seek');
const bar2 = document.getElementById('bar2');
const dot = document.querySelector('.master_play .dot');
const vol = document.getElementById('vol');
const volIconBtn = document.getElementById('vol_icon_btn');
const shuffleBtn = document.getElementById('shuffle_btn');
const prevBtn = document.getElementById('prev_btn');
const nextBtn = document.getElementById('next_btn');
const heartBtn = document.getElementById('heart_btn');
const heartBtnFilled = document.getElementById('heart_btn_filled');
const downloadBtn = document.getElementById('download_music');
const heroPlayBtn = document.getElementById('hero_play_btn');

const allPlaylistBtn = document.getElementById('all_playlist_btn');
const favPlaylistBtn = document.getElementById('fav_playlist_btn');
const playlistNavItems = document.querySelectorAll('.menu_side .playlist h4');
const sidebarSongList = document.querySelector('.menu_side .menu_song');
const sidebarSongItems = document.querySelectorAll('.menu_side .menu_song li.songItem');
const horizontalSongItems = document.querySelectorAll('.popular_song .pop_song li, .popular_artists .pop_song li');

/* ===== Sistema de Cookies e LocalStorage para Músicas Favoritas ===== */

function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, days = 365) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

function loadFavorites() {
    try {
        let stored = localStorage.getItem('favoriteSongs');
        if (!stored) {
            stored = getCookie('favoriteSongs');
        }
        if (stored) {
            let parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return [1, 3, 5, 17];
    } catch (e) {
        return [1, 3, 5, 17];
    }
}

function saveFavorites(favs) {
    let json = JSON.stringify(favs);
    try {
        localStorage.setItem('favoriteSongs', json);
    } catch (e) {}
    setCookie('favoriteSongs', json);
}

let favorites = loadFavorites();

/* ===== Controle de Reprodução de Áudio ===== */

function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    let min = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${min}:${s < 10 ? '0' : ''}${s}`;
}

function updateHeartUI() {
    let currentSongId = (currentIndex >= 0 && songs[currentIndex]) ? songs[currentIndex].id : null;
    let isFav = Boolean(currentSongId && favorites.includes(currentSongId));

    if (heartBtn && heartBtnFilled) {
        if (isFav) {
            heartBtn.style.display = 'none';
            heartBtnFilled.style.display = 'inline-block';
        } else {
            heartBtn.style.display = 'inline-block';
            heartBtnFilled.style.display = 'none';
        }
    }

    if (typeof updateRightHeartUI === 'function') {
        updateRightHeartUI();
    }
    if (typeof updateLikedSongsCount === 'function') {
        updateLikedSongsCount();
    }
}

/* Sincronização Perfeita de Seleção: Menu Esquerdo, Lado Direito e Tabela da Biblioteca */
function syncActiveState() {
    if (currentIndex < 0 || currentIndex >= songs.length) {
        sidebarSongItems.forEach((li) => li.classList.remove('active'));
        horizontalSongItems.forEach((card) => card.classList.remove('active'));
        updateAlbumPlayIcons();
        if (typeof updateLibraryTableUI === 'function') updateLibraryTableUI();
        return;
    }

    const currentSong = songs[currentIndex];
    if (!currentSong) return;

    const normName = currentSong.name.toLowerCase().trim();
    const normFile = currentSong.file.toLowerCase().trim();

    // 1. Sincroniza o menu lateral esquerdo
    sidebarSongItems.forEach((li, idx) => {
        const liH5 = li.querySelector('h5');
        const textSpan = li.querySelector('.song_title_text');
        const liName = (li.dataset.name || (textSpan ? textSpan.textContent : (liH5 && liH5.childNodes[0] ? liH5.childNodes[0].nodeValue : (liH5 ? liH5.textContent : '')))).toLowerCase().trim();
        const liFile = (li.dataset.file || '').toLowerCase().trim();
        
        // Só ativa se o arquivo não estiver vazio E coincidir com o da música atual E o nome for igual
        const isMatch = Boolean(liFile) && (liFile === normFile) && (liName === normName);

        if (isMatch) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });

    // 2. Sincroniza os carrosséis da direita (Popular Song e Popular Artists)
    horizontalSongItems.forEach((card) => {
        const cardH5 = card.querySelector('h5');
        const cardSpan = card.querySelector('.song_title_text');
        const cardName = (card.dataset.name || (cardSpan ? cardSpan.textContent : (cardH5 && cardH5.childNodes[0] ? cardH5.childNodes[0].nodeValue : (cardH5 ? cardH5.textContent : '')))).toLowerCase().trim();
        const cardFile = (card.dataset.file || '').toLowerCase().trim();

        // Só ativa se o arquivo não estiver vazio E coincidir rigorosamente com a faixa em reprodução
        const isMatch = Boolean(cardFile) && (cardFile === normFile) && (cardName === normName);

        if (isMatch) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    updateAlbumPlayIcons();
    if (typeof updateLibraryTableUI === 'function') updateLibraryTableUI();
}

/* Alternância interativa dos botões de reprodução dos álbuns (Play vs Pause barras estilo Spotify) */
function updateAlbumPlayIcons() {
    const playIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="play_icon" viewBox="0 0 16 16">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
        </svg>
    `;
    const pauseIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="pause_icon" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
        </svg>
    `;

    horizontalSongItems.forEach((card) => {
        const btn = card.querySelector('.album_play_btn');
        if (!btn) return;
        const isActiveAndPlaying = card.classList.contains('active') && isPlaying && !isRadioStreaming;
        btn.innerHTML = isActiveAndPlaying ? pauseIconSvg : playIconSvg;
        btn.setAttribute('title', isActiveAndPlaying ? 'Pausar' : 'Reproduzir');
    });
}

function setSong(index, shouldPlay = true) {
    if (index < 0 || index >= songs.length) return;
    isRadioStreaming = false;
    activeRadioStation = null;
    if (typeof updateRadioStationCards === 'function') updateRadioStationCards();

    // Se estiver em modo rádio, volta para a tela inicial ao tocar uma música
    if (songSideContainer && songSideContainer.classList.contains('radio_mode')) {
        returnToHomeView();
    }

    currentIndex = index;
    const song = songs[currentIndex];

    music.src = song.file;
    if (posterMasterPlay) posterMasterPlay.src = song.poster;
    if (titleMasterPlay) {
        titleMasterPlay.innerHTML = `<div class="song_title_wrap" title="${song.name}"><span class="song_title_text">${song.name}</span></div><div class="subtitle">${song.subtitle}</div>`;
        if (typeof updateMarqueeForElement === 'function') {
            updateMarqueeForElement(titleMasterPlay);
            const newWrap = titleMasterPlay.querySelector('.song_title_wrap');
            const newTextEl = titleMasterPlay.querySelector('.song_title_text');
            if (newWrap && newTextEl && typeof attachMarqueeHoverEvents === 'function') {
                attachMarqueeHoverEvents(titleMasterPlay, newWrap, newTextEl);
            }
        }
    }

    // Reset progress
    seek.value = 0;
    bar2.style.width = '0%';
    dot.style.left = '0%';
    currentStart.textContent = '0:00';

    updateHeartUI();
    syncActiveState();

    if (typeof updateRightSidebarSong === 'function') {
        updateRightSidebarSong(song);
    }

    // Abre automaticamente por padrão ao tocar/abrir música, a menos que o usuário tenha desativado
    if (shouldPlay && !userDisabledRightSidebar && typeof openRightSidebar === 'function') {
        openRightSidebar();
    }

    if (shouldPlay) {
        playMusic();
    } else {
        pauseMusic();
    }
}

function playMusic() {
    music.play().then(() => {
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
        if (wave) wave.classList.add('active1');
        syncActiveState();
        if (typeof updateRadioStationCards === 'function') updateRadioStationCards();
    }).catch(err => {
        console.warn('Reprodução iniciada após interação:', err);
    });
}

function pauseMusic() {
    music.pause();
    isPlaying = false;
    playIcon.style.display = 'inline-block';
    pauseIcon.style.display = 'none';
    if (wave) wave.classList.remove('active1');
    updateAlbumPlayIcons();
    if (typeof updateLibraryTableUI === 'function') updateLibraryTableUI();
    if (typeof updateRadioStationCards === 'function') updateRadioStationCards();
}

function togglePlay() {
    if (currentIndex === -1 || !music.src) {
        setSong(0, true);
        return;
    }
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

playPauseBtn.addEventListener('click', togglePlay);

// Botão de Play exclusivo de "Pedro Azevedo - Phronesis in its Prime" (Totalmente independente das demais músicas)
if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
        showToast('🎵 Faixa "Phronesis in its Prime" será lançada em breve!');
    });
}

/* ===== Avançar e Voltar Música ===== */

function playNextSong() {
    if (isRadioStreaming && radioStationsData && radioStationsData.length > 0) {
        let curIdx = radioStationsData.findIndex(s => activeRadioStation && (s.stationuuid === activeRadioStation.stationuuid || s.name === activeRadioStation.name));
        let nextIdx = (curIdx + 1) % radioStationsData.length;
        playRadioStation(radioStationsData[nextIdx]);
        return;
    }

    // Modo Fila de Reprodução Sequencial do Álbum
    if (isQueueActive && playbackQueue.length > 0) {
        if (queueCurrentIndex + 1 < playbackQueue.length) {
            queueCurrentIndex++;
            const nextSong = playbackQueue[queueCurrentIndex];
            const gIdx = songs.findIndex(s => s.id === nextSong.id || s.file === nextSong.file);
            if (gIdx !== -1) {
                setSong(gIdx, true);
                return;
            }
        } else {
            // Chegou ao fim do álbum da fila: para a reprodução sequencial
            isQueueActive = false;
            playbackQueue = [];
            queueCurrentIndex = -1;
            pauseMusic();
            showToast(`Fim da reprodução sequencial do álbum "${queueAlbumName}".`);
            return;
        }
    }

    if (currentIndex === -1) {
        setSong(0, true);
        return;
    }
    if (isShuffle) {
        let nextIndex;
        if (songs.length > 1) {
            do {
                nextIndex = Math.floor(Math.random() * songs.length);
            } while (nextIndex === currentIndex);
        } else {
            nextIndex = 0;
        }
        setSong(nextIndex, true);
    } else {
        let nextIndex = (currentIndex + 1) % songs.length;
        setSong(nextIndex, true);
    }
}

function playPrevSong() {
    if (isRadioStreaming && radioStationsData && radioStationsData.length > 0) {
        let curIdx = radioStationsData.findIndex(s => activeRadioStation && (s.stationuuid === activeRadioStation.stationuuid || s.name === activeRadioStation.name));
        let prevIdx = (curIdx - 1 + radioStationsData.length) % radioStationsData.length;
        playRadioStation(radioStationsData[prevIdx]);
        return;
    }
    if (music.currentTime > 3) {
        music.currentTime = 0;
        return;
    }

    // Modo Fila de Reprodução Sequencial do Álbum
    if (isQueueActive && playbackQueue.length > 0) {
        if (queueCurrentIndex > 0) {
            queueCurrentIndex--;
            const prevSong = playbackQueue[queueCurrentIndex];
            const gIdx = songs.findIndex(s => s.id === prevSong.id || s.file === prevSong.file);
            if (gIdx !== -1) {
                setSong(gIdx, true);
                return;
            }
        } else {
            music.currentTime = 0;
            return;
        }
    }

    if (currentIndex === -1) {
        setSong(0, true);
        return;
    }
    let prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setSong(prevIndex, true);
}

nextBtn.addEventListener('click', playNextSong);
prevBtn.addEventListener('click', playPrevSong);

/* Transição automática para a próxima música ao fim */
music.addEventListener('ended', () => {
    playNextSong();
});

/* ===== Shuffle (Embaralhar) ===== */

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    if (isShuffle) {
        shuffleBtn.classList.add('active');
    } else {
        shuffleBtn.classList.remove('active');
    }
});

/* ===== Barra de Progresso e Tempo ===== */

music.addEventListener('timeupdate', () => {
    if (isRadioStreaming) {
        currentStart.textContent = 'AO VIVO';
        currentEnd.textContent = (activeRadioStation && activeRadioStation.bitrate) ? `${activeRadioStation.bitrate} kbps` : 'LIVE';
        bar2.style.width = '100%';
        dot.style.left = '100%';
        return;
    }
    let curr = music.currentTime;
    let dur = music.duration;

    currentStart.textContent = formatTime(curr);

    if (!isNaN(dur) && dur > 0) {
        currentEnd.textContent = formatTime(dur);
        let progress = (curr / dur) * 100;
        seek.value = progress;
        bar2.style.width = `${progress}%`;
        dot.style.left = `${progress}%`;
    }
});

music.addEventListener('loadedmetadata', () => {
    if (!isNaN(music.duration) && music.duration > 0) {
        currentEnd.textContent = formatTime(music.duration);
    }
});

seek.addEventListener('input', () => {
    if (isRadioStreaming) return; // Streams ao vivo não possuem seek
    if (!isNaN(music.duration) && music.duration > 0) {
        music.currentTime = (seek.value * music.duration) / 100;
        bar2.style.width = `${seek.value}%`;
        dot.style.left = `${seek.value}%`;
    }
});

/* ===== Controle de Volume ===== */

let lastVolume = 70;
music.volume = (parseInt(vol.value) || 70) / 100;

function updateVolIcon(val) {
    if (val === 0) {
        volIconBtn.innerHTML = `<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>`;
    } else if (val < 50) {
        volIconBtn.innerHTML = `<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zm3.025 4a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z"/>`;
    } else {
        volIconBtn.innerHTML = `<path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>`;
    }
}

vol.addEventListener('input', () => {
    let val = parseInt(vol.value);
    music.volume = val / 100;
    if (val > 0) lastVolume = val;
    updateVolIcon(val);
});

volIconBtn.addEventListener('click', () => {
    if (music.volume > 0) {
        lastVolume = parseInt(vol.value) || 70;
        vol.value = 0;
        music.volume = 0;
        updateVolIcon(0);
    } else {
        let restoreVal = lastVolume || 70;
        vol.value = restoreVal;
        music.volume = restoreVal / 100;
        updateVolIcon(restoreVal);
    }
});

/* ===== Botão de Download ===== */

if (downloadBtn) {
    let dlWrapper = downloadBtn.closest('svg') || downloadBtn;
    dlWrapper.addEventListener('click', () => {
        if (currentIndex < 0 || !songs[currentIndex]) {
            showToast('Selecione uma faixa para baixar');
            return;
        }
        let cur = songs[currentIndex];
        let a = document.createElement('a');
        a.href = cur.file;
        a.download = `${cur.name}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

/* ===== Sistema de Favoritos e Playlist Pre-definida ===== */

function toggleFavorite(targetSongId = null) {
    if (typeof targetSongId !== 'number' && typeof targetSongId !== 'string') {
        targetSongId = null;
    }
    let currentSongId = (targetSongId !== null) 
        ? parseInt(targetSongId) 
        : ((currentIndex >= 0 && songs[currentIndex]) ? songs[currentIndex].id : null);

    if (!currentSongId) {
        showToast('Selecione uma faixa para curtir');
        return;
    }

    const curSong = songs.find(s => s.id === currentSongId);
    let pos = favorites.indexOf(currentSongId);

    if (pos > -1) {
        favorites.splice(pos, 1);
        showToast(`"${curSong ? curSong.name : 'Música'}" removida das Músicas Curtidas.`);
    } else {
        favorites.push(currentSongId);
        showToast(`"${curSong ? curSong.name : 'Música'}" salva em Músicas Curtidas!`);
    }

    saveFavorites(favorites);
    updateHeartUI();
    if (typeof updateLibraryTableUI === 'function') updateLibraryTableUI();
    if (typeof updateLikedSongsCount === 'function') updateLikedSongsCount();
    if (typeof renderArtistTracksTable === 'function' && artistPageView && artistPageView.style.display === 'flex') {
        renderArtistTracksTable();
    }

    if (favPlaylistBtn && favPlaylistBtn.classList.contains('active')) {
        renderFavoritesView();
    }
}

if (heartBtn) {
    heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite();
    });
}
if (heartBtnFilled) {
    heartBtnFilled.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite();
    });
}

function renderFavoritesView() {
    let visibleCount = 0;
    sidebarSongItems.forEach((li, idx) => {
        let songId = songs[idx].id;
        if (favorites.includes(songId)) {
            li.style.display = 'flex';
            visibleCount++;
        } else {
            li.style.display = 'none';
        }
    });

    let existingMsg = sidebarSongList.querySelector('.no_favs_msg');
    if (visibleCount === 0) {
        if (!existingMsg) {
            let msg = document.createElement('div');
            msg.className = 'no_favs_msg';
            msg.style.padding = '30px 20px';
            msg.style.fontSize = '12px';
            msg.style.color = '#6b7080';
            msg.style.textAlign = 'center';
            msg.style.lineHeight = '18px';
            msg.innerHTML = 'Nenhuma música favorita ainda.<br>Clique no <span style="color:#36e2ec;">ícone de coração</span> para adicionar!';
            sidebarSongList.appendChild(msg);
        }
    } else if (existingMsg) {
        existingMsg.remove();
    }
}

function restoreAllSongsView() {
    sidebarSongItems.forEach((li) => {
        li.style.display = 'flex';
    });
    let existingMsg = sidebarSongList.querySelector('.no_favs_msg');
    if (existingMsg) existingMsg.remove();
}

playlistNavItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
        playlistNavItems.forEach(el => el.classList.remove('active'));
        navItem.classList.add('active');

        if (navItem === favPlaylistBtn) {
            renderFavoritesView();
        } else {
            restoreAllSongsView();
        }
    });
});

/* ===== Sistema Inteligente de Clique e Duplo Clique nas Músicas ===== */

let lastSongClickIndex = -1;
let lastSongClickTime = 0;
const DBL_CLICK_THRESHOLD = 450; // Janela de 450ms para detecção de duplo clique

function handleSongClick(targetIndex, e) {
    if (targetIndex < 0 || targetIndex >= songs.length) return;

    const now = performance.now();
    const isSameSong = (targetIndex === currentIndex);

    if (isSameSong) {
        const isDoubleClick = (lastSongClickIndex === targetIndex && (now - lastSongClickTime) < DBL_CLICK_THRESHOLD);
        lastSongClickTime = now;
        lastSongClickIndex = targetIndex;

        if (isDoubleClick) {
            // DOIS CLIQUES SEGUIDOS NA MESMA MÚSICA: Reinicia do zero e reproduz
            music.currentTime = 0;
            seek.value = 0;
            bar2.style.width = '0%';
            dot.style.left = '0%';
            currentStart.textContent = '0:00';
            playMusic();
            lastSongClickTime = 0;
            lastSongClickIndex = -1;
            return;
        }

        // APENAS UM CLIQUE NA MESMA MÚSICA:
        // Se o clique foi especificamente no botão de play flutuante do álbum, alterna play/pause
        if (e && e.target && e.target.closest('.album_play_btn')) {
            togglePlay();
            return;
        }

        // Se a música já estiver tocando: NÃO pausa e NÃO reinicia ao clicar no corpo do card. Continua de onde está!
        // Se a música estiver pausada: retoma a reprodução de onde parou.
        if (songSideContainer && songSideContainer.classList.contains('radio_mode')) {
            returnToHomeView();
        }
        if (!isPlaying) {
            playMusic();
        }
        return;
    }

    // CLIQUE EM OUTRA MÚSICA: Toca a nova faixa selecionada desde o início
    lastSongClickTime = now;
    lastSongClickIndex = targetIndex;
    setSong(targetIndex, true);
}

// Cliques nas músicas do menu lateral
sidebarSongItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
        const file = (item.dataset.file || '').trim();
        if (!file) {
            console.log('Álbum vazio/mudo.');
            return;
        }
        let foundIdx = songs.findIndex(s => s.file.toLowerCase() === file.toLowerCase());
        if (foundIdx > -1) {
            handleSongClick(foundIdx, e);
        }
    });
});

// Cliques nas músicas das listas horizontais (Popular Song e Popular Artists)
horizontalSongItems.forEach((item) => {
    item.addEventListener('click', (e) => {
        const file = (item.dataset.file || '').trim();
        const itemH5 = item.querySelector('h5');
        const textSpan = item.querySelector('.song_title_text');
        const name = (item.dataset.name || (textSpan ? textSpan.textContent : (itemH5 && itemH5.childNodes[0] ? itemH5.childNodes[0].nodeValue : (itemH5 ? itemH5.textContent : '')))).trim();

        // Álbum vazio/mudo: não toca e não seleciona outra música
        if (!file) {
            console.log(`Álbum "${name}" ainda não possui música correspondente.`);
            return;
        }

        let foundIdx = songs.findIndex(s => s.file.toLowerCase() === file.toLowerCase());
        if (foundIdx === -1) {
            foundIdx = songs.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
        }

        if (foundIdx > -1) {
            handleSongClick(foundIdx, e);
        }
    });
});

// Suporte para capa e título na sidebar lateral direita e no footer player
const rightAlbumBox = document.querySelector('.right_side .album_cover_box');
const rightSongBox = document.querySelector('.right_side .song_text');
if (rightAlbumBox) {
    rightAlbumBox.addEventListener('click', (e) => {
        if (currentIndex >= 0) handleSongClick(currentIndex, e);
    });
    rightAlbumBox.style.cursor = 'pointer';
}
if (rightSongBox) {
    rightSongBox.addEventListener('click', (e) => {
        if (currentIndex >= 0) handleSongClick(currentIndex, e);
    });
    rightSongBox.style.cursor = 'pointer';
}

if (posterMasterPlay) {
    posterMasterPlay.addEventListener('click', (e) => {
        if (currentIndex >= 0) handleSongClick(currentIndex, e);
    });
    posterMasterPlay.style.cursor = 'pointer';
}
if (titleMasterPlay) {
    titleMasterPlay.addEventListener('click', (e) => {
        if (currentIndex >= 0) handleSongClick(currentIndex, e);
    });
    titleMasterPlay.style.cursor = 'pointer';
}

/* ===== Manutenção da Seleção ao Clicar Fora ===== */

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu_side .menu_song li, .pop_song li, .master_play, .playlist, .content .buttons, .right_side, #sidebar_toggle_btn')) {
        // Ao clicar fora, preserva a música que está em reprodução destacada em ambos os lados
        syncActiveState();
    }
});



/* ===== Saudação Dinâmica ===== */

let dateElement = document.querySelector('.data');
if (dateElement) {
    let currentTime = new Date().getHours();
    if (currentTime >= 0 && currentTime < 12) {
        dateElement.textContent = "Good morning!";
    } else if (currentTime >= 12 && currentTime < 18) {
        dateElement.textContent = "Good afternoon!";
    } else {
        dateElement.textContent = "Good night!";
    }
}

/* ===== Controle da Sidebar Direita (Now Playing View estilo Spotify) ===== */
const rightSide = document.getElementById('right_side');
const sidebarToggleBtn = document.getElementById('sidebar_toggle_btn');
const rightSideClose = document.getElementById('right_side_close');
const rightPoster = document.getElementById('right_poster');
const rightSongTitle = document.getElementById('right_song_title');
const rightSongArtist = document.getElementById('right_song_artist');
const rightHeartBtn = document.getElementById('right_heart_btn');
const rightHeartBtnFilled = document.getElementById('right_heart_btn_filled');
const followArtistBtn = document.getElementById('follow_artist_btn');

let isRightSidebarOpen = false;
let userDisabledRightSidebar = false; // Desativa auto-abertura quando o usuário fecha manualmente

function openRightSidebar() {
    if (!rightSide) return;
    rightSide.classList.add('active');
    isRightSidebarOpen = true;
    if (sidebarToggleBtn) sidebarToggleBtn.classList.add('active');
}

function closeRightSidebar() {
    if (!rightSide) return;
    rightSide.classList.remove('active');
    isRightSidebarOpen = false;
    if (sidebarToggleBtn) sidebarToggleBtn.classList.remove('active');
}

function toggleRightSidebar() {
    if (isRightSidebarOpen) {
        closeRightSidebar();
        userDisabledRightSidebar = true; // Desativada manualmente pelo usuário
    } else {
        openRightSidebar();
        userDisabledRightSidebar = false; // Reativada manualmente pelo usuário
    }
}

if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleRightSidebar);
}

if (rightSideClose) {
    rightSideClose.addEventListener('click', () => {
        closeRightSidebar();
        userDisabledRightSidebar = true;
    });
}

if (followArtistBtn) {
    followArtistBtn.addEventListener('click', () => {
        if (followArtistBtn.classList.contains('following')) {
            followArtistBtn.classList.remove('following');
            followArtistBtn.textContent = 'Seguir';
        } else {
            followArtistBtn.classList.add('following');
            followArtistBtn.textContent = 'Seguindo';
        }
    });
}

function updateRightHeartUI() {
    let currentSongId = songs[currentIndex] ? songs[currentIndex].id : null;
    let isFav = currentSongId && favorites.includes(currentSongId);
    if (rightHeartBtn && rightHeartBtnFilled) {
        if (isFav) {
            rightHeartBtn.style.display = 'none';
            rightHeartBtnFilled.style.display = 'inline-block';
        } else {
            rightHeartBtn.style.display = 'inline-block';
            rightHeartBtnFilled.style.display = 'none';
        }
    }
}

if (rightHeartBtn) {
    rightHeartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite();
    });
}

if (rightHeartBtnFilled) {
    rightHeartBtnFilled.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite();
    });
}

function updateRightSidebarSong(song) {
    if (!song) return;
    if (rightPoster && song.poster) {
        rightPoster.src = song.poster;
        rightPoster.style.opacity = '1';
    }
    if (rightSongTitle && song.name) rightSongTitle.textContent = song.name;
    if (rightSongArtist && song.subtitle) rightSongArtist.textContent = song.subtitle;
    updateRightHeartUI();
}

/* ===== Inicialização do Player (Nenhuma música pré-selecionada por padrão) ===== */

syncActiveState();

/* ===== Barra de Pesquisa Dinâmica (Filtro e Reordenação em Tempo Real) ===== */
const searchInput = document.getElementById('search_input') || document.querySelector('.search input');

const menuSongUl = document.querySelector('.menu_side .menu_song');
const popSongDiv = document.querySelector('.popular_song .pop_song');
const popArtDiv = document.querySelector('.popular_artists .pop_song');

// Armazena as referências originais dos elementos na ordem inicial
const originalMenuElements = Array.from(menuSongUl ? menuSongUl.querySelectorAll('li.songItem') : []);
const originalPopSongElements = Array.from(popSongDiv ? popSongDiv.querySelectorAll('li.songItem') : []);
const originalPopArtElements = Array.from(popArtDiv ? popArtDiv.querySelectorAll('li.songItem') : []);

/* Pop-up de Sugestões / Auto-complete da Barra de Pesquisa */
const searchSuggestionsPopup = document.getElementById('search_suggestions_popup');
const suggestionsList = document.getElementById('suggestions_list');
let activeSuggestionIndex = -1;

function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + query.length);
    const after = text.substring(idx + query.length);
    return `${before}<span class="match_hl">${match}</span>${after}`;
}

function updateSearchSuggestions(rawQuery) {
    if (!searchSuggestionsPopup || !suggestionsList) return;
    const query = (rawQuery || '').trim().toLowerCase();

    if (!query) {
        searchSuggestionsPopup.style.display = 'none';
        suggestionsList.innerHTML = '';
        activeSuggestionIndex = -1;
        return;
    }

    const scoredMatches = [];

    songs.forEach(song => {
        const sName = song.name.toLowerCase();
        const sArtist = (song.subtitle || '').toLowerCase();
        let score = 0;

        if (sName.startsWith(query)) {
            score = 100;
        } else if (sName.includes(' ' + query)) {
            score = 80;
        } else if (sName.includes(query)) {
            score = 60;
        } else if (sArtist.includes(query)) {
            score = 40;
        }

        if (score > 0) {
            scoredMatches.push({ song, score });
        }
    });

    scoredMatches.sort((a, b) => b.score - a.score);
    let candidates = scoredMatches.map(m => m.song);

    // Requisito: mínimo 3 sugestões interativas
    if (candidates.length < 3) {
        const candidateNames = new Set(candidates.map(s => s.name.toLowerCase()));
        for (const s of songs) {
            if (!candidateNames.has(s.name.toLowerCase())) {
                candidates.push(s);
                candidateNames.add(s.name.toLowerCase());
                if (candidates.length >= 3) break;
            }
        }
    }

    // Requisito do usuário: no máximo 4 sugestões para ficar compacto e elegante
    const topSuggestions = candidates.slice(0, 4);

    if (topSuggestions.length === 0) {
        searchSuggestionsPopup.style.display = 'none';
        suggestionsList.innerHTML = '';
        activeSuggestionIndex = -1;
        return;
    }

    suggestionsList.innerHTML = '';
    activeSuggestionIndex = -1;

    topSuggestions.forEach((song, idx) => {
        const item = document.createElement('div');
        item.className = 'suggestion_item';
        item.dataset.index = idx;
        item.dataset.songId = song.id;
        item.dataset.songName = song.name;

        const highlightedTitle = highlightMatch(song.name, query);

        item.innerHTML = `
            <img src="${song.poster || 'img/PedroAzevedo.jpg'}" alt="${song.name}" class="suggestion_thumb" onerror="this.src='img/PedroAzevedo.jpg'">
            <div class="suggestion_content">
                <div class="suggestion_title">${highlightedTitle}</div>
                <div class="suggestion_meta">${song.subtitle || 'Pedro Azevedo'}</div>
            </div>
            <div class="suggestion_arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </div>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectAndPlaySuggestion(song);
        });

        suggestionsList.appendChild(item);
    });

    searchSuggestionsPopup.style.display = 'block';
}

function selectAndPlaySuggestion(songOrName) {
    let targetIndex = -1;
    if (typeof songOrName === 'object' && songOrName !== null) {
        targetIndex = songs.findIndex(s => s.id === songOrName.id);
    } else if (typeof songOrName === 'string') {
        const cleanName = songOrName.trim().toLowerCase();
        targetIndex = songs.findIndex(s => s.name.toLowerCase() === cleanName);
        if (targetIndex === -1) {
            targetIndex = songs.findIndex(s => s.name.toLowerCase().includes(cleanName));
        }
    }

    if (searchInput) {
        if (targetIndex > -1) {
            searchInput.value = songs[targetIndex].name;
        }
        searchInput.blur();
    }
    closeSearchSuggestions();

    if (targetIndex > -1) {
        // Sai de modos sobrepostos se estiver em rádio ou biblioteca
        if (songSideContainer && (songSideContainer.classList.contains('radio_mode') || songSideContainer.classList.contains('library_mode'))) {
            returnToHomeView();
        }
        setSong(targetIndex, true);
    }
}

function closeSearchSuggestions() {
    if (searchSuggestionsPopup) searchSuggestionsPopup.style.display = 'none';
    activeSuggestionIndex = -1;
}

function filterAndReorderList(container, originalElements, query) {
    if (!container || !originalElements.length) return;

    if (!query) {
        // Restaura a ordem e a visibilidade original sem forçar display inline que altere o layout
        originalElements.forEach(item => {
            item.style.display = '';
            container.appendChild(item);
        });
        return;
    }

    const matched = [];
    const unmatched = [];

    originalElements.forEach(item => {
        const itemH5 = item.querySelector('h5');
        const name = (item.dataset.name || (itemH5 && itemH5.childNodes[0] ? itemH5.childNodes[0].nodeValue : (itemH5 ? itemH5.textContent : ''))).toLowerCase().trim();
        const artist = (item.dataset.subtitle || (item.querySelector('.subtitle') ? item.querySelector('.subtitle').textContent : '')).toLowerCase().trim();

        if (name.includes(query) || artist.includes(query)) {
            matched.push(item);
        } else {
            unmatched.push(item);
        }
    });

    // Joga apenas as músicas que corresponderem aos resultados para o início das listas
    matched.forEach(item => {
        item.style.display = '';
        container.appendChild(item);
    });

    // Oculta as demais que não coincidiram com a busca
    unmatched.forEach(item => {
        item.style.display = 'none';
        container.appendChild(item);
    });

    // Retorna a rolagem horizontal para o início para visualizar os resultados imediatos
    container.scrollLeft = 0;
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        // 1. Atualiza e exibe o mini pop-up de sugestões interativo
        updateSearchSuggestions(e.target.value);

        // 2. Reordena as listas jogando os resultados para o início sem quebrar títulos
        filterAndReorderList(popSongDiv, originalPopSongElements, query);
        filterAndReorderList(popArtDiv, originalPopArtElements, query);

        if (favPlaylistBtn && favPlaylistBtn.classList.contains('active') && !query) {
            renderFavoritesView();
        } else {
            filterAndReorderList(menuSongUl, originalMenuElements, query);
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
            updateSearchSuggestions(searchInput.value);
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsList ? suggestionsList.querySelectorAll('.suggestion_item') : [];

        if (e.key === 'ArrowDown') {
            if (items.length > 0 && searchSuggestionsPopup && searchSuggestionsPopup.style.display !== 'none') {
                e.preventDefault();
                activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
                items.forEach((it, i) => it.classList.toggle('active_nav', i === activeSuggestionIndex));
            }
        } else if (e.key === 'ArrowUp') {
            if (items.length > 0 && searchSuggestionsPopup && searchSuggestionsPopup.style.display !== 'none') {
                e.preventDefault();
                activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
                items.forEach((it, i) => it.classList.toggle('active_nav', i === activeSuggestionIndex));
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeSuggestionIndex > -1 && items[activeSuggestionIndex]) {
                const songId = parseInt(items[activeSuggestionIndex].dataset.songId);
                const songName = items[activeSuggestionIndex].dataset.songName;
                const foundSong = songs.find(s => s.id === songId) || songName;
                selectAndPlaySuggestion(foundSong);
            } else if (items.length > 0) {
                // Toca a primeira sugestão se o usuário der Enter direto
                const songId = parseInt(items[0].dataset.songId);
                const songName = items[0].dataset.songName;
                const foundSong = songs.find(s => s.id === songId) || songName;
                selectAndPlaySuggestion(foundSong);
            } else if (searchInput.value.trim()) {
                selectAndPlaySuggestion(searchInput.value.trim());
            } else {
                closeSearchSuggestions();
            }
        } else if (e.key === 'Escape') {
            closeSearchSuggestions();
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    });

    // Fechar pop-up ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search_bar_container, .search')) {
            closeSearchSuggestions();
        }
    });
}



/* ===== Sistema Avançado de Playlists Categorizadas (LocalStorage & Cookies) ===== */

const DEFAULT_PLAYLISTS = [
    {
        id: 'pl_vibe_sonora',
        name: 'Vibe Sonora',
        category: 'Acústico & MPB',
        desc: 'Sons relaxantes, violão e brasilidade autêntica com Pedro Azevedo.',
        cover: 'img/Cavaquinho.jpg',
        songIds: [4, 5, 6, 7, 8, 12, 13, 14]
    },
    {
        id: 'pl_minhas_escolhas',
        name: 'Minhas Escolhas',
        category: 'Urban & Beats',
        desc: 'Seleção especial com batidas marcantes, groove e melodias urbanas.',
        cover: 'img/SelvaDeConcreto.jpg',
        songIds: [1, 2, 9, 10, 11, 15, 16]
    },
    {
        id: 'pl_eletronica_bass',
        name: 'Eletrônica & Bass',
        category: 'EDM & Bass',
        desc: 'Energia pura para a noite, sintetizadores marcantes e graves pesados.',
        cover: 'img/NeonBoulevard.jpg',
        songIds: [2, 3, 10, 17, 18, 19, 20]
    }
];

function loadCustomPlaylists() {
    try {
        let stored = localStorage.getItem('customPlaylists');
        if (!stored) {
            stored = getCookie('customPlaylists');
        }
        let list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list) || list.length === 0) {
            return JSON.parse(JSON.stringify(DEFAULT_PLAYLISTS));
        }
        // Assegura que as playlists padrão estejam sempre presentes
        DEFAULT_PLAYLISTS.forEach(def => {
            const found = list.find(p => p.id === def.id || p.name.toLowerCase() === def.name.toLowerCase());
            if (!found) {
                list.push(JSON.parse(JSON.stringify(def)));
            } else {
                if (!found.cover) found.cover = def.cover;
                if (!found.category) found.category = def.category;
                if (!found.desc) found.desc = def.desc;
                if (!found.songIds || found.songIds.length === 0) found.songIds = def.songIds;
            }
        });
        return list;
    } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_PLAYLISTS));
    }
}

function saveCustomPlaylists(pls) {
    let json = JSON.stringify(pls);
    try {
        localStorage.setItem('customPlaylists', json);
    } catch (e) {}
    setCookie('customPlaylists', json);
}

let customPlaylists = loadCustomPlaylists();
let activePlaylistId = null;

// Toast de Notificação
function showToast(msg) {
    const toast = document.getElementById('toast_notification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

// Atualiza o subtítulo com a contagem de curtidas
function updateLikedSongsCount() {
    const sub = document.getElementById('liked_songs_count_sub');
    if (sub) {
        const count = favorites.length;
        sub.textContent = `Playlist • ${count} música${count !== 1 ? 's' : ''}`;
    }
}

// Renderiza a lista de playlists do usuário na sidebar esquerda estilo Spotify
function renderCustomPlaylistsUI() {
    const container = document.getElementById('custom_playlists_container');
    if (!container) return;
    container.innerHTML = '';

    updateLikedSongsCount();

    const likedItem = document.getElementById('liked_songs_library_item');
    if (likedItem) {
        if (activePlaylistId === 'pl_liked') {
            likedItem.classList.add('active');
        } else {
            likedItem.classList.remove('active');
        }
    }

    // Ordena playlists colocando as fixadas no topo
    const displayList = [...customPlaylists].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    displayList.forEach(pl => {
        const item = document.createElement('div');
        item.className = 'custom_playlist_item';
        if (pl.isPinned) item.classList.add('pinned_item');
        if (pl.isPrivate) item.classList.add('private_item');
        item.dataset.playlistId = pl.id;
        if (activePlaylistId === pl.id) item.classList.add('active');
        item.title = pl.name;

        const songCount = pl.songIds ? pl.songIds.length : 0;
        const subText = pl.category ? `${pl.category} • ${songCount} faixas` : `Playlist • ${songCount} faixas`;

        let thumbHtml = '';
        if (pl.cover) {
            thumbHtml = `<img src="${pl.cover}" alt="${pl.name}" class="pl_thumb">`;
        } else {
            thumbHtml = `
            <div class="pl_thumb default_note_thumb">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
            </div>`;
        }

        item.innerHTML = `
            ${thumbHtml}
            <div class="pl_info">
                <span class="lib_title">${pl.name}</span>
                <span class="lib_sub">${subText}</span>
            </div>
            <div class="pl_options_trigger" title="Opções da playlist">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
            </div>
        `;

        // Clique para abrir a página da playlist (SPA)
        item.addEventListener('click', (e) => {
            if (e.target.closest('.pl_options_trigger')) return;
            openPlaylistPage(pl.id);
        });

        // Clique no menu de opções da playlist (renomear/excluir)
        const optTrigger = item.querySelector('.pl_options_trigger');
        optTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openPlaylistContextMenu(e, pl.id);
        });

        container.appendChild(item);
    });

    renderPlaylistSubmenu();
}

// Abre a Página da Playlist em SPA (como na imagem 3)
function openPlaylistPage(plId) {
    activePlaylistId = plId;
    renderCustomPlaylistsUI();

    let plTitle = '';
    let plDesc = '';
    let plCover = null;
    let plCoverIcon = false;
    let plSongs = [];

    if (plId === 'pl_liked') {
        plTitle = 'Músicas Curtidas';
        plDesc = 'Suas faixas favoritas salvas na sua biblioteca pessoal.';
        plCoverIcon = true;
        plSongs = songs.filter(s => favorites.includes(s.id));
    } else {
        const pl = customPlaylists.find(p => p.id === plId);
        if (!pl) return;
        plTitle = pl.name;
        plDesc = pl.desc || `Playlist personalizada com faixas selecionadas por Pedro Azevedo.`;
        plCover = pl.cover || null;
        plSongs = songs.filter(s => pl.songIds && pl.songIds.includes(s.id));
    }

    // Alterna modos da song_side
    if (artistPageView) artistPageView.style.display = 'none';
    const radPageView = document.getElementById('radio_page_view');
    if (radPageView) radPageView.style.display = 'none';
    const libPageView = document.getElementById('library_page_view');
    if (libPageView) libPageView.style.display = 'none';

    if (songSideContainer) {
        songSideContainer.classList.remove('artist_mode');
        songSideContainer.classList.remove('radio_mode');
        songSideContainer.classList.remove('library_mode');
        songSideContainer.classList.add('playlist_mode');
    }

    const plPageView = document.getElementById('playlist_page_view');
    if (plPageView) plPageView.style.display = 'flex';
    setActiveNavTab('discover');

    // Atualiza cabeçalho da playlist
    const heroTitle = document.getElementById('playlist_hero_title');
    const heroDesc = document.getElementById('playlist_hero_desc');
    const heroCount = document.getElementById('playlist_hero_count');
    const heroCover = document.getElementById('playlist_hero_cover');
    const heroIcon = document.getElementById('playlist_hero_icon');
    const heroNote = document.getElementById('playlist_hero_note_icon');

    if (heroTitle) heroTitle.textContent = plTitle;
    if (heroDesc) heroDesc.textContent = plDesc;
    if (heroCount) heroCount.textContent = `${plSongs.length} música${plSongs.length !== 1 ? 's' : ''}`;

    if (plCoverIcon) {
        if (heroCover) heroCover.style.display = 'none';
        if (heroIcon) heroIcon.style.display = 'flex';
        if (heroNote) heroNote.style.display = 'none';
    } else if (plCover) {
        if (heroCover) {
            heroCover.style.display = 'block';
            heroCover.src = plCover;
        }
        if (heroIcon) heroIcon.style.display = 'none';
        if (heroNote) heroNote.style.display = 'none';
    } else {
        if (heroCover) heroCover.style.display = 'none';
        if (heroIcon) heroIcon.style.display = 'none';
        if (heroNote) heroNote.style.display = 'flex';
    }

    renderPlaylistTracksTable(plSongs, plId);
    showToast(`Visualizando playlist "${plTitle}"`);
}

const heroCoverWrapper = document.getElementById('playlist_hero_cover_wrapper');
if (heroCoverWrapper) {
    heroCoverWrapper.addEventListener('click', () => {
        if (activePlaylistId && activePlaylistId !== 'pl_liked') {
            openPlaylistModal('rename', activePlaylistId);
        }
    });
}
const heroTitleEl = document.getElementById('playlist_hero_title');
if (heroTitleEl) {
    heroTitleEl.addEventListener('click', () => {
        if (activePlaylistId && activePlaylistId !== 'pl_liked') {
            openPlaylistModal('rename', activePlaylistId);
        }
    });
}

// Renderiza a tabela vertical de músicas da playlist
function renderPlaylistTracksTable(plSongs, plId) {
    const table = document.getElementById('playlist_tracks_table');
    if (!table) return;
    table.innerHTML = '';

    if (plSongs.length === 0) {
        table.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: #8b92a5;">
                <p style="font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 8px;">Esta playlist está vazia</p>
                <p style="font-size: 13px;">Adicione músicas clicando no ícone de opções (...) de qualquer faixa!</p>
            </div>
        `;
        return;
    }

    plSongs.forEach((song, idx) => {
        const row = document.createElement('div');
        row.className = 'artist_track_row';
        row.dataset.songId = song.id;
        row.dataset.file = song.file;
        row.dataset.name = song.name;
        const isCurrent = (songs[currentIndex] && songs[currentIndex].id === song.id && isPlaying);
        if (isCurrent) row.classList.add('active');

        const isFav = favorites.includes(song.id);
        const songIndex = songs.findIndex(s => s.id === song.id);

        row.innerHTML = `
            <div class="track_rank">${idx + 1}</div>
            <div class="track_thumb">
                <img src="${song.poster}" alt="${song.name}">
            </div>
            <div class="track_info">
                <div class="track_title">${song.name}</div>
                <div style="font-size: 11px; color: #8b92a5;">${song.subtitle}</div>
            </div>
            <div class="track_heart ${isFav ? 'filled' : ''}" title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="${isFav ? 'M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z' : 'm8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z'}"/>
                </svg>
            </div>
            <div class="track_duration">3:45</div>
        `;

        // Curtir/descurtir
        const heartEl = row.querySelector('.track_heart');
        heartEl.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
            if (plId === 'pl_liked') {
                openPlaylistPage('pl_liked');
            } else {
                renderPlaylistTracksTable(plSongs, plId);
            }
        });

        // Clique para tocar
        row.addEventListener('click', () => {
            if (songIndex !== -1) {
                handleSongClick(songIndex, null);
                renderPlaylistTracksTable(plSongs, plId);
            }
        });

        table.appendChild(row);
    });
}

// Retorna à tela inicial normal (Fecha Artista, Playlist, Rádio e Biblioteca)
function returnToHomeView() {
    activePlaylistId = null;
    if (songSideContainer) {
        songSideContainer.classList.remove('artist_mode');
        songSideContainer.classList.remove('playlist_mode');
        songSideContainer.classList.remove('radio_mode');
        songSideContainer.classList.remove('library_mode');
    }

    // Restaura a visibilidade e funcionalidade da barra de pesquisa da navbar superior
    const navSearch = document.getElementById('search_bar_container');
    if (navSearch) navSearch.style.display = '';

    if (artistPageView) artistPageView.style.display = 'none';
    const plPageView = document.getElementById('playlist_page_view');
    if (plPageView) plPageView.style.display = 'none';
    const radPageView = document.getElementById('radio_page_view');
    if (radPageView) radPageView.style.display = 'none';
    const libPageView = document.getElementById('library_page_view');
    if (libPageView) libPageView.style.display = 'none';

    setActiveNavTab('discover');
    renderCustomPlaylistsUI();
}

// Submenu com lista de playlists para adicionar a música atual (com filtro de pesquisa)
function renderPlaylistSubmenu(filterText = '') {
    const listContainer = document.getElementById('user_playlists_list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    let list = customPlaylists;
    if (filterText) {
        const ft = filterText.toLowerCase();
        list = customPlaylists.filter(p => p.name.toLowerCase().includes(ft));
    }

    if (list.length === 0) {
        listContainer.innerHTML = `<div style="padding:8px 14px; font-size:11.5px; color:#6b7080;">${filterText ? 'Nenhuma playlist encontrada' : 'Nenhuma playlist criada'}</div>`;
        return;
    }

    list.forEach(pl => {
        const item = document.createElement('div');
        item.className = 'submenu_item';
        item.textContent = pl.name;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSpotifyContextMenu();
            const targetSong = currentContextSong || songs[currentIndex];
            if (!targetSong) return;

            if (!pl.songIds) pl.songIds = [];
            if (!pl.songIds.includes(targetSong.id)) {
                pl.songIds.push(targetSong.id);
                saveCustomPlaylists(customPlaylists);
                showToast(`"${targetSong.name}" adicionada à playlist "${pl.name}"!`);
                if (activePlaylistId === pl.id) {
                    openPlaylistPage(pl.id);
                }
            } else {
                showToast(`"${targetSong.name}" já está na playlist "${pl.name}"!`);
            }
        });

        listContainer.appendChild(item);
    });
}

// Modal de Criação / Edição de Playlist (Avançado com Capa e Descrição)
let modalMode = 'create'; // 'create' ou 'rename'
let editingPlaylistId = null;
let currentModalCoverData = null; // Armazena dataURL da imagem ou null

const playlistModalOverlay = document.getElementById('playlist_modal_overlay');
const playlistModalTitle = document.getElementById('playlist_modal_title');
const playlistModalClose = document.getElementById('playlist_modal_close');
const playlistModalInput = document.getElementById('playlist_modal_input');
const playlistModalNameError = document.getElementById('playlist_modal_name_error');
const playlistModalDescInput = document.getElementById('playlist_modal_desc_input');
const playlistModalCharCounter = document.getElementById('playlist_modal_char_counter');
const modalCoverBox = document.getElementById('modal_cover_box');
const modalCoverImg = document.getElementById('modal_cover_img');
const modalCoverPlaceholder = document.getElementById('modal_cover_placeholder');
const playlistModalFileInput = document.getElementById('playlist_modal_file_input');
const modalRemoveCoverBtn = document.getElementById('modal_remove_cover_btn');
const playlistModalCancel = document.getElementById('playlist_modal_cancel');
const playlistModalConfirm = document.getElementById('playlist_modal_confirm');
const createPlaylistBtn = document.getElementById('create_playlist_btn');
const submenuCreatePlaylist = document.getElementById('submenu_create_playlist');

// Segurança e restrições de formato para upload
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB máximo

function resetPlaylistModalState() {
    if (playlistModalInput) {
        playlistModalInput.classList.remove('has_error');
    }
    if (playlistModalNameError) {
        playlistModalNameError.classList.remove('visible');
    }
    if (playlistModalFileInput) {
        playlistModalFileInput.value = '';
    }
    currentModalCoverData = null;
    if (modalCoverImg) {
        modalCoverImg.src = '';
        modalCoverImg.style.display = 'none';
    }
    if (modalCoverPlaceholder) {
        modalCoverPlaceholder.style.display = 'flex';
    }
    if (modalRemoveCoverBtn) {
        modalRemoveCoverBtn.style.display = 'none';
    }
}

function openPlaylistModal(mode = 'create', plId = null) {
    modalMode = mode;
    editingPlaylistId = plId;
    resetPlaylistModalState();

    if (mode === 'create') {
        if (playlistModalTitle) playlistModalTitle.textContent = 'Criar Playlist';
        if (playlistModalInput) playlistModalInput.value = `Minha Playlist #${customPlaylists.length + 1}`;
        if (playlistModalDescInput) playlistModalDescInput.value = '';
        if (playlistModalCharCounter) playlistModalCharCounter.textContent = '0/300';
    } else {
        const pl = customPlaylists.find(p => p.id === plId);
        if (playlistModalTitle) playlistModalTitle.textContent = 'Editar detalhes';
        if (playlistModalInput) playlistModalInput.value = pl ? pl.name : '';
        if (playlistModalDescInput) playlistModalDescInput.value = pl && pl.desc ? pl.desc : '';
        if (playlistModalCharCounter) {
            const len = playlistModalDescInput ? playlistModalDescInput.value.length : 0;
            playlistModalCharCounter.textContent = `${len}/300`;
        }

        if (pl && pl.cover) {
            currentModalCoverData = pl.cover;
            if (modalCoverImg) {
                modalCoverImg.src = pl.cover;
                modalCoverImg.style.display = 'block';
            }
            if (modalCoverPlaceholder) {
                modalCoverPlaceholder.style.display = 'none';
            }
            if (modalRemoveCoverBtn) {
                modalRemoveCoverBtn.style.display = 'block';
            }
        }
    }

    if (playlistModalOverlay) {
        playlistModalOverlay.classList.add('active');
        setTimeout(() => {
            if (playlistModalInput) {
                playlistModalInput.focus();
                playlistModalInput.select();
            }
        }, 120);
    }
}

function closePlaylistModal() {
    if (playlistModalOverlay) {
        playlistModalOverlay.classList.remove('active');
    }
    resetPlaylistModalState();
}

// Upload seguro de imagem da galeria local
if (modalCoverBox && playlistModalFileInput) {
    modalCoverBox.addEventListener('click', () => {
        playlistModalFileInput.click();
    });

    playlistModalFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // 1. Validação estrita de extensão e MIME type (rejeita executáveis, scripts e vetores SVG com scripts)
        const fileName = file.name || '';
        const ext = '.' + fileName.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
            showToast('Formato inválido! Envie apenas imagens JPG, PNG ou WebP.');
            playlistModalFileInput.value = '';
            return;
        }

        // 2. Validação de tamanho (máximo 3MB para proteger a performance e armazenamento)
        if (file.size > MAX_IMAGE_SIZE) {
            showToast('A imagem selecionada excede o limite máximo de 3MB.');
            playlistModalFileInput.value = '';
            return;
        }

        // 3. Leitura e validação de integridade por FileReader
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            // Carrega em elemento Image isolado para comprovar que é imagem genuína sem código malicioso
            const testImg = new Image();
            testImg.onload = () => {
                currentModalCoverData = dataUrl;
                if (modalCoverImg) {
                    modalCoverImg.src = dataUrl;
                    modalCoverImg.style.display = 'block';
                }
                if (modalCoverPlaceholder) {
                    modalCoverPlaceholder.style.display = 'none';
                }
                if (modalRemoveCoverBtn) {
                    modalRemoveCoverBtn.style.display = 'block';
                }
            };
            testImg.onerror = () => {
                showToast('Falha: arquivo corrompido ou imagem ilegível.');
                playlistModalFileInput.value = '';
            };
            testImg.src = dataUrl;
        };
        reader.onerror = () => {
            showToast('Erro ao ler arquivo da imagem.');
            playlistModalFileInput.value = '';
        };
        reader.readAsDataURL(file);
    });
}

// Botão remover foto
if (modalRemoveCoverBtn) {
    modalRemoveCoverBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentModalCoverData = null;
        if (modalCoverImg) {
            modalCoverImg.src = '';
            modalCoverImg.style.display = 'none';
        }
        if (modalCoverPlaceholder) {
            modalCoverPlaceholder.style.display = 'flex';
        }
        if (playlistModalFileInput) {
            playlistModalFileInput.value = '';
        }
        modalRemoveCoverBtn.style.display = 'none';
    });
}

// Contador de caracteres da descrição
if (playlistModalDescInput && playlistModalCharCounter) {
    playlistModalDescInput.addEventListener('input', () => {
        playlistModalCharCounter.textContent = `${playlistModalDescInput.value.length}/300`;
    });
}

// Limpeza de erro no campo nome ao digitar
if (playlistModalInput) {
    playlistModalInput.addEventListener('input', () => {
        if (playlistModalInput.value.trim()) {
            playlistModalInput.classList.remove('has_error');
            if (playlistModalNameError) playlistModalNameError.classList.remove('visible');
        }
    });
}

// Fechamento do modal
if (playlistModalClose) playlistModalClose.addEventListener('click', closePlaylistModal);
if (playlistModalCancel) playlistModalCancel.addEventListener('click', closePlaylistModal);
if (playlistModalOverlay) {
    playlistModalOverlay.addEventListener('click', (e) => {
        if (e.target === playlistModalOverlay) closePlaylistModal();
    });
}

// Submissão do modal
if (playlistModalConfirm) {
    playlistModalConfirm.addEventListener('click', () => {
        const name = playlistModalInput ? playlistModalInput.value.trim() : '';
        if (!name) {
            if (playlistModalInput) {
                playlistModalInput.classList.add('has_error');
                playlistModalInput.focus();
            }
            if (playlistModalNameError) {
                playlistModalNameError.classList.add('visible');
            }
            return;
        }

        const desc = playlistModalDescInput ? playlistModalDescInput.value.trim() : '';

        if (modalMode === 'create') {
            const newPl = {
                id: 'pl_' + Date.now(),
                name: name,
                desc: desc || 'Playlist criada por você com faixas personalizadas.',
                cover: currentModalCoverData || null,
                songIds: []
            };
            customPlaylists.push(newPl);
            saveCustomPlaylists(customPlaylists);
            renderCustomPlaylistsUI();
            openPlaylistPage(newPl.id);
            showToast(`Playlist "${name}" criada com sucesso!`);
        } else if ((modalMode === 'rename' || modalMode === 'edit') && editingPlaylistId) {
            const pl = customPlaylists.find(p => p.id === editingPlaylistId);
            if (pl) {
                pl.name = name;
                if (desc !== undefined) pl.desc = desc;
                if (currentModalCoverData !== undefined) pl.cover = currentModalCoverData || null;
                saveCustomPlaylists(customPlaylists);
                renderCustomPlaylistsUI();
                if (activePlaylistId === editingPlaylistId) {
                    openPlaylistPage(editingPlaylistId);
                }
                showToast(`Playlist "${name}" atualizada!`);
            }
        }

        closePlaylistModal();
    });

    if (playlistModalInput) {
        playlistModalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') playlistModalConfirm.click();
            if (e.key === 'Escape') closePlaylistModal();
        });
    }

    if (playlistModalDescInput) {
        playlistModalDescInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                playlistModalConfirm.click();
            }
            if (e.key === 'Escape') closePlaylistModal();
        });
    }
}

if (createPlaylistBtn) {
    createPlaylistBtn.addEventListener('click', () => openPlaylistModal('create'));
}
if (submenuCreatePlaylist) {
    submenuCreatePlaylist.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        openPlaylistModal('create');
    });
}

// ===== Sistema de Context Menu Personalizado (Substitui menu padrão do navegador) =====

let contextPlaylistId = null;
let currentContextSong = null;

// Localiza qual música/álbum foi alvo do clique na página
function findSongFromElement(target) {
    if (!target) return null;
    const songItem = target.closest('li.songItem');
    if (songItem) {
        const file = songItem.dataset.file;
        const name = songItem.dataset.name;
        if (file) {
            const found = songs.find(s => s.file === file || (name && s.name.toLowerCase() === name.toLowerCase()));
            if (found) return found;
        }
        if (name) {
            const found = songs.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (found) return found;
        }
    }
    const trackRow = target.closest('.artist_track_row');
    if (trackRow) {
        const songId = trackRow.dataset.songId;
        if (songId) {
            const found = songs.find(s => s.id === parseInt(songId));
            if (found) return found;
        }
        const file = trackRow.dataset.file;
        const name = trackRow.dataset.name || trackRow.querySelector('.track_title')?.textContent?.trim();
        if (file) {
            const found = songs.find(s => s.file === file || (name && s.name.toLowerCase() === name.toLowerCase()));
            if (found) return found;
        }
        if (name) {
            const found = songs.find(s => s.name.toLowerCase() === name.toLowerCase());
            if (found) return found;
        }
    }
    const rightPosterWrap = target.closest('.right_side .poster_wrap, .right_side .song_header, .right_side .song_details');
    if (rightPosterWrap) {
        return songs[currentIndex] || songs[0];
    }
    const masterPlayCover = target.closest('.master_play .current_playing_cover, .master_play .title');
    if (masterPlayCover) {
        return songs[currentIndex] || songs[0];
    }
    const popularSection = target.closest('.popular_song, .popular_artists');
    if (popularSection) {
        const item = target.closest('li');
        if (item) {
            const file = item.dataset.file;
            const name = item.dataset.name;
            if (file) {
                const found = songs.find(s => s.file === file || (name && s.name.toLowerCase() === name.toLowerCase()));
                if (found) return found;
            }
            if (name) {
                const found = songs.find(s => s.name.toLowerCase() === name.toLowerCase());
                if (found) return found;
            }
        }
    }
    return null;
}

function getAlbumFromCard(el) {
    if (!el) return null;
    const card = el.closest ? el.closest('li.songItem, .pop_song li, .popular_song li, .popular_artists li, li') : null;
    if (!card) return null;

    const titleEl = card.querySelector('.song_title_text') || card.querySelector('h5');
    const name = card.dataset.name || (titleEl ? titleEl.textContent.trim() : 'Álbum');
    const poster = card.dataset.poster || card.querySelector('img')?.getAttribute('src') || 'img/psa.jpg';
    const subtitleEl = card.querySelector('.subtitle');
    const artist = card.dataset.subtitle || (subtitleEl ? subtitleEl.textContent.trim() : 'Pedro Azevedo');
    const file = card.dataset.file || '';

    // 1. Procura se existe álbum correspondente catalogado
    const existing = getAlbumByName(name);
    if (existing && existing.songs && existing.songs.length > 0) {
        return existing;
    }

    // 2. Procura se é uma música catalogada
    const matchedSong = songs.find(s => (s.name && s.name.toLowerCase() === name.toLowerCase()) || (file && s.file === file));
    if (matchedSong) {
        return getAlbumForSong(matchedSong);
    }

    // 3. Fallback criando o objeto do álbum diretamente do card
    const albumSongs = file ? [{ id: Date.now(), name: name, file: file, poster: poster, subtitle: artist }] : [];
    return {
        name: name,
        poster: poster,
        artist: artist,
        songs: albumSongs
    };
}

// ===== Sistema de Pastas de Álbuns na Navbar Esquerda (Explorador de Arquivos) =====

function loadCustomFolders() {
    try {
        let stored = localStorage.getItem('customFolders');
        if (!stored) stored = getCookie('customFolders');
        let list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) return [];
        return list;
    } catch (e) {
        return [];
    }
}

function saveCustomFolders(folders) {
    let json = JSON.stringify(folders);
    try {
        localStorage.setItem('customFolders', json);
    } catch (e) {}
    setCookie('customFolders', json);
}

let customFolders = loadCustomFolders();
let contextTargetAlbum = null;
let contextFolderId = null;

// Modal de Pasta de Álbuns
const folderModalOverlay = document.getElementById('folder_modal_overlay');
const folderModalTitle = document.getElementById('folder_modal_title');
const folderModalClose = document.getElementById('folder_modal_close');
const folderModalCancel = document.getElementById('folder_modal_cancel');
const folderModalConfirm = document.getElementById('folder_modal_confirm');
const folderNameInput = document.getElementById('folder_name_input');
const folderNameError = document.getElementById('folder_name_error');

let editingFolderId = null;
let folderPendingAlbumName = null;

function openFolderModal(mode = 'create', folderId = null, pendingAlbumName = null) {
    if (!folderModalOverlay) return;
    editingFolderId = folderId;
    folderPendingAlbumName = pendingAlbumName;

    if (folderNameError) folderNameError.style.display = 'none';

    if (mode === 'rename' && folderId) {
        const f = customFolders.find(x => x.id === folderId);
        if (folderModalTitle) folderModalTitle.textContent = 'Renomear Pasta de Álbuns';
        if (folderNameInput) folderNameInput.value = f ? f.name : '';
    } else {
        if (folderModalTitle) folderModalTitle.textContent = 'Criar Pasta de Álbuns';
        if (folderNameInput) folderNameInput.value = '';
    }

    folderModalOverlay.classList.add('active');
    setTimeout(() => {
        if (folderNameInput) folderNameInput.focus();
    }, 60);
}

function closeFolderModal() {
    if (folderModalOverlay) folderModalOverlay.classList.remove('active');
    editingFolderId = null;
    folderPendingAlbumName = null;
    if (folderNameError) folderNameError.style.display = 'none';
}

if (folderModalClose) folderModalClose.addEventListener('click', closeFolderModal);
if (folderModalCancel) folderModalCancel.addEventListener('click', closeFolderModal);
if (folderModalOverlay) {
    folderModalOverlay.addEventListener('click', (e) => {
        if (e.target === folderModalOverlay) closeFolderModal();
    });
}

if (folderModalConfirm) {
    folderModalConfirm.addEventListener('click', () => {
        const val = folderNameInput ? folderNameInput.value.trim() : '';
        if (!val) {
            if (folderNameError) {
                folderNameError.textContent = 'O nome da pasta é obrigatório.';
                folderNameError.style.display = 'block';
            }
            if (folderNameInput) folderNameInput.focus();
            return;
        }

        if (editingFolderId) {
            const f = customFolders.find(x => x.id === editingFolderId);
            if (f) {
                f.name = val;
                saveCustomFolders(customFolders);
                renderCustomFoldersUI();
                showToast(`Pasta renomeada para "${val}".`);
            }
        } else {
            const newFolder = {
                id: 'folder_' + Date.now(),
                name: val,
                isExpanded: true,
                albumNames: folderPendingAlbumName ? [folderPendingAlbumName] : []
            };
            customFolders.push(newFolder);
            saveCustomFolders(customFolders);
            renderCustomFoldersUI();
            if (folderPendingAlbumName) {
                showToast(`Pasta "${val}" criada com o álbum "${folderPendingAlbumName}" guardado!`);
            } else {
                showToast(`Pasta "${val}" criada na barra lateral!`);
            }
        }
        closeFolderModal();
    });
}

if (folderNameInput) {
    folderNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') folderModalConfirm.click();
        if (e.key === 'Escape') closeFolderModal();
    });
}

function renderCustomFoldersUI() {
    const container = document.getElementById('custom_folders_container');
    if (!container) return;
    container.innerHTML = '';

    if (customFolders.length === 0) return;

    customFolders.forEach(folder => {
        const folderEl = document.createElement('div');
        folderEl.className = `folder_directory_item ${folder.isExpanded ? 'expanded' : ''}`;
        folderEl.dataset.folderId = folder.id;

        const countText = `${folder.albumNames.length}/10 álbuns`;

        folderEl.innerHTML = `
            <div class="folder_header" title="Clique para recolher/expandir pasta">
                <svg class="folder_chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
                <div class="folder_icon_wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.192 3.477 1 4.037 1 4.636V12a1 1 0 0 0 .996.909h10.349a1 1 0 0 0 .996-.909V4.636c0-.599-.192-1.159-.506-1.516a1 1 0 0 0-.744-.32H9.828a3 3 0 0 1-2.12-.879l-.83-.828A1 1 0 0 0 6.173 2H2.5a1 1 0 0 0-.994 1.12z"/>
                    </svg>
                </div>
                <div class="folder_info">
                    <span class="folder_title">${folder.name}</span>
                    <span class="folder_sub">${countText}</span>
                </div>
                <div class="folder_options_trigger" title="Opções da pasta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                    </svg>
                </div>
            </div>
            <div class="folder_content_tree"></div>
        `;

        const contentTree = folderEl.querySelector('.folder_content_tree');

        if (folder.albumNames.length === 0) {
            contentTree.innerHTML = `
                <div class="folder_empty_hint">
                    Nenhum álbum nesta pasta.<br>
                    Clique com o botão direito em um álbum para guardar aqui (máx 10).
                </div>
            `;
        } else {
            folder.albumNames.forEach(albumName => {
                const albumObj = getAlbumByName(albumName);
                if (!albumObj) return;

                const albumNode = document.createElement('div');
                albumNode.className = 'folder_album_node';
                albumNode.dataset.albumName = albumObj.name;
                albumNode.dataset.folderId = folder.id;

                albumNode.innerHTML = `
                    <div class="folder_album_header" title="Clique para ver músicas do álbum">
                        <svg class="folder_album_chevron" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                        <img src="${albumObj.poster}" alt="${albumObj.name}" class="folder_album_thumb">
                        <div class="folder_album_info">
                            <span class="folder_album_title">${albumObj.name}</span>
                            <span class="folder_album_sub">${albumObj.songs.length} faixas • ${albumObj.artist}</span>
                        </div>
                        <button class="folder_album_play" title="Tocar álbum em fila sequencial" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                        </button>
                        <button class="folder_album_remove" title="Remover álbum desta pasta" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708-.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="folder_album_songs_tree"></div>
                `;

                const songsTree = albumNode.querySelector('.folder_album_songs_tree');
                albumObj.songs.forEach((s, sIdx) => {
                    const sRow = document.createElement('div');
                    sRow.className = `folder_song_row ${(currentIndex >= 0 && songs[currentIndex] && songs[currentIndex].id === s.id) ? 'active' : ''}`;
                    sRow.dataset.songId = s.id;
                    sRow.innerHTML = `
                        <span class="folder_song_num">${sIdx + 1}</span>
                        <span class="folder_song_title">${s.name}</span>
                        <span class="folder_song_dur">${s.duration || ''}</span>
                    `;

                    sRow.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const foundIdx = songs.findIndex(item => item.id === s.id);
                        if (foundIdx !== -1) handleSongClick(foundIdx, e);
                    });

                    songsTree.appendChild(sRow);
                });

                const aHeader = albumNode.querySelector('.folder_album_header');
                aHeader.addEventListener('click', (e) => {
                    if (e.target.closest('.folder_album_play, .folder_album_remove')) return;
                    albumNode.classList.toggle('expanded');
                });

                const aPlay = albumNode.querySelector('.folder_album_play');
                aPlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    addAlbumToQueue(albumObj.songs, albumObj.name, true);
                });

                const aRemove = albumNode.querySelector('.folder_album_remove');
                aRemove.addEventListener('click', (e) => {
                    e.stopPropagation();
                    folder.albumNames = folder.albumNames.filter(n => n.toLowerCase() !== albumObj.name.toLowerCase());
                    saveCustomFolders(customFolders);
                    renderCustomFoldersUI();
                    showToast(`Álbum "${albumObj.name}" removido da pasta "${folder.name}".`);
                });

                contentTree.appendChild(albumNode);
            });
        }

        const fHeader = folderEl.querySelector('.folder_header');
        fHeader.addEventListener('click', (e) => {
            if (e.target.closest('.folder_options_trigger')) return;
            folder.isExpanded = !folder.isExpanded;
            folderEl.classList.toggle('expanded', folder.isExpanded);
            saveCustomFolders(customFolders);
        });

        const fOpt = folderEl.querySelector('.folder_options_trigger');
        fOpt.addEventListener('click', (e) => {
            e.stopPropagation();
            openPlaylistContextMenu(e, null, null, folder.id);
        });

        container.appendChild(folderEl);
    });
}

// Inicializa a renderização das pastas
renderCustomFoldersUI();

// Context Menu da Sidebar Esquerda / Playlists / Álbuns
const playlistContextMenu = document.getElementById('playlist_context_menu');
const menuRenamePlaylist = document.getElementById('menu_rename_playlist');
const menuDeletePlaylist = document.getElementById('menu_delete_playlist');
const menuSidebarAddQueue = document.getElementById('menu_sidebar_add_queue');
const menuSidebarDuplicatePl = document.getElementById('menu_sidebar_duplicate_pl');
const menuSidebarCreatePl = document.getElementById('menu_sidebar_create_pl');
const menuSidebarCreateFolder = document.getElementById('menu_sidebar_create_folder');
const menuSidebarTogglePrivate = document.getElementById('menu_sidebar_toggle_private');
const menuSidebarTogglePrivateText = document.getElementById('menu_sidebar_toggle_private_text');
const menuSidebarPinPl = document.getElementById('menu_sidebar_pin_pl');
const menuSidebarPinPlText = document.getElementById('menu_sidebar_pin_pl_text');
const menuSidebarShare = document.getElementById('menu_sidebar_share');
const sidebarSubmenuCopyLink = document.getElementById('sidebar_submenu_copy_link');
const sidebarSubmenuCopyLinkText = document.getElementById('sidebar_submenu_copy_link_text');
const menuSaveToFolder = document.getElementById('menu_save_to_folder');
const folderListSubmenu = document.getElementById('folder_list_submenu');
const menuRemoveFromFolder = document.getElementById('menu_remove_from_folder');
const menuSidebarDivider1 = document.getElementById('menu_sidebar_divider_1');
const menuSidebarDivider2 = document.getElementById('menu_sidebar_divider_2');

function renderFolderSubmenu(targetAlbum) {
    if (!folderListSubmenu) return;
    folderListSubmenu.innerHTML = '';

    if (customFolders.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'submenu_item';
        emptyItem.innerHTML = '<span>+ Criar nova pasta</span>';
        emptyItem.addEventListener('click', (e) => {
            e.stopPropagation();
            closePlaylistContextMenu();
            openFolderModal('create', null, targetAlbum ? targetAlbum.name : null);
        });
        folderListSubmenu.appendChild(emptyItem);
        return;
    }

    customFolders.forEach(f => {
        const item = document.createElement('div');
        item.className = 'submenu_item folder_dest_item';
        item.dataset.folderId = f.id;
        item.innerHTML = `<span>📁 ${f.name} <small style="color:#8b92a5; margin-left:4px;">(${f.albumNames.length}/10)</small></span>`;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            closePlaylistContextMenu();
            if (!targetAlbum) return;

            if (f.albumNames.some(n => n.toLowerCase() === targetAlbum.name.toLowerCase())) {
                showToast(`O álbum "${targetAlbum.name}" já está guardado na pasta "${f.name}".`);
                return;
            }

            if (f.albumNames.length >= 10) {
                showToast('Limite atingido: esta pasta já possui 10 álbuns (máximo permitido).');
                return;
            }

            f.albumNames.push(targetAlbum.name);
            saveCustomFolders(customFolders);
            renderCustomFoldersUI();
            showToast(`Álbum "${targetAlbum.name}" guardado na pasta "${f.name}"!`);
        });

        folderListSubmenu.appendChild(item);
    });

    const divider = document.createElement('div');
    divider.className = 'submenu_divider';
    folderListSubmenu.appendChild(divider);

    const createNewItem = document.createElement('div');
    createNewItem.className = 'submenu_item';
    createNewItem.innerHTML = '<span>+ Criar nova pasta</span>';
    createNewItem.addEventListener('click', (e) => {
        e.stopPropagation();
        closePlaylistContextMenu();
        openFolderModal('create', null, targetAlbum ? targetAlbum.name : null);
    });
    folderListSubmenu.appendChild(createNewItem);
}

function openPlaylistContextMenu(e, plId = null, targetAlbum = null, folderId = null) {
    contextPlaylistId = plId;
    contextTargetAlbum = targetAlbum;
    contextFolderId = folderId;

    if (!playlistContextMenu) return;

    closeSpotifyContextMenu();

    const pl = customPlaylists.find(p => p.id === plId);
    const isCustomPlaylist = Boolean(plId && plId !== 'pl_liked');
    const isFolder = Boolean(folderId && !targetAlbum);
    const isAlbum = Boolean(targetAlbum);

    // Ajusta opções visíveis
    if (menuRenamePlaylist) {
        if (isCustomPlaylist) {
            menuRenamePlaylist.style.display = 'flex';
            const span = menuRenamePlaylist.querySelector('span');
            if (span) span.textContent = 'Editar detalhes';
        } else if (isFolder) {
            menuRenamePlaylist.style.display = 'flex';
            const span = menuRenamePlaylist.querySelector('span');
            if (span) span.textContent = 'Renomear pasta';
        } else {
            menuRenamePlaylist.style.display = 'none';
        }
    }

    if (menuDeletePlaylist) {
        if (isCustomPlaylist) {
            menuDeletePlaylist.style.display = 'flex';
            const span = menuDeletePlaylist.querySelector('span');
            if (span) span.textContent = 'Excluir playlist';
        } else if (isFolder) {
            menuDeletePlaylist.style.display = 'flex';
            const span = menuDeletePlaylist.querySelector('span');
            if (span) span.textContent = 'Excluir pasta';
        } else {
            menuDeletePlaylist.style.display = 'none';
        }
    }

    if (menuSidebarDuplicatePl) {
        menuSidebarDuplicatePl.style.display = isCustomPlaylist ? 'flex' : 'none';
    }

    if (menuSidebarTogglePrivate) {
        menuSidebarTogglePrivate.style.display = isCustomPlaylist ? 'flex' : 'none';
        if (menuSidebarTogglePrivateText && pl) {
            menuSidebarTogglePrivateText.textContent = pl.isPrivate ? 'Tornar pública' : 'Tornar privada';
        }
    }

    if (menuSidebarPinPl) {
        menuSidebarPinPl.style.display = isCustomPlaylist ? 'flex' : 'none';
        if (menuSidebarPinPlText && pl) {
            menuSidebarPinPlText.textContent = pl.isPinned ? 'Desafixar playlist' : 'Fixar playlist';
        }
    }

    if (menuSidebarAddQueue) {
        menuSidebarAddQueue.style.display = (isAlbum || plId || plId === 'pl_liked') ? 'flex' : 'none';
    }

    if (menuSaveToFolder) {
        menuSaveToFolder.style.display = isAlbum ? 'flex' : 'none';
        if (isAlbum) renderFolderSubmenu(targetAlbum);
    }

    if (menuRemoveFromFolder) {
        menuRemoveFromFolder.style.display = (isAlbum && folderId) ? 'flex' : 'none';
    }

    if (menuSidebarCreatePl) {
        menuSidebarCreatePl.style.display = 'flex';
    }

    if (menuSidebarCreateFolder) {
        menuSidebarCreateFolder.style.display = 'flex';
    }

    if (menuSidebarShare) {
        menuSidebarShare.style.display = (isAlbum || isCustomPlaylist) ? 'flex' : 'none';
        const span = menuSidebarShare.querySelector('span');
        if (span) span.textContent = isAlbum ? 'Compartilhar álbum' : 'Compartilhar playlist';
    }

    if (sidebarSubmenuCopyLinkText) {
        sidebarSubmenuCopyLinkText.textContent = isAlbum ? 'Copiar link do álbum' : 'Copiar link da playlist';
    }

    const hasTopOptions = isCustomPlaylist || isFolder || isAlbum || plId === 'pl_liked';
    const hasBottomOptions = isCustomPlaylist || isAlbum;

    if (menuSidebarDivider1) {
        menuSidebarDivider1.style.display = hasTopOptions ? 'block' : 'none';
    }
    if (menuSidebarDivider2) {
        menuSidebarDivider2.style.display = hasBottomOptions ? 'block' : 'none';
    }

    const menuWidth = 230;
    const menuHeight = 350;
    let x = (e && typeof e.clientX === 'number') ? e.clientX : 50;
    let y = (e && typeof e.clientY === 'number') ? e.clientY : 50;
    if (x + menuWidth > window.innerWidth) x = Math.max(10, window.innerWidth - menuWidth - 10);
    if (y + menuHeight > window.innerHeight) y = Math.max(10, window.innerHeight - menuHeight - 10);

    playlistContextMenu.style.left = `${Math.max(10, x)}px`;
    playlistContextMenu.style.top = `${Math.max(10, y)}px`;

    const submenus = playlistContextMenu.querySelectorAll('.playlist_submenu');
    submenus.forEach(sub => {
        if (x + menuWidth + 215 > window.innerWidth) {
            sub.classList.add('open_left');
        } else {
            sub.classList.remove('open_left');
        }
    });

    playlistContextMenu.style.display = 'block';
    playlistContextMenu.classList.add('show');
}

function closePlaylistContextMenu() {
    if (playlistContextMenu) {
        playlistContextMenu.classList.remove('show');
        playlistContextMenu.style.display = 'none';
    }
    contextTargetAlbum = null;
    contextFolderId = null;
    contextPlaylistId = null;
}

if (menuRenamePlaylist) {
    menuRenamePlaylist.addEventListener('click', () => {
        const curFId = contextFolderId;
        const curPlId = contextPlaylistId;
        closePlaylistContextMenu();
        if (curFId) {
            openFolderModal('rename', curFId);
        } else if (curPlId) {
            openPlaylistModal('rename', curPlId);
        }
    });
}

if (menuDeletePlaylist) {
    menuDeletePlaylist.addEventListener('click', () => {
        const curFId = contextFolderId;
        const curPlId = contextPlaylistId;
        closePlaylistContextMenu();

        if (curFId) {
            const f = customFolders.find(x => x.id === curFId);
            const fName = f ? f.name : 'Pasta';
            customFolders = customFolders.filter(x => x.id !== curFId);
            saveCustomFolders(customFolders);
            renderCustomFoldersUI();
            showToast(`Pasta "${fName}" excluída.`);
            return;
        }

        if (!curPlId) return;

        const deletedId = curPlId;
        const pl = customPlaylists.find(p => p.id === deletedId);
        const plName = pl ? pl.name : 'Playlist';

        const itemElem = document.querySelector(`.custom_playlist_item[data-playlist-id="${deletedId}"]`);
        if (itemElem) {
            itemElem.classList.add('is_deleting');
        }

        if (activePlaylistId === deletedId) {
            activePlaylistId = null;
            returnToHomeView();
        }

        customPlaylists = customPlaylists.filter(p => p.id !== deletedId);
        saveCustomPlaylists(customPlaylists);

        setTimeout(() => {
            renderCustomPlaylistsUI();
        }, 220);

        showToast(`Playlist "${plName}" excluída.`);
    });
}

if (menuSidebarAddQueue) {
    menuSidebarAddQueue.addEventListener('click', (e) => {
        e.stopPropagation();
        const curAlbum = contextTargetAlbum;
        const curPlId = contextPlaylistId;
        closePlaylistContextMenu();

        if (curAlbum) {
            addAlbumToQueue(curAlbum.songs, curAlbum.name, true);
        } else if (curPlId === 'pl_liked') {
            const likedList = songs.filter(s => favorites.includes(s.id));
            if (likedList.length > 0) {
                addAlbumToQueue(likedList, 'Músicas Curtidas', true);
            } else {
                showToast('Nenhuma música curtida para adicionar à fila.');
            }
        } else if (curPlId) {
            const pl = customPlaylists.find(p => p.id === curPlId);
            const plSongs = songs.filter(s => pl && pl.songIds && pl.songIds.includes(s.id));
            if (plSongs.length > 0) {
                addAlbumToQueue(plSongs, pl.name, true);
            } else {
                showToast(`A playlist "${pl ? pl.name : ''}" está vazia.`);
            }
        }
    });
}

if (menuRemoveFromFolder) {
    menuRemoveFromFolder.addEventListener('click', (e) => {
        e.stopPropagation();
        const curAlbum = contextTargetAlbum;
        const curFId = contextFolderId;
        closePlaylistContextMenu();

        if (curAlbum && curFId) {
            const f = customFolders.find(x => x.id === curFId);
            if (f) {
                f.albumNames = f.albumNames.filter(n => n.toLowerCase() !== curAlbum.name.toLowerCase());
                saveCustomFolders(customFolders);
                renderCustomFoldersUI();
                showToast(`Álbum "${curAlbum.name}" removido da pasta "${f.name}".`);
            }
        }
    });
}

if (menuSidebarDuplicatePl) {
    menuSidebarDuplicatePl.addEventListener('click', (e) => {
        e.stopPropagation();
        closePlaylistContextMenu();
        if (!contextPlaylistId) return;
        const pl = customPlaylists.find(p => p.id === contextPlaylistId);
        if (pl) {
            const dup = {
                id: 'pl_' + Date.now(),
                name: `${pl.name} (Cópia)`,
                desc: pl.desc || '',
                cover: pl.cover || null,
                category: pl.category || '',
                songIds: [...(pl.songIds || [])]
            };
            customPlaylists.push(dup);
            saveCustomPlaylists(customPlaylists);
            renderCustomPlaylistsUI();
            showToast(`Playlist similar criada: "${dup.name}"`);
        }
    });
}

if (menuSidebarCreatePl) {
    menuSidebarCreatePl.addEventListener('click', (e) => {
        e.stopPropagation();
        closePlaylistContextMenu();
        openPlaylistModal('create');
    });
}

if (menuSidebarCreateFolder) {
    menuSidebarCreateFolder.addEventListener('click', (e) => {
        e.stopPropagation();
        const pendingAlb = contextTargetAlbum ? contextTargetAlbum.name : null;
        closePlaylistContextMenu();
        openFolderModal('create', null, pendingAlb);
    });
}

if (menuSidebarTogglePrivate) {
    menuSidebarTogglePrivate.addEventListener('click', (e) => {
        e.stopPropagation();
        closePlaylistContextMenu();
        if (!contextPlaylistId) return;
        const pl = customPlaylists.find(p => p.id === contextPlaylistId);
        if (pl) {
            pl.isPrivate = !pl.isPrivate;
            saveCustomPlaylists(customPlaylists);
            renderCustomPlaylistsUI();
            showToast(pl.isPrivate ? `Playlist "${pl.name}" agora é privada.` : `Playlist "${pl.name}" agora é pública.`);
        }
    });
}

if (menuSidebarPinPl) {
    menuSidebarPinPl.addEventListener('click', (e) => {
        e.stopPropagation();
        closePlaylistContextMenu();
        if (!contextPlaylistId) return;
        const pl = customPlaylists.find(p => p.id === contextPlaylistId);
        if (pl) {
            pl.isPinned = !pl.isPinned;
            saveCustomPlaylists(customPlaylists);
            renderCustomPlaylistsUI();
            showToast(pl.isPinned ? `Playlist "${pl.name}" fixada no topo da biblioteca!` : `Playlist "${pl.name}" desafixada.`);
        }
    });
}

if (sidebarSubmenuCopyLink) {
    sidebarSubmenuCopyLink.addEventListener('click', (e) => {
        e.stopPropagation();
        const curAlbum = contextTargetAlbum;
        const curPlId = contextPlaylistId;
        closePlaylistContextMenu();

        if (curAlbum) {
            const shareUrl = `${window.location.href.split('#')[0]}#album-${encodeURIComponent(curAlbum.name)}`;
            if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(() => {});
            showToast(`Link do álbum "${curAlbum.name}" copiado!`);
        } else if (curPlId) {
            const pl = customPlaylists.find(p => p.id === curPlId);
            const plName = pl ? pl.name : 'Playlist';
            const shareUrl = `${window.location.href.split('#')[0]}#playlist-${curPlId}`;
            if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(() => {});
            showToast(`Link da playlist "${plName}" copiado!`);
        }
    });
}

// Context Menu do Álbum / Música (Imagem 1)
const rightMoreOptsBtn = document.getElementById('right_more_opts');
const spotifyContextMenu = document.getElementById('spotify_context_menu');
const menuToggleLiked = document.getElementById('menu_toggle_liked');
const menuToggleLikedText = document.getElementById('menu_toggle_liked_text');
const menuAddToQueue = document.getElementById('menu_add_to_queue');
const menuGoToRadio = document.getElementById('menu_go_to_radio');
const menuGoToArtist = document.getElementById('menu_go_to_artist');
const menuGoToAlbum = document.getElementById('menu_go_to_album');
const menuShowCredits = document.getElementById('menu_show_credits');
const submenuCopyLink = document.getElementById('submenu_copy_link');
const submenuCopyEmbed = document.getElementById('submenu_copy_embed');
const playlistSearchFilter = document.getElementById('playlist_search_filter');

function openSpotifyContextMenu(e, targetSong = null) {
    if (!spotifyContextMenu) return;
    currentContextSong = targetSong || songs[currentIndex] || songs[0];
    if (!currentContextSong) return;

    closePlaylistContextMenu();

    const isFav = favorites.includes(currentContextSong.id);
    if (menuToggleLikedText) {
        menuToggleLikedText.textContent = isFav ? 'Remover das Músicas Curtidas' : 'Salvar em Músicas Curtidas';
    }

    if (playlistSearchFilter) playlistSearchFilter.value = '';
    renderPlaylistSubmenu('');

    let x = e.clientX;
    let y = e.clientY;

    if (e.target && e.target.closest('#right_more_opts')) {
        const rect = rightMoreOptsBtn.getBoundingClientRect();
        x = rect.left - 180;
        y = rect.bottom + 6;
    }

    const menuWidth = 230;
    const menuHeight = 310;
    if (x + menuWidth > window.innerWidth) x = Math.max(10, window.innerWidth - menuWidth - 10);
    if (y + menuHeight > window.innerHeight) y = Math.max(10, window.innerHeight - menuHeight - 10);

    spotifyContextMenu.style.left = `${Math.max(10, x)}px`;
    spotifyContextMenu.style.top = `${Math.max(10, y)}px`;

    const submenus = spotifyContextMenu.querySelectorAll('.playlist_submenu');
    submenus.forEach(sub => {
        if (x + menuWidth + 215 > window.innerWidth) {
            sub.classList.add('open_left');
        } else {
            sub.classList.remove('open_left');
        }
    });

    spotifyContextMenu.style.display = 'block';
    spotifyContextMenu.classList.add('show');
}

function closeSpotifyContextMenu() {
    if (spotifyContextMenu) {
        spotifyContextMenu.classList.remove('show');
        spotifyContextMenu.style.display = 'none';
    }
    currentContextSong = null;
}

if (rightMoreOptsBtn) {
    rightMoreOptsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (spotifyContextMenu && spotifyContextMenu.classList.contains('show')) {
            closeSpotifyContextMenu();
        } else {
            openSpotifyContextMenu(e);
        }
    });
}

if (menuToggleLiked) {
    menuToggleLiked.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        const curSong = currentContextSong || songs[currentIndex];
        if (!curSong) return;
        toggleFavorite(curSong.id);
        const isFav = favorites.includes(curSong.id);
        showToast(isFav ? `"${curSong.name}" salva em Músicas Curtidas!` : `"${curSong.name}" removida das Músicas Curtidas.`);
    });
}

if (menuAddToQueue) {
    menuAddToQueue.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        const curSong = currentContextSong || songs[currentIndex];
        if (curSong) {
            showToast(`"${curSong.name}" adicionada à fila de reprodução.`);
        }
    });
}

if (menuGoToRadio) {
    menuGoToRadio.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        const curSong = currentContextSong || songs[currentIndex];
        if (curSong) {
            const curIdx = songs.findIndex(s => s.id === curSong.id);
            if (curIdx !== -1) handleSongClick(curIdx, null);
            const radioTab = document.querySelector('.song_side nav ul li:nth-child(2)');
            if (radioTab) radioTab.click();
            showToast(`Iniciando rádio baseado em "${curSong.name}"...`);
        }
    });
}

if (menuGoToArtist) {
    menuGoToArtist.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        openArtistPage();
    });
}

if (menuGoToAlbum) {
    menuGoToAlbum.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        const curSong = currentContextSong || songs[currentIndex];
        if (curSong) {
            const foundPl = customPlaylists.find(p => p.songIds && p.songIds.includes(curSong.id));
            if (foundPl) {
                openPlaylistPage(foundPl.id);
            } else {
                openArtistPage();
            }
            showToast(`Exibindo álbum / coleção de "${curSong.name}"`);
        }
    });
}

if (menuShowCredits) {
    menuShowCredits.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        openSongCreditsModal(currentContextSong);
    });
}

if (submenuCopyLink) {
    submenuCopyLink.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        const curSong = currentContextSong || songs[currentIndex];
        const shareText = `Ouça "${curSong.name}" de ${curSong.subtitle} na playlist de Pedro Azevedo: ${window.location.href.split('#')[0]}#song-${curSong.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).catch(() => {});
        }
        showToast(`Link copiado: "${curSong.name}"`);
    });
}

if (submenuCopyEmbed) {
    submenuCopyEmbed.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSpotifyContextMenu();
        const curSong = currentContextSong || songs[currentIndex];
        const embedCode = `<iframe src="${window.location.href.split('#')[0]}?track=${curSong.id}" width="300" height="80" frameborder="0"></iframe>`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(embedCode).catch(() => {});
        }
        showToast(`Código de incorporação copiado!`);
    });
}

if (playlistSearchFilter) {
    playlistSearchFilter.addEventListener('input', (e) => {
        renderPlaylistSubmenu(e.target.value.trim());
    });
    playlistSearchFilter.addEventListener('click', (e) => e.stopPropagation());
    playlistSearchFilter.addEventListener('keydown', (e) => e.stopPropagation());
}

// Modal de Créditos da Música (Estilo Spotify)
const songCreditsModalOverlay = document.getElementById('song_credits_modal_overlay');
const creditsModalClose = document.getElementById('credits_modal_close');
const creditsModalOk = document.getElementById('credits_modal_ok');
const creditsTrackPoster = document.getElementById('credits_track_poster');
const creditsTrackTitle = document.getElementById('credits_track_title');
const creditsTrackArtist = document.getElementById('credits_track_artist');
const creditsPerformer = document.getElementById('credits_performer');

function openSongCreditsModal(song) {
    if (!songCreditsModalOverlay) return;
    const target = song || currentContextSong || songs[currentIndex] || songs[0];
    if (!target) return;

    if (creditsTrackPoster && target.poster) creditsTrackPoster.src = target.poster;
    if (creditsTrackTitle && target.name) creditsTrackTitle.textContent = target.name;
    if (creditsTrackArtist && target.subtitle) creditsTrackArtist.textContent = target.subtitle;
    if (creditsPerformer && target.subtitle) creditsPerformer.textContent = target.subtitle;

    songCreditsModalOverlay.classList.add('active');
}

function closeSongCreditsModal() {
    if (songCreditsModalOverlay) songCreditsModalOverlay.classList.remove('active');
}

if (creditsModalClose) creditsModalClose.addEventListener('click', closeSongCreditsModal);
if (creditsModalOk) creditsModalOk.addEventListener('click', closeSongCreditsModal);
if (songCreditsModalOverlay) {
    songCreditsModalOverlay.addEventListener('click', (e) => {
        if (e.target === songCreditsModalOverlay) closeSongCreditsModal();
    });
}

// Fechar context menus ao clicar com botão esquerdo fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('#spotify_context_menu, #right_more_opts')) {
        closeSpotifyContextMenu();
    }
    if (!e.target.closest('#playlist_context_menu, .pl_options_trigger')) {
        closePlaylistContextMenu();
    }
});

// Interceptor Global de Botão Direito (Substitui menu nativo do navegador e bloqueia inspeção)
const openSongContextMenu = openSpotifyContextMenu;

window.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Impede SEMPRE o menu padrão do navegador (sem inspecionar, sem salvar, sem printar)

    // 1. Clicou na navbar esquerda (biblioteca, pastas, playlists ou área da barra lateral)
    const sidebarEl = e.target.closest('#menu_side, .menu_side');
    if (sidebarEl) {
        // Clicou em um álbum dentro de uma pasta
        const albumNode = e.target.closest('.folder_album_node');
        if (albumNode) {
            const aName = albumNode.dataset.albumName;
            const fId = albumNode.dataset.folderId;
            const targetAlbum = getAlbumByName(aName);
            openPlaylistContextMenu(e, null, targetAlbum, fId);
            return;
        }

        // Clicou no cabeçalho de uma pasta
        const folderItem = e.target.closest('.folder_directory_item');
        if (folderItem && !e.target.closest('.folder_album_node')) {
            const fId = folderItem.dataset.folderId;
            openPlaylistContextMenu(e, null, null, fId);
            return;
        }

        // Clicou em playlist ou curtidas
        const playlistItem = e.target.closest('.custom_playlist_item, .liked_songs_item');
        if (playlistItem) {
            const plId = playlistItem.dataset.playlistId || (playlistItem.id === 'liked_songs_library_item' ? 'pl_liked' : null);
            openPlaylistContextMenu(e, plId, null, null);
            return;
        }

        // Clicou em uma faixa na lista da biblioteca lateral (#library_menu_song)
        const songItemInSidebar = e.target.closest('li.songItem');
        if (songItemInSidebar) {
            const targetAlbum = getAlbumFromCard(songItemInSidebar);
            openPlaylistContextMenu(e, null, targetAlbum, null);
            return;
        }

        // Clicou na área geral / vazia da navbar esquerda
        openPlaylistContextMenu(e, null, null, null);
        return;
    }

    // 2. Clicou nas fileiras de álbuns no centro (.popular_song, .popular_artists, .pop_song)
    // REQUISITO: reutilizar o pop up da navbar esquerda para as listas horizontais de álbuns
    const horizSection = e.target.closest('.popular_song, .popular_artists, .pop_song');
    if (horizSection) {
        const card = e.target.closest('.pop_song li, li.songItem, li');
        const targetAlbum = card ? getAlbumFromCard(card) : null;
        openPlaylistContextMenu(e, null, targetAlbum, null);
        return;
    }

    // 3. Clicou em uma faixa/música avulsa (ex: tabela do artista, player de baixo)
    const cardOrSong = e.target.closest('.artist_track_row, .master_play, .right_side');
    if (cardOrSong) {
        const songTarget = findSongFromElement(e.target);
        if (songTarget) {
            openSpotifyContextMenu(e, songTarget);
            return;
        }
    }

    // 4. Clicou fora dos álbuns na página normal
    // Fecha quaisquer menus customizados abertos e NÃO mostra o menu nativo do navegador
    closeSpotifyContextMenu();
    closePlaylistContextMenu();
}, { passive: false });

// Atualiza o clique nas tabs padrões para resetar a playlist customizada ativa
if (allPlaylistBtn) {
    allPlaylistBtn.addEventListener('click', () => {
        activePlaylistId = null;
        renderCustomPlaylistsUI();
    });
}
if (favPlaylistBtn) {
    favPlaylistBtn.addEventListener('click', () => {
        activePlaylistId = null;
        renderCustomPlaylistsUI();
    });
}

/* ===== Página do Artista SPA (Single Page Application) ===== */

const songSideContainer = document.querySelector('.song_side');
const homeView = document.getElementById('home_view');
const artistPageView = document.getElementById('artist_page_view');
const artistTracksTable = document.getElementById('artist_tracks_table');
const backToHomeBtn = document.getElementById('back_to_home_btn');
const artistBigPlayBtn = document.getElementById('artist_big_play_btn');
const artistPageFollowBtn = document.getElementById('artist_page_follow_btn');

const rightArtistPhoto = document.getElementById('right_artist_photo');
const rightArtistCardName = document.getElementById('right_artist_card_name');
const rightArtistCard = document.querySelector('.right_side .artist_card');

// Músicas do artista em ordem de relevância / streams
const artistRepertoire = [
    { id: 1, name: 'Final Lap', subtitle: 'Pedro Azevedo', poster: 'img/FinalLap.jpg', file: 'Music/FinalLap.mp3', plays: '1.842.920', dur: '3:12' },
    { id: 2, name: 'Signal', subtitle: 'Pedro Azevedo', poster: 'img/Signal.jpg', file: 'Music/Signal.mp3', plays: '1.421.818', dur: '3:13' },
    { id: 3, name: 'Tempest', subtitle: 'Pedro Azevedo', poster: 'img/Tempest.png', file: 'Music/Tempest.mp3', plays: '1.104.530', dur: '2:48' },
    { id: 4, name: 'Cavaquinho', subtitle: 'Pedro Azevedo', poster: 'img/Cavaquinho.jpg', file: 'Music/Cavaquinho.mp3', plays: '982.104', dur: '2:55' },
    { id: 5, name: 'Brisa do Mar', subtitle: 'Pedro Azevedo', poster: 'img/BrisaDoMar.jpg', file: 'Music/BrisaDoMar.mp3', plays: '854.290', dur: '3:05' },
    { id: 6, name: 'Areias do Destino', subtitle: 'Pedro Azevedo', poster: 'img/AreiasdoDestino.png', file: 'Music/AreiasdoDestino.mp3', plays: '781.420', dur: '2:40' },
    { id: 7, name: 'Golden Hour', subtitle: 'Pedro Azevedo', poster: 'img/GoldenHour.jpg', file: 'Music/GoldenHour.mp3', plays: '694.110', dur: '3:20' },
    { id: 8, name: 'Amber Skies', subtitle: 'Pedro Azevedo', poster: 'img/CoralSkies.jpg', file: 'Music/Amber Skies.mp3', plays: '612.300', dur: '3:15' },
    { id: 9, name: 'Selva de Concreto', subtitle: 'Pedro Azevedo', poster: 'img/SelvaDeConcreto.jpg', file: 'Music/SelvaDeConcreto.mp3', plays: '540.820', dur: '2:50' },
    { id: 10, name: '808s', subtitle: 'Pedro Azevedo', poster: 'img/808s.jpg', file: 'Music/808s.mp3', plays: '490.150', dur: '3:00' }
];

function renderArtistTracksTable() {
    if (!artistTracksTable) return;
    artistTracksTable.innerHTML = '';

    const curSong = songs[currentIndex];

    artistRepertoire.forEach((trk, idx) => {
        const row = document.createElement('div');
        row.className = 'artist_track_row';
        row.dataset.file = trk.file;
        row.dataset.name = trk.name;

        const isMatch = (curSong && curSong.name.toLowerCase() === trk.name.toLowerCase());
        if (isMatch) row.classList.add('active');

        const isFav = favorites.includes(trk.id);

        row.innerHTML = `
            <div class="track_rank">${idx + 1}</div>
            <div class="track_thumb">
                <img src="${trk.poster}" alt="${trk.name}">
            </div>
            <div class="track_info">
                <div class="track_title">${trk.name}</div>
            </div>
            <div class="track_plays">${trk.plays}</div>
            <div class="track_heart ${isFav ? 'filled' : ''}" title="Curtir">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    ${isFav 
                        ? '<path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>'
                        : '<path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>'}
                </svg>
            </div>
            <div class="track_duration">${trk.dur}</div>
        `;

        // Clique na linha toca ou duplique reinicia
        row.addEventListener('click', (e) => {
            if (e.target.closest('.track_heart')) return;
            const foundIdx = songs.findIndex(s => s.name.toLowerCase() === trk.name.toLowerCase());
            if (foundIdx > -1) {
                handleSongClick(foundIdx, e);
                renderArtistTracksTable();
            }
        });

        // Clique no coração da linha
        const heartEl = row.querySelector('.track_heart');
        heartEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const foundIdx = songs.findIndex(s => s.name.toLowerCase() === trk.name.toLowerCase());
            if (foundIdx > -1) {
                let sId = songs[foundIdx].id;
                let pos = favorites.indexOf(sId);
                if (pos > -1) favorites.splice(pos, 1);
                else favorites.push(sId);
                saveFavorites(favorites);
                updateHeartUI();
                renderArtistTracksTable();
            }
        });

        artistTracksTable.appendChild(row);
    });
}

function openArtistPage() {
    const plPageView = document.getElementById('playlist_page_view');
    if (plPageView) plPageView.style.display = 'none';
    const radPageView = document.getElementById('radio_page_view');
    if (radPageView) radPageView.style.display = 'none';
    const libPageView = document.getElementById('library_page_view');
    if (libPageView) libPageView.style.display = 'none';

    if (songSideContainer) {
        songSideContainer.classList.remove('playlist_mode');
        songSideContainer.classList.remove('radio_mode');
        songSideContainer.classList.remove('library_mode');
        songSideContainer.classList.add('artist_mode');
    }
    if (artistPageView) artistPageView.style.display = 'flex';
    setActiveNavTab('discover');

    renderArtistTracksTable();

    // Sincroniza status do botão seguir da página com o da sidebar
    if (artistPageFollowBtn && followArtistBtn) {
        if (followArtistBtn.classList.contains('following')) {
            artistPageFollowBtn.classList.add('following');
            artistPageFollowBtn.textContent = 'Seguindo';
        } else {
            artistPageFollowBtn.classList.remove('following');
            artistPageFollowBtn.textContent = 'Seguir';
        }
    }

    showToast('Visualizando página oficial de Pedro Azevedo');
}

function closeArtistPage() {
    returnToHomeView();
}

if (backToHomeBtn) backToHomeBtn.addEventListener('click', returnToHomeView);

const artistTopBackBtn = document.getElementById('artist_top_back_btn');
if (artistTopBackBtn) artistTopBackBtn.addEventListener('click', returnToHomeView);

const playlistBackBtn = document.getElementById('playlist_back_btn');
if (playlistBackBtn) playlistBackBtn.addEventListener('click', returnToHomeView);

const playlistActionBackBtn = document.getElementById('playlist_action_back_btn');
if (playlistActionBackBtn) playlistActionBackBtn.addEventListener('click', returnToHomeView);

// Aba Discover do menu superior também retorna para home
const discoverTab = document.querySelector('.song_side nav ul li:first-child');
if (discoverTab) {
    discoverTab.style.cursor = 'pointer';
    discoverTab.addEventListener('click', returnToHomeView);
}

// ===== Botão de Recolher / Expandir a Sidebar Lateral Esquerda =====
const menuSide = document.getElementById('menu_side');
const leftSidebarToggleBtn = document.getElementById('left_sidebar_toggle_btn');
const libraryTitleGroup = document.getElementById('library_title_group');
const quickCreatePlaylistBtn = document.getElementById('quick_create_playlist_btn');

function toggleSidebarCollapse() {
    if (!menuSide) return;
    menuSide.classList.toggle('collapsed');
    const isCollapsed = menuSide.classList.contains('collapsed');
    try {
        localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
    } catch(e) {}
}

if (leftSidebarToggleBtn) leftSidebarToggleBtn.addEventListener('click', toggleSidebarCollapse);
if (libraryTitleGroup) {
    libraryTitleGroup.addEventListener('click', () => {
        if (menuSide && menuSide.classList.contains('collapsed')) {
            toggleSidebarCollapse();
        }
    });
}
if (quickCreatePlaylistBtn) {
    quickCreatePlaylistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPlaylistModal('create');
    });
}

// Item Fixo: Músicas Curtidas
const likedSongsItem = document.getElementById('liked_songs_library_item');
if (likedSongsItem) {
    likedSongsItem.addEventListener('click', () => {
        openPlaylistPage('pl_liked');
    });
}

// Filtros Rápidos (Pills: Todas / Playlists / Músicas)
const libPills = document.querySelectorAll('.lib_pill');
const librarySongsWrapper = document.getElementById('library_songs_wrapper');
const customPlaylistsContainer = document.getElementById('custom_playlists_container');
const customFoldersContainer = document.getElementById('custom_folders_container');

libPills.forEach(pill => {
    pill.addEventListener('click', () => {
        libPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');

        if (filter === 'all') {
            if (likedSongsItem) likedSongsItem.style.display = 'flex';
            if (customFoldersContainer) customFoldersContainer.style.display = 'flex';
            if (customPlaylistsContainer) customPlaylistsContainer.style.display = 'flex';
            if (librarySongsWrapper) librarySongsWrapper.style.display = 'block';
        } else if (filter === 'playlists') {
            if (likedSongsItem) likedSongsItem.style.display = 'flex';
            if (customFoldersContainer) customFoldersContainer.style.display = 'flex';
            if (customPlaylistsContainer) customPlaylistsContainer.style.display = 'flex';
            if (librarySongsWrapper) librarySongsWrapper.style.display = 'none';
        } else if (filter === 'songs') {
            if (likedSongsItem) likedSongsItem.style.display = 'none';
            if (customFoldersContainer) customFoldersContainer.style.display = 'none';
            if (customPlaylistsContainer) customPlaylistsContainer.style.display = 'none';
            if (librarySongsWrapper) librarySongsWrapper.style.display = 'block';
        }
    });
});

// Botão grande Play da página de Playlist
const playlistBigPlayBtn = document.getElementById('playlist_big_play_btn');
if (playlistBigPlayBtn) {
    playlistBigPlayBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseMusic();
        } else {
            let plSongs = [];
            if (activePlaylistId === 'pl_liked') {
                plSongs = songs.filter(s => favorites.includes(s.id));
            } else if (activePlaylistId) {
                const pl = customPlaylists.find(p => p.id === activePlaylistId);
                if (pl) plSongs = songs.filter(s => pl.songIds && pl.songIds.includes(s.id));
            }
            if (plSongs.length > 0) {
                const firstSongIndex = songs.findIndex(s => s.id === plSongs[0].id);
                if (firstSongIndex !== -1) handleSongClick(firstSongIndex, null);
            } else {
                handleSongClick(0, null);
            }
        }
    });
}

// Triggers para abrir a página do artista
if (rightArtistPhoto) {
    rightArtistPhoto.style.cursor = 'pointer';
    rightArtistPhoto.addEventListener('click', openArtistPage);
}
if (rightArtistCardName) {
    rightArtistCardName.style.cursor = 'pointer';
    rightArtistCardName.addEventListener('click', openArtistPage);
}
const artistPhotoWrap = document.querySelector('.right_side .artist_photo_wrapper');
if (artistPhotoWrap) {
    artistPhotoWrap.style.cursor = 'pointer';
    artistPhotoWrap.addEventListener('click', openArtistPage);
}

// Botão grande de Play na página do artista
if (artistBigPlayBtn) {
    artistBigPlayBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseMusic();
        } else {
            // Toca a faixa #1 se não estiver tocando
            handleSongClick(0, null);
            renderArtistTracksTable();
        }
    });
}

// Botão Seguir da página do artista
if (artistPageFollowBtn) {
    artistPageFollowBtn.addEventListener('click', () => {
        if (artistPageFollowBtn.classList.contains('following')) {
            artistPageFollowBtn.classList.remove('following');
            artistPageFollowBtn.textContent = 'Seguir';
            if (followArtistBtn) {
                followArtistBtn.classList.remove('following');
                followArtistBtn.textContent = 'Seguir';
            }
            showToast('Deixou de seguir Pedro Azevedo.');
        } else {
            artistPageFollowBtn.classList.add('following');
            artistPageFollowBtn.textContent = 'Seguindo';
            if (followArtistBtn) {
                followArtistBtn.classList.add('following');
                followArtistBtn.textContent = 'Seguindo';
            }
            showToast('Você agora está seguindo Pedro Azevedo!');
        }
    });
}

// Atualiza a tabela do artista quando mudar a música
const originalSyncActive = syncActiveState;
syncActiveState = function() {
    originalSyncActive();
    if (artistPageView && artistPageView.style.display === 'flex') {
        renderArtistTracksTable();
    }
    const plPageView = document.getElementById('playlist_page_view');
    if (plPageView && plPageView.style.display === 'flex' && activePlaylistId) {
        let plSongs = (activePlaylistId === 'pl_liked') 
            ? songs.filter(s => favorites.includes(s.id))
            : songs.filter(s => {
                const pl = customPlaylists.find(p => p.id === activePlaylistId);
                return pl && pl.songIds && pl.songIds.includes(s.id);
            });
        renderPlaylistTracksTable(plSongs, activePlaylistId);
    }
};

// Inicializa a interface de playlists
renderCustomPlaylistsUI();


/* ===== MÓDULO DE RÁDIO ONLINE (RADIO BROWSER API INTEGRATION) ===== */

const RADIO_API_SERVERS = [
    'https://de1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://at1.api.radio-browser.info'
];
let currentRadioServerIdx = 0;

let radioSelectedCountry = 'all'; // 'all' (default: Brasil no topo) ou id do país selecionado
let radioSelectedGenre = 'all';     // 'all' (default: todos os gêneros) ou gênero específico
let radioSearchQuery = '';
let radioSearchTimeout = null;

// Rádios Curadas e Verificadas Organizadas por País (Prioridade: Brasil no Topo, seguido de EUA, UK, Portugal, Espanha, França, Alemanha, Itália, Canadá e Argentina)
const CURATED_RADIO_SECTIONS = [
    {
        "id": "brasil",
        "country": "Brasil",
        "flag": "🇧🇷",
        "code": "BR",
        "stations": [
            {
                "name": "Rádio Antena 1 94.7 FM",
                "stationuuid": "570cc99a-9159-4d91-9a8f-96ddb5b30797",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "adult,flashback",
                "bitrate": 96,
                "favicon": "https://img.radios.com.br/radio/lg/radio9505_1574106966.jpg",
                "url_resolved": "https://antenaone.crossradio.com.br/stream/1;",
                "url": "https://antenaone.crossradio.com.br/stream/1;",
                "color": "#1e3a8a"
            },
            {
                "name": "Rádio Mix 106.3 FM",
                "stationuuid": "901c92bd-a757-449a-b8ce-652b079fd38a",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "chr,pop-rock,youth",
                "bitrate": 64,
                "favicon": "https://img.radios.com.br/radio/lg/radio13955_1720711597.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SAOPAULOAAC.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SAOPAULOAAC.aac",
                "color": "#0369a1"
            },
            {
                "name": "Bossa Jazz Brasil",
                "stationuuid": "7ada8a81-5ae1-418c-8f18-51d2f38d86a4",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "bossa nova,jazz,mpb",
                "bitrate": 64,
                "favicon": "https://bossajazzbrasil.com/wp-content/uploads/2020/12/cropped-bjs-app-180x180.png",
                "url_resolved": "https://centova5.transmissaodigital.com:20104/live",
                "url": "https://centova5.transmissaodigital.com:20104/live",
                "color": "#0f766e"
            },
            {
                "name": "Rádio Saudade FM 99.7",
                "stationuuid": "5dcbb03d-423a-4f97-8af5-b95981094c69",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "adult,classic hits,flashback",
                "bitrate": 64,
                "favicon": "https://img.radios.com.br/radio/lg/radio8_1626274312.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/SAUDADE_FMAAC.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/SAUDADE_FMAAC.aac",
                "color": "#15803d"
            },
            {
                "name": "Antena 1 São Paulo, SP (ZYD823 94,7 MHz FM)",
                "stationuuid": "963fa65f-0601-11e8-ae97-52543be04c81",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "adult contemporary,jazz,pop",
                "bitrate": 96,
                "favicon": "",
                "url_resolved": "http://antena1.newradio.it/stream?ext=.mp3",
                "url": "http://antena1.newradio.it/stream?ext=.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "bandnews fm sp",
                "stationuuid": "4a17b7fa-42a0-4c32-bdc6-dc1c59066c96",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "news,news talk",
                "bitrate": 64,
                "favicon": "https://img.radios.com.br/radio/lg/radio24477_1579261235.jpg",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/BANDNEWSFM_SPAAC.m3u8",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/BANDNEWSFM_SPAAC.m3u8",
                "color": "#7c2d12"
            },
            {
                "name": "Rádio Jovem Pan 100.9 FM",
                "stationuuid": "8e9b5ba4-dcc1-4dad-8ddf-e7cc04c33a00",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "entertainment,journalism,music",
                "bitrate": 128,
                "favicon": "https://img.radios.com.br/radio/lg/radio8829_1708517690.png",
                "url_resolved": "https://stream.zeno.fm/c45wbq2us3buv",
                "url": "https://stream.zeno.fm/c45wbq2us3buv",
                "color": "#4338ca"
            },
            {
                "name": "Alpha FM 101.7 MHz (São Paulo",
                "stationuuid": "447a1a5f-aee6-4b21-b85f-10ceb1896ad3",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "light,misc,portuguese music",
                "bitrate": 128,
                "favicon": "https://cdn-profiles.tunein.com/s8129/images/logod.jpg",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALPHAFM_ADP.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALPHAFM_ADP.aac",
                "color": "#6b21a8"
            },
            {
                "name": "Rádio Itatiaia 95.7 FM",
                "stationuuid": "f66f08c3-1616-4dd6-a54f-75aa29aa8249",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "news,soccer,sports",
                "bitrate": 64,
                "favicon": "https://img.radios.com.br/radio/lg/radio14_1646746883.jpeg",
                "url_resolved": "https://8903.brasilstream.com.br/stream",
                "url": "https://8903.brasilstream.com.br/stream",
                "color": "#1e3a8a"
            },
            {
                "name": "Jovem Pan FM",
                "stationuuid": "bf64595a-eed4-49de-94e5-87c1bb813a74",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "chr,contemporary hits radio,dance",
                "bitrate": 128,
                "favicon": "https://jpimg.com.br/uploads/2024/02/avatar-florianopolis-rgb-500x500.png",
                "url_resolved": "https://live.paineldj.com.br/proxy/jfloripa?mp=/stream",
                "url": "https://live.paineldj.com.br/proxy/jfloripa?mp=/stream",
                "color": "#0369a1"
            },
            {
                "name": "Ouro Verde FM Easy 105.5",
                "stationuuid": "6116adf7-d0c7-49ca-91d9-c9e5553d250c",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "brasil,brazilian music,classic hits",
                "bitrate": 64,
                "favicon": "https://ouroverdefm.com.br/wp-content/uploads/2022/11/favicon-150x150.png",
                "url_resolved": "https://8522.brasilstream.com.br/stream",
                "url": "https://8522.brasilstream.com.br/stream",
                "color": "#0f766e"
            },
            {
                "name": "80 Hits Brasil",
                "stationuuid": "4c66701a-2486-421e-87c7-a53879b069c1",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "80's,80s,mpb",
                "bitrate": 96,
                "favicon": "https://i.ibb.co/5x1yHdR0/LOGO2025.png",
                "url_resolved": "https://stm5.painelcast.com:7662/stream",
                "url": "https://stm5.painelcast.com:7662/stream",
                "color": "#15803d"
            },
            {
                "name": "Sertaneja 106.7",
                "stationuuid": "00bc4f1d-050c-49ae-bc42-a8aaa5d0ff5b",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "country,sertanejo",
                "bitrate": 128,
                "favicon": "https://assets.clubefm.com.br/uploads/site/logo/2/106-sertaneja-4fff3e1f118ab621432fa4d74136e042e86b6eedbabf561ded0dfd61123d980e.png",
                "url_resolved": "https://sc4s.cdn.upx.com:8067/stream",
                "url": "https://sc4s.cdn.upx.com:8067/stream",
                "color": "#b91c1c"
            },
            {
                "name": "BR",
                "stationuuid": "195f2990-e0d3-4b34-8aab-5b173ddb6c6e",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "classic rock,hard rock,heavy metal",
                "bitrate": 128,
                "favicon": "https://cdn.onlineradiobox.com/img/l/5/94775.v6.png",
                "url_resolved": "https://stream.zeno.fm/nbq1aq62gd0uv",
                "url": "https://stream.zeno.fm/nbq1aq62gd0uv",
                "color": "#7c2d12"
            },
            {
                "name": "Antena 1 FM 94.7 São Paulo",
                "stationuuid": "531fced7-b22b-11e8-afe1-52543be04c81",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "adult contemporary,lite",
                "bitrate": 96,
                "favicon": "https://www.antena1.com.br/apple-touch-icon.png",
                "url_resolved": "http://antena1.newradio.it/stream",
                "url": "http://antena1.newradio.it/stream",
                "color": "#4338ca"
            },
            {
                "name": "Smooth Jazz Lounge",
                "stationuuid": "ef07dbb2-1176-4b09-bb87-9e841300c3cf",
                "country": "Brasil",
                "countrycode": "BR",
                "tags": "jazz,smooth jazz,smooth lounge",
                "bitrate": 128,
                "favicon": "https://www.vip-radios.fm/favicon.ico",
                "url_resolved": "https://radio4.vip-radios.fm:18060/stream-128kmp3-SmoothJazzLounge",
                "url": "https://radio4.vip-radios.fm:18060/stream-128kmp3-SmoothJazzLounge",
                "color": "#6b21a8"
            }
        ]
    },
    {
        "id": "estados_unidos",
        "country": "Estados Unidos",
        "flag": "🇺🇸",
        "code": "US",
        "stations": [
            {
                "name": "Classic Vinyl HD",
                "stationuuid": "d1a54d2e-623e-4970-ab11-35f7b56c5ec3",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "1930,1940,1950",
                "bitrate": 320,
                "favicon": "https://icecast.walmradio.com:8443/classic.jpg",
                "url_resolved": "https://icecast.walmradio.com:8443/classic",
                "url": "https://icecast.walmradio.com:8443/classic",
                "color": "#1e3a8a"
            },
            {
                "name": "101 SMOOTH JAZZ",
                "stationuuid": "d28420a4-eccf-47a2-ace1-088c7e7cb7e0",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "easy listening,jazz,smooth jazz",
                "bitrate": 192,
                "favicon": "http://101smoothjazz.com/favicon.ico",
                "url_resolved": "http://jking.cdnstream1.com/b22139_128mp3",
                "url": "http://www.101smoothjazz.com/101-smoothjazz.m3u",
                "color": "#0369a1"
            },
            {
                "name": "Radio Paradise Main Mix (EU) 320k AAC",
                "stationuuid": "9617a958-0601-11e8-ae97-52543be04c81",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "california,eclectic,free",
                "bitrate": 320,
                "favicon": "https://radioparadise.com/apple-touch-icon.png",
                "url_resolved": "http://stream-uk1.radioparadise.com/aac-320",
                "url": "http://stream-uk1.radioparadise.com/aac-320",
                "color": "#0f766e"
            },
            {
                "name": "102.7 KIIS FM",
                "stationuuid": "c76686ca-a8b9-4db9-9839-1470c9599623",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "pop,top 40",
                "bitrate": 128,
                "favicon": "https://i.iheart.com/v3/re/assets.brands/2ebe753539305728784b0f3b178eae45?ops=new(),flood(%22white%22),swap(),merge(%22over%22),gravity(%22center%22),contain(167,167),quality(80),format(%22png%22)",
                "url_resolved": "https://stream.revma.ihrhls.com/zc185",
                "url": "https://stream.revma.ihrhls.com/zc185",
                "color": "#15803d"
            },
            {
                "name": "CNN",
                "stationuuid": "33178054-56cd-449c-8cf7-412cc7be936a",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "news",
                "bitrate": 96,
                "favicon": "https://www.cnn.com/media/sites/cnn/favicon.ico",
                "url_resolved": "https://tunein.cdnstream1.com/2868_96.mp3",
                "url": "https://tunein.cdnstream1.com/2868_96.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "SomaFM Groove Salad (128k MP3)",
                "stationuuid": "960cf833-0601-11e8-ae97-52543be04c81",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "ambient,chillout,downtempo",
                "bitrate": 128,
                "favicon": "https://somafm.com/img3/groovesalad-400.jpg",
                "url_resolved": "https://ice5.somafm.com/groovesalad-128-mp3",
                "url": "https://somafm.com/groovesalad.pls",
                "color": "#7c2d12"
            },
            {
                "name": "Fox News Radio",
                "stationuuid": "510aeeac-e7a0-41c2-aea2-e572e811ffe7",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "news",
                "bitrate": 64,
                "favicon": "https://static.foxnews.com/radio.foxnews.com/content/uploads/2017/10/default_logo-150x150.png",
                "url_resolved": "https://live.amperwave.net/direct/foxnewsradio-foxnewsradioaac-imc?source=fnr.web",
                "url": "https://live.amperwave.net/direct/foxnewsradio-foxnewsradioaac-imc?source=fnr.web",
                "color": "#4338ca"
            },
            {
                "name": ".977 80s",
                "stationuuid": "961b7325-0601-11e8-ae97-52543be04c81",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "80s",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "http://26433.live.streamtheworld.com:3690/977_80_SC",
                "url": "http://playerservices.streamtheworld.com/pls/977_80.pls",
                "color": "#6b21a8"
            },
            {
                "name": "Ambient Sleeping Pill",
                "stationuuid": "961fa288-0601-11e8-ae97-52543be04c81",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "ambient,meditation,sleep",
                "bitrate": 256,
                "favicon": "",
                "url_resolved": "http://radio.stereoscenic.com/asp-h",
                "url": "http://radio.stereoscenic.com/asp-h",
                "color": "#1e3a8a"
            },
            {
                "name": "NPR 24 Hour Program Stream",
                "stationuuid": "7ba4c184-fc2b-11e9-bbf2-52543be04c81",
                "country": "Estados Unidos",
                "countrycode": "US",
                "tags": "news,news talk,political talk",
                "bitrate": 96,
                "favicon": "https://static-assets.npr.org/static/images/favicon/favicon-96x96.png",
                "url_resolved": "http://npr-ice.streamguys1.com/live.mp3",
                "url": "http://npr-ice.streamguys1.com/live.mp3",
                "color": "#0369a1"
            }
        ]
    },
    {
        "id": "reino_unido",
        "country": "Reino Unido",
        "flag": "🇬🇧",
        "code": "GB",
        "stations": [
            {
                "name": "BBC World Service",
                "stationuuid": "98adecf7-2683-4408-9be7-02d3f9098eb8",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "news,talk",
                "bitrate": 56,
                "favicon": "http://cdn-profiles.tunein.com/s24948/images/logoq.jpg?t=1",
                "url_resolved": "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
                "url": "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
                "color": "#0f766e"
            },
            {
                "name": "Heart 80s",
                "stationuuid": "c4077677-dc2f-11e9-a8ba-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "80s,national,pop",
                "bitrate": 128,
                "favicon": "https://www.heart.co.uk/assets_v4r/heart/img/favicon-196x196.png",
                "url_resolved": "https://media-ssl.musicradio.com/Heart80sMP3",
                "url": "https://media-ssl.musicradio.com/Heart80sMP3",
                "color": "#15803d"
            },
            {
                "name": "LBC UK",
                "stationuuid": "6efe216d-bf7e-11e9-8502-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "news talk,talk",
                "bitrate": 48,
                "favicon": "https://cdn-radiotime-logos.tunein.com/s220687q.png",
                "url_resolved": "http://media-ice.musicradio.com/LBCUK",
                "url": "http://media-ice.musicradio.com/LBCUK",
                "color": "#b91c1c"
            },
            {
                "name": "CAPITAL",
                "stationuuid": "4ad5bdc7-01e5-47c9-a1f9-751671b4707e",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "capital,capital fm,contemporary hits radio",
                "bitrate": 48,
                "favicon": "https://cdn-profiles.tunein.com/s241396/images/logod.jpg",
                "url_resolved": "https://media-ssl.musicradio.com/CapitalUK",
                "url": "https://media-ssl.musicradio.com/CapitalUK",
                "color": "#7c2d12"
            },
            {
                "name": "BBC Radio 4 (128k)",
                "stationuuid": "98137c2d-ce68-4e33-8cb7-ddf3692ecc9d",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "comedy,drama,news",
                "bitrate": 128,
                "favicon": "https://cdn-radiotime-logos.tunein.com/s25419q.png",
                "url_resolved": "http://as-hls-ww-live.akamaized.net/pool_55057080/live/ww/bbc_radio_fourfm/bbc_radio_fourfm.isml/bbc_radio_fourfm-audio%3d128000.norewind.m3u8",
                "url": "http://as-hls-ww-live.akamaized.net/pool_55057080/live/ww/bbc_radio_fourfm/bbc_radio_fourfm.isml/bbc_radio_fourfm-audio%3d128000.norewind.m3u8",
                "color": "#4338ca"
            },
            {
                "name": "Classic FM UK",
                "stationuuid": "96063f25-0601-11e8-ae97-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "classical",
                "bitrate": 128,
                "favicon": "http://www.classicfm.com/assets_v4r/classic/img/favicon-196x196.png",
                "url_resolved": "http://ice-the.musicradio.com/ClassicFMMP3",
                "url": "http://ice-the.musicradio.com/ClassicFMMP3",
                "color": "#6b21a8"
            },
            {
                "name": "BBC Radio 2 (128k)",
                "stationuuid": "3606ef8c-cd58-4440-8c47-dbf1e0cacdac",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "adult contemporary",
                "bitrate": 128,
                "favicon": "https://cdn-radiotime-logos.tunein.com/s24940q.png",
                "url_resolved": "http://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio%3d128000.norewind.m3u8",
                "url": "http://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio%3d128000.norewind.m3u8",
                "color": "#1e3a8a"
            },
            {
                "name": "BBC Radio 1",
                "stationuuid": "fdbdc2b0-c184-437b-8643-9a5bfa45c253",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "hits,pop,ao vivo",
                "bitrate": 101,
                "favicon": "https://cdn-radiotime-logos.tunein.com/s24939q.png",
                "url_resolved": "http://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/pc_hd_abr_v2/ak/bbc_radio_one.m3u8",
                "url": "http://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/pc_hd_abr_v2/ak/bbc_radio_one.m3u8",
                "color": "#0369a1"
            },
            {
                "name": "Gold",
                "stationuuid": "0a1e0bb0-dc37-11e9-a8ba-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "classic hits,national,oldies",
                "bitrate": 128,
                "favicon": "https://www.mygoldmusic.co.uk/assets_v4r/gold/img/favicon-196x196.png",
                "url_resolved": "https://media-ssl.musicradio.com/GoldMP3",
                "url": "https://media-ssl.musicradio.com/GoldMP3",
                "color": "#0f766e"
            },
            {
                "name": "Heart London 106.2",
                "stationuuid": "9608ade8-0601-11e8-ae97-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "commercial,hot adult contemporary,london",
                "bitrate": 128,
                "favicon": "https://cdn-profiles.tunein.com/s2846/images/logoq.jpg",
                "url_resolved": "http://ice-sov.musicradio.com/HeartLondonMP3",
                "url": "http://ice-sov.musicradio.com/HeartLondonMP3",
                "color": "#15803d"
            },
            {
                "name": "Capital FM London",
                "stationuuid": "96200095-0601-11e8-ae97-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "pop",
                "bitrate": 128,
                "favicon": "http://assets6.capitalfm.com/2016/11/capital-3d-network-logo-large-canvas-1458228638-herowidev4-0.jpg",
                "url_resolved": "http://media-ice.musicradio.com/CapitalMP3",
                "url": "http://media-ice.musicradio.com/CapitalMP3",
                "color": "#b91c1c"
            },
            {
                "name": "Radio Caroline",
                "stationuuid": "9606ceae-0601-11e8-ae97-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "country,pop,rock",
                "bitrate": 128,
                "favicon": "http://www.radiocaroline.co.uk/favicon.ico",
                "url_resolved": "http://78.129.202.200:8040/;",
                "url": "http://78.129.202.200:8040/;",
                "color": "#7c2d12"
            },
            {
                "name": "BBC Radio 6 Music",
                "stationuuid": "1c6dcd6f-88c6-4fd4-8191-078435168e85",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "alternative,blues,dance",
                "bitrate": 128,
                "favicon": "https://de8as167a043l.cloudfront.net/styles/images/logosplus/120x120xBBCR6.png",
                "url_resolved": "http://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio%3d320000.norewind.m3u8",
                "url": "http://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio%3d320000.norewind.m3u8",
                "color": "#4338ca"
            },
            {
                "name": "Smooth Radio",
                "stationuuid": "962b27a3-0601-11e8-ae97-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "easy listening,smooth,soft music",
                "bitrate": 48,
                "favicon": "http://www.smoothradio.com/assets_v4r/smooth/img/favicon-196x196.png",
                "url_resolved": "http://media-the.musicradio.com/SmoothEastMids",
                "url": "http://media-the.musicradio.com/SmoothEastMids",
                "color": "#6b21a8"
            },
            {
                "name": "Heart 90s",
                "stationuuid": "52bb00fe-dc31-11e9-a8ba-52543be04c81",
                "country": "Reino Unido",
                "countrycode": "GB",
                "tags": "90s,national,pop",
                "bitrate": 128,
                "favicon": "https://www.heart.co.uk/assets_v4r/heart/img/favicon-196x196.png",
                "url_resolved": "https://media-ssl.musicradio.com/Heart90sMP3",
                "url": "https://media-ssl.musicradio.com/Heart90sMP3",
                "color": "#1e3a8a"
            }
        ]
    },
    {
        "id": "portugal",
        "country": "Portugal",
        "flag": "🇵🇹",
        "code": "PT",
        "stations": [
            {
                "name": "Antena 1 (Portugal)",
                "stationuuid": "dbc018ae-1848-4f26-a677-367011a1f4b2",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "portugal,portuguese,sports",
                "bitrate": 166,
                "favicon": "https://www.celsoazevedo.com/files/2022/antena-1.png",
                "url_resolved": "http://streaming-live-app.rtp.pt/liveradio/antena180a/playlist.m3u8",
                "url": "http://streaming-live-app.rtp.pt/liveradio/antena180a/playlist.m3u8",
                "color": "#0369a1"
            },
            {
                "name": "RFM",
                "stationuuid": "856155ee-f434-4a45-9225-391c0e618b8b",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "64kbps",
                "bitrate": 64,
                "favicon": "https://rfmsite-images.azureedge.net/icons/touch-icon-iphone-retina.png",
                "url_resolved": "https://23603.live.streamtheworld.com/RFMAAC.aac",
                "url": "https://23603.live.streamtheworld.com/RFMAAC.aac",
                "color": "#0f766e"
            },
            {
                "name": "Rádio Comercial",
                "stationuuid": "2b501db4-e4b6-4106-9670-9875536f70f1",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "contemporary,dance,pop",
                "bitrate": 127,
                "favicon": "https://static2.mytuner.mobi/media/tvos_radios/drkZNBUn6W.png",
                "url_resolved": "https://stream-hls.bauermedia.pt/comercial.aac/playlist.m3u8",
                "url": "https://stream-hls.bauermedia.pt/comercial.aac/playlist.m3u8",
                "color": "#15803d"
            },
            {
                "name": "TSF Rádio Notícias",
                "stationuuid": "cc461784-3150-4a34-81c5-2116fe024740",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "desporto,futebol,notícias",
                "bitrate": 128,
                "favicon": "https://www.celsoazevedo.com/files/2024/tsf.png",
                "url_resolved": "https://directo.tsf.pt/tsfdirecto.mp3",
                "url": "https://directo.tsf.pt/tsfdirecto.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "M80 Rádio – 80s",
                "stationuuid": "7bc1f66f-412d-484b-82eb-b7b1c4575faa",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "80s,pop,romantic",
                "bitrate": 128,
                "favicon": "http://webradiodirectory.com/wp-content/uploads/2021/01/cc9443f16e2af31ba205ac82214760c9.jpg",
                "url_resolved": "https://stream-icy.bauermedia.pt/m8080.aac",
                "url": "https://stream-icy.bauermedia.pt/m8080.aac",
                "color": "#7c2d12"
            },
            {
                "name": "Rádio Observador",
                "stationuuid": "e822ed30-1b14-4a90-906f-a1267e3d761d",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "https://observador.pt/wp-content/themes/observador-child/assets/build/img/favicon.ico",
                "url_resolved": "http://195.23.85.126:8455/stream",
                "url": "http://195.23.85.126:8455/listen.pls?sid=1",
                "color": "#4338ca"
            },
            {
                "name": "Rádio Renascença",
                "stationuuid": "9618e7a0-0601-11e8-ae97-52543be04c81",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "national news",
                "bitrate": 64,
                "favicon": "https://rrsite-images.azureedge.net/favicon/apple-touch-icon.png",
                "url_resolved": "http://29345.live.streamtheworld.com/RADIO_RENASCENCA_SC",
                "url": "http://provisioning.streamtheworld.com/pls/RADIO_RENASCENCA.pls",
                "color": "#6b21a8"
            },
            {
                "name": "Radio Comercial Portugal",
                "stationuuid": "44cb20dc-e9ac-41ef-a4fe-153d48fcdd96",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "https://stream-icy.bauermedia.pt/comercial.mp3",
                "url": "https://stream-icy.bauermedia.pt/comercial.mp3",
                "color": "#1e3a8a"
            },
            {
                "name": "M80 rádio",
                "stationuuid": "c6ed0be5-21dd-4b03-aa18-0dbc9a0c3f87",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "2000's,70's,80's",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "http://stream-icy.bauermedia.pt/m80.mp3",
                "url": "http://stream-icy.bauermedia.pt/m80.mp3",
                "color": "#0369a1"
            },
            {
                "name": "Mega Hits",
                "stationuuid": "9618e93b-0601-11e8-ae97-52543be04c81",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "pop,top 40",
                "bitrate": 64,
                "favicon": "http://cdn-radiotime-logos.tunein.com/s6745q.png",
                "url_resolved": "http://25583.live.streamtheworld.com/MEGA_HITS_SC",
                "url": "http://provisioning.streamtheworld.com/pls/mega_hits.pls",
                "color": "#0f766e"
            },
            {
                "name": "Antena 1 (Portugal)",
                "stationuuid": "909735da-70e8-4527-b771-52793d9f0086",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "live sports,musica,talk & speech",
                "bitrate": 173,
                "favicon": "https://cdn-images.rtp.pt/play/images/apple-touch-icon.png-120x120.png",
                "url_resolved": "https://streaming-live.rtp.pt/liveradio/antena180a/playlist.m3u8",
                "url": "https://streaming-live.rtp.pt/liveradio/antena180a/playlist.m3u8",
                "color": "#15803d"
            },
            {
                "name": "TOP 80",
                "stationuuid": "89bd8b04-11c9-42bf-a374-e5eb3b7b8f22",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "hits,pop,ao vivo",
                "bitrate": 320,
                "favicon": "https://www.top80.fm/wp-content/uploads/2023/03/cropped-ic_launcher_top80-180x180.png",
                "url_resolved": "http://live.top80.fm:8086/",
                "url": "http://live.top80.fm:8086/",
                "color": "#b91c1c"
            },
            {
                "name": "Rap/Hip Hop",
                "stationuuid": "2a0fb11e-f91a-4553-bfff-3861a1de8fb9",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "hip hop,portugal,tuga",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "http://185.32.188.17:8097/stream",
                "url": "http://185.32.188.17:8097/stream",
                "color": "#7c2d12"
            },
            {
                "name": "4Drive Jazz",
                "stationuuid": "f86c489e-7e21-11e9-aa30-52543be04c81",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "jazz fusion,nu-jazz,smooth jazz",
                "bitrate": 192,
                "favicon": "https://www.wix.com/favicon.ico",
                "url_resolved": "http://radio.streemlion.com:1150/stream",
                "url": "http://radio.streemlion.com:1150/stream",
                "color": "#4338ca"
            },
            {
                "name": "Radio Commercial",
                "stationuuid": "ac843a5b-f7ef-4b89-9491-590bdaf20b4c",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "pop",
                "bitrate": 128,
                "favicon": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Logo_Radio_Comercial.jpg",
                "url_resolved": "https://stream-icy.bauermedia.pt/comercial.mp3",
                "url": "https://stream-icy.bauermedia.pt/comercial.mp3",
                "color": "#6b21a8"
            },
            {
                "name": "M80 Rádio – Ballads",
                "stationuuid": "a08d74ca-2172-447a-941a-b5c5c20afdd6",
                "country": "Portugal",
                "countrycode": "PT",
                "tags": "70s,80s,90s",
                "bitrate": 127,
                "favicon": "",
                "url_resolved": "https://stream-icy.bauermedia.pt/m80ballads.aac",
                "url": "https://stream-icy.bauermedia.pt/m80ballads.aac",
                "color": "#1e3a8a"
            }
        ]
    },
    {
        "id": "espanha",
        "country": "Espanha",
        "flag": "🇪🇸",
        "code": "ES",
        "stations": [
            {
                "name": "Cadena SER España",
                "stationuuid": "692a3b69-0f68-11ea-a87e-52543be04c81",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "cultural news,live,news",
                "bitrate": 128,
                "favicon": "https://cadenaser00.epimg.net/favicon.png",
                "url_resolved": "http://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3",
                "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3",
                "color": "#0369a1"
            },
            {
                "name": "Cadena 100",
                "stationuuid": "960c37c6-0601-11e8-ae97-52543be04c81",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "music",
                "bitrate": 128,
                "favicon": "https://www.cadena100.es/estaticos/apple-touch-icon-192x192.png",
                "url_resolved": "http://cadena100-streamers-mp3.flumotion.com/cope/cadena100.mp3",
                "url": "http://cadena100-streamers-mp3.flumotion.com/cope/cadena100.mp3",
                "color": "#0f766e"
            },
            {
                "name": "LOS 40 Principales España",
                "stationuuid": "b81c57c3-eb05-47ac-a0ea-eb01a6960cc4",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "music,pop,top 40",
                "bitrate": 128,
                "favicon": "https://los40es00.epimg.net/iconos/v1.x/v1.0/touch-apple.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3",
                "color": "#15803d"
            },
            {
                "name": "COPE + Sevilla",
                "stationuuid": "09f4d466-1ab2-4b61-a180-96409adc5d80",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "local news",
                "bitrate": 96,
                "favicon": "",
                "url_resolved": "http://wecast09-h-cloud.flumotion.com/copesedes/sevilla-mas.mp3",
                "url": "http://wecast09-h-cloud.flumotion.com/copesedes/sevilla-mas.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "RAC1",
                "stationuuid": "38a33fc0-be05-4c98-8c6a-ba3869575bc1",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "culture,humour,local news",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/RAC_1.mp3",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/RAC_1.mp3",
                "color": "#7c2d12"
            },
            {
                "name": "Cope Madrid FM",
                "stationuuid": "00526b4f-47a3-432d-baca-f914c1273f0b",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "hits,pop,ao vivo",
                "bitrate": 64,
                "favicon": "https://static.mytuner.mobi/media/tvos_radios/871/cope-madrid.51d780e3.png",
                "url_resolved": "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3",
                "url": "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3",
                "color": "#4338ca"
            },
            {
                "name": "Cadena Dial",
                "stationuuid": "84c6f3cc-3c66-415d-aff5-050b5f330adc",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "música en español",
                "bitrate": 128,
                "favicon": "https://www.cadenadial.com/wp-content/uploads/2024/03/cropped-512x512_favicon_dial-180x180.png",
                "url_resolved": "http://playerservices.streamtheworld.com/api/livestream-redirect/CADENADIAL.mp3",
                "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/CADENADIAL.mp3",
                "color": "#6b21a8"
            },
            {
                "name": "Radio Nacional de España",
                "stationuuid": "5d6b5573-d661-477a-82fc-1d0d03799679",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "news,talk",
                "bitrate": 128,
                "favicon": "https://img2.rtve.es/css//rtve.2021/i/rtve-logos/logos_cadenas/radio-5_color.svg",
                "url_resolved": "https://d131.rndfnk.com/star/crtve/rne5/main/mp3/128/stream.mp3?aggregator=tunein&cid=01GEP4MW5CAHPYP1EXHVKWFJ8W&sid=2OeE42hivuba6dTGvjnMGjKByQe&token=cdczXcnimVx4AY4iamqYbTMdu3cK7oBxmS2UQN9cWc0&tvf=pdPcDBxuVxdkMTMxLnJuZGZuay5jb20",
                "url": "https://d131.rndfnk.com/star/crtve/rne5/main/mp3/128/stream.mp3?aggregator=tunein&cid=01GEP4MW5CAHPYP1EXHVKWFJ8W&sid=2OeE42hivuba6dTGvjnMGjKByQe&token=cdczXcnimVx4AY4iamqYbTMdu3cK7oBxmS2UQN9cWc0&tvf=pdPcDBxuVxdkMTMxLnJuZGZuay5jb20",
                "color": "#1e3a8a"
            },
            {
                "name": "Rock FM",
                "stationuuid": "9649dec5-0601-11e8-ae97-52543be04c81",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "hits,pop,ao vivo",
                "bitrate": 96,
                "favicon": "https://www.rockfm.fm/estaticos/apple-touch-icon-192x192.png",
                "url_resolved": "http://flucast34-h-cloud.flumotion.com/cope/rockfm-low.mp3",
                "url": "http://rockfm.cope.stream.flumotion.com/cope/rockfm-low.mp3.m3u",
                "color": "#0369a1"
            },
            {
                "name": "Los 40 Urban",
                "stationuuid": "8cc2da8b-ae85-4e37-9027-9ad765a1ea7a",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "dance,music,pop",
                "bitrate": 128,
                "favicon": "https://los40es00.epimg.net/iconos/v1.x/v1.0/promos/promo_og_los40.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_URBAN.mp3",
                "color": "#0f766e"
            },
            {
                "name": "COPE Málaga",
                "stationuuid": "9584da46-3ab4-11e9-9b4e-52543be04c81",
                "country": "Espanha",
                "countrycode": "ES",
                "tags": "hits,pop,ao vivo",
                "bitrate": 96,
                "favicon": "https://www.cope.es/favicon/cope/apple-touch-icon-192x192.png",
                "url_resolved": "http://flucast16-h-cloud.flumotion.com/cope/net1.mp3",
                "url": "http://net1.cope.stream.flumotion.com/cope/net1.mp3.m3u",
                "color": "#15803d"
            }
        ]
    },
    {
        "id": "franca",
        "country": "França",
        "flag": "🇫🇷",
        "code": "FR",
        "stations": [
            {
                "name": "RTL",
                "stationuuid": "042d3140-227c-4fac-9387-4903b692d5f2",
                "country": "França",
                "countrycode": "FR",
                "tags": "généraliste",
                "bitrate": 64,
                "favicon": "https://duckduckgo.com/i/035a5e15d396c67a.png",
                "url_resolved": "https://live.m6radio.quortex.io/webM89Hc99XApzgfhXNX8ASN5/grouprtl/national/short/audio-64000/index.m3u8",
                "url": "https://live.m6radio.quortex.io/webM89Hc99XApzgfhXNX8ASN5/grouprtl/national/short/audio-64000/index.m3u8",
                "color": "#b91c1c"
            },
            {
                "name": "France Info",
                "stationuuid": "1cfb151d-a341-11e9-a787-52543be04c81",
                "country": "França",
                "countrycode": "FR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "https://www.francetvinfo.fr/assets/common/images/pwa/ios/120-5487caf3.png",
                "url_resolved": "http://direct.franceinfo.fr/live/franceinfo-midfi.mp3",
                "url": "http://direct.franceinfo.fr/live/franceinfo-midfi.mp3",
                "color": "#7c2d12"
            },
            {
                "name": "RMC FR",
                "stationuuid": "7a3a3989-8f26-44f7-9ae5-fa91e5cf4f9d",
                "country": "França",
                "countrycode": "FR",
                "tags": "france,info,sport",
                "bitrate": 128,
                "favicon": "https://i1.wp.com/www.mediasportif.fr/wp-content/uploads/2014/05/Radio-RMC.jpg",
                "url_resolved": "https://audio.bfmtv.com/rmcradio_128.mp3",
                "url": "https://audio.bfmtv.com/rmcradio_128.mp3",
                "color": "#4338ca"
            },
            {
                "name": "Europe 1",
                "stationuuid": "dfcef843-6bf9-40f6-b3fe-2b224df86e48",
                "country": "França",
                "countrycode": "FR",
                "tags": "aac,news,talk",
                "bitrate": 128,
                "favicon": "https://www.europe1.fr/build/e1/images/favicon-120x120.png",
                "url_resolved": "https://stream.europe1.fr/europe1.aac",
                "url": "https://stream.europe1.fr/europe1.aac",
                "color": "#6b21a8"
            },
            {
                "name": "France Inter",
                "stationuuid": "33960c43-0464-44b4-abfa-73591ebf647f",
                "country": "França",
                "countrycode": "FR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/France_Inter_logo_2021.svg/1200px-France_Inter_logo_2021.svg.png",
                "url_resolved": "https://stream.radiofrance.fr/franceinter/franceinter_hifi.m3u8?id=radiofrance",
                "url": "https://stream.radiofrance.fr/franceinter/franceinter_hifi.m3u8?id=radiofrance",
                "color": "#1e3a8a"
            },
            {
                "name": "Nostalgie HQ",
                "stationuuid": "d39ab442-6c34-4097-afd0-e298ac21e50c",
                "country": "França",
                "countrycode": "FR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 320,
                "favicon": "https://img.nrj.fr/J6jlakQsQ2siRzCzCI_2IDCQj1E=/80x80/https%3A%2F%2Fplayers.nrjaudio.fm%2Flive-metadata%2Fplayer%2Fimg%2Fplayer-files%2Fnosta%2Flogos%2F640x640%2FP_Nostalgie_Premium_Logo_2023.png",
                "url_resolved": "https://streaming.nrjaudio.fm/oua8a3w2dqao?origine=playernostalgie&aw_0_req.userConsentV2=&aw_0_1st.station=",
                "url": "https://streaming.nrjaudio.fm/oua8a3w2dqao?origine=playernostalgie&aw_0_req.userConsentV2=&aw_0_1st.station=",
                "color": "#0369a1"
            },
            {
                "name": "FUN Radio",
                "stationuuid": "9f756e2d-8e9b-45f5-8fc1-61573e23036b",
                "country": "França",
                "countrycode": "FR",
                "tags": "dance,electro,latino",
                "bitrate": 128,
                "favicon": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Logo_Fun_Radio_%282021%29.svg/langfr-1280px-Logo_Fun_Radio_%282021%29.svg.png",
                "url_resolved": "http://icecast.funradio.fr/fun-1-44-128",
                "url": "http://icecast.funradio.fr/fun-1-44-128",
                "color": "#0f766e"
            },
            {
                "name": "RFM",
                "stationuuid": "2dffb353-5341-4438-b67b-83de8c3efbab",
                "country": "França",
                "countrycode": "FR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "http://cdn-rfm.lanmedia.fr/apple-touch-icon-120x120.png",
                "url_resolved": "http://stream.rfm.fr/rfm.mp3",
                "url": "http://stream.rfm.fr/rfm.mp3",
                "color": "#15803d"
            },
            {
                "name": "Skyrock",
                "stationuuid": "01b61e49-18bd-486d-b0e1-cb51cbaf9a6d",
                "country": "França",
                "countrycode": "FR",
                "tags": "rap",
                "bitrate": 128,
                "favicon": "https://play-lh.googleusercontent.com/dPiQ01OUKZVfRZUbbb-EVK5g9miS_K-xrxHgmBbynGG-GQ53yt3GzFKr0zUTnb-xswQ=s200-rw",
                "url_resolved": "http://icecast.skyrock.net/s/natio_mp3_128k",
                "url": "http://icecast.skyrock.net/s/natio_mp3_128k",
                "color": "#b91c1c"
            },
            {
                "name": "Chérie FM",
                "stationuuid": "f9ed1fa4-63d7-45a4-bdd6-48c5567f0f6b",
                "country": "França",
                "countrycode": "FR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "https://media.info/l/o/6/6812.1503485369.png",
                "url_resolved": "https://cdnradio.streamakaci.com/cheriefm1.mp3",
                "url": "https://cdnradio.streamakaci.com/cheriefm1.mp3",
                "color": "#7c2d12"
            },
            {
                "name": "France Culture",
                "stationuuid": "6a1440b2-e6f0-11e9-a96c-52543be04c81",
                "country": "França",
                "countrycode": "FR",
                "tags": "aac,culture,public radio",
                "bitrate": 192,
                "favicon": "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c9/France_Culture_-_2008.svg/1024px-France_Culture_-_2008.svg.png",
                "url_resolved": "http://icecast.radiofrance.fr/franceculture-hifi.aac",
                "url": "http://icecast.radiofrance.fr/franceculture-hifi.aac",
                "color": "#4338ca"
            },
            {
                "name": "Jazz Radio Blues",
                "stationuuid": "96102c22-0601-11e8-ae97-52543be04c81",
                "country": "França",
                "countrycode": "FR",
                "tags": "blues,jazz",
                "bitrate": 128,
                "favicon": "https://www.jazzradio.fr/apple-touch-icon-120x120.png",
                "url_resolved": "http://jazzblues.ice.infomaniak.ch/jazzblues-high.mp3",
                "url": "http://jazzblues.ice.infomaniak.ch/jazzblues-high.mp3",
                "color": "#6b21a8"
            },
            {
                "name": "Europe 2",
                "stationuuid": "be1e97e2-064a-4710-9ce9-d792d8beb1ca",
                "country": "França",
                "countrycode": "FR",
                "tags": "pop rock",
                "bitrate": 128,
                "favicon": "https://www.europe2.fr/wp-content/themes/melty/europeradio/assets/images/favicons/favicon128.png",
                "url_resolved": "http://europe2.lmn.fm/europe2.mp3",
                "url": "http://europe2.lmn.fm/europe2.mp3",
                "color": "#1e3a8a"
            },
            {
                "name": "FIP",
                "stationuuid": "932eb148-e6f6-11e9-a96c-52543be04c81",
                "country": "França",
                "countrycode": "FR",
                "tags": "aac,music,public radio",
                "bitrate": 192,
                "favicon": "https://upload.wikimedia.org/wikipedia/fr/thumb/d/d5/FIP_logo_2005.svg/1024px-FIP_logo_2005.svg.png",
                "url_resolved": "http://icecast.radiofrance.fr/fip-hifi.aac",
                "url": "http://icecast.radiofrance.fr/fip-hifi.aac",
                "color": "#0369a1"
            },
            {
                "name": "Rire et Chansons",
                "stationuuid": "a70cdc64-9a33-4432-91a1-957beb5ac6e7",
                "country": "França",
                "countrycode": "FR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "https://img.nrj.fr/OImjPWH1tkT1NaUMPlxsY49g9BI=/medias%2F2024%2F03%2Fvvscnx9i3yteabtkx8nlpdusmqj6uo8hshh9iphoit8_65fbfe026c3a5.png",
                "url_resolved": "https://streaming.nrjaudio.fm/ou8o8xgk7oiu?origine=fluxradios",
                "url": "https://streaming.nrjaudio.fm/ou8o8xgk7oiu?origine=fluxradios",
                "color": "#0f766e"
            }
        ]
    },
    {
        "id": "alemanha",
        "country": "Alemanha",
        "flag": "🇩🇪",
        "code": "DE",
        "stations": [
            {
                "name": "MANGORADIO",
                "stationuuid": "78012206-1aa1-11e9-a80b-52543be04c81",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "music,variety",
                "bitrate": 128,
                "favicon": "https://mangoradio.de/wp-content/uploads/cropped-Logo-192x192.webp",
                "url_resolved": "https://mangoradio.stream.laut.fm/mangoradio",
                "url": "https://mangoradio.stream.laut.fm/mangoradio",
                "color": "#15803d"
            },
            {
                "name": "Deutschlandfunk | DLF | MP3 128k",
                "stationuuid": "1c3e8be2-5b14-4933-bad3-87cbc227cba4",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "culture,news,public service",
                "bitrate": 128,
                "favicon": "https://www.deutschlandfunk.de/static/img/deutschlandfunk/icons/apple-touch-icon-128x128.png",
                "url_resolved": "https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3?aggregator=web",
                "url": "https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3?aggregator=web",
                "color": "#b91c1c"
            },
            {
                "name": "SWR3",
                "stationuuid": "240d28b9-7858-48d2-a816-9cf8e1875fe8",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "news,pop,rock",
                "bitrate": 128,
                "favicon": "https://swr3.de/assets/swr3/icons/apple-touch-icon.png",
                "url_resolved": "https://liveradio.swr.de/sw282p3/swr3/play.mp3",
                "url": "https://liveradio.swr.de/sw282p3/swr3/play.mp3",
                "color": "#7c2d12"
            },
            {
                "name": "1LIVE",
                "stationuuid": "9606f727-0601-11e8-ae97-52543be04c81",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "ard,public radio,rock",
                "bitrate": 128,
                "favicon": "https://www1.wdr.de/radio/1live/resources/img/favicon/apple-touch-icon.png",
                "url_resolved": "http://wdr-1live-live.icecast.wdr.de/wdr/1live/live/mp3/128/stream.mp3",
                "url": "http://wdr-1live-live.icecast.wdr.de/wdr/1live/live/mp3/128/stream.mp3",
                "color": "#4338ca"
            },
            {
                "name": "Bayern 3",
                "stationuuid": "0de82079-04e7-407b-b616-e0726eba5244",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "pop",
                "bitrate": 128,
                "favicon": "https://api.ardmediathek.de/image-service/images/urn:ard:image:52fd25fc45de7c6a?w=512",
                "url_resolved": "https://dispatcher.rndfnk.com/br/br3/live/mp3/mid",
                "url": "https://dispatcher.rndfnk.com/br/br3/live/mp3/mid",
                "color": "#6b21a8"
            },
            {
                "name": "WDR 5",
                "stationuuid": "9605edb3-0601-11e8-ae97-52543be04c81",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "information,news,news talk",
                "bitrate": 128,
                "favicon": "https://www1.wdr.de/resources-v5.134.1/img/favicon/apple-touch-icon.png",
                "url_resolved": "http://wdr-wdr5-live.icecast.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3",
                "url": "http://wdr-wdr5-live.icecast.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3",
                "color": "#1e3a8a"
            },
            {
                "name": "Deutschlandfunk | DLF | AAC 192k",
                "stationuuid": "717e3749-b9e8-4497-bd6a-61ccec935922",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "culture,news,public service",
                "bitrate": 256,
                "favicon": "https://www.deutschlandfunk.de/static/img/deutschlandfunk/icons/apple-touch-icon-128x128.png",
                "url_resolved": "https://st01.sslstream.dlf.de/dlf/01/high/aac/stream.aac?aggregator=web",
                "url": "https://st01.sslstream.dlf.de/dlf/01/high/aac/stream.aac?aggregator=web",
                "color": "#0369a1"
            },
            {
                "name": "Deutschlandfunk | DLF | OPUS 24k",
                "stationuuid": "5a6946a2-f02f-4fd1-a16b-558c90150041",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "culture,news,public service",
                "bitrate": 24,
                "favicon": "https://www.deutschlandfunk.de/static/img/deutschlandfunk/icons/apple-touch-icon-128x128.png",
                "url_resolved": "https://st01.sslstream.dlf.de/dlf/01/low/opus/stream.opus?aggregator=web",
                "url": "https://st01.sslstream.dlf.de/dlf/01/low/opus/stream.opus?aggregator=web",
                "color": "#0f766e"
            },
            {
                "name": "Radio Eins",
                "stationuuid": "960553a5-0601-11e8-ae97-52543be04c81",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "adult contemporary,alternative,ard",
                "bitrate": 128,
                "favicon": "http://www.radioeins.de/content/dam/rbb/rbb/logos/touch/rad-128.png",
                "url_resolved": "http://f141.rndfnk.com/ard/rbb/radioeins/live/mp3/128/stream.mp3?cid=01FC1WH12KJ93TCQPDSE2E5PZ9&sid=3L1ahU3DyMuvzoooMtjNapDWmFh&token=bbem21t6MT_sgPAWAAXFbH7ajKRbnI-ifyy55rbsqXs&tvf=ld4c-87B4BhmMTQxLnJuZGZuay5jb20",
                "url": "http://radioeins.de/stream",
                "color": "#15803d"
            },
            {
                "name": "SWR1 BW",
                "stationuuid": "36a6d57a-4d8a-45e3-aad9-7931c6e43c56",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "https://www.radio.at/images/broadcasts/07/41/2273/2/c300.png",
                "url_resolved": "https://liveradio.swr.de/sw282p3/swr1bw/play.mp3",
                "url": "https://liveradio.swr.de/sw282p3/swr1bw/play.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "- DJ & CLUB CHARTS ---> Club Classics, Festival-Hits, Remixes, Single Charts, Mashups, DJ Sets, Club Edits, Dancefloor, Underground, Nightlife, Party Anthems, Ibiza, Miami, Clubbing, Festival, Remix, Mashup, DJ, EDM,  RAVE, Dance, Urban, Latin, Beachclub, Lounge",
                "stationuuid": "3d9dcff7-8fd2-4eda-9d77-cfe259c62a70",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "#bewirbdich!,#mashup,beach",
                "bitrate": 192,
                "favicon": "https://i.ibb.co/P7QHpGB/DJ-CLUB-CHARTS-LOGO.png",
                "url_resolved": "https://breakz-2012-high.rautemusik.fm/?ref=rb-djclubcharts",
                "url": "https://breakz-2012-high.rautemusik.fm/?ref=rb-djclubcharts",
                "color": "#7c2d12"
            },
            {
                "name": "# TOP 100 DJ CHARTS",
                "stationuuid": "5bc44bcd-7481-40e1-b503-bb92b936f4cf",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "#90s,#charts,2000s",
                "bitrate": 192,
                "favicon": "https://i.ibb.co/jMmvLjz/TOP100-DJ-CHARTS-RADIO.png",
                "url_resolved": "https://breakz-high.rautemusik.fm/?ref=radiobrowser-top100-djcharts",
                "url": "https://breakz-high.rautemusik.fm/?ref=radiobrowser-top100-djcharts",
                "color": "#4338ca"
            },
            {
                "name": "BR24",
                "stationuuid": "787eda99-1532-4ee0-b14e-fdb88ec71530",
                "country": "Alemanha",
                "countrycode": "DE",
                "tags": "news",
                "bitrate": 128,
                "favicon": "https://api.ardmediathek.de/image-service/images/urn:ard:image:c3ab9296f3b282bf?w=512",
                "url_resolved": "https://dispatcher.rndfnk.com/br/br24/live/mp3/mid",
                "url": "https://dispatcher.rndfnk.com/br/br24/live/mp3/mid",
                "color": "#6b21a8"
            }
        ]
    },
    {
        "id": "italia",
        "country": "Itália",
        "flag": "🇮🇹",
        "code": "IT",
        "stations": [
            {
                "name": "Radio 24 il sole 24 ore",
                "stationuuid": "986c5985-41d7-11ea-a95e-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "news talk",
                "bitrate": 64,
                "favicon": "https://www.radio24.ilsole24ore.com/whitelabel/group-2420101401040528/img/apple-touch-icon.png",
                "url_resolved": "http://shoutcast2.radio24.it:8000/;",
                "url": "http://shoutcast2.radio24.it:8000/;",
                "color": "#1e3a8a"
            },
            {
                "name": "Radio Deejay",
                "stationuuid": "999ff951-68eb-4f4a-bec9-ed972b99d258",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "italian,news,pop",
                "bitrate": 122,
                "favicon": "https://www.deejay.it/favicon.ico",
                "url_resolved": "https://4c4b867c89244861ac216426883d1ad0.msvdn.net/radiodeejay/radiodeejay/master_ma.m3u8",
                "url": "https://4c4b867c89244861ac216426883d1ad0.msvdn.net/radiodeejay/radiodeejay/master_ma.m3u8",
                "color": "#0369a1"
            },
            {
                "name": "Rai Radio 1",
                "stationuuid": "96185693-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "news,public radio,rai",
                "bitrate": 256,
                "favicon": "",
                "url_resolved": "http://icestreaming.rai.it/1.mp3",
                "url": "http://icestreaming.rai.it/1.mp3",
                "color": "#0f766e"
            },
            {
                "name": "Radio Italia Solo Musica Italiana",
                "stationuuid": "216ee092-939d-43b6-8562-c646f73ad89f",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "italian pop",
                "bitrate": 128,
                "favicon": "https://www.radioitalia.it/images/logo-radioitalia.png",
                "url_resolved": "https://radioitaliasmi.akamaized.net/hls/live/2093120/RISMI/stream01/streamPlaylist.m3u8",
                "url": "https://radioitaliasmi.akamaized.net/hls/live/2093120/RISMI/stream01/streamPlaylist.m3u8",
                "color": "#15803d"
            },
            {
                "name": "Radio Armisa",
                "stationuuid": "83dcfac4-b3c3-4731-afc1-a80dd271dffa",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "anni 80,anni 90,balera",
                "bitrate": 128,
                "favicon": "https://armisa.it/assets/favicon/android-chrome-512x512.png",
                "url_resolved": "https://onair.armisa.it/listen/armisa/radio.mp3",
                "url": "https://onair.armisa.it/listen/armisa/radio.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "Radio Kiss Kiss",
                "stationuuid": "961756e4-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "adult contemporary,pop",
                "bitrate": 128,
                "favicon": "https://kisskiss.it/wp-content/uploads/2022/07/cropped-favicon-new-kisskiss-180x180.png",
                "url_resolved": "http://wma08.fluidstream.net:4610/",
                "url": "http://players.fluidstream.net/kisskissnetwork.pls",
                "color": "#7c2d12"
            },
            {
                "name": "RTL 102.5",
                "stationuuid": "675bd925-8b13-43fe-a1b9-43bb0f90fbbd",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "local,news,varied",
                "bitrate": 192,
                "favicon": "https://cloud.rtl.it/assets/www.rtl.it/3.0.64/img/logo/favicon-96x96.png",
                "url_resolved": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S97044836/tbbP8T1ZRPBL/playlist_audio.m3u8",
                "url": "https://dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S97044836/tbbP8T1ZRPBL/playlist_audio.m3u8",
                "color": "#4338ca"
            },
            {
                "name": "Radio 105 Network",
                "stationuuid": "9619ea14-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "hits,mediaset,pop",
                "bitrate": 128,
                "favicon": "https://upload.wikimedia.org/wikipedia/it/0/01/105.png",
                "url_resolved": "http://icecast.unitedradio.it/Radio105.mp3",
                "url": "http://icecast.unitedradio.it/Radio105.mp3",
                "color": "#6b21a8"
            },
            {
                "name": "Rai Radio 1",
                "stationuuid": "370437b8-878d-4efd-b4f5-17f060a49a6e",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "music,news,pop",
                "bitrate": 256,
                "favicon": "https://www.raicom.rai.it/wp-content/uploads/2021/12/RADIO1-1024x1024.jpg",
                "url_resolved": "http://icestreaming.rai.it/1.mp3",
                "url": "http://icestreaming.rai.it/1.mp3",
                "color": "#1e3a8a"
            },
            {
                "name": "Rai Radio 3",
                "stationuuid": "9608eb3e-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "classical,culture,public radio",
                "bitrate": 320,
                "favicon": "",
                "url_resolved": "http://icestreaming.rai.it/3.mp3",
                "url": "http://icestreaming.rai.it/3.mp3",
                "color": "#0369a1"
            },
            {
                "name": "Radio 105",
                "stationuuid": "77601de4-40ed-11ea-a9fa-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "hits,pop,ao vivo",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "https://icecast.unitedradio.it/Radio105.mp3",
                "url": "https://icecast.unitedradio.it/Radio105.mp3",
                "color": "#0f766e"
            },
            {
                "name": "50s 60s RETRO HITS",
                "stationuuid": "5532c4d9-616e-4d62-a49f-984a13e3189c",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "50s,60s,classic hits",
                "bitrate": 128,
                "favicon": "https://static.wixstatic.com/media/f361b3_ea9b293c1b80488d97f24981e7c6c1d3~mv2.jpg",
                "url_resolved": "https://stream.zeno.fm/pxzwykxbluitv",
                "url": "https://stream.zeno.fm/pxzwykxbluitv",
                "color": "#15803d"
            },
            {
                "name": "Virgin Radio Classic Rock",
                "stationuuid": "9619f126-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "classic rock,mediaset",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "http://icy.unitedradio.it/VirginRockClassics.mp3",
                "url": "http://icy.unitedradio.it/VirginRockClassics.mp3",
                "color": "#b91c1c"
            },
            {
                "name": "Rai Radio 2",
                "stationuuid": "96181819-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "public radio,rai",
                "bitrate": 256,
                "favicon": "",
                "url_resolved": "http://icestreaming.rai.it/2.mp3",
                "url": "http://icestreaming.rai.it/2.mp3",
                "color": "#7c2d12"
            },
            {
                "name": "Virgin Radio Italia",
                "stationuuid": "9619eb8a-0601-11e8-ae97-52543be04c81",
                "country": "Itália",
                "countrycode": "IT",
                "tags": "mediaset,pop rock",
                "bitrate": 128,
                "favicon": "http://www.virginradio.it/favicon_2.ico?v=1722509813651",
                "url_resolved": "http://icecast.unitedradio.it/Virgin.mp3",
                "url": "http://icecast.unitedradio.it/Virgin.mp3",
                "color": "#4338ca"
            }
        ]
    },
    {
        "id": "canada",
        "country": "Canadá",
        "flag": "🇨🇦",
        "code": "CA",
        "stations": [
            {
                "name": "# RdMix Classic Rock 70s 80s 90s",
                "stationuuid": "7afae7e3-8d06-42f5-b59e-a52d6e09e60e",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "60s,60s and 70s.,70's",
                "bitrate": 128,
                "favicon": "https://static.wixstatic.com/media/f361b3_1bad7e5fb9a54196b2ac2c2fe71d6e4f~mv2.jpg",
                "url_resolved": "https://cast1.torontocast.com:4610/stream",
                "url": "https://cast1.torontocast.com:4610/stream",
                "color": "#6b21a8"
            },
            {
                "name": "#100 BEST IBIZA DEEP HOUSE",
                "stationuuid": "64d74c72-025e-4cea-8a32-906812691731",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "chill,chill house,chillout",
                "bitrate": 128,
                "favicon": "https://static.wixstatic.com/media/f361b3_cf8747dc2b804de09c56359c324dd1f5~mv2.jpg",
                "url_resolved": "https://stream.zeno.fm/lwv6zqgtv1dtv",
                "url": "https://stream.zeno.fm/lwv6zqgtv1dtv",
                "color": "#1e3a8a"
            },
            {
                "name": "AIRPORT LOUNGE RADIO",
                "stationuuid": "02569932-0b3c-4938-9d3e-b00b2158d40b",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "aereoporto,airport,ambient",
                "bitrate": 128,
                "favicon": "https://favicon-generator.org/favicon-generator/htdocs/favicons/2023-12-16/9274e8a4803971186ff5c45359ab77a4.ico.png",
                "url_resolved": "https://az1.mediacp.eu/listen/airport-lounge-radio/radio.mp3",
                "url": "https://az1.mediacp.eu/listen/airport-lounge-radio/radio.mp3",
                "color": "#0369a1"
            },
            {
                "name": "# 100 GREATEST HEAVY METAL",
                "stationuuid": "d0df2a51-9cd3-4f3e-977d-aab92ddef7a3",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "60's,60s,70's",
                "bitrate": 192,
                "favicon": "https://static.wixstatic.com/media/f361b3_a5ce07773ea14d209785044fbeb26dca~mv2.jpg",
                "url_resolved": "https://cast1.torontocast.com:4660/stream",
                "url": "https://cast1.torontocast.com:4660/stream",
                "color": "#0f766e"
            },
            {
                "name": "# 70s 80s 90s RdMix Network",
                "stationuuid": "cf14b5ee-f03e-4468-8ce1-379f171fd8c4",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "00's,00s,192kbps",
                "bitrate": 192,
                "favicon": "",
                "url_resolved": "https://cast1.torontocast.com:1830/stream",
                "url": "https://cast1.torontocast.com:1830/stream",
                "color": "#15803d"
            },
            {
                "name": "CBC Radio 1 Toronto",
                "stationuuid": "147a830e-fbc3-4260-9504-6dcc62530923",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "public radio",
                "bitrate": 48,
                "favicon": "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP._kBBu0jkxW7vsBMbUIlxpwHaJA%26pid%3DApi&f=1",
                "url_resolved": "https://cbcradiolive.akamaized.net/hls/live/2041036/ES_R1ETR/master.m3u8",
                "url": "https://cbcradiolive.akamaized.net/hls/live/2041036/ES_R1ETR/master.m3u8",
                "color": "#b91c1c"
            },
            {
                "name": "REGGAE CHILL CAFE",
                "stationuuid": "a3253a96-a1ba-4cf5-bf4b-ec7988afcfd3",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "chill,chillout,dancehall",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "https://maggie.torontocast.com:2020/stream/reggaechillcafe",
                "url": "https://maggie.torontocast.com:2020/stream/reggaechillcafe",
                "color": "#7c2d12"
            },
            {
                "name": "# RdMix DJSET 70s 80s 90s",
                "stationuuid": "6cb69b95-72d9-4ea6-859f-52546a85c1fe",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "1970s,1980s,1990s",
                "bitrate": 128,
                "favicon": "https://static.wixstatic.com/media/f361b3_ee09b4fc28354c5287c3be2392e0b1e3~mv2.png",
                "url_resolved": "https://cast1.torontocast.com:4560/stream",
                "url": "https://cast1.torontocast.com:4560/stream",
                "color": "#4338ca"
            },
            {
                "name": "# 100 GREATEST JAZZ LOUNGE BAR",
                "stationuuid": "4cc3e959-b572-4285-99e2-069151d03b5e",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "192kbps,chillout,chillout+lounge",
                "bitrate": 192,
                "favicon": "https://static.wixstatic.com/media/f361b3_2722a2a63db342f0901576a0168f2571~mv2.jpg",
                "url_resolved": "https://cast1.torontocast.com:4640/stream",
                "url": "https://cast1.torontocast.com:4640/stream",
                "color": "#6b21a8"
            },
            {
                "name": "100% ACID JAZZ",
                "stationuuid": "34a15ee8-a71b-4004-8fce-83650b46af66",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "acid,acid jazz,ambient",
                "bitrate": 128,
                "favicon": "https://d1ujqdpfgkvqfi.cloudfront.net/favicon-generator/htdocs/favicons/2024-10-25/f83dbfeda4fbcf3399eb5afd0949c4b1.ico.png",
                "url_resolved": "https://mpc1.mediacp.eu:8356/stream",
                "url": "https://mpc1.mediacp.eu:8356/stream",
                "color": "#1e3a8a"
            },
            {
                "name": "A MISSISSIPPI BLUES",
                "stationuuid": "a2b92b15-ce28-4007-a756-b431abeb1059",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "blues,bluesrock,canada",
                "bitrate": 320,
                "favicon": "https://d1ujqdpfgkvqfi.cloudfront.net/favicon-generator/htdocs/favicons/2025-04-26/7358e7e8c2649a65c1a9d821887e32e3.ico.png",
                "url_resolved": "https://cast1.torontocast.com:4450/;?type=http&nocache=1745625391",
                "url": "https://cast1.torontocast.com:4450/;?type=http&nocache=1745625391",
                "color": "#0369a1"
            },
            {
                "name": "加拿大中文电台FM.96.1",
                "stationuuid": "8e8f1791-1408-49f7-a4fb-b7c7e2fb3636",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "96.1,96.1 fm,music",
                "bitrate": 48,
                "favicon": "",
                "url_resolved": "https://5b2959fe11444.streamlock.net/radio/fm961.stream/playlist.m3u8",
                "url": "https://5b2959fe11444.streamlock.net/radio/fm961.stream/playlist.m3u8",
                "color": "#0f766e"
            },
            {
                "name": "# RdMix Italo Disco 80s",
                "stationuuid": "e9577c10-e299-4bb8-9313-c6cc2070c1f3",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "1980,1980s,1980s hits",
                "bitrate": 192,
                "favicon": "https://static.wixstatic.com/media/f361b3_12e18c80af1f44a283eb3115b0ddd750~mv2.jpg",
                "url_resolved": "https://cast1.torontocast.com:2130/stream",
                "url": "https://cast1.torontocast.com:2130/stream",
                "color": "#15803d"
            },
            {
                "name": "SENSUAL LOUNGE RADIO",
                "stationuuid": "75db29d2-9abd-4b2b-b16c-a8decd86a587",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "ambient,ambient lounge,canada",
                "bitrate": 320,
                "favicon": "https://d1ujqdpfgkvqfi.cloudfront.net/favicon-generator/htdocs/favicons/2025-02-16/253ad4a8eaed27bf80efa9d428914089.ico.png",
                "url_resolved": "https://kathy.torontocast.com:3590/;?type=http&nocache=1739707069",
                "url": "https://kathy.torontocast.com:3590/;?type=http&nocache=1739707069",
                "color": "#b91c1c"
            },
            {
                "name": "100 % COVERS LOUNGE",
                "stationuuid": "77871905-48cd-465c-8d25-dd14ae536656",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "ambient,ambient and relaxation music,bossa nova",
                "bitrate": 128,
                "favicon": "",
                "url_resolved": "https://az1.mediacp.eu/listen/100coverslounge/radio.mp3",
                "url": "https://az1.mediacp.eu/listen/100coverslounge/radio.mp3",
                "color": "#7c2d12"
            },
            {
                "name": "680 News Toronto",
                "stationuuid": "44db1e25-6942-11ea-b1cf-52543be04c81",
                "country": "Canadá",
                "countrycode": "CA",
                "tags": "hits,pop,ao vivo",
                "bitrate": 47,
                "favicon": "https://www.680news.com/favicon.ico",
                "url_resolved": "https://rogers-hls.leanstream.co/rogers/tor680.stream/playlist.m3u8",
                "url": "https://rogers-hls.leanstream.co/rogers/tor680.stream/playlist.m3u8",
                "color": "#4338ca"
            }
        ]
    },
    {
        "id": "argentina",
        "country": "Argentina",
        "flag": "🇦🇷",
        "code": "AR",
        "stations": [
            {
                "name": "La 100",
                "stationuuid": "7b03996e-6ea0-4db5-8168-ddd1463faec2",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "99.9 fm,argentina,buenos aires",
                "bitrate": 96,
                "favicon": "http://cdn-profiles.tunein.com/s6984/images/logod.jpg",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/FM999_56.mp3",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/FM999_56.mp3",
                "color": "#6b21a8"
            },
            {
                "name": "Radio 10",
                "stationuuid": "7bc38611-e8d6-494d-9f71-2c1be5341f12",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 65,
                "favicon": "https://www.radio10.com.ar/css-custom/220/favicons/apple-touch-icon-120x120.png",
                "url_resolved": "https://radio10.stweb.tv/radio10/live/playlist.m3u8",
                "url": "https://radio10.stweb.tv/radio10/live/playlist.m3u8",
                "color": "#1e3a8a"
            },
            {
                "name": "Radio La Red AM 910. Ciudad de Buenos Aires",
                "stationuuid": "5440e89d-708d-4336-9b42-fa274ed093b1",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 64,
                "favicon": "",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/LA_RED_AM910AAC.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/LA_RED_AM910AAC.aac",
                "color": "#0369a1"
            },
            {
                "name": "Mitre AM 790. AAC Alta. Ciudad de Buenos Aires",
                "stationuuid": "f006d4dc-9771-4109-bf35-eb09291320da",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 64,
                "favicon": "https://cloudfront-arc.cienradios.com/radiomitre/favicons/apple-icon-120x120.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/AM790_56AAC.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/AM790_56AAC.aac",
                "color": "#0f766e"
            },
            {
                "name": "Aspen 102.3",
                "stationuuid": "4285a122-9c78-417e-879e-5440c0482c56",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 96,
                "favicon": "https://fmaspen.com/wp-content/themes/aspen/images/logoaspen.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/ASPEN.mp3",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/ASPEN.mp3",
                "color": "#15803d"
            },
            {
                "name": "Radio Mitre",
                "stationuuid": "c0cf2d87-993c-4cb6-97ad-f508a3fc5495",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "news",
                "bitrate": 64,
                "favicon": "https://cloudfront-arc.cienradios.com/radiomitre/favicons/apple-icon-120x120.png",
                "url_resolved": "http://playerservices.streamtheworld.com/api/livestream-redirect/AM790_56AAC_SC",
                "url": "http://playerservices.streamtheworld.com/api/livestream-redirect/AM790_56AAC_SC",
                "color": "#b91c1c"
            },
            {
                "name": "Radio Disney 94.3",
                "stationuuid": "9257ed3b-c422-43cf-a8dd-8165861b3187",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "94.3 fm,américa,argentina",
                "bitrate": 128,
                "favicon": "https://cdn-profiles.tunein.com/s13659/images/logog.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/DISNEY_ARG_BA_ADP.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/DISNEY_ARG_BA_ADP.aac",
                "color": "#7c2d12"
            },
            {
                "name": "La Popu",
                "stationuuid": "47d1e0f9-ce15-4557-a73c-a703b3762d06",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "cuarteto,local news,music",
                "bitrate": 128,
                "favicon": "https://www.lapopu.com.ar/img/favicon.png",
                "url_resolved": "https://liveradio.mediainbox.net/popular.mp3",
                "url": "https://liveradio.mediainbox.net/popular.mp3",
                "color": "#4338ca"
            },
            {
                "name": "FM Soldados 87.5",
                "stationuuid": "ee8db61a-1cc3-409f-bb4f-69b17b7861d6",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 32,
                "favicon": "https://fmsoldados.com/favicon.png",
                "url_resolved": "https://radio02.ferozo.com/proxy/ra01000409?mp=/stream",
                "url": "https://radio02.ferozo.com/proxy/ra01000409?mp=/stream",
                "color": "#6b21a8"
            },
            {
                "name": "Radio Rivadavia AM 630. Ciudad de Buenos Aires",
                "stationuuid": "3c6c111c-6bbc-44ae-8ad8-46b502b3002a",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "hits,pop,ao vivo",
                "bitrate": 64,
                "favicon": "https://rivadavia.com.ar/apple-touch-icon.png",
                "url_resolved": "https://playerservices.streamtheworld.com/api/livestream-redirect/RIVADAVIAAAC.aac",
                "url": "https://playerservices.streamtheworld.com/api/livestream-redirect/RIVADAVIAAAC.aac",
                "color": "#1e3a8a"
            },
            {
                "name": "FM 90 Saladillo FM 90.7",
                "stationuuid": "93a6169c-8fd4-42fa-b1f4-9a958c13a9a2",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "news talk music",
                "bitrate": 32,
                "favicon": "",
                "url_resolved": "https://chino.republicahosting.com:2316/live",
                "url": "https://chino.republicahosting.com:2316/live",
                "color": "#0369a1"
            },
            {
                "name": "Radio Con Vos 89.9",
                "stationuuid": "ae7694a3-d499-11e9-a861-52543be04c81",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "news,pop,rock",
                "bitrate": 67,
                "favicon": "",
                "url_resolved": "https://server1.stweb.tv/rcvos/live/playlist.m3u8",
                "url": "https://server1.stweb.tv/rcvos/live/playlist.m3u8",
                "color": "#0f766e"
            },
            {
                "name": "neverland",
                "stationuuid": "2df8d43a-3950-4596-b854-cd8aa1c2c236",
                "country": "Argentina",
                "countrycode": "AR",
                "tags": "anime,anime radio,jazz",
                "bitrate": 128,
                "favicon": "https://discord.do/wp-content/uploads/2023/08/Neverland-Fandub.jpg",
                "url_resolved": "https://stream-166.zeno.fm/oaqigxpfjzqvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJvYXFpZ3hwZmp6cXZ2IiwiaG9zdCI6InN0cmVhbS0xNjYuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IjFnRWVwSWpIUXJXVElZSU1pLVlrenciLCJpYXQiOjE3NDgxMzU4OTUsImV4cCI6MTc0ODEzNTk1NX0.b4Llu6iAJk1NPa2U9OhIjm_3CZQyLuRJZWiNecQWBdY",
                "url": "https://stream-166.zeno.fm/oaqigxpfjzqvv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJvYXFpZ3hwZmp6cXZ2IiwiaG9zdCI6InN0cmVhbS0xNjYuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IjFnRWVwSWpIUXJXVElZSU1pLVlrenciLCJpYXQiOjE3NDgxMzU4OTUsImV4cCI6MTc0ODEzNTk1NX0.b4Llu6iAJk1NPa2U9OhIjm_3CZQyLuRJZWiNecQWBdY",
                "color": "#15803d"
            }
        ]
    }
];

// Busca em espelhos redundantes da Radio Browser API
async function fetchRadioBrowserAPI(endpoint) {
    for (let i = 0; i < RADIO_API_SERVERS.length; i++) {
        const server = RADIO_API_SERVERS[(currentRadioServerIdx + i) % RADIO_API_SERVERS.length];
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4500);
            const res = await fetch(`${server}${endpoint}`, {
                headers: { 'User-Agent': 'PedroxiousMusic/2.0' },
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (res.ok) {
                currentRadioServerIdx = (currentRadioServerIdx + i) % RADIO_API_SERVERS.length;
                return await res.json();
            }
        } catch (e) {
            // Continua para o próximo espelho
        }
    }
    return [];
}

// Gera um avatar / logo SVG moderno quando a rádio não tiver imagem oficial
function generateRadioFallbackAvatar(name, color = '#182234') {
    const initials = (name || 'RA').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'FM';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0e1726"/>
                    <stop offset="100%" stop-color="${color}"/>
                </linearGradient>
            </defs>
            <rect width="160" height="160" rx="12" fill="url(#bg)"/>
            <circle cx="80" cy="50" r="24" fill="rgba(54, 226, 236, 0.15)"/>
            <path d="M72 40a12 12 0 0 0 0 20 .75.75 0 0 1-.5.75 1.5 1.5 0 0 1-1.5-1.5 15 15 0 0 1 0-18.5 1.5 1.5 0 0 1 2 0zM88 40a12 12 0 0 1 0 20 .75.75 0 0 0 .5.75 1.5 1.5 0 0 0 1.5-1.5 15 15 0 0 0 0-18.5 1.5 1.5 0 0 0-2 0zM80 46a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" fill="#36e2ec"/>
            <text x="80" y="105" text-anchor="middle" fill="#ffffff" font-family="Poppins, sans-serif" font-size="20" font-weight="800" letter-spacing="1">${initials}</text>
            <rect x="55" y="122" width="50" height="16" rx="4" fill="rgba(54, 226, 236, 0.25)"/>
            <text x="80" y="134" text-anchor="middle" fill="#36e2ec" font-family="Poppins, sans-serif" font-size="9" font-weight="700">ONLINE</text>
        </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Cria o elemento Card da Rádio (Estilo Spotify UI com capa, status e botão play overlay)
function createRadioCardElement(station) {
    const card = document.createElement('div');
    card.className = 'radio_station_card';
    card.dataset.stationuuid = station.stationuuid || station.name;

    const isThisPlaying = isRadioStreaming && activeRadioStation && 
        (activeRadioStation.stationuuid === station.stationuuid || activeRadioStation.name === station.name);

    if (isThisPlaying) card.classList.add('is_playing');

    const fallbackImg = generateRadioFallbackAvatar(station.name, station.color || '#1e3a8a');
    const imgSrc = station.favicon && station.favicon.startsWith('http') ? station.favicon : fallbackImg;

    const tags = (station.tags || 'Ao vivo').split(',').slice(0, 2).map(t => t.trim()).join(' • ');
    const subtitle = `${station.country || 'Online'} • ${tags}`;

    card.innerHTML = `
        <div class="radio_logo_box">
            <img src="${imgSrc}" alt="${station.name}" class="radio_logo_img" onerror="this.onerror=null; this.src='${fallbackImg}';">
            <div class="radio_play_overlay" title="${isThisPlaying ? 'Pausar ' + station.name : 'Ouvir ' + station.name}">
                <div class="radio_overlay_circle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        ${isThisPlaying ? 
                            '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>' :
                            '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>'
                        }
                    </svg>
                </div>
            </div>
        </div>
        <div class="radio_card_info">
            <span class="radio_card_title" title="${station.name}">${station.name}</span>
            <span class="radio_card_tags">${subtitle}</span>
        </div>
    `;

    card.addEventListener('click', () => {
        playRadioStation(station);
    });

    return card;
}

// Renderiza todas as listas empilhadas por país conforme a seleção da caixa de seleção e filtros de gênero
function renderStackedRadioSections() {
    const container = document.getElementById('radio_stacked_sections');
    const loadingEl = document.getElementById('radio_loading_state');
    const emptyEl = document.getElementById('radio_empty_state');
    if (!container) return;

    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    container.innerHTML = '';

    const q = radioSearchQuery.toLowerCase().trim();
    const genre = radioSelectedGenre.toLowerCase().trim();
    const country = radioSelectedCountry.toLowerCase().trim();

    // Determina a ordem e filtragem das seções conforme a caixa de seleção de países
    let sectionsToRender = [...CURATED_RADIO_SECTIONS];

    if (country !== 'all') {
        const foundIndex = sectionsToRender.findIndex(sec => 
            sec.id.toLowerCase() === country || 
            sec.country.toLowerCase() === country ||
            (sec.code && sec.code.toLowerCase() === country)
        );

        if (foundIndex !== -1) {
            // Mostra o país selecionado em prioridade absoluta no topo
            const selectedSec = sectionsToRender[foundIndex];
            sectionsToRender = [selectedSec];
        }
    }

    let totalVisible = 0;

    sectionsToRender.forEach(sec => {
        const matchingStations = sec.stations.filter(station => {
            // Busca textual (nome, tags, país)
            if (q) {
                const nameMatch = (station.name || '').toLowerCase().includes(q);
                const tagMatch = (station.tags || '').toLowerCase().includes(q);
                const countryMatch = (station.country || '').toLowerCase().includes(q);
                if (!nameMatch && !tagMatch && !countryMatch) return false;
            }

            // Filtro por Gênero Musical (Apenas gêneros por ordem de mais ouvidos)
            if (genre !== 'all') {
                const tagsStr = (station.tags || '').toLowerCase();
                const nameStr = (station.name || '').toLowerCase();

                let genreMatch = false;
                if (genre === 'pop') {
                    genreMatch = tagsStr.includes('pop') || tagsStr.includes('hit') || tagsStr.includes('top40') || tagsStr.includes('jovem');
                } else if (genre === 'rock') {
                    genreMatch = tagsStr.includes('rock') || tagsStr.includes('metal') || tagsStr.includes('alternative') || tagsStr.includes('indie');
                } else if (genre === 'sertanejo') {
                    genreMatch = tagsStr.includes('sertanejo') || tagsStr.includes('country') || tagsStr.includes('popular') || nameStr.includes('sertanej');
                } else if (genre === 'electronic') {
                    genreMatch = tagsStr.includes('electronic') || tagsStr.includes('dance') || tagsStr.includes('edm') || tagsStr.includes('house') || tagsStr.includes('techno') || tagsStr.includes('club') || tagsStr.includes('trance');
                } else if (genre === 'mpb') {
                    genreMatch = tagsStr.includes('mpb') || tagsStr.includes('samba') || tagsStr.includes('bossa') || tagsStr.includes('brasileira') || tagsStr.includes('pagode');
                } else if (genre === 'flashback') {
                    genreMatch = tagsStr.includes('flashback') || tagsStr.includes('retro') || tagsStr.includes('classic') || tagsStr.includes('80') || tagsStr.includes('90') || tagsStr.includes('70') || tagsStr.includes('oldies') || tagsStr.includes('gold');
                } else if (genre === 'hiphop') {
                    genreMatch = tagsStr.includes('hiphop') || tagsStr.includes('rap') || tagsStr.includes('r&b') || tagsStr.includes('urban');
                } else if (genre === 'news') {
                    genreMatch = tagsStr.includes('news') || tagsStr.includes('notic') || tagsStr.includes('talk') || tagsStr.includes('jornal') || tagsStr.includes('info');
                } else if (genre === 'jazz') {
                    genreMatch = tagsStr.includes('jazz') || tagsStr.includes('blues') || tagsStr.includes('lounge') || tagsStr.includes('smooth');
                } else if (genre === 'gospel') {
                    genreMatch = tagsStr.includes('gospel') || tagsStr.includes('relig') || tagsStr.includes('crista') || tagsStr.includes('louvor');
                } else if (genre === 'classical') {
                    genreMatch = tagsStr.includes('classic') || tagsStr.includes('classica') || tagsStr.includes('instrumental') || tagsStr.includes('orchestra');
                } else {
                    genreMatch = tagsStr.includes(genre);
                }

                if (!genreMatch) return false;
            }

            return true;
        });

        if (matchingStations.length === 0) return;

        totalVisible += matchingStations.length;

        // Cria a seção empilhada para este país
        const sectionEl = document.createElement('section');
        sectionEl.className = 'radio_country_section';
        sectionEl.id = `radio_section_${sec.id}`;

        sectionEl.innerHTML = `
            <div class="radio_section_header">
                <div class="radio_section_title_group">
                    <span class="radio_country_flag_badge">${sec.flag || '🌐'}</span>
                    <h2 class="radio_country_title">${sec.country}</h2>
                    <span class="radio_section_count">${matchingStations.length} ${matchingStations.length === 1 ? 'estação' : 'estações'}</span>
                </div>
            </div>
            <div class="radio_stations_grid"></div>
        `;

        const grid = sectionEl.querySelector('.radio_stations_grid');
        matchingStations.forEach(station => {
            const card = createRadioCardElement(station);
            grid.appendChild(card);
        });

        container.appendChild(sectionEl);
    });

    if (totalVisible === 0) {
        if (q.length >= 2) {
            searchRadioBrowserAPI(q);
        } else {
            if (emptyEl) emptyEl.style.display = 'flex';
        }
    } else {
        updateRadioStationCards();
    }
}

// Busca estações globais na Radio Browser API caso a busca local não tenha retorno
async function searchRadioBrowserAPI(query) {
    const container = document.getElementById('radio_stacked_sections');
    const loadingEl = document.getElementById('radio_loading_state');
    const emptyEl = document.getElementById('radio_empty_state');
    if (!container) return;

    if (loadingEl) loadingEl.style.display = 'flex';
    if (emptyEl) emptyEl.style.display = 'none';

    try {
        const path = `/json/stations/search?name=${encodeURIComponent(query)}&limit=24&order=clickcount&reverse=true&hidebroken=true`;
        const stations = await fetchRadioBrowserAPI(path);

        if (loadingEl) loadingEl.style.display = 'none';

        if (!stations || stations.length === 0) {
            if (emptyEl) emptyEl.style.display = 'flex';
            return;
        }

        const sectionEl = document.createElement('section');
        sectionEl.className = 'radio_country_section';
        sectionEl.innerHTML = `
            <div class="radio_section_header">
                <div class="radio_section_title_group">
                    <h2 class="radio_country_title">Resultados Globais: "${query}"</h2>
                    <span class="radio_section_count">${stations.length} estações</span>
                </div>
            </div>
            <div class="radio_stations_grid"></div>
        `;

        const grid = sectionEl.querySelector('.radio_stations_grid');
        stations.forEach(st => {
            const card = createRadioCardElement(st);
            grid.appendChild(card);
        });

        container.appendChild(sectionEl);
        updateRadioStationCards();
    } catch (e) {
        console.warn('Erro ao buscar na API de rádios:', e);
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'flex';
    }
}

// Atualiza o estado visual de todos os cartões de rádio
function updateRadioStationCards() {
    const cards = document.querySelectorAll('.radio_station_card');
    cards.forEach(card => {
        const sid = card.dataset.stationuuid;
        const isMatch = isRadioStreaming && activeRadioStation && 
            (activeRadioStation.stationuuid === sid || activeRadioStation.name === sid);

        if (isMatch) {
            card.classList.add('is_playing');
            const circle = card.querySelector('.radio_overlay_circle');
            if (circle) {
                circle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        ${isPlaying ? 
                            '<path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>' :
                            '<path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>'
                        }
                    </svg>
                `;
            }
        } else {
            card.classList.remove('is_playing');
            const circle = card.querySelector('.radio_overlay_circle');
            if (circle) {
                circle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                    </svg>
                `;
            }
        }
    });
}

// Reprodução de Estação de Rádio integrada ao Master Player com failover e auto-recuperação
function playRadioStation(station) {
    if (activeRadioStation && (activeRadioStation.stationuuid === station.stationuuid || activeRadioStation.name === station.name) && isRadioStreaming) {
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
        updateRadioStationCards();
        return;
    }

    activeRadioStation = station;
    isRadioStreaming = true;

    // Desativa seleção das músicas locais normais
    sidebarSongItems.forEach(li => li.classList.remove('active'));
    horizontalSongItems.forEach(card => card.classList.remove('active'));

    const streamUrl = station.url_resolved || station.url;
    if (!streamUrl) {
        showToast('⚠️ URL de áudio desta estação não encontrada.');
        return;
    }

    music.pause();
    music.src = streamUrl;

    // Atualiza o player inferior
    const fallbackImg = generateRadioFallbackAvatar(station.name, station.color || '#1e3a8a');
    const logoSrc = station.favicon && station.favicon.startsWith('http') ? station.favicon : fallbackImg;

    if (posterMasterPlay) posterMasterPlay.src = logoSrc;
    if (titleMasterPlay) {
        titleMasterPlay.innerHTML = `<div class="song_title_wrap" title="${station.name}"><span class="song_title_text">${station.name}</span></div><div class="subtitle">Rádio Ao Vivo • ${station.country || 'Online'}</div>`;
        if (typeof updateMarqueeForElement === 'function') {
            updateMarqueeForElement(titleMasterPlay);
            const newWrap = titleMasterPlay.querySelector('.song_title_wrap');
            const newTextEl = titleMasterPlay.querySelector('.song_title_text');
            if (newWrap && newTextEl && typeof attachMarqueeHoverEvents === 'function') {
                attachMarqueeHoverEvents(titleMasterPlay, newWrap, newTextEl);
            }
        }
    }

    currentStart.textContent = 'AO VIVO';
    currentEnd.textContent = station.bitrate ? `${station.bitrate} kbps` : 'LIVE';
    bar2.style.width = '100%';
    dot.style.left = '100%';

    showToast(`Sintonizando ${station.name}...`);

    music.play().then(() => {
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline-block';
        if (wave) wave.classList.add('active1');
        updateAlbumPlayIcons();
        updateRadioStationCards();
        showToast(`Sintonizado em: ${station.name}!`);
    }).catch(err => {
        console.warn('Erro ao conectar ao stream da rádio:', err);
        // Tenta url direta se url_resolved falhou
        if (station.url && station.url !== station.url_resolved) {
            music.src = station.url;
            music.play().then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline-block';
                if (wave) wave.classList.add('active1');
                updateRadioStationCards();
                showToast(`Sintonizado em: ${station.name}!`);
            }).catch(e => {
                handleRadioError(station);
            });
        } else {
            handleRadioError(station);
        }
    });
}

function handleRadioError(station) {
    isRadioStreaming = false;
    isPlaying = false;
    playIcon.style.display = 'inline-block';
    pauseIcon.style.display = 'none';
    if (wave) wave.classList.remove('active1');
    updateRadioStationCards();
    showToast(`⚠️ Transmissão de "${station.name}" instável no momento. Escolha outra rádio.`);
}

// Abre a Visualização da Rádio em SPA
function openRadioView() {
    activePlaylistId = null;
    if (songSideContainer) {
        songSideContainer.classList.remove('artist_mode');
        songSideContainer.classList.remove('playlist_mode');
        songSideContainer.classList.remove('library_mode');
        songSideContainer.classList.add('radio_mode');
    }

    // Oculta a barra de pesquisa da navbar superior conforme exigido
    const navSearch = document.getElementById('search_bar_container');
    if (navSearch) navSearch.style.display = 'none';

    // Exibe o badge 'RADIO ONLINE AO VIVO' na navbar superior ao lado do avatar
    const navLiveBadge = document.getElementById('radio_nav_live_indicator');
    if (navLiveBadge) navLiveBadge.style.display = 'flex';

    if (artistPageView) artistPageView.style.display = 'none';
    const plPageView = document.getElementById('playlist_page_view');
    if (plPageView) plPageView.style.display = 'none';
    const libPageView = document.getElementById('library_page_view');
    if (libPageView) libPageView.style.display = 'none';

    const radioPageView = document.getElementById('radio_page_view');
    if (radioPageView) radioPageView.style.display = 'flex';

    setActiveNavTab('radio');

    // Renderiza as categorias empilhadas com Brasil no topo
    renderStackedRadioSections();
}

// Controle visual da aba ativa no menu superior (Discover / Library / Radio) e bottom nav mobile
function setActiveNavTab(tabName) {
    const discoverLi = document.getElementById('nav_discover_tab');
    const libraryLi = document.getElementById('nav_library_tab');
    const radioLi = document.getElementById('nav_radio_tab');

    [discoverLi, libraryLi, radioLi].forEach(li => {
        if (!li) return;
        li.classList.remove('active');
        li.style.color = '';
        const span = li.querySelector('span');
        if (span) span.remove();
    });

    let targetLi = null;
    if (tabName === 'discover') targetLi = discoverLi;
    else if (tabName === 'library') targetLi = libraryLi;
    else if (tabName === 'radio') targetLi = radioLi;

    if (targetLi) {
        targetLi.classList.add('active');
    }

    // Sincroniza abas da barra inferior no celular
    const mobHome = document.getElementById('mob_tab_home');
    const mobSearch = document.getElementById('mob_tab_search');
    const mobRadio = document.getElementById('mob_tab_radio');
    const mobLib = document.getElementById('mob_tab_library');

    [mobHome, mobSearch, mobRadio, mobLib].forEach(t => {
        if (t) t.classList.remove('active');
    });

    if (tabName === 'discover' && mobHome) mobHome.classList.add('active');
    else if (tabName === 'search' && mobSearch) mobSearch.classList.add('active');
    else if (tabName === 'radio' && mobRadio) mobRadio.classList.add('active');
    else if (tabName === 'library' && mobLib) mobLib.classList.add('active');
}

// Configura o Seletor Customizado Moderno de Países
function setupRadioCountrySelect() {
    const trigger = document.getElementById('radio_country_trigger');
    const customSelect = document.getElementById('radio_custom_select');
    const optionsMenu = document.getElementById('radio_country_options_menu');
    const label = document.getElementById('radio_selected_country_label');
    const flagEl = document.getElementById('radio_selected_flag');

    if (!trigger || !customSelect || !optionsMenu) return;

    // Toggle abrir/fechar dropdown ao clicar no botão
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = customSelect.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });

    // Evento de seleção em cada opção
    const options = optionsMenu.querySelectorAll('.radio_option');
    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            options.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            const country = opt.dataset.country;
            radioSelectedCountry = country;

            const optFlag = opt.querySelector('.opt_flag') ? opt.querySelector('.opt_flag').textContent : '🌐';
            const optName = opt.querySelector('.opt_name') ? opt.querySelector('.opt_name').textContent : 'Todos os Países';

            if (label) label.textContent = country === 'all' ? 'Selecionar País' : optName;
            if (flagEl) flagEl.textContent = optFlag;

            customSelect.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');

            // Renderiza novamente com a prioridade do país selecionado
            renderStackedRadioSections();
        });
    });
}

// Configura as pílulas de filtros rápidos (apenas gêneros musicais)
function setupRadioGenrePills() {
    const pills = document.querySelectorAll('#radio_genre_pills .radio_pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            radioSelectedGenre = pill.dataset.genre || 'all';
            renderStackedRadioSections();
        });
    });
}

// Eventos da Rádio e Navegação
const navRadioTab = document.getElementById('nav_radio_tab');
if (navRadioTab) {
    navRadioTab.style.cursor = 'pointer';
    navRadioTab.addEventListener('click', openRadioView);
}

const navDiscoverTab = document.getElementById('nav_discover_tab');
if (navDiscoverTab) {
    navDiscoverTab.style.cursor = 'pointer';
    navDiscoverTab.addEventListener('click', returnToHomeView);
}

const navLibraryTab = document.getElementById('nav_library_tab');
if (navLibraryTab) {
    navLibraryTab.style.cursor = 'pointer';
    navLibraryTab.addEventListener('click', openLibraryView);
}

const radioBackBtn = document.getElementById('radio_back_btn');
if (radioBackBtn) radioBackBtn.addEventListener('click', returnToHomeView);

// Busca exclusiva da Rádio (com debounce)
const radioSearchInput = document.getElementById('radio_search_input');
const radioSearchClear = document.getElementById('radio_search_clear');
if (radioSearchInput) {
    radioSearchInput.addEventListener('input', () => {
        const val = radioSearchInput.value.trim();
        radioSearchQuery = val;
        if (radioSearchClear) radioSearchClear.style.display = val ? 'block' : 'none';

        clearTimeout(radioSearchTimeout);
        radioSearchTimeout = setTimeout(() => {
            renderStackedRadioSections();
        }, 250);
    });
}

if (radioSearchClear) {
    radioSearchClear.addEventListener('click', () => {
        if (radioSearchInput) {
            radioSearchInput.value = '';
            radioSearchQuery = '';
            radioSearchClear.style.display = 'none';
            renderStackedRadioSections();
        }
    });
}

// Botão de Redefinir Filtros no estado vazio
const radioResetBtn = document.getElementById('radio_empty_reset_btn');
if (radioResetBtn) {
    radioResetBtn.addEventListener('click', () => {
        if (radioSearchInput) radioSearchInput.value = '';
        radioSearchQuery = '';
        if (radioSearchClear) radioSearchClear.style.display = 'none';
        radioSelectedCountry = 'all';
        radioSelectedGenre = 'all';

        const label = document.getElementById('radio_selected_country_label');
        const flagEl = document.getElementById('radio_selected_flag');
        if (label) label.textContent = 'Selecionar País';
        if (flagEl) flagEl.textContent = '🌐';

        const options = document.querySelectorAll('#radio_country_options_menu .radio_option');
        options.forEach((o, idx) => {
            if (idx === 0) o.classList.add('active');
            else o.classList.remove('active');
        });

        const pills = document.querySelectorAll('#radio_genre_pills .radio_pill');
        pills.forEach((p, idx) => {
            if (idx === 0) p.classList.add('active');
            else p.classList.remove('active');
        });

        renderStackedRadioSections();
    });
}

// Inicializa os componentes e pré-renderiza a rádio imediatamente
setupRadioCountrySelect();
setupRadioGenrePills();
renderStackedRadioSections();

function openLibraryView() {
    activePlaylistId = null;
    if (songSideContainer) {
        songSideContainer.classList.remove('artist_mode');
        songSideContainer.classList.remove('playlist_mode');
        songSideContainer.classList.remove('radio_mode');
        songSideContainer.classList.add('library_mode');
    }

    // Restaura a visibilidade da barra de busca da navbar superior
    const navSearch = document.getElementById('search_bar_container');
    if (navSearch) navSearch.style.display = '';

    if (artistPageView) artistPageView.style.display = 'none';
    const plPageView = document.getElementById('playlist_page_view');
    if (plPageView) plPageView.style.display = 'none';
    const radPageView = document.getElementById('radio_page_view');
    if (radPageView) radPageView.style.display = 'none';

    const libPageView = document.getElementById('library_page_view');
    if (libPageView) libPageView.style.display = 'flex';

    setActiveNavTab('library');
    renderLibraryTable();
    updateLibraryBigPlayButton();
}

function getProcessedLibrarySongs() {
    let result = [...songs];

    // Filtro por abas (Todas vs Favoritas)
    if (currentLibraryFilter === 'favorites') {
        result = result.filter(s => favorites.includes(s.id));
    }

    // Filtro por busca interna
    if (currentLibrarySearch) {
        const q = currentLibrarySearch.toLowerCase();
        result = result.filter(s => 
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
            (s.album && s.album.toLowerCase().includes(q))
        );
    }

    // Ordenação
    if (currentLibrarySort === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentLibrarySort === 'artist') {
        result.sort((a, b) => a.subtitle.localeCompare(b.subtitle));
    } else if (currentLibrarySort === 'album') {
        result.sort((a, b) => (a.album || '').localeCompare(b.album || ''));
    } else if (currentLibrarySort === 'date') {
        // Mais recente primeiro
        result.sort((a, b) => b.id - a.id);
    } else if (currentLibrarySort === 'duration') {
        result.sort((a, b) => {
            const getSecs = (dur) => {
                if (!dur) return 0;
                const parts = dur.split(':').map(Number);
                return (parts[0] || 0) * 60 + (parts[1] || 0);
            };
            return getSecs(b.duration) - getSecs(a.duration);
        });
    }

    return result;
}

function renderLibraryTable() {
    const tableBody = document.getElementById('lib_table_body');
    if (!tableBody) return;

    const libSongs = getProcessedLibrarySongs();
    tableBody.innerHTML = '';

    if (libSongs.length === 0) {
        tableBody.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #8b92a5;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-music-note-beamed" viewBox="0 0 16 16" style="opacity: 0.4; margin-bottom: 12px;">
                    <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.895 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
                    <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
                    <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/>
                </svg>
                <h4 style="color: #fff; font-size: 17px; margin-bottom: 6px;">Nenhuma música encontrada</h4>
                <p style="font-size: 13px; max-width: 360px; margin: 0 auto;">
                    ${currentLibraryFilter === 'favorites' ? 'Você ainda não adicionou nenhuma música aos seus favoritos. Curta músicas para vê-las aqui!' : 'Tente buscar com outros termos ou redefinir os filtros aplicados.'}
                </p>
            </div>
        `;
        return;
    }

    libSongs.forEach((song, rowIdx) => {
        const actualIndex = songs.findIndex(s => s.id === song.id);
        const isActive = (currentIndex === actualIndex);
        const isCurrentlyPlaying = isActive && isPlaying && !isRadioStreaming;
        const isFav = favorites.includes(song.id);

        const row = document.createElement('div');
        row.className = `lib_table_row ${isActive ? 'active' : ''} ${isCurrentlyPlaying ? 'playing' : ''}`;
        row.dataset.songId = song.id;
        row.dataset.index = actualIndex;

        row.innerHTML = `
            <div class="col_num">
                <span class="row_index_num">${rowIdx + 1}</span>
                <span class="row_play_icon" title="${isCurrentlyPlaying ? 'Pausar' : 'Reproduzir'}">
                    ${isCurrentlyPlaying ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                        </svg>
                    ` : `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                        </svg>
                    `}
                </span>
            </div>
            <div class="col_title_wrap">
                <img src="${song.poster}" alt="${song.name}" class="col_thumb">
                <div class="col_track_info">
                    <span class="col_track_title">${song.name}</span>
                    <span class="col_track_artist">${song.subtitle}</span>
                </div>
            </div>
            <div class="col_album" title="${song.album || 'Single'}">${song.album || 'Single'}</div>
            <div class="col_date">${song.dateAdded || 'Recente'}</div>
            <div class="col_like">
                <button class="row_heart_btn ${isFav ? 'liked' : ''}" title="${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}">
                    ${isFav ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#36e2ec" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                        </svg>
                    ` : `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                        </svg>
                    `}
                </button>
            </div>
            <div class="col_duration">${song.duration || '3:30'}</div>
            <div class="col_more" style="display:flex; justify-content:center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color:#a7a7a7;">
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                </svg>
            </div>
        `;

        // Evento de clique no botão de coração
        const heartBtnEl = row.querySelector('.row_heart_btn');
        if (heartBtnEl) {
            heartBtnEl.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(song.id);
            });
        }

        // Evento de clique na linha inteira para tocar/pausar
        row.addEventListener('click', (e) => {
            if (actualIndex === currentIndex) {
                togglePlay();
            } else {
                setSong(actualIndex, true);
            }
        });

        tableBody.appendChild(row);
    });

    updateLibraryBigPlayButton();
}

function updateLibraryTableUI() {
    const tableBody = document.getElementById('lib_table_body');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('.lib_table_row');
    rows.forEach(row => {
        const rowSongId = parseInt(row.dataset.songId, 10);
        const actualIndex = parseInt(row.dataset.index, 10);
        const isActive = (currentIndex === actualIndex);
        const isCurrentlyPlaying = isActive && isPlaying && !isRadioStreaming;
        const isFav = favorites.includes(rowSongId);

        row.classList.toggle('active', isActive);
        row.classList.toggle('playing', isCurrentlyPlaying);

        // Atualiza ícone de play / pause
        const playIconSpan = row.querySelector('.row_play_icon');
        if (playIconSpan) {
            playIconSpan.setAttribute('title', isCurrentlyPlaying ? 'Pausar' : 'Reproduzir');
            playIconSpan.innerHTML = isCurrentlyPlaying ? `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                </svg>
            ` : `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
            `;
        }

        // Atualiza coração
        const heartBtnEl = row.querySelector('.row_heart_btn');
        if (heartBtnEl) {
            heartBtnEl.classList.toggle('liked', isFav);
            heartBtnEl.setAttribute('title', isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos');
            heartBtnEl.innerHTML = isFav ? `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#36e2ec" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                </svg>
            ` : `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                </svg>
            `;
        }
    });

    updateLibraryBigPlayButton();
}

function updateLibraryBigPlayButton() {
    const bigPlayBtn = document.getElementById('lib_big_play_btn');
    if (!bigPlayBtn) return;

    const isCurrentPlaying = isPlaying && !isRadioStreaming && (currentIndex >= 0);
    bigPlayBtn.setAttribute('title', isCurrentPlaying ? 'Pausar biblioteca' : 'Tocar biblioteca');
    bigPlayBtn.innerHTML = isCurrentPlaying ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
        </svg>
    ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" style="margin-left: 2px;">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
        </svg>
    `;
}

// Inicialização dos Controles da Biblioteca Spotify
const libBackBtn = document.getElementById('library_back_btn');
if (libBackBtn) libBackBtn.addEventListener('click', returnToHomeView);

const libBigPlayBtn = document.getElementById('lib_big_play_btn');
if (libBigPlayBtn) {
    libBigPlayBtn.addEventListener('click', () => {
        const libSongs = getProcessedLibrarySongs();
        if (libSongs.length === 0) {
            showToast('Nenhuma música para reproduzir');
            return;
        }

        if (isPlaying && !isRadioStreaming && currentIndex >= 0) {
            pauseMusic();
        } else if (currentIndex >= 0 && !isRadioStreaming) {
            playMusic();
        } else {
            // Toca a primeira faixa da biblioteca
            const firstIdx = songs.findIndex(s => s.id === libSongs[0].id);
            setSong(firstIdx >= 0 ? firstIdx : 0, true);
        }
    });
}

const libShuffleToggle = document.getElementById('lib_shuffle_toggle');
if (libShuffleToggle) {
    libShuffleToggle.addEventListener('click', () => {
        isShuffle = !isShuffle;
        libShuffleToggle.classList.toggle('active', isShuffle);
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', isShuffle);
        }
        showToast(isShuffle ? '🔀 Modo aleatório ativado' : '▶️ Modo sequencial ativado');
    });
}

const libDownloadAll = document.getElementById('lib_download_all');
if (libDownloadAll) {
    libDownloadAll.addEventListener('click', () => {
        if (currentIndex >= 0 && songs[currentIndex]) {
            let cur = songs[currentIndex];
            let a = document.createElement('a');
            a.href = cur.file;
            a.download = `${cur.name}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast(`💾 Baixando "${cur.name}"...`);
        } else {
            showToast('💾 Selecione uma faixa da biblioteca para baixar');
        }
    });
}

// Filtros em Chip (Todas / Favoritas)
const libFilterChips = document.querySelectorAll('.lib_filter_chip');
libFilterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        libFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentLibraryFilter = chip.dataset.filter || 'all';
        renderLibraryTable();
    });
});

// Ordenação
const libSortSelect = document.getElementById('lib_sort_select');
if (libSortSelect) {
    libSortSelect.addEventListener('change', (e) => {
        currentLibrarySort = e.target.value;
        renderLibraryTable();
    });
}

// Busca interna
const libSearchInput = document.getElementById('lib_search_input');
if (libSearchInput) {
    libSearchInput.addEventListener('input', (e) => {
        currentLibrarySearch = e.target.value.trim();
        renderLibraryTable();
    });
}

/* ===== Handlers para a Navegação Mobile e Gaveta Lateral (Spotify Mobile) ===== */
const mobMenuToggle = document.getElementById('mob_menu_toggle');
const mobileDrawerBackdrop = document.getElementById('mobile_drawer_backdrop');
const mobTabHome = document.getElementById('mob_tab_home');
const mobTabSearch = document.getElementById('mob_tab_search');
const mobTabRadio = document.getElementById('mob_tab_radio');
const mobTabLibrary = document.getElementById('mob_tab_library');

function openMobileDrawer() {
    if (menuSide) menuSide.classList.add('mobile_open');
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('active');
}

function closeMobileDrawer() {
    if (menuSide) menuSide.classList.remove('mobile_open');
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('active');
}

if (mobMenuToggle) {
    mobMenuToggle.addEventListener('click', openMobileDrawer);
}

if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);
}

if (mobTabHome) {
    mobTabHome.addEventListener('click', () => {
        closeMobileDrawer();
        returnToHomeView();
    });
}

if (mobTabSearch) {
    mobTabSearch.addEventListener('click', () => {
        closeMobileDrawer();
        returnToHomeView();
        const searchInp = document.getElementById('search_input');
        if (searchInp) {
            searchInp.focus();
            searchInp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setActiveNavTab('search');
    });
}

if (mobTabRadio) {
    mobTabRadio.addEventListener('click', () => {
        closeMobileDrawer();
        openRadioView();
    });
}

if (mobTabLibrary) {
    mobTabLibrary.addEventListener('click', () => {
        closeMobileDrawer();
        openLibraryView();
    });
}

// Fechar gaveta móvel ao clicar em playlists ou faixas no celular
if (menuSide) {
    menuSide.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && (e.target.closest('.songItem') || e.target.closest('.custom_playlist_item') || e.target.closest('.liked_songs_item'))) {
            closeMobileDrawer();
        }
    });
}

// Toque no mini-player flutuante para abrir painel "Tocando Agora" no celular
const masterPlayContainer = document.querySelector('.master_play');
if (masterPlayContainer) {
    masterPlayContainer.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('#play_pause_btn') && !e.target.closest('#heart_btn') && !e.target.closest('#heart_btn_filled')) {
                const rightSideEl = document.getElementById('right_side');
                if (rightSideEl) {
                    rightSideEl.classList.add('active');
                }
            }
        }
    });
}

if (rightSideClose) {
    rightSideClose.addEventListener('click', () => {
        const rightSideEl = document.getElementById('right_side');
        if (rightSideEl) rightSideEl.classList.remove('active');
    });
}

/* ===== Minimalist HUD Estilo YouTube (Feedback Não-Intrusivo na Tela) ===== */
let ytHudTimer = null;
function triggerMiniHud(type, value) {
    const hud = document.getElementById('yt_mini_hud');
    if (!hud) return;

    hud.classList.remove('pill_hud');
    hud.innerHTML = '';

    if (type === 'play') {
        hud.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
        `;
    } else if (type === 'pause') {
        hud.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
            </svg>
        `;
    } else if (type === 'forward') {
        hud.classList.add('pill_hud');
        hud.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
            <span>+5s</span>
        `;
    } else if (type === 'rewind') {
        hud.classList.add('pill_hud');
        hud.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style="transform:rotate(180deg);">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
            <span>-5s</span>
        `;
    } else if (type === 'volume') {
        hud.classList.add('pill_hud');
        let iconPath = '';
        if (value === 0) {
            iconPath = '<path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>';
        } else if (value < 50) {
            iconPath = '<path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zm3.025 4a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z"/>';
        } else {
            iconPath = '<path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>';
        }
        hud.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                ${iconPath}
            </svg>
            <span>${value}%</span>
        `;
    }

    hud.classList.remove('active');
    void hud.offsetWidth; // Força reflow
    hud.classList.add('active');

    clearTimeout(ytHudTimer);
    ytHudTimer = setTimeout(() => {
        hud.classList.remove('active');
    }, 550);
}

/* ===== Atalhos Globais de Teclado (Espaço: Play/Pause | Setas: Avançar/Retroceder & Volume) ===== */
document.addEventListener('keydown', (e) => {
    // 1. Evita interceptação se o usuário estiver digitando em campos de busca, modais ou inputs
    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (activeEl && (activeEl.isContentEditable || activeEl.getAttribute('contenteditable') === 'true'))) {
        return;
    }

    // 2. Tecla Espaço: Play / Pause (Estilo YouTube, sem popup invasivo)
    if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
        e.preventDefault(); // Impede rolagem da página para baixo
        const willPlay = !isPlaying;
        togglePlay();
        triggerMiniHud(willPlay ? 'play' : 'pause');
        return;
    }

    // 3. Seta Direita: Avançar +5s na faixa atual (ou próxima faixa com Shift)
    if (e.code === 'ArrowRight' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
            playNextSong();
            triggerMiniHud('forward');
            return;
        }
        if (isRadioStreaming) {
            playNextSong();
            return;
        }
        if (!isNaN(music.duration) && music.duration > 0) {
            const newTime = Math.min(music.duration, music.currentTime + 5);
            music.currentTime = newTime;
            const progress = (newTime / music.duration) * 100;
            seek.value = progress;
            bar2.style.width = `${progress}%`;
            dot.style.left = `${progress}%`;
            currentStart.textContent = formatTime(newTime);
            triggerMiniHud('forward');
        }
        return;
    }

    // 4. Seta Esquerda: Retroceder -5s na faixa atual (ou faixa anterior com Shift)
    if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
            playPrevSong();
            triggerMiniHud('rewind');
            return;
        }
        if (isRadioStreaming) {
            playPrevSong();
            return;
        }
        if (!isNaN(music.duration) && music.duration > 0) {
            const newTime = Math.max(0, music.currentTime - 5);
            music.currentTime = newTime;
            const progress = (newTime / music.duration) * 100;
            seek.value = progress;
            bar2.style.width = `${progress}%`;
            dot.style.left = `${progress}%`;
            currentStart.textContent = formatTime(newTime);
            triggerMiniHud('rewind');
        }
        return;
    }

    // 5. Seta para Cima: Aumentar Volume em +5% (Estilo YouTube)
    if (e.code === 'ArrowUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        let cur = parseInt(vol.value) || 0;
        let newVol = Math.min(100, Math.round((cur + 5) / 5) * 5);
        vol.value = newVol;
        music.volume = newVol / 100;
        if (newVol > 0) lastVolume = newVol;
        updateVolIcon(newVol);
        triggerMiniHud('volume', newVol);
        return;
    }

    // 6. Seta para Baixo: Diminuir Volume em -5% (Estilo YouTube)
    if (e.code === 'ArrowDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        let cur = parseInt(vol.value) || 0;
        let newVol = Math.max(0, Math.round((cur - 5) / 5) * 5);
        vol.value = newVol;
        music.volume = newVol / 100;
        if (newVol > 0) lastVolume = newVol;
        updateVolIcon(newVol);
        triggerMiniHud('volume', newVol);
        return;
    }
});

/* ==========================================================================
   ===== Sistema de Hover Marquee para Títulos Longos (Estilo Spotify) =====
   ========================================================================== */

/**
 * Calcula se o texto transborda seu contêiner e aplica propriedades CSS
 * para a animação de rolagem horizontal fluida com velocidade controlada.
 */
function updateMarqueeForElement(container) {
    if (!container) return;
    const wrap = container.querySelector('.song_title_wrap') || (container.classList.contains('song_title_wrap') ? container : null);
    if (!wrap) return;
    const textEl = wrap.querySelector('.song_title_text');
    if (!textEl) return;

    // Reseta temporariamente para medir o tamanho natural sem quebra
    const prevMax = textEl.style.maxWidth;
    textEl.style.maxWidth = 'none';
    const textWidth = textEl.scrollWidth;
    const containerWidth = wrap.clientWidth;
    textEl.style.maxWidth = prevMax;

    const overflow = textWidth - containerWidth;

    if (overflow > 3) {
        wrap.classList.add('has-marquee');
        const travelDist = overflow + 8; // Folga de 8px no final para leitura completa
        wrap.style.setProperty('--marquee-dist', `-${travelDist}px`);

        // Velocidade controlada: ~26px por segundo de deslocamento ativo
        // O ciclo total: 15% pausa início + 45% rolagem ativa + 15% pausa fim + 17% retorno + 8% pausa reset
        const scrollSeconds = travelDist / 26;
        const totalDuration = Math.max(3.2, +(scrollSeconds / 0.45).toFixed(2));
        wrap.style.setProperty('--marquee-duration', `${totalDuration}s`);
    } else {
        wrap.classList.remove('has-marquee');
        wrap.classList.remove('is-marquee-active');
        wrap.style.removeProperty('--marquee-dist');
        wrap.style.removeProperty('--marquee-duration');
        textEl.style.transition = '';
        textEl.style.transform = '';
    }
}

/**
 * Anexa eventos de mouseenter e mouseleave com retorno suave e sem saltos.
 */
function attachMarqueeHoverEvents(hostElement, wrap, textEl) {
    if (!hostElement || !wrap || !textEl) return;
    if (wrap._marqueeHoverBound) return;
    wrap._marqueeHoverBound = true;

    let cleanupTimer = null;

    hostElement.addEventListener('mouseenter', () => {
        if (!wrap.classList.contains('has-marquee')) return;

        // Cancela qualquer transição de retorno que estivesse em andamento
        if (cleanupTimer) {
            clearTimeout(cleanupTimer);
            cleanupTimer = null;
        }
        textEl.style.transition = '';
        textEl.style.transform = '';

        // Dispara a animação contínua
        wrap.classList.add('is-marquee-active');
    });

    hostElement.addEventListener('mouseleave', () => {
        if (!wrap.classList.contains('has-marquee')) return;
        if (!wrap.classList.contains('is-marquee-active')) return;

        // 1. Captura a coordenada exata em que a animação se encontra
        const style = window.getComputedStyle(textEl);
        const transformMatrix = style.transform;

        // 2. Remove a classe de animação keyframe
        wrap.classList.remove('is-marquee-active');

        if (transformMatrix && transformMatrix !== 'none') {
            // Congela na posição atual
            textEl.style.transform = transformMatrix;
            // 3. Aplica retorno suave 2D sem travar o pipeline gráfico
            requestAnimationFrame(() => {
                textEl.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                textEl.style.transform = 'translateX(0)';
            });

            const onTransitionEnd = () => {
                textEl.style.transition = '';
                textEl.style.transform = '';
                textEl.removeEventListener('transitionend', onTransitionEnd);
            };
            textEl.addEventListener('transitionend', onTransitionEnd);
            cleanupTimer = setTimeout(onTransitionEnd, 450);
        } else {
            textEl.style.transition = '';
            textEl.style.transform = '';
        }
    });
}

/**
 * Inicializa e vincula todos os títulos de músicas do site
 */
function initHoverMarqueeSystem() {
    // 1. Músicas nos carrosséis horizontais e barra lateral
    const songCards = document.querySelectorAll(
        '.popular_song .pop_song li.songItem, ' +
        '.popular_artists .pop_song li.songItem, ' +
        '.menu_side .menu_song li.songItem'
    );

    songCards.forEach(card => {
        const wrap = card.querySelector('.song_title_wrap');
        const textEl = card.querySelector('.song_title_text');
        if (wrap && textEl) {
            updateMarqueeForElement(wrap);
            attachMarqueeHoverEvents(card, wrap, textEl);
        }
    });

    // 2. Player inferior (master_play)
    if (titleMasterPlay) {
        const wrap = titleMasterPlay.querySelector('.song_title_wrap');
        const textEl = titleMasterPlay.querySelector('.song_title_text');
        if (wrap && textEl) {
            updateMarqueeForElement(wrap);
            attachMarqueeHoverEvents(titleMasterPlay, wrap, textEl);
        }
    }
}

// Recalcula o marquee em resize da janela com debounce
let marqueeResizeDebounce = null;
window.addEventListener('resize', () => {
    clearTimeout(marqueeResizeDebounce);
    marqueeResizeDebounce = setTimeout(() => {
        const wraps = document.querySelectorAll('.song_title_wrap');
        wraps.forEach(wrap => updateMarqueeForElement(wrap));
    }, 150);
});

// Inicialização imediata e no carregamento completo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHoverMarqueeSystem);
} else {
    initHoverMarqueeSystem();
}
window.addEventListener('load', () => {
    setTimeout(initHoverMarqueeSystem, 100);
});
