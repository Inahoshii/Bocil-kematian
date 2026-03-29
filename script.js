document.addEventListener("DOMContentLoaded", () => {
    // AUDIO REFS
    const getAudio = (id) => document.getElementById(id);
    const sCoin = getAudio('sfx-coin'), sPortal = getAudio('sfx-portal'),
          bgmG = getAudio('bgm-game'), bgmE = getAudio('bgm-ending');

    if(bgmG) bgmG.volume = 0.5; 
    if(bgmE) bgmE.volume = 0.8;

    function playSFX(sfx) { 
        if (sfx) { sfx.currentTime = 0; sfx.play().catch(()=>{}); } 
    }

    // JURUS KLONING AUDIO (Agar suara koin responsif tanpa delay pas diklik cepat)
    function playCoin() {
        if(sCoin) {
            let clone = sCoin.cloneNode();
            clone.volume = 1;
            clone.play().catch(()=>{});
        }
    }

    function switchScreen(hideId, showId) {
        if(hideId) {
            const h = document.getElementById(hideId);
            h.style.opacity = '0';
            setTimeout(() => h.classList.add('hidden'), 500);
        }
        if(showId) {
            const s = document.getElementById(showId);
            s.classList.remove('hidden');
            s.style.opacity = '0';
            setTimeout(() => s.style.opacity = '1', 10);
        }
    }

    // 1. LOADING
    let prg = 0;
    const loadFill = document.getElementById('load-fill');
    const loadInt = setInterval(() => {
        prg += 15;
        if (prg >= 100) prg = 100;
        if (loadFill) loadFill.style.width = prg + "%";
        
        if (prg === 100) {
            clearInterval(loadInt);
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('intro-screen').classList.remove('hidden');
            document.getElementById('intro-screen').style.opacity = '1';
            startTyping();
        }
    }, 100);

    // 2. DIALOG ANYA
    const talks = [
        { t: "\"Waku-waku! Anya tahu hari ini kamu ulang tahun kan?\"", i: "assets/anya smug.png" },
        { t: "\"Kumpulin 15 kacang buat buka portal Guild! Anya akan menilai refleks jarimu!\"", i: "assets/anya 1.png" }
    ];
    let curT = 0;
    
    function startTyping() {
        document.getElementById('anya-face').src = talks[curT].i;
        const txt = document.getElementById('dialogue-text');
        txt.innerHTML = "";
        let i = 0;
        const tInt = setInterval(() => {
            txt.innerHTML += talks[curT].t[i]; i++;
            if (i >= talks[curT].t.length) {
                clearInterval(tInt);
                if (curT < talks.length - 1) document.getElementById('btn-next').classList.remove('hidden');
                else {
                    document.getElementById('btn-start').classList.remove('hidden');
                    document.getElementById('tutor-text').classList.remove('hidden');
                }
            }
        }, 50);
    }
    document.getElementById('btn-next').onclick = () => { curT++; document.getElementById('btn-next').classList.add('hidden'); startTyping(); };

    // =========================================
    // 3. GAME CLICKER LOGIC
    // =========================================
    let score = 0;
    const targetScore = 15;
    let spawnInterval;
    const spawner = document.getElementById('peanut-spawner');
    const scoreUI = document.getElementById('peanut-score');
    const anyaGameFace = document.getElementById('anya-game-face');

    function anyaReact(success) {
        anyaGameFace.classList.remove('hidden');
        anyaGameFace.src = success ? 'assets/anya smug.png' : 'assets/anya 1.png';
        anyaGameFace.style.animation = 'none';
        void anyaGameFace.offsetWidth; 
        anyaGameFace.style.animation = 'anyaPopIn 0.3s alternate';
        setTimeout(() => anyaGameFace.classList.add('hidden'), 800);
    }

    function createConfettiBurst(x, y) {
        const colors = ['#FFD700', '#FF69B4', '#00ff00', '#fff'];
        for(let i=0; i<15; i++) {
            let p = document.createElement('div');
            p.className = 'sparkle-particle';
            p.style.left = x + 'px'; p.style.top = y + 'px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.setProperty('--rx', (Math.random() - 0.5) * 150 + 'px');
            p.style.setProperty('--ry', (Math.random() - 0.5) * 150 + 'px');
            spawner.appendChild(p);
            setTimeout(() => p.remove(), 800);
        }
    }

    document.getElementById('btn-start').onclick = () => {
        switchScreen('intro-screen', 'game-screen');
        if(bgmG) bgmG.play().catch(()=>{});
        score = 0;
        scoreUI.innerText = score;
        spawnInterval = setInterval(spawnPeanut, 700);
    };

    function spawnPeanut() {
        if(score >= targetScore) return;

        let p = document.createElement('div');
        p.className = 'peanut-target';
        
        let randomX = Math.floor(Math.random() * 80) + 10;
        let randomY = Math.floor(Math.random() * 60) + 10;
        p.style.left = randomX + '%';
        p.style.top = randomY + '%';

        p.onpointerdown = (e) => {
            e.stopPropagation();
            playCoin(); // Gunakan jurus Kloning SFX Coin!
            
            const rect = p.getBoundingClientRect();
            const spawnerRect = spawner.getBoundingClientRect();
            createConfettiBurst(rect.left - spawnerRect.left + 35, rect.top - spawnerRect.top + 35);
            
            p.onpointerdown = null; 
            p.className = 'peanut-target peanut-fly';
            anyaReact(true);
            
            score++;
            scoreUI.innerText = score;

            if(score >= targetScore) {
                winQuest();
            }

            setTimeout(() => { if(p.parentNode) p.remove(); }, 600);
        };

        spawner.appendChild(p);

        setTimeout(() => {
            if(p.parentNode && !p.classList.contains('peanut-fly')) {
                p.remove();
                if(score < targetScore) anyaReact(false);
            }
        }, 1200);
    }

    function winQuest() {
        clearInterval(spawnInterval);
        spawner.innerHTML = ''; 
        document.getElementById('portal-container').classList.remove('hidden');
    }

    // KLIK PORTAL -> UNBOXING MEWAH
    document.querySelector('.portal').onclick = () => {
        playSFX(sPortal);
        if(bgmG) bgmG.pause();
        
        const warp = document.createElement('div');
        warp.style.cssText = "position:absolute;width:100%;height:100%;background:#fff;z-index:999;transition:opacity 0.5s";
        document.body.appendChild(warp);

        setTimeout(() => {
            warp.style.opacity = '0';
            switchScreen('game-screen', 'unboxing-screen');
            setTimeout(() => warp.remove(), 500);
        }, 100);
    };

    // 4. UNBOXING
    let taps = 0;
    document.getElementById('gift-box').onclick = () => {
        taps++; 
        document.getElementById('tap-count').innerText = "TAP " + (5 - taps) + "X LAGI!";
        if (taps >= 5) { 
            switchScreen('unboxing-screen', 'victory-screen');
            fireVictoryConfetti();
            if(bgmE) bgmE.play().catch(()=>{}); 
        }
    };

    function fireVictoryConfetti() {
        const container = document.getElementById('victory-screen');
        for(let i=0; i<40; i++) {
            let conf = document.createElement('div');
            conf.className = 'sparkle-particle';
            conf.style.backgroundColor = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.top = '-20px';
            conf.style.animation = "particleExplode "+(Math.random()*2+1)+"s ease-out forwards";
            conf.style.setProperty('--rx', (Math.random() - 0.5) * 500 + 'px');
            conf.style.setProperty('--ry', Math.random() * 800 + 'px');
            container.appendChild(conf);
        }
    }

    // NAVIGATION DI ENDING
    document.getElementById('btn-memories').onclick = () => switchScreen('victory-screen', 'memory-screen');
    document.getElementById('btn-doa').onclick = () => switchScreen('memory-screen', 'doa-screen');
    document.getElementById('btn-final').onclick = () => switchScreen('doa-screen', 'final-screen');

    // =========================================
    // FITUR LIRIK SPOTIFY (SINKRON TEMPO VIDEO)
    // =========================================
    const lyricsData = [
        { time: 0, text: "♪ (Music) ♪", sub: "" },
        { time: 2.0, text: "Ima de wa...", sub: "(Namun sekarang)" },
        { time: 6.5, text: "Hokori darake no mainichi", sub: "(Hari-hariku penuh dengan debu)" },
        { time: 11.5, text: "Itsu no hi ka", sub: "(Entah sejak kapan)" },
        { time: 16.5, text: "Subete no toki ni mi o makaseru dake", sub: "(Aku hanya menyerahkan semuanya pada sang waktu)" },
        { time: 22.0, text: "♪ (Music) ♪", sub: "" },
        { time: 27.5, text: "Moshimo sekai ga kawaru no nara", sub: "(Seandainya dunia ini berubah)" },
        { time: 34.5, text: "Nanimo shiranai koro no watashi ni tsurete itte", sub: "(Bawalah aku ke masa saat aku belum mengenal apa-apa)" },
        { time: 45.5, text: "Omoide ga iro asenai you ni...", sub: "(Agar kenanganku tak perlahan-lahan menghilang)" },
        { time: 54.0, text: "♪ (Outro) ♪", sub: "" }
    ];

    const lyricsContent = document.getElementById('lyrics-content');
    if (lyricsContent) {
        lyricsData.forEach((line, i) => {
            let div = document.createElement('div');
            div.className = 'lyric-line';
            div.id = 'lyric-' + i;
            div.innerHTML = `<div class="lyric-text">${line.text}</div><div class="lyric-sub">${line.sub}</div>`;
            lyricsContent.appendChild(div);
        });

        if (bgmE) {
            bgmE.addEventListener('timeupdate', () => {
                let time = bgmE.currentTime;
                let activeIdx = -1;
                for (let i = 0; i < lyricsData.length; i++) {
                    if (time >= lyricsData[i].time) activeIdx = i;
                    else break;
                }
                
                if (activeIdx !== -1) {
                    document.querySelectorAll('.lyric-line').forEach(el => el.classList.remove('active'));
                    let activeEl = document.getElementById('lyric-' + activeIdx);
                    if (activeEl) {
                        activeEl.classList.add('active');
                        lyricsContent.style.transform = `translateY(-${activeIdx * 50}px)`;
                    }
                }
            });
        }
    }
});