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

let radioActiveFilter = 'all'; // 'all' | país | gênero
let radioSearchQuery = '';
let radioSearchTimeout = null;

// Rádios Curadas Organizadas por País / Localização (Prioridade: Brasil no Topo, seguido de EUA, Reino Unido, Portugal, Espanha, etc.)
const CURATED_RADIO_SECTIONS = [
    {
        id: "brasil",
        country: "Brasil",
        flag: "🇧🇷",
        code: "BR",
        stations: [
            {
                name: "Alpha FM 101.7",
                stationuuid: "curated_alpha_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "pop,adult contemporary,hits",
                bitrate: 128,
                favicon: "https://cdn-profiles.tunein.com/s8129/images/logod.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_ALPHAFMAAC.aac",
                color: "#1e3a8a",
                location: "São Paulo, SP"
            },
            {
                name: "Antena 1 94.7 FM",
                stationuuid: "curated_antena1",
                country: "Brasil",
                countrycode: "BR",
                tags: "adult contemporary,jazz,pop",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio9505_1574170366.png",
                url_resolved: "https://antenaone.crossradio.com.br/stream/1;",
                color: "#0369a1",
                location: "São Paulo, SP"
            },
            {
                name: "Rádio Mix FM 106.3",
                stationuuid: "curated_mix_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "pop,rock,jovem,hits",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio13955_1720541703.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/MIXFM_SPAAC.aac",
                color: "#b91c1c",
                location: "São Paulo, SP"
            },
            {
                name: "89 FM A Rádio Rock",
                stationuuid: "curated_89_rock",
                country: "Brasil",
                countrycode: "BR",
                tags: "rock,classic rock,alternative",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio91_1603729864.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_89FMAAC.aac",
                color: "#18181b",
                location: "São Paulo, SP"
            },
            {
                name: "Band FM 96.1",
                stationuuid: "curated_band_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "pagode,sertanejo,popular",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio87_1603728639.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_BANDFMAAC.aac",
                color: "#15803d",
                location: "São Paulo, SP"
            },
            {
                name: "Rádio Saudade FM 99.7",
                stationuuid: "curated_saudade_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "flashback,anos 70,anos 80,classicos",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio8_1626274384.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/SAUDADE_FMAAC.aac",
                color: "#4338ca",
                location: "Santos, SP"
            },
            {
                name: "Jovem Pan FM",
                stationuuid: "curated_jovem_pan",
                country: "Brasil",
                countrycode: "BR",
                tags: "pop,jovem,noticias,talk",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio92_1603730248.png",
                url_resolved: "https://live.paineldj.com.br/proxy/jfloripa?mp=/stream",
                color: "#b91c1c",
                location: "São Paulo, SP"
            },
            {
                name: "CBN São Paulo 90.5 FM",
                stationuuid: "curated_cbn_sp",
                country: "Brasil",
                countrycode: "BR",
                tags: "news,talk,jornalismo,esportes",
                bitrate: 96,
                favicon: "https://img.radios.com.br/radio/lg/radio90_1603729571.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_CBN_SPAAC.aac",
                color: "#dc2626",
                location: "São Paulo, SP"
            },
            {
                name: "Bossa Jazz Brasil",
                stationuuid: "curated_bossa_jazz",
                country: "Brasil",
                countrycode: "BR",
                tags: "bossa nova,jazz,mpb,instrumental",
                bitrate: 128,
                favicon: "https://bossajazzbrasil.com/wp-content/uploads/2021/08/logo-bossa-jazz-brasil.png",
                url_resolved: "https://centova5.transmissaodigital.com:20104/live",
                color: "#7c2d12",
                location: "Santos, SP"
            },
            {
                name: "Metropolitana 98.5 FM",
                stationuuid: "curated_metropolitana",
                country: "Brasil",
                countrycode: "BR",
                tags: "pop,funk,dance,jovem",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio14_1603726715.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/METROPOLITANA_FMAAC.aac",
                color: "#1d4ed8",
                location: "São Paulo, SP"
            },
            {
                name: "BandNews FM 96.9",
                stationuuid: "curated_bandnews",
                country: "Brasil",
                countrycode: "BR",
                tags: "news,jornalismo,noticias",
                bitrate: 96,
                favicon: "https://img.radios.com.br/radio/lg/radio94_1603730872.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_BANDNEWSFMAAC.aac",
                color: "#b91c1c",
                location: "São Paulo, SP"
            },
            {
                name: "Nativa FM 95.3",
                stationuuid: "curated_nativa_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "sertanejo,romantico,popular",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio12_1603726487.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_NATIVAFMAAC.aac",
                color: "#7e22ce",
                location: "São Paulo, SP"
            },
            {
                name: "Kiss FM 92.5",
                stationuuid: "curated_kiss_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "rock,classic rock,hard rock",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio24_1603727670.png",
                url_resolved: "https://caikron.radios.net:8022/stream",
                color: "#991b1b",
                location: "São Paulo, SP"
            },
            {
                name: "Novabrasil FM 89.7",
                stationuuid: "curated_novabrasil",
                country: "Brasil",
                countrycode: "BR",
                tags: "mpb,musica brasileira,bossa",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio11_1603726359.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/NOVABRASIL_FMAAC.aac",
                color: "#059669",
                location: "São Paulo, SP"
            },
            {
                name: "Gazeta FM 88.1",
                stationuuid: "curated_gazeta_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "pop,hits,sertanejo",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio95_1603730999.png",
                url_resolved: "https://26683.live.streamtheworld.com:443/GAZETA_FMAAC.aac",
                color: "#ea580c",
                location: "São Paulo, SP"
            },
            {
                name: "Rádio Disney 91.3",
                stationuuid: "curated_disney_fm",
                country: "Brasil",
                countrycode: "BR",
                tags: "pop,teen,hits",
                bitrate: 128,
                favicon: "https://img.radios.com.br/radio/lg/radio15_1603726839.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/DISNEY_BRAAC.aac",
                color: "#0284c7",
                location: "São Paulo, SP"
            }
        ]
    },
    {
        id: "estados_unidos",
        country: "Estados Unidos",
        flag: "🇺🇸",
        code: "US",
        stations: [
            {
                name: "181.FM - The Eagle",
                stationuuid: "curated_181_eagle",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "classic rock,rock,70s,80s",
                bitrate: 128,
                favicon: "https://images.live-radio.net/181fm-the-eagle.png",
                url_resolved: "https://listen.181fm.com/181-eagle_128k.mp3",
                color: "#b45309",
                location: "Waynesboro, VA"
            },
            {
                name: "Smooth Jazz 247",
                stationuuid: "curated_smooth_jazz",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "jazz,smooth jazz,relax,instrumental",
                bitrate: 128,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/7n79m3767nsu.jpg",
                url_resolved: "https://streaming.exclusive.radio/er/smoothjazz/icecast.audio",
                color: "#4f46e5",
                location: "New York, NY"
            },
            {
                name: "KEXP 90.3 FM",
                stationuuid: "curated_kexp",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "alternative,indie,rock,eclectic",
                bitrate: 160,
                favicon: "https://kexp.org/static/assets/img/kexp-logo-social.png",
                url_resolved: "https://kexp.streamguys1.com/kexp160.mp3",
                color: "#e11d48",
                location: "Seattle, WA"
            },
            {
                name: "181.FM - Awesome 80's",
                stationuuid: "curated_181_80s",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "flashback,80s,pop,retro",
                bitrate: 128,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/b9f8d9760773.jpg",
                url_resolved: "https://listen.181fm.com/181-awesome80s_128k.mp3",
                color: "#db2777",
                location: "Waynesboro, VA"
            },
            {
                name: "SomaFM - Groove Salad",
                stationuuid: "curated_groove_salad",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "electronic,ambient,chillout,downtempo",
                bitrate: 128,
                favicon: "https://somafm.com/img/groovesalad120.png",
                url_resolved: "https://ice1.somafm.com/groovesalad-128-mp3",
                color: "#059669",
                location: "San Francisco, CA"
            },
            {
                name: "Power 106 FM Los Angeles",
                stationuuid: "curated_power_106",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "hip-hop,rap,r&b,urban",
                bitrate: 128,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/872kydc66szn.jpg",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac",
                color: "#d97706",
                location: "Los Angeles, CA"
            },
            {
                name: "WNYC 93.9 FM",
                stationuuid: "curated_wnyc",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "news,talk,npr,jornalismo",
                bitrate: 96,
                favicon: "https://media.wnyc.org/i/300/300/c/80/1/wnyc_square_logo.png",
                url_resolved: "https://fm939.wnyc.org/wnycfm-web.aac",
                color: "#dc2626",
                location: "New York, NY"
            },
            {
                name: "Big R Radio - 90s Alternative",
                stationuuid: "curated_bigr_90s",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "rock,90s,grunge,alternative",
                bitrate: 128,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/478637500.jpg",
                url_resolved: "https://shoutcast.bigrradio.com/90salternative",
                color: "#475569",
                location: "United States"
            }
        ]
    },
    {
        id: "reino_unido",
        country: "Reino Unido",
        flag: "🇬🇧",
        code: "GB",
        stations: [
            {
                name: "BBC Radio 1",
                stationuuid: "curated_bbc_1",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "pop,dance,chart,electronic",
                bitrate: 128,
                favicon: "https://sounds.files.bbci.co.uk/3.6.4/networks/bbc_radio_one/colour_default.svg",
                url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
                color: "#0284c7",
                location: "London, UK"
            },
            {
                name: "BBC Radio 6 Music",
                stationuuid: "curated_bbc_6",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "alternative,indie,rock,curated",
                bitrate: 128,
                favicon: "https://sounds.files.bbci.co.uk/3.6.4/networks/bbc_6music/colour_default.svg",
                url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_6music",
                color: "#0f766e",
                location: "London, UK"
            },
            {
                name: "Capital FM London",
                stationuuid: "curated_capital_fm",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "pop,hits,top 40,dance",
                bitrate: 128,
                favicon: "https://images.live-radio.net/capital-london.png",
                url_resolved: "https://media-ice.musicradio.com/CapitalMP3",
                color: "#e11d48",
                location: "London, UK"
            },
            {
                name: "Classic FM UK",
                stationuuid: "curated_classic_fm",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "classical,soundtrack,instrumental",
                bitrate: 128,
                favicon: "https://images.live-radio.net/classic-fm.png",
                url_resolved: "https://media-ice.musicradio.com/ClassicFMMP3",
                color: "#1e3a8a",
                location: "London, UK"
            },
            {
                name: "Heart UK",
                stationuuid: "curated_heart_uk",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "pop,feel good,90s,00s",
                bitrate: 128,
                favicon: "https://images.live-radio.net/heart-london.png",
                url_resolved: "https://media-ice.musicradio.com/HeartLondonMP3",
                color: "#dc2626",
                location: "London, UK"
            },
            {
                name: "Radio X UK",
                stationuuid: "curated_radio_x",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "rock,indie,britpop,alternative",
                bitrate: 128,
                favicon: "https://images.live-radio.net/radio-x-london.png",
                url_resolved: "https://media-ice.musicradio.com/RadioXLondonMP3",
                color: "#047857",
                location: "London, UK"
            }
        ]
    },
    {
        id: "portugal",
        country: "Portugal",
        flag: "🇵🇹",
        code: "PT",
        stations: [
            {
                name: "Rádio Comercial",
                stationuuid: "curated_comercial_pt",
                country: "Portugal",
                countrycode: "PT",
                tags: "pop,hits,entretenimento,jovem",
                bitrate: 128,
                favicon: "https://radiocomercial.pt/assets/icons/favicon-192x192.png",
                url_resolved: "https://stream-icy.bauermedia.pt/comercial.mp3",
                color: "#dc2626",
                location: "Lisboa, Portugal"
            },
            {
                name: "RFM Portugal",
                stationuuid: "curated_rfm_pt",
                country: "Portugal",
                countrycode: "PT",
                tags: "pop,rock,sucessos,hits",
                bitrate: 128,
                favicon: "https://rfm.pt/assets/icons/favicon-192x192.png",
                url_resolved: "https://stream-icy.bauermedia.pt/rfm.mp3",
                color: "#0284c7",
                location: "Lisboa, Portugal"
            },
            {
                name: "M80 Rádio Portugal",
                stationuuid: "curated_m80_pt",
                country: "Portugal",
                countrycode: "PT",
                tags: "flashback,anos 80,anos 90,classicos",
                bitrate: 128,
                favicon: "https://m80.pt/assets/icons/favicon-192x192.png",
                url_resolved: "https://stream-icy.bauermedia.pt/m80.mp3",
                color: "#7c3aed",
                location: "Lisboa, Portugal"
            },
            {
                name: "Antena 1 Portugal",
                stationuuid: "curated_antena1_pt",
                country: "Portugal",
                countrycode: "PT",
                tags: "noticias,cultura,fado,talk",
                bitrate: 128,
                favicon: "https://cdn-radios.rtp.pt/antena1/wp-content/themes/antena1/assets/img/antena1.png",
                url_resolved: "https://radiocast.rtp.pt/antena180a.mp3",
                color: "#059669",
                location: "Lisboa, Portugal"
            },
            {
                name: "TSF Rádio Notícias",
                stationuuid: "curated_tsf_pt",
                country: "Portugal",
                countrycode: "PT",
                tags: "news,talk,jornalismo,informacao",
                bitrate: 96,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/gH5n6fEw4c.png",
                url_resolved: "https://tsfdirecto.tsf.pt/tsf.mp3",
                color: "#b91c1c",
                location: "Lisboa, Portugal"
            },
            {
                name: "Mega Hits",
                stationuuid: "curated_mega_hits",
                country: "Portugal",
                countrycode: "PT",
                tags: "pop,dance,eletronica,jovem",
                bitrate: 128,
                favicon: "https://megahits.pt/assets/icons/favicon-192x192.png",
                url_resolved: "https://stream-icy.bauermedia.pt/megahits.mp3",
                color: "#ea580c",
                location: "Lisboa, Portugal"
            }
        ]
    },
    {
        id: "espanha",
        country: "Espanha",
        flag: "🇪🇸",
        code: "ES",
        stations: [
            {
                name: "Los 40 Principales",
                stationuuid: "curated_los40_es",
                country: "Espanha",
                countrycode: "ES",
                tags: "pop,latin,hits,dance",
                bitrate: 128,
                favicon: "https://los40.com/dist/assets/images/favicon/favicon-192.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40AAC.aac",
                color: "#0284c7",
                location: "Madrid, España"
            },
            {
                name: "Cadena SER",
                stationuuid: "curated_cadenaser_es",
                country: "Espanha",
                countrycode: "ES",
                tags: "news,talk,noticias,actualidad",
                bitrate: 96,
                favicon: "https://cadenaser.com/dist/assets/images/favicon/favicon-192.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASERAAC.aac",
                color: "#1d4ed8",
                location: "Madrid, España"
            },
            {
                name: "Cadena Dial",
                stationuuid: "curated_cadenadial_es",
                country: "Espanha",
                countrycode: "ES",
                tags: "pop,baladas,musica en espanol",
                bitrate: 128,
                favicon: "https://cadenadial.com/dist/assets/images/favicon/favicon-192.png",
                url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/CADENADIALAAC.aac",
                color: "#16a34a",
                location: "Madrid, España"
            },
            {
                name: "Rock FM España",
                stationuuid: "curated_rockfm_es",
                country: "Espanha",
                countrycode: "ES",
                tags: "rock,classic rock,hard rock",
                bitrate: 128,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/2J2r2q3K4E.png",
                url_resolved: "https://rockfm.cope.stream.flumotion.com/cope/rockfm.mp3",
                color: "#1e293b",
                location: "Madrid, España"
            }
        ]
    },
    {
        id: "internacional",
        country: "Internacional & Global",
        flag: "🌐",
        code: "GLOBAL",
        stations: [
            {
                name: "1LIVE WDR",
                stationuuid: "curated_1live_de",
                country: "Alemanha",
                countrycode: "DE",
                tags: "pop,dance,electronic,hits",
                bitrate: 128,
                favicon: "https://www1.wdr.de/radio/1live/1live-logo-100~_v-gseapremiumxl.jpg",
                url_resolved: "https://wdr-1live-live.icecast.wdr.de/wdr/1live/live/mp3/128/stream.mp3",
                color: "#dc2626",
                location: "Köln, Deutschland"
            },
            {
                name: "Sunshine Live",
                stationuuid: "curated_sunshine_live",
                country: "Alemanha",
                countrycode: "DE",
                tags: "electronic,edm,techno,trance",
                bitrate: 192,
                favicon: "https://static.mytuner.mobi/media/tvos_radios/3j3g96357d34.jpg",
                url_resolved: "https://sunsl.streamabc.net/sunsl-techno-mp3-192-3487441",
                color: "#f59e0b",
                location: "Berlin, Deutschland"
            },
            {
                name: "Defected Radio",
                stationuuid: "curated_defected_global",
                country: "Reino Unido",
                countrycode: "GB",
                tags: "house,dance,electronic,club",
                bitrate: 128,
                favicon: "https://defected.com/assets/favicon/apple-touch-icon.png",
                url_resolved: "https://stream.defected.com/defected.mp3",
                color: "#475569",
                location: "London, UK"
            },
            {
                name: "SomaFM - Secret Agent",
                stationuuid: "curated_secret_agent",
                country: "Estados Unidos",
                countrycode: "US",
                tags: "lounge,chillout,spy,soundtrack",
                bitrate: 128,
                favicon: "https://somafm.com/img/secretagent120.jpg",
                url_resolved: "https://ice1.somafm.com/secretagent-128-mp3",
                color: "#047857",
                location: "San Francisco, CA"
            }
        ]
    }
];

