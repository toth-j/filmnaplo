const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3000';
// Egyedi felhasználónév ennek a tesztfájlnak, hogy elkerüljük az ütközéseket más tesztekkel
const testUsername = 'filmtesztelo';
const testPassword = 'TesztJelszo123';

// Globális változók a tesztek között átadott ID-k tárolására
let mainCreatedMovieId;
const createdFilterMovieIds = {};

// --- Fő Tesztcsomag ---
// A mode: 'serial' biztosítja, hogy a tesztek ebben a describe blokkban sorban fussanak le.
test.describe('API Tesztek (api_teszt2.http alapján) - Megosztott Kontextus Nélkül', () => {
  test.describe.configure({ mode: 'serial' });

  // 1. Felhasználó regisztrációja (a korábbi globális beforeAll helyett)
  test('1. Új felhasználó regisztrációja (filmtesztelo)', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/users/register`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: testUsername,
        password: testPassword
      }
    });
    // Elfogadjuk a 201 (Created) vagy 409 (Conflict - felhasználó már létezik) státuszt.
    expect([201, 409], `Regisztráció (${testUsername}) sikertelen vagy felhasználó már létezik: ${response.status()}`).toContain(response.status());
  });

  // --- Film Műveletek ---
  test.describe('Film Műveletek', () => {
    // A soros végrehajtás a szülő describe blokkból öröklődik.
    // Bejelentkezés minden teszt előtt ebben az al-csomagban.
    test.beforeEach(async ({ request }) => {
      const loginResponse = await request.post(`${baseURL}/api/users/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          username: testUsername,
          password: testPassword
        }
      });
      expect(loginResponse.ok(), `Bejelentkezés (${testUsername}) sikertelen a Film Műveletek teszt előtt: ${loginResponse.status()}`).toBeTruthy();
    });

    test('3. Új film hozzáadása (sikeres)', async ({ request }) => {
      const movieData = {
        cim: "Teszt Film Címe JS (NoCtx)",
        ev: 2023,
        szereplok: "Teszt Szereplő JS (NoCtx)", // Javítva 'szereplok'-ra
        ertekeles: 4,
        velemeny: "Ez egy jó teszt film JS (NoCtx).",
        megnezve: "2023-10-26",
        hol: "Mozi JS (NoCtx)"
      };
      const response = await request.post(`${baseURL}/api/movies`, {
        headers: { 'Content-Type': 'application/json' },
        data: movieData
      });
      expect(response.ok(), `Új film hozzáadása sikertelen: ${response.status()}`).toBeTruthy();
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      mainCreatedMovieId = responseBody.id; // ID mentése későbbi tesztekhez
      expect(responseBody.cim).toBe(movieData.cim);
      expect(responseBody.ev).toBe(movieData.ev);
    });

    test('4. Új film hozzáadása (hiba: hiányzó cím)', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/movies`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          ev: 2023
        }
      });
      expect(response.status()).toBe(400);
    });

    test('5. Új film hozzáadása (hiba: érvénytelen értékelés)', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/movies`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          cim: "Film Rossz Értékeléssel JS (NoCtx)",
          ertekeles: 7
        }
      });
      expect(response.status()).toBe(400);
    });

    test('6. Új film hozzáadása (hiba: érvénytelen év)', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/movies`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          cim: "Film Rossz Évvel JS (NoCtx)",
          ev: 1700
        }
      });
      expect(response.status()).toBe(400);
    });

    test('7. Új film hozzáadása (hiba: érvénytelen dátum)', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/movies`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          cim: "Film Rossz Dátummal JS (NoCtx)",
          megnezve: "2023-13-01"
        }
      });
      expect(response.status()).toBe(400);
    });

    test('8. Felhasználó filmjeinek listázása (sikeres)', async ({ request }) => {
      expect(mainCreatedMovieId, "mainCreatedMovieId nem definiált a listázáshoz.").toBeDefined();
      const response = await request.get(`${baseURL}/api/movies`);
      expect(response.ok(), `Filmek listázása sikertelen: ${response.status()}`).toBeTruthy();
      const movies = await response.json();
      expect(Array.isArray(movies)).toBeTruthy();
      const foundMovie = movies.find(movie => movie.id === mainCreatedMovieId);
      expect(foundMovie, `A létrehozott film (ID: ${mainCreatedMovieId}) nem található a listában.`).toBeDefined();
    });

    test('15. Egy konkrét film lekérése (sikeres)', async ({ request }) => {
      expect(mainCreatedMovieId, "mainCreatedMovieId nem definiált a konkrét film lekéréséhez.").toBeDefined();
      const response = await request.get(`${baseURL}/api/movies/${mainCreatedMovieId}`);
      expect(response.ok(), `Konkrét film lekérése sikertelen: ${response.status()}`).toBeTruthy();
      const movie = await response.json();
      expect(movie.id).toBe(mainCreatedMovieId);
      expect(movie.cim).toBeDefined(); // A cím lehet az eredeti vagy a frissített
    });

    test('16. Egy konkrét film lekérése (hiba: nem létező ID)', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/movies/99999999`); // Nagyobb, valószínűleg nem létező ID
      expect(response.status()).toBe(404);
    });

    test('17. Egy konkrét film lekérése (hiba: érvénytelen ID formátum)', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/movies/abc`);
      // A server.js parseInt('abc') NaN-t ad, ami miatt a /:id útvonalon belül
      // a movieId NaN lesz, és a DB lekérdezés előtt a parseInt(req.params.id, 10)
      // isNaN(movieId) true lesz, így 400-at ad vissza.
      expect(response.status()).toBe(400);
    });

    test('18. Film adatainak módosítása (sikeres)', async ({ request }) => {
      expect(mainCreatedMovieId, "mainCreatedMovieId nem definiált a módosításhoz.").toBeDefined();
      const updatedData = {
        cim: "Frissített Teszt Film Címe JS (NoCtx)",
        ertekeles: 5,
        velemeny: "Ez egy frissített vélemény JS (NoCtx)."
      };
      const response = await request.put(`${baseURL}/api/movies/${mainCreatedMovieId}`, {
        headers: { 'Content-Type': 'application/json' },
        data: updatedData
      });
      expect(response.ok(), `Film módosítása sikertelen: ${response.status()}`).toBeTruthy();
      const movie = await response.json();
      expect(movie.cim).toBe(updatedData.cim);
      expect(movie.ertekeles).toBe(updatedData.ertekeles);
      expect(movie.velemeny).toBe(updatedData.velemeny);
    });

    test('19. Film adatainak módosítása (hiba: érvénytelen értékelés)', async ({ request }) => {
      expect(mainCreatedMovieId, "mainCreatedMovieId nem definiált a hibás módosításhoz.").toBeDefined();
      const response = await request.put(`${baseURL}/api/movies/${mainCreatedMovieId}`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          ertekeles: 0
        }
      });
      expect(response.status()).toBe(400);
    });

    test('20. Film adatainak módosítása (hiba: nem létező ID)', async ({ request }) => {
      const response = await request.put(`${baseURL}/api/movies/99999999`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          cim: "Nem Létező Film Frissítése JS (NoCtx)"
        }
      });
      expect(response.status()).toBe(404);
    });

    test('21. Film törlése (sikeres - az eredetileg létrehozott teszt film)', async ({ request }) => {
      expect(mainCreatedMovieId, "mainCreatedMovieId nem definiált a törléshez.").toBeDefined();
      const response = await request.delete(`${baseURL}/api/movies/${mainCreatedMovieId}`);
      // A server.js 204 No Content-et ad sikeres törlés esetén
      expect(response.status()).toBe(204);
    });

    test('22. Film törlése (hiba: nem létező ID, mert már töröltük)', async ({ request }) => {
      expect(mainCreatedMovieId, "mainCreatedMovieId még mindig definiált a második törlési kísérlethez.").toBeDefined();
      const response = await request.delete(`${baseURL}/api/movies/${mainCreatedMovieId}`);
      // A server.js 404-et ad, ha a result.changes === 0 (nem volt mit törölni)
      expect(response.status()).toBe(404);
    });
  }); // End Film Műveletek

  // --- Szűrési Tesztek ---
  test.describe('Szűrési Tesztek', () => {
    // A soros végrehajtás öröklődik. Bejelentkezés minden teszt előtt.
    test.beforeEach(async ({ request }) => {
      const loginResponse = await request.post(`${baseURL}/api/users/login`, {
        headers: { 'Content-Type': 'application/json' },
        data: {
          username: testUsername,
          password: testPassword
        }
      });
      expect(loginResponse.ok(), `Bejelentkezés (${testUsername}) sikertelen a Szűrési Tesztek előtt: ${loginResponse.status()}`).toBeTruthy();
    });

    const filterMoviesData = [
      { name: "watchedFilterMovie", data: { cim: "Megnézett Szűrő Teszt Film JS (NoCtx)", ev: 2024, szereplok: "Színész A, Színész B", ertekeles: 5, megnezve: "2024-01-15", hol: "Online" } },
      { name: "unwatchedFilterMovie", data: { cim: "Nem Megnézett Szűrő Teszt Film JS (NoCtx)", ev: 2024, szereplok: "Színész C", ertekeles: 3, megnezve: null, hol: "Várólista" } },
      { name: "searchableWatchedMovie", data: { cim: "Egyedi Kulcsszó Film Megnézve JS (NoCtx)", ev: 2022, megnezve: "2022-05-10", szereplok: "Kulcsszó Színész" } },
      { name: "searchableUnwatchedMovie", data: { cim: "Másik Kulcsszó Film Nem Megnézve JS (NoCtx)", ev: 2023, megnezve: null, szereplok: "Kulcsszó Színész 2" } }
    ];

    test('Szűrés Setup: Teszt filmek létrehozása szűréshez', async ({ request }) => {
      for (const movie of filterMoviesData) {
        const response = await request.post(`${baseURL}/api/movies`, {
          headers: { 'Content-Type': 'application/json' },
          data: movie.data
        });
        expect(response.ok(), `Szűrő tesztfilm (${movie.data.cim}) létrehozása sikertelen: ${response.status()}`).toBeTruthy();
        const responseBody = await response.json();
        createdFilterMovieIds[movie.name] = responseBody.id;
      }
    });

    test('10. Filmek listázása (szűrés: csak a megnézettek)', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/movies?megnezve=true`);
      expect(response.ok()).toBeTruthy();
      const movies = await response.json();
      expect(Array.isArray(movies)).toBeTruthy();
      for (const movie of movies) {
        expect(movie.megnezve, `A '${movie.cim}' filmnek megnezve állapotúnak kellene lennie.`).not.toBeNull();
      }
      expect(movies.some(m => m.id === createdFilterMovieIds.watchedFilterMovie)).toBeTruthy();
      expect(movies.some(m => m.id === createdFilterMovieIds.searchableWatchedMovie)).toBeTruthy();
      if (createdFilterMovieIds.unwatchedFilterMovie) {
        expect(movies.some(m => m.id === createdFilterMovieIds.unwatchedFilterMovie)).toBeFalsy();
      }
      if (createdFilterMovieIds.searchableUnwatchedMovie) {
        expect(movies.some(m => m.id === createdFilterMovieIds.searchableUnwatchedMovie)).toBeFalsy();
      }
    });

    test('11. Filmek listázása (szűrés: csak a nem megnézettek)', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/movies?megnezve=false`);
      expect(response.ok()).toBeTruthy();
      const movies = await response.json();
      expect(Array.isArray(movies)).toBeTruthy();
      for (const movie of movies) {
        expect(movie.megnezve, `A '${movie.cim}' filmnek nem megnezve állapotúnak kellene lennie (megnezve: null).`).toBeNull();
      }
      expect(movies.some(m => m.id === createdFilterMovieIds.unwatchedFilterMovie)).toBeTruthy();
      expect(movies.some(m => m.id === createdFilterMovieIds.searchableUnwatchedMovie)).toBeTruthy();
      if (createdFilterMovieIds.watchedFilterMovie) {
        expect(movies.some(m => m.id === createdFilterMovieIds.watchedFilterMovie)).toBeFalsy();
      }
      if (createdFilterMovieIds.searchableWatchedMovie) {
        expect(movies.some(m => m.id === createdFilterMovieIds.searchableWatchedMovie)).toBeFalsy();
      }
    });

    test('12. Filmek listázása (keresés címben: "Kulcsszó")', async ({ request }) => {
      const searchTerm = "Kulcsszó";
      const response = await request.get(`${baseURL}/api/movies?cim=${encodeURIComponent(searchTerm)}`);
      expect(response.ok()).toBeTruthy();
      const movies = await response.json();
      expect(Array.isArray(movies)).toBeTruthy();
      for (const movie of movies) {
        expect(movie.cim.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
      expect(movies.some(m => m.id === createdFilterMovieIds.searchableWatchedMovie)).toBeTruthy();
      expect(movies.some(m => m.id === createdFilterMovieIds.searchableUnwatchedMovie)).toBeTruthy();
    });

    test('13. Filmek listázása (kombinált: megnézett ÉS címben "Egyedi")', async ({ request }) => {
      const searchTerm = "Egyedi";
      const response = await request.get(`${baseURL}/api/movies?megnezve=true&cim=${encodeURIComponent(searchTerm)}`);
      expect(response.ok()).toBeTruthy();
      const movies = await response.json();
      expect(Array.isArray(movies)).toBeTruthy();
      for (const movie of movies) {
        expect(movie.megnezve).not.toBeNull();
        expect(movie.cim.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
      expect(movies.some(m => m.id === createdFilterMovieIds.searchableWatchedMovie)).toBeTruthy();
      if (createdFilterMovieIds.searchableUnwatchedMovie) {
        expect(movies.some(m => m.id === createdFilterMovieIds.searchableUnwatchedMovie)).toBeFalsy();
      }
    });

    test('14. Filmek listázása (kombinált: nem megnézett ÉS címben "Másik")', async ({ request }) => {
      const searchTerm = "Másik";
      const response = await request.get(`${baseURL}/api/movies?megnezve=false&cim=${encodeURIComponent(searchTerm)}`);
      expect(response.ok()).toBeTruthy();
      const movies = await response.json();
      expect(Array.isArray(movies)).toBeTruthy();
      for (const movie of movies) {
        expect(movie.megnezve).toBeNull();
        expect(movie.cim.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
      expect(movies.some(m => m.id === createdFilterMovieIds.searchableUnwatchedMovie)).toBeTruthy();
      if (createdFilterMovieIds.searchableWatchedMovie) {
        expect(movies.some(m => m.id === createdFilterMovieIds.searchableWatchedMovie)).toBeFalsy();
      }
    });

    test('Szűrés Teardown: Teszt filmek törlése szűrés után', async ({ request }) => {
      for (const movieName in createdFilterMovieIds) {
        const id = createdFilterMovieIds[movieName];
        if (id) {
          const deleteResponse = await request.delete(`${baseURL}/api/movies/${id}`);
          // Elfogadjuk a 204 (sikeres törlés) vagy 404 (nem található, pl. már törölve) státuszt
          expect([204, 404], `A(z) ${movieName} (ID: ${id}) film törlése sikertelen: ${deleteResponse.status()}`).toContain(deleteResponse.status());
        }
      }
    });
  }); // End Szűrési Tesztek

  // 23. Kijelentkezés (a korábbi globális afterAll helyett)
  test('23. Kijelentkezés (filmtesztelo)', async ({ request }) => {
    // Biztonság kedvéért bejelentkezünk újra, hogy biztosan legyen aktív munkamenet, amit lezárhatunk.
    // Ez a `request` objektum a saját, izolált kontextusában működik.
    const loginForLogoutResponse = await request.post(`${baseURL}/api/users/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: testUsername,
        password: testPassword
      }
    });
    expect(loginForLogoutResponse.ok(), `Bejelentkezés (${testUsername}) sikertelen a kijelentkezési teszt előtt: ${loginForLogoutResponse.status()}`).toBeTruthy();

    const logoutResponse = await request.post(`${baseURL}/api/users/logout`);
    expect(logoutResponse.ok(), `Kijelentkezés (${testUsername}) sikertelen: ${logoutResponse.status()}`).toBeTruthy();
  });

}); // End Fő Tesztcsomag
