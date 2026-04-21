const audio = new Audio();
const playBtn = document.getElementById("playBtn");
const icon = document.getElementById("icon");
const coverImg = document.getElementById("coverImg");
const coverImgNext = document.getElementById("coverImgNext");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const fill = document.getElementById("fill");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("songTime");
const durationEl = document.getElementById("songLen");
const toggleInput = document.getElementById("toggleInput");
const searchInput = document.getElementById("search");
const searchResults = document.getElementById("searchResults");
const volumeSlider = document.getElementById("volumeSlider");
const slider = document.getElementById("volumeSlider");

let songAmnt = 0;
let songsData = [];
let adaptiveColoring = false;
let repeat = false;
let shuffle = false;
let isPlaying = false;
let songID = 0;
let lastCoverID = -1;
let direction = 1;

volumeSlider.value = 0.3;
audio.volume = 0.3;
audio.preload = "metadata";
coverImg.src = "songs/cover/cover" + songID + ".jpg";
coverImg.onload = () => updateColorsFromCover();
lastCoverID = 0;

fetch("songs.json")
    .then(res => res.json())
    .then(data => {
        songsData = data;
        songAmnt = songsData.length

        loadSong(songID);
    });
isPlaying = false;
icon.src = "icon/play.png";

function loadSong(id) {

    const song = songsData.find(s => Number(s.id) === Number(id));
    audio.currentTime = 0;
    if (!song) return;

    songID = id;

    audio.src = "songs/song" + id + ".flac";
    audio.load();

    const box = document.getElementById("song-box");
    if (box) {
        box.innerHTML = `
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        `;
    }

    
    if (id !== lastCoverID) {
        lastCoverID = id;

        coverImgNext.src = "songs/cover/cover" + id + ".jpg";

        coverImgNext.onload = () => {
            if (direction === 1) {
                coverImgNext.style.transform = "translateX(100%)";
                coverImg.classList.add("slide-out-left");
                coverImgNext.classList.add("slide-in-right");
            } else {
                coverImgNext.style.transform = "translateX(-100%)";
                coverImg.classList.add("slide-out-right");
                coverImgNext.classList.add("slide-in-left");
            }

            setTimeout(() => {
                coverImg.src = coverImgNext.src;
                coverImg.style.transform = "translateX(0)";
                coverImg.classList.remove("slide-out-left", "slide-out-right");
                coverImgNext.classList.remove("slide-in-right", "slide-in-left");
                coverImgNext.style.transform = "translateX(100%)";
                updateColorsFromCover();
            }, 500);
        };

        if (coverImgNext.complete) coverImgNext.onload();
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = "0" + sec;
    return min + ":" + sec;
}

function getRandomSong() {
    let newID;
    do {
        newID = Math.floor(Math.random() * songAmnt);
    } while (newID === songID);
    return newID;
}

function setColors(c1, c2) {
    document.documentElement.style.setProperty("--c1", c1);
    document.documentElement.style.setProperty("--c2", c2);
}

function updateColorsFromCover() {
    if (!adaptiveColoring) return;

    const colorThief = new ColorThief();

    const extract = () => {
        try {
            const palette = colorThief.getPalette(coverImg, 2);

            const c1 = `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`;
            const c2 = `rgb(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]})`;

            setColors(c1, c2);
        } catch (e) {
            console.warn("ColorThief error:", e);
        }
    };

    if (coverImg.complete && coverImg.naturalWidth > 0) {
        extract();
    } else {
        coverImg.onload = extract;
    }
}

audio.addEventListener("timeupdate", () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    let percent = (audio.currentTime / audio.duration) * 100;
    fill.style.width = percent + "%";
    currentTimeEl.textContent = formatTime(audio.currentTime);

    if (audio.duration > 0 && audio.currentTime >= audio.duration - 0.3) {
        audio.dispatchEvent(new Event("ended"));
    }
});

playBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        icon.src = "icon/pause.png";
        audio.play();
    } else {
        icon.src = "icon/play.png";
        audio.pause();
    }
});

audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("click", (e) => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
    audio.play();
    isPlaying = true;
    icon.src = "icon/pause.png";
});

audio.addEventListener("ended", () => {
    if (repeat) {
        audio.currentTime = 0;
        audio.play();
    } else if (shuffle) {
        direction = 1;
        songID = getRandomSong();
        loadSong(songID);
        audio.play()
    } else {
        direction = 1;
        songID += 1;
        if (songID >= songAmnt) songID = 0;
        loadSong(songID);
        audio.play()
    }
});

prevBtn.addEventListener("click", () => {
    direction = -1;
    if (songID !== 0 && audio.currentTime <= 5) songID -= 1;
    audio.currentTime = 0;
    loadSong(songID);
    isPlaying= true
    icon.src="icon/pause.png"
    audio.play()
});

nextBtn.addEventListener("click", () => {
    direction = 1;
    if (shuffle) songID = getRandomSong();
    else songID += 1;
    if (songID >= songAmnt) songID = 0;
    loadSong(songID);
    isPlaying= true
    icon.src="icon/pause.png"
    audio.play()
});

shuffleBtn.addEventListener("click", () => {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("active", shuffle);
});

repeatBtn.addEventListener("click", () => {
    repeat = !repeat;
    repeatBtn.classList.toggle("active", repeat);
});

toggleInput.addEventListener("change", () => {
    adaptiveColoring = toggleInput.checked;
    if (!adaptiveColoring) {
        setColors("#3b0a45", "#1b2a4a"); 
    } else {
        updateColorsFromCover();  
    }
});

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = "";

    if (query === "") return;

    const matches = songsData
        .map(song => {
            const title = song.title.toLowerCase();
            const artist = song.artist.toLowerCase();

            let score = 0;

            if (title.startsWith(query)) score += 5;
            else if (title.includes(" " + query)) score += 3;
            else if (title.includes(query)) score += 1;

            if (artist.startsWith(query)) score += 4;
            else if (artist.includes(query)) score += 2;

            return { song, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.song.title.localeCompare(b.song.title);
        })
        .map(item => item.song);

    matches.forEach(song => {
        const item = document.createElement("div");
        item.classList.add("search-result-item");

        item.innerHTML = `
            <span class="result-title">${song.title}</span>
            <span class="result-artist">${song.artist}</span>
        `;

        item.addEventListener("click", () => {
            songID = song.id;
            direction = 1;
            loadSong(songID);
            searchInput.value = "";
            searchResults.innerHTML = "";
            isPlaying = true
            audio.play()
        });

        searchResults.appendChild(item);
    });
});

volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
});

function updateSlider() {
    const percent = slider.value * 100;

    slider.style.background = `
        linear-gradient(90deg,
            #0b1b3a 0%,
            #2a1b4a ${percent}%,
            rgba(255,255,255,0.08) ${percent}%,
            rgba(255,255,255,0.08) 100%
        )
    `;
}

slider.addEventListener("input", updateSlider);
updateSlider();