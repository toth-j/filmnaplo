// public/js/movies.js

if (window.location.pathname.endsWith('/movies.html')) {
    // Felhasználó nevének kiolvasása és a cím frissítése
    const moviesTitleElement = document.getElementById('moviesTitle');
    const username = localStorage.getItem('username'); // Az auth.js menti ezt bejelentkezéskor
    if (moviesTitleElement && username) {
        moviesTitleElement.textContent = `${username} filmlistája`;
    }
    loadMovies();
    const filterButton = document.getElementById('applyFilterButton');
    if (filterButton) filterButton.addEventListener('click', loadMovies);
}

const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
    addMovieForm.addEventListener('submit', handleAddOrEditMovie);
}

const editMovieForm = document.getElementById('editMovieForm');
if (editMovieForm) {
    loadMovieDataForEdit(); // This will also add the submit listener after loading
}

async function loadMovies() {
    // A tokent (cookie-t) a böngésző automatikusan küldi.
    // Az auth.js logikája kezeli a kezdeti hozzáférés-ellenőrzést.

    const movieListDiv = document.getElementById('movieList');
    const noMoviesMessage = document.getElementById('noMoviesMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const filterStatus = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchTerm').value.trim();

    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (movieListDiv) movieListDiv.innerHTML = '';
    if (noMoviesMessage) noMoviesMessage.style.display = 'none';

    let queryParams = new URLSearchParams();
    if (filterStatus === 'watched') queryParams.append('megnezve', 'true');
    if (filterStatus === 'unwatched') queryParams.append('megnezve', 'false');
    if (searchTerm) queryParams.append('cim', searchTerm);

    try {
        const response = await fetch(`${API_BASE_URL}/movies?${queryParams.toString()}`);
        if (response.status === 401) { // Unauthorized
            handleLogout();
            return; // Megállítjuk a további végrehajtást
        }
        const movies = await response.json();
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (response.ok) {
            if (movies.length === 0) {
                if (noMoviesMessage) noMoviesMessage.style.display = 'block';
            } else {
                movies.forEach(movie => renderMovieCard(movie, movieListDiv));
            }
        } else {
            alert(movies.message || `Hiba a filmek betöltésekor: ${response.status}`);
        }
    } catch (error) {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        alert(`Hálózati hiba: ${error.message}`);
    }
}

function renderMovieCard(movie, container) {
    const isWatched = movie.megnezve !== null && movie.megnezve !== undefined && movie.megnezve !== '';
    const statusText = isWatched ? `Megnézve: ${new Date(movie.megnezve).toLocaleDateString()}` : 'Még nem megnézett';

    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 movie-card';
    // card.id = `movie-${movie.id}`;
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${movie.cim} ${movie.ev ? `(${movie.ev})` : ''}</h5>
                ${movie.szereplok ? `<h6 class="card-subtitle mb-2 text-muted">Szereplő(k): ${movie.szereplok}</h6>` : ''}
                ${movie.ertekeles ? `<p class="card-text">Értékelés: ${movie.ertekeles}/5</p>` : ''}
                ${movie.velemeny ? `<p class="card-text">Vélemény: <small>${movie.velemeny}</small></p>` : ''}
                <p class="card-text"><small class="text-muted">${statusText}</small></p>
                ${movie.hol ? `<p class="card-text"><small class="text-muted">Hol: ${movie.hol}</small></p>` : ''}
                <div class="mt-auto">
                    <a href="/edit_movie.html?id=${movie.id}" class="btn btn-sm btn-primary me-1">Szerkesztés</a>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteMovie(${movie.id})">Törlés</button>
                </div>
            </div>
        </div>`;
    container.appendChild(card);
}

async function handleAddOrEditMovie(event) {
    event.preventDefault();
    // A tokent (cookie-t) a böngésző automatikusan küldi.
    const form = event.target;
    const movieId = form.movieId ? form.movieId.value : null; // For edit
    const isEditMode = !!movieId;

    // Client-side validation
    const cim = form.cim.value.trim();
    const ev = form.ev.value ? parseInt(form.ev.value) : null;
    const ertekeles = form.ertekeles.value ? parseInt(form.ertekeles.value) : null;

    const movieData = {
        cim: cim,
        ev: ev,
        szereplok: form.szereplo.value.trim() || null, // Kulcs javítva 'szereplok'-ra
        ertekeles: ertekeles,
        velemeny: form.velemeny.value.trim() || null,
        megnezve: form.megnezve.value || null, // Empty string becomes null on backend if desired
        hol: form.hol.value.trim() || null
    };
    // Ensure null for empty optional fields if backend expects null not empty string
    for (const key in movieData) {
        if (movieData[key] === '') movieData[key] = null;
    }

    const url = isEditMode ? `${API_BASE_URL}/movies/${movieId}` : `${API_BASE_URL}/movies`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(movieData)
        });

        if (response.status === 401) {
            if (typeof handleLogout === 'function') handleLogout(); else window.location.href = '/login.html';
            return;
        }
        const data = await response.json(); // Csak akkor próbáljuk olvasni, ha nem 401

        if (response.ok) {
            window.location.href = '/movies.html';
        } else {
            alert(data.message || `Hiba: ${response.statusText} (${response.status})`);
        }
    } catch (error) {
        alert(`Hálózati hiba: ${error.message}`);
    }
}

async function loadMovieDataForEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) {
        window.location.href = '/movies.html';
        return;
    }

    const form = document.getElementById('editMovieForm');
    const loadingIndicator = document.getElementById('loadingIndicatorEdit');
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (form) form.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
        if (response.status === 401) {
            handleLogout();
            return;
        }
        const movie = await response.json();

        if (loadingIndicator) loadingIndicator.style.display = 'none';

        if (response.ok) {
            if (form) {
                form.movieId.value = movie.id;
                form.cim.value = movie.cim;
                form.ev.value = movie.ev || '';
                form.szereplo.value = movie.szereplok || ''; 
                form.ertekeles.value = movie.ertekeles || '';
                form.velemeny.value = movie.velemeny || '';
                form.megnezve.value = movie.megnezve || ''; // Format YYYY-MM-DD
                form.hol.value = movie.hol || '';
                form.style.display = 'block';
                form.addEventListener('submit', handleAddOrEditMovie); 
            }
        } else {
            alert(movie.message || `Hiba a film adatainak betöltésekor: ${response.status}`);
            window.location.href = '/movies.html';
        }
    } catch (error) {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        alert(`Hálózati hiba: ${error.message}`);
    }
}

function confirmDeleteMovie(movieId) {
    if (confirm('Biztosan törölni szeretnéd ezt a filmet?')) {
        deleteMovie(movieId);
    }
}

async function deleteMovie(movieId) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'DELETE'
        });
        if (response.status === 401) {
            handleLogout();
            return;
        }
        if (response.ok) {
            loadMovies();
        } else {
            const data = await response.json().catch(() => ({ message: `Hiba: ${response.statusText} (${response.status})` }));
            alert(data.message || `Hiba a film törlésekor: ${response.status}`);
        }
    } catch (error) {
        alert(`Hálózati hiba: ${error.message}`);
    }
}