// Chamada resiliente para a Radio Browser API com rotação de espelhos
async function fetchRadioBrowserAPI(path) {
    for (let i = 0; i < RADIO_API_SERVERS.length; i++) {
        const srv = RADIO_API_SERVERS[(currentRadioServerIdx + i) % RADIO_API_SERVERS.length];
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`${srv}${path}`, {
                signal: controller.signal,
                headers: { 'User-Agent': 'MusicPlaylistWeb/2.0' }
            });
            clearTimeout(tid);
            if (res.ok) {
                currentRadioServerIdx = (currentRadioServerIdx + i) % RADIO_API_SERVERS.length;
                return await res.json();
            }
        } catch (e) {
            console.warn(`Servidor de rádio ${srv} indisponível, tentando próximo...`);
        }
    }
    throw new Error('Servidores da Radio Browser API temporariamente inacessíveis.');
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

// Cria o elemento Card da Rádio (Estilo Spotify: Imagem no topo, título, subtítulo e botão de play no hover)
function createRadioCardElement(station) {
    const card = document.createElement('div');
    card.className = 'radio_station_card';
    card.dataset.stationuuid = station.stationuuid || station.name;

    const isThisPlaying = isRadioStreaming && activeRadioStation && 
        (activeRadioStation.stationuuid === station.stationuuid || activeRadioStation.name === station.name);

    if (isThisPlaying) card.classList.add('is_playing');

    const fallbackImg = generateRadioFallbackAvatar(station.name, station.color || '#1e3a8a');
    const imgSrc = station.favicon && station.favicon.startsWith('http') ? station.favicon : fallbackImg;

    // Subtítulo elegante com país / localização e tags (estilo Spotify da imagem)
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

// Renderiza todas as categorias de listas empilhadas por país (Brasil no topo, EUA, Reino Unido, Portugal, etc.)
function renderStackedRadioSections() {
    const container = document.getElementById('radio_stacked_sections');
    const loadingEl = document.getElementById('radio_loading_state');
    const emptyEl = document.getElementById('radio_empty_state');
    if (!container) return;

    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';
    container.innerHTML = '';

    const q = radioSearchQuery.toLowerCase().trim();
    const filter = radioActiveFilter.toLowerCase().trim();

    let totalVisible = 0;

    CURATED_RADIO_SECTIONS.forEach(sec => {
        // Verifica se o filtro ativo restringe a um país específico
        if (filter !== 'all') {
            const isCountryMatch = sec.country.toLowerCase().includes(filter) || sec.id.toLowerCase().includes(filter);
            const isGenreFilter = ['pop', 'rock', 'sertanejo', 'mpb', 'flashback', 'news', 'electronic', 'jazz'].includes(filter);
            if (!isCountryMatch && !isGenreFilter) {
                return;
            }
        }

        // Filtra as estações da seção
        const matchingStations = sec.stations.filter(station => {
            // Busca textual (nome, tags, país ou localização)
            if (q) {
                const nameMatch = station.name.toLowerCase().includes(q);
                const tagMatch = (station.tags || '').toLowerCase().includes(q);
                const countryMatch = (station.country || '').toLowerCase().includes(q);
                const locMatch = (station.location || '').toLowerCase().includes(q);
                if (!nameMatch && !tagMatch && !countryMatch && !locMatch) return false;
            }

            // Filtro por gênero se ativo
            if (filter !== 'all') {
                const isGenreFilter = ['pop', 'rock', 'sertanejo', 'mpb', 'flashback', 'news', 'electronic', 'jazz'].includes(filter);
                if (isGenreFilter) {
                    const tagMatch = (station.tags || '').toLowerCase().includes(filter);
                    if (!tagMatch) return false;
                }
            }

            return true;
        });

        if (matchingStations.length === 0) return;

        totalVisible += matchingStations.length;

        // Cria a seção empilhada para este país (com título do país conforme pedido pelo usuário)
        const sectionEl = document.createElement('section');
        sectionEl.className = 'radio_country_section';
        sectionEl.id = `radio_section_${sec.id}`;

        sectionEl.innerHTML = `
            <div class="radio_section_header">
                <div class="radio_section_title_group">
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
        // Se a busca não encontrou resultados locais, busca dinamicamente na Radio Browser API mundial
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
                circle.innerHTML = isPlaying ? 
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>' :
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>';
            }
        } else {
            card.classList.remove('is_playing');
            const circle = card.querySelector('.radio_overlay_circle');
            if (circle) {
                circle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>';
            }
        }
    });
}

// Reprodução de Estação de Rádio integrada ao Master Player
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

    showToast(`Conectando à rádio ${station.name}...`);

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
    showToast(`⚠️ Transmissão de "${station.name}" fora do ar no momento. Escolha outra rádio.`);
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

// Busca exclusiva e totalmente funcional da Rádio (com debounce)
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

// Pílulas de Filtros Rápidos (Todas, Brasil, EUA, Gêneros)
const radioGenrePills = document.querySelectorAll('.radio_pill');
radioGenrePills.forEach(pill => {
    pill.addEventListener('click', () => {
        radioGenrePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        radioActiveFilter = pill.dataset.filter || 'all';
        renderStackedRadioSections();
    });
});

// Botão de Redefinir Filtros no estado vazio
const radioResetBtn = document.getElementById('radio_empty_reset_btn');
if (radioResetBtn) {
    radioResetBtn.addEventListener('click', () => {
        if (radioSearchInput) radioSearchInput.value = '';
        radioSearchQuery = '';
        if (radioSearchClear) radioSearchClear.style.display = 'none';
        radioActiveFilter = 'all';

        radioGenrePills.forEach((p, idx) => {
            if (idx === 0) p.classList.add('active');
            else p.classList.remove('active');
        });

        renderStackedRadioSections();
    });
}

/* ===== Sistema de Visualização da Biblioteca (SPA - Estilo Spotify Desktop) ===== */

let currentLibraryFilter = 'all'; // 'all' | 'favorites'
let currentLibrarySearch = '';
let currentLibrarySort = 'date'; // 'custom' | 'name' | 'artist' | 'album' | 'date' | 'duration'

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
