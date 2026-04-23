const searchInput = document.getElementById("search");
const searchResults = document.getElementById("searchResults");
const div = document.createElement("div");

let songsData = [];
let songID = 0;

fetch("songs.json")
    .then(res => res.json())
    .then(data => {
        songsData = data;
        songAmnt = songsData.length;

        fillRows();
    });

searchInput.addEventListener("input", () => {

    if (!songsData || songsData.length === 0) return;

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
        .sort((a, b) => b.score - a.score)
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
            console.log("Song"+ songID)
        });

        searchResults.appendChild(item);
    });
});

function createSongCard(song, row) {
    const div = document.createElement("div");
    div.classList.add("song");

    div.innerHTML = `
        <img src="songs/cover/cover${song.id}.jpg">
        <p class="title">${song.title}</p>
        <p class="artist">${song.artist}</p>
    `;

    div.addEventListener("click", () => {
        window.location.href = `index.html?song=${song.id}`;
    });

    row.appendChild(div);
}

function fillRows() {
    for (let i = 1; i <= 3; i++) {
        const row = document.getElementById(`row-${i}`);

        for (let j = 0; j < 10; j++) {
            const song = getRandomSong();
            createSongCard(song, row);
        }
    }
}

function getRandomSong() {
    return songsData[Math.floor(Math.random() * songsData.length)];
}
