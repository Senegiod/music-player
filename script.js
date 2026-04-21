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
const toggleInput = document.getElementById("toggleInput")
const songAmnt = 5;

let adaptiveColoring = false;
let repeat = false;
let shuffle = false;
let isPlaying = false;
let songID = 0;
let lastCoverID = -1;
let direction = 1;

audio.preload = "metadata";
coverImg.src = "songs/song0/cover.jpg";
coverImg.onload = () => updateColorsFromCover();
lastCoverID = 0;

loadSong(songID);
isPlaying = false;
icon.src = "icon/play.png";

function loadSong(id) {
    audio.src = "songs/song" + id + ".flac";

    if (id === lastCoverID) {
        audio.play();
        isPlaying = true;
        icon.src = "icon/pause.png";
        return;
    }

    lastCoverID = id;
    coverImgNext.src = "songs/song" + id + "/cover.jpg";

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

    audio.play();
    isPlaying = true;
    icon.src = "icon/pause.png";
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
    if (adaptiveColoring) {
        const colorThief = new ColorThief();
        function extract() {
            try {
                const palette = colorThief.getPalette(coverImg, 2);
                const c1 = "rgb(" + palette[0][0] + ", " + palette[0][1] + ", " + palette[0][2] + ")";
                const c2 = "rgb(" + palette[1][0] + ", " + palette[1][1] + ", " + palette[1][2] + ")";
                setColors(c1, c2);
            } catch (e) {}
        }
        if (coverImg.complete && coverImg.naturalWidth > 0) {
            extract();
        } else {
            coverImg.onload = extract;
        }
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
    const newTime = percent * audio.duration;
    
    audio.currentTime = newTime;
    
    audio.addEventListener("seeked", () => {
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }, { once: true });
    
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
    } else {
        direction = 1;
        songID += 1;
        if (songID >= songAmnt) songID = 0;
        loadSong(songID);
    }
});

prevBtn.addEventListener("click", () => {
    direction = -1;
    if (songID !== 0 && audio.currentTime <= 5) songID -= 1;
    audio.currentTime = 0;
    loadSong(songID);
});

nextBtn.addEventListener("click", () => {
    direction = 1;
    if (shuffle) songID = getRandomSong();
    else songID += 1;
    if (songID >= songAmnt) songID = 0;
    loadSong(songID);
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
        setColors("#3b0a45", "#1b2a4a");  // ← zurück zu den standard farben aus deinem CSS
    } else {
        updateColorsFromCover();  // ← sofort farben laden wenn man es anmacht
    }
});