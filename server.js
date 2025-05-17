require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const DB = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET nincs definiálva a .env fájlban!");
    process.exit(1);
}
const SALT_ROUNDS = 10;

// --- Adatbázis beállítása ---
const dbPath = path.resolve(__dirname, 'filmnaplo.db');
const db = new DB(dbPath);
// Felhasználók tábla létrehozása, ha még nem létezik
db.exec(`
    CREATE TABLE IF NOT EXISTS felhasznalok (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);
// Filmek tábla létrehozása, ha még nem létezik
db.exec(`
    CREATE TABLE IF NOT EXISTS filmek (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cim TEXT NOT NULL,
        ev INTEGER,
        szereplok TEXT,
        ertekeles INTEGER,
        velemeny TEXT,
        megnezve DATE, -- Ha NULL, akkor még nem néztük meg
        hol TEXT,
        FOREIGN KEY (user_id) REFERENCES felhasznalok(id) ON DELETE CASCADE
    )
`);

// Segédfüggvény felhasználó kereséséhez felhasználónév alapján
function findUserByUsername(username) {
    const stmt = db.prepare('SELECT * FROM felhasznalok WHERE username = ?');
    return stmt.get(username);
};

// --- Middleware-ek ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Autentikációs Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken; // Token olvasása a cookie-ból
    if (token == null) {
        return res.status(401).json({ message: 'Hiányzó autentikációs token.' });
    }
    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            console.error('Token verifikációs hiba:', err.message);
            return res.status(403).json({ message: 'Érvénytelen vagy lejárt token.' });
        }
        // userPayload tartalmazza a felhasználó adatait: { userId: user.id, username: user.username }
        req.user = userPayload;
        next();
    });
};

// --- Felhasználói Útvonalak ---

// POST /api/users/register: Regisztráció
app.post('/api/users/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Felhasználónév és jelszó megadása kötelező.' });
    }
    if (password.length < 6) { // validáció
        return res.status(400).json({ message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie.' });
    }
    const existingUser = findUserByUsername(username);
    if (existingUser) {
        return res.status(409).json({ message: 'A felhasználónév már foglalt.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const stmt = db.prepare('INSERT INTO felhasznalok (username, password) VALUES (?, ?)');
        const info = stmt.run(username, hashedPassword);
        res.status(201).json({ message: 'Sikeres regisztráció.', userId: info.lastInsertRowid });
    } catch (error) {
        console.error('Hiba a regisztráció során:', error);
        res.status(500).json({ message: 'Szerverhiba a regisztráció során.' });
    }
});

// POST /api/users/login: Bejelentkezés
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Felhasználónév és jelszó megadása kötelező.' });
    }
    const user = findUserByUsername(username);
    if (!user) {
        return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó.' });
    }
    try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó.' });
        }
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '3h' } // Token lejárati ideje
        );

        res.cookie('authToken', token, {
            httpOnly: true, // JavaScript nem férhet hozzá
            secure: process.env.NODE_ENV === 'production', // Csak HTTPS-en éles környezetben
            sameSite: 'Lax', // CSRF védelem ('Strict' még erősebb)
            maxAge: 3 * 60 * 60 * 1000 // 3 óra milliszekundumban, összhangban a token lejáratával
        });

        res.status(200).json({
            message: 'Sikeres bejelentkezés.',
            // A tokent nem küldjük a JSON body-ban, ha sütit használunk
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Hiba a bejelentkezés során:', error);
        res.status(500).json({ message: 'Szerverhiba a bejelentkezés során.' });
    }
});

// POST /api/users/logout: Kijelentkezés
app.post('/api/users/logout', (req, res) => {
    res.cookie('authToken', '', { // Cookie törlése üres értékkel és azonnali lejárattal
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        expires: new Date(0) // Vagy maxAge: 0
    });
    res.status(200).json({ message: 'Sikeres kijelentkezés.' });
});

// --- Segédfüggvény filmadatok validálásához ---
function validateMovieData(data, isNewMovie = false) {
    const { cim, ev, ertekeles, megnezve } = data;

    // Cim validáció (csak új filmeknél kötelező)
    if (isNewMovie && !cim) { 
        return { status: 400, message: 'A film címe kötelező.' };
    }

    // Ertekeles validáció
    // Ha az ertekeles meg van adva (nem undefined, nem null), akkor 1 és 5 közötti számnak kell lennie.
    if (ertekeles !== undefined && ertekeles !== null) {
        if (typeof ertekeles !== 'number' || ertekeles < 1 || ertekeles > 5) {
            return { status: 400, message: 'Az értékelésnek 1 és 5 közötti számnak kell lennie.' };
        }
    }

    // Ev validáció
    // Ha az ev meg van adva (nem undefined, nem null), akkor érvényes számnak kell lennie a tartományban.
    if (ev !== undefined && ev !== null) {
        if (typeof ev !== 'number' || ev < 1900 || ev > new Date().getFullYear() + 10) {
            return { status: 400, message: 'Érvénytelen megjelenési év.' };
        }
    }

    // Megnezve validáció
    // Ha a megnezve meg van adva (nem undefined, nem null, nem üres string), 
    // akkor érvényes YYYY-MM-DD dátumnak kell lennie.
    if (megnezve !== undefined && megnezve !== null && megnezve !== '') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(megnezve)) {
            return { status: 400, message: 'A megnézés dátuma érvénytelen formátumú (YYYY-MM-DD).' };
        }
        try {
            const d = new Date(megnezve);
            if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== megnezve) {
                throw new Error('Invalid date value');
            }
        } catch (e) {
            return { status: 400, message: 'A megnézés dátuma érvénytelen (pl. február 30).' };
        }
    }
    return null; // Minden validáció sikeres
}

// --- Filmekkel kapcsolatos Útvonalak ---

// POST /api/movies: Új film hozzáadása
app.post('/api/movies', authenticateToken, (req, res) => {
    const { cim, ev, szereplok, ertekeles, velemeny, megnezve, hol } = req.body;
    const userId = req.user.userId; // A tokenből kinyert felhasználói azonosító

    // Adatok validálása a segédfüggvénnyel
    const validationError = validateMovieData(req.body, true); // true, mert új filmről van szó
    if (validationError) {
        return res.status(validationError.status).json({ message: validationError.message });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO filmek (user_id, cim, ev, szereplok, ertekeles, velemeny, megnezve, hol)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            userId,
            cim,
            Number(ev) || null,
            szereplok || null,
            Number(ertekeles) || null,
            velemeny || null,
            (megnezve === '' || megnezve === undefined) ? null : megnezve,
            hol || null
        );
        const newMovieId = result.lastInsertRowid;
        const newMovie = db.prepare('SELECT * FROM filmek WHERE id = ?').get(newMovieId);
        res.status(201).json(newMovie);
    } catch (error) {
        console.error("Hiba film hozzáadásakor:", error);
        res.status(500).json({ message: 'Szerverhiba történt a film hozzáadásakor.' });
    }
});

// GET /api/movies: Bejelentkezett felhasználó filmjeinek listázása
app.get('/api/movies', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    let query = 'SELECT * FROM filmek WHERE user_id = ?';
    query += ' ORDER BY date(megnezve) DESC'; // Biztosítjuk, hogy dátumként értelmezze

    try {
        const stmt = db.prepare(query);
        const movies = stmt.all(userId);
        res.status(200).json(movies);
    } catch (error) {
        console.error("Hiba filmek listázásakor:", error);
        res.status(500).json({ message: 'Szerverhiba történt a filmek listázásakor.' });
    }
});

// GET /api/movies/:id: Egy konkrét film lekérése
app.get('/api/movies/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.id, 10);
    if (isNaN(movieId)) {
        return res.status(400).json({ message: 'Érvénytelen film azonosító.' });
    }
    try {
        const stmt = db.prepare('SELECT * FROM filmek WHERE id = ? AND user_id = ?');
        const movie = stmt.get(movieId, userId);

        if (!movie) {
            return res.status(404).json({ message: 'Film nem található vagy nincs jogosultságod megtekinteni.' });
        }
        res.status(200).json(movie);
    } catch (error) {
        console.error("Hiba film lekérésekor:", error);
        res.status(500).json({ message: 'Szerverhiba történt a film lekérésekor.' });
    }
});

// PUT /api/movies/:id: Film adatainak módosítása
app.put('/api/movies/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.id, 10);
    if (isNaN(movieId)) {
        return res.status(400).json({ message: 'Érvénytelen film azonosító.' });
    }
    const { cim, ev, szereplok, ertekeles, velemeny, megnezve, hol } = req.body;

    // Adatok validálása a segédfüggvénnyel
    const validationError = validateMovieData(req.body, false); // false, mert meglévő filmet módosítunk
    if (validationError) {
        return res.status(validationError.status).json({ message: validationError.message });
    }

    try {
        const checkStmt = db.prepare('SELECT id FROM filmek WHERE id = ? AND user_id = ?');
        if (!checkStmt.get(movieId, userId)) {
            return res.status(404).json({ message: 'Film nem található vagy nincs jogosultságod módosítani.' });
        }

        const fieldsToUpdate = {};
        if (cim !== undefined) fieldsToUpdate.cim = cim;
        if (ev !== undefined) fieldsToUpdate.ev = (ev === '' || ev === null) ? null : Number(ev);
        if (szereplok !== undefined) fieldsToUpdate.szereplok = (szereplok === '' || szereplok === null) ? null : szereplok;
        if (ertekeles !== undefined) fieldsToUpdate.ertekeles = (ertekeles === '' || ertekeles === null) ? null : Number(ertekeles);
        if (velemeny !== undefined) fieldsToUpdate.velemeny = (velemeny === '' || velemeny === null) ? null : velemeny;
        if (megnezve !== undefined) fieldsToUpdate.megnezve = (megnezve === '' || megnezve === null) ? null : megnezve;
        if (hol !== undefined) fieldsToUpdate.hol = (hol === '' || hol === null) ? null : hol;

        if (Object.keys(fieldsToUpdate).length === 0) {
            const currentMovie = db.prepare('SELECT * FROM filmek WHERE id = ?').get(movieId);
            return res.status(200).json(currentMovie); // Nincs mit frissíteni
        }

        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), movieId, userId];

        const updateStmt = db.prepare(`UPDATE filmek SET ${setClauses} WHERE id = ? AND user_id = ?`);
        updateStmt.run(...values);

        const updatedMovie = db.prepare('SELECT * FROM filmek WHERE id = ?').get(movieId);
        res.status(200).json(updatedMovie);
    } catch (error) {
        console.error("Hiba a film frissítésekor:", error);
        res.status(500).json({ message: 'Szerverhiba történt a film frissítésekor.' });
    }
});

// DELETE /api/filmek/:id: Film törlése
app.delete('/api/movies/:id', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const movieId = parseInt(req.params.id, 10);
    if (isNaN(movieId)) {
        return res.status(400).json({ message: 'Érvénytelen film azonosító.' });
    }
    try {
        const stmt = db.prepare('DELETE FROM filmek WHERE id = ? AND user_id = ?');
        const result = stmt.run(movieId, userId);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'A film nem található vagy nincs jogosultságod törölni.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Hiba film törlésekor:", error);
        res.status(500).json({ message: 'Szerverhiba történt a film törlésekor.' });
    }
});

// --- Alapvető hibakezelő ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Szerverhiba történt!' });
});

// --- Szerver indítása ---
app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT} címen`);
});