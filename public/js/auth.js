// public/js/auth.js
const API_BASE_URL = 'http://localhost:3000/api';

const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', handleRegister);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

// Átirányítási logika a localStorage-ban tárolt username alapján
const protectedPages = ['/movies.html', '/add_movie.html', '/edit_movie.html'];
const authPages = ['/index.html', '/register.html'];
const currentPage = window.location.pathname;
const isLoggedIn = !!localStorage.getItem('username'); // Igaz, ha van username a localStorage-ban

if (!isLoggedIn && protectedPages.includes(currentPage)) {
    // Ha nincs bejelentkezve és védett oldalon van, átirányítás a loginhoz
    window.location.href = '/index.html';
}
if (isLoggedIn && authPages.includes(currentPage)) {
    // Ha be van jelentkezve és a login/register oldalon van, átirányítás a filmekhez
    window.location.href = '/movies.html';
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value; // A jelszót általában nem trimmeljük
    const passwordConfirm = form.passwordConfirm.value;

    if (password !== passwordConfirm) {
        alert('A két jelszó nem egyezik!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Sikeres regisztráció! Most már bejelentkezhetsz.');
            form.reset();
            window.location.href = '/index.html';
        } else {
            alert(data.message || `Hiba történt a regisztráció során: ${response.statusText}`);
        }
    } catch (error) {
        alert(`Hálózati hiba: ${error.message}`);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.username.value.trim(); // Felhasználónév trimmelése
    const password = form.password.value; // A jelszót általában nem trimmeljük

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        // A szerver itt állítja be a HttpOnly cookie-t.
        if (response.ok && data.user && data.user.username) {
            // A tokent nem tároljuk a localStorage-ban, mivel az HttpOnly cookie-ban van.
            // A felhasználónevet a szerver válaszából vesszük.
            localStorage.setItem('username', data.user.username);
            window.location.href = '/movies.html';
        } else {
            localStorage.removeItem('username'); // Sikertelen bejelentkezés esetén töröljük
            alert(data.message || 'Sikertelen bejelentkezés. Ellenőrizd az adatokat.');
        }
    } catch (error) {
        localStorage.removeItem('username'); // Hiba esetén is töröljük
        alert(`Hálózati hiba bejelentkezéskor: ${error.message}`);
    }
}

async function handleLogout(event) {
    if (event) event.preventDefault();

    try {
        // Kérés a szervernek a cookie törlésére
        const response = await fetch(`${API_BASE_URL}/users/logout`, {
            method: 'POST',
            // A cookie-t a böngésző automatikusan küldi, nincs szükség Authorization fejlécre
        });

        if (!response.ok) {
            const errorData = await response.text().catch(() => "Ismeretlen szerverhiba kijelentkezéskor.");
            console.warn('Szerveroldali kijelentkezési hiba:', response.status, errorData);
        }
    } catch (error) {
        console.error('Hálózati hiba kijelentkezéskor:', error);
    } finally {
        // Mindig végezzük el a kliensoldali takarítást, függetlenül a szerver válaszától
        localStorage.removeItem('username');
        window.location.href = '/index.html'; // Átirányítás a bejelentkezési oldalra
    }
}
