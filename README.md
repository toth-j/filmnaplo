**Projekt címe:** Személyes filmnapló

**Projekt célja:** Egy olyan egyszerű webalkalmazás fejlesztése, amely lehetővé teszi a regisztrált felhasználók számára, hogy saját, személyes listát vezessenek azokról a filmekről, amelyeket láttak, meg szeretnének nézni, vagy éppen néznek. Minden felhasználó kizárólag a saját, másoktól független filmadatait kezeli és látja. 

**Főbb funkciók:**

1. **Adattárolás (Backend oldalon):**
   
   * **Felhasználói adatok:**
     * Felhasználónév (egyedi).
     * Biztonságosan tárolt (hashelt) jelszó.
   * **Felhasználó filmbejegyzései:** Minden bejegyzés egy adott felhasználóhoz kötődik, és a következő adatokat tartalmazza:
     * Film címe (kötelező).
     * Megjelenési éve (opcionális, szám).
     * Rendező(k) (opcionális, szöveg).
     * Személyes értékelés (1-5 skálán, opcionális, szám).
     * Rövid személyes jegyzet/vélemény (opcionális, hosszabb szöveg).
     * Megnézés módosítás dátuma (Ha NULL, akkor még nem néztük meg).
     * Hol néztük vagy hol fogjuk nézni (opcionális, szöveg).

2. **Backend API:**
   
   * **Felhasználókezelés (Authentication):**
     * `POST /api/users/register`: Regisztráció új felhasználói fiókkal (felhasználónév, jelszó).
     * `POST /api/users/login`: Bejelentkezés (felhasználónév, jelszó), sikeres bejelentkezés esetén token alapú azonosítás.
     * `POST /api/users/logout`: Kijelentkezés.
   * **Saját filmbejegyzések kezelése (autentikációt igénylő végpontok, a bejelentkezett felhasználóhoz kötötten):**
     * `POST /api/movies`: Új filmbejegyzés hozzáadása a bejelentkezett felhasználó naplójához.
     * `GET /api/movies`: A bejelentkezett felhasználó összes filmbejegyzésének listázása. Lehetőség szűrésre.
     * `GET /api/movies/:id`: Egy konkrét filmbejegyzés részleteinek lekérése (csak a sajátját érheti el).
     * `PUT /api/movies/:id`: Meglévő filmbejegyzés adatainak módosítása (csak a sajátját módosíthatja).
     * `DELETE /api/movies/:id`: Filmbejegyzés törlése a személyes naplóból (csak a sajátját törölheti).

3. **Frontend (Felhasználói Felület):**
   
   * Reszponzív (legalább mobil és asztali nézetre optimalizált) webdesign.
   * **Oldalak:**
     * **Kezdőoldal/Bejelentkezési oldal:** Bejelentkezési űrlap. Link a regisztrációs oldalra.
     * **Regisztrációs oldal:** Regisztrációs űrlap.
     * **Filmnaplóm oldal (bejelentkezés után):**
       * A felhasználó saját filmbejegyzéseinek listázása (pl. táblázatosan vagy kártyákon).
       * Lehetőség új filmbejegyzés hozzáadására (egy űrlapon keresztül).
       * Lehetőség a meglévő filmbejegyzések szerkesztésére és törlésére.
       * Szűrési lehetőség a filmek státusza alapján.
       * Kijelentkezés gomb.
   * **Interakciók:**
     * Űrlapok kliensoldali validációja (pl. kötelező mezők kitöltése).
     * Dinamikus tartalomfrissítés (pl. új film hozzáadása után a lista frissül az oldal újratöltése nélkül) .
     * Vizuális visszajelzések a felhasználói műveletekről (pl. "Sikeres mentés!", "Hiba történt!").

**Technológiai követelmények:**

* **Backend:** Node.js, Express.js.
* **Frontend:** HTML5, CSS3, JavaScript.
* **Adatbázis/Adattárolás:** SQLite adatbázis használata a `better-sqlite3` Node.js csomaggal.
* **Verziókezelés:** Git használata kötelező (GitHub).
* **API Kommunikáció:** A frontend JavaScript `fetch` API-t használ a backend API-val való kommunikációra (JSON formátumú adatokkal).


