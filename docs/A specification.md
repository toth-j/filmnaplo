# Filmnapló alkalmazás specifikáció

## 1. Bevezetés

### 1.1. A projekt célja
A Filmnapló egy webalkalmazás, amely lehetővé teszi a felhasználók számára, hogy az általuk megnézett naplózzák. A felhasználók regisztrálhatnak, bejelentkezhetnek, filmeket adhatnak hozzá a naplójukhoz, értékelhetik és véleményezhetik azokat, valamint nyomon követhetik, hogy mely filmeket nézték meg.

### 1.2. Funkciók
Az alkalmazás a következő fő funkciókat foglalja magában:
*   Felhasználói fiók kezelése (regisztráció, bejelentkezés, kijelentkezés).
*   Filmek hozzáadása, módosítása, listázása, szűrése és keresése, valamint törlése.

### 1.3. Célközönség
Mindenki, aki szeretné rendszerezetten naplózni a megnézett vagy megnézendő filmjeit, személyes értékelésekkel és jegyzetekkel kiegészítve.

## 2. Felhasználói szerepkörök

### 2.1. Regisztrált felhasználó
Az alkalmazás egyetlen fő felhasználói szerepkörrel rendelkezik:
*   **Regisztrált felhasználó**: Képes regisztrálni, bejelentkezni, saját filmeket kezelni (hozzáadni, listázni, módosítani, törölni), valamint kijelentkezni. Minden felhasználó csak a saját maga által hozzáadott filmeket látja és kezelheti.

## 3. Funkcionális követelmények

### 3.1. Felhasználókezelés
*   **FK1: Regisztráció**
    *   A felhasználó megadhat egy felhasználónevet és jelszót a regisztrációhoz.
    *   A rendszer ellenőrzi, hogy a felhasználónév egyedi-e.
    *   A jelszónak meg kell felelnie a minimális biztonsági követelményeknek (legalább 6 karakter).
    *   Sikeres regisztráció után a felhasználó értesítést kap és bejelentkezhet a bejelentkezési oldalon.
*   **FK2: Bejelentkezés**
    *   A felhasználó a regisztrált felhasználónevével és jelszavával bejelentkezhet.
    *   Sikeres bejelentkezés után a rendszer egy autentikációs tokent (JWT) állít be egy HTTP-only cookie-ban.
    *   A felhasználó átirányításra kerül a filmlista oldalra.
*   **FK3: Kijelentkezés**
    *   A felhasználó kijelentkezhet a rendszerből.
    *   Kijelentkezéskor az autentikációs token cookie törlődik.
    *   A felhasználó átirányításra kerül a bejelentkezési oldalra.

### 3.2. Filmnapló kezelése
*   **FK4: Új film hozzáadása**
    *   A bejelentkezett felhasználó új filmet adhat hozzá a naplójához.
    *   Kötelezően megadandó adat: film címe.
    *   Opcionálisan megadható adatok: megjelenési év, szereplők, értékelés (1-5), személyes vélemény, megnézés dátuma, hol nézte meg.
    *   A rendszer validálja a bevitt adatokat (pl. értékelés tartománya, dátum formátuma).
*   **FK5: Filmek listázása**
    *   A bejelentkezett felhasználó megtekintheti a saját maga által hozzáadott filmek listáját.
    *   A lista tartalmazza a filmek adatait (cím, év, értékelés, megnézett státusz).
    *   A felhasználó neve megjelenik a lista címében (pl. "Nagy Béla filmlistája").
*   **FK6: Filmek szűrése**
    *   A felhasználó szűrheti a filmlistát a "megnézett" vagy "még nem megnézett" státusz alapján.
*   **FK7: Filmek keresése**
    *   A felhasználó kereshet a filmek címében.
*   **FK8: Filmek rendezése**
    *   A filmek a hozzáadás sorrendjében (legutóbb hozzáadott elöl) jelennek meg.
    *   A szűrési és keresési eredmények is ebben a sorrendben jelennek meg.
*   **FK9: Film adatainak módosítása**
    *   A bejelentkezett felhasználó módosíthatja a saját maga által hozzáadott filmek adatait.
    *   Minden, a hozzáadáskor megadható adat módosítható.
*   **FK10: Film törlése**
    *   A bejelentkezett felhasználó törölheti a saját maga által hozzáadott filmeket.
    *   Törlés előtt megerősítést kér a rendszer.

## 4. Nem funkcionális követelmények

*   **NFK1: Felhasználói felület (UI)**
    *   Az alkalmazás reszponzív webes felülettel rendelkezik, amely Bootstrap 5 keretrendszerre épül.
    *   A design letisztult és felhasználóbarát.
*   **NFK2: Biztonság**
    *   A felhasználói jelszavak hash-elve (bcrypt) tárolódnak az adatbázisban.
    *   Az autentikáció JWT (JSON Web Token) alapú, a token HTTP-only, secure (éles környezetben) és SameSite=Lax attribútumokkal ellátott cookie-ban tárolódik.
    *   Az API végpontok védettek az illetéktelen hozzáféréstől.
*   **NFK3: Teljesítmény**
    *   Az oldalak gyorsan betöltődnek, és az API válaszok minimális késleltetéssel érkeznek.
    *   A listázás és szűrés hatékonyan működik nagyobb mennyiségű adat esetén is (az SQLite korlátain belül).
*   **NFK4: Karbantarthatóság**
    *   A kliens- és szerveroldali kód moduláris és jól strukturált.
    *   A kód megfelelően kommentezett, ahol szükséges.
*   **NFK5: Kompatibilitás**
    *   Az alkalmazás támogatja a modern webböngészőket (Chrome, Firefox, Safari, Edge legfrissebb verziói).

## 5. Architektúra

### 5.1. Áttekintés
Az alkalmazás egy klasszikus kliens-szerver architektúrát követ.
*   **Kliensoldal (Frontend)**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5. A böngészőben fut, felelős a felhasználói felület megjelenítéséért és az interakciók kezeléséért.
*   **Szerveroldal (Backend)**: Node.js futtatási környezetben, Express.js keretrendszerrel. Felelős az üzleti logika végrehajtásáért, adatbázis-műveletekért és az API végpontok kiszolgálásáért.
*   **Adatbázis**: SQLite, egy fájl-alapú relációs adatbázis-kezelő rendszer. A `better-sqlite3` modul segítségével éri el a szerver.

### 5.2. Kommunikáció
A kliens és a szerver között a kommunikáció HTTP protokollon keresztül történik. Az adatok JSON formátumban cserélődnek.

## 6. Felhasználói felület és oldaltérkép

### 6.1. Oldalak
1.  **Bejelentkezési oldal (`/index.html`)**
    *   Űrlap a felhasználónév és jelszó megadására.
    *   Link a regisztrációs oldalra.
2.  **Regisztrációs oldal (`/register.html`)**
    *   Űrlap a felhasználónév, jelszó és jelszó megerősítésének megadására.
    *   Link a bejelentkezési oldalra.
3.  **Filmlista oldal (`/movies.html`)**
    *   Címsor a felhasználó nevével (pl. "Nagy Béla filmlistája").
    *   Megjeleníti a bejelentkezett felhasználó filmjeit kártya nézetben.
    *   Szűrési lehetőség (státusz alapján).
    *   Keresési mező (cím alapján).
    *   Gomb új film hozzáadásához.
    *   Minden filmkártyán gombok a szerkesztéshez és törléshez.
    *   Navigációs sáv linkkel új film hozzáadásához és kijelentkezéshez.
4.  **Új film hozzáadása oldal (`/add_movie.html`)**
    *   Űrlap az új film adatainak megadására (cím, év, szereplők, értékelés, vélemény, megnézve, hol).
    *   Mentés és Mégse gombok.
5.  **Film szerkesztése oldal (`/edit_movie.html`)**
    *   Űrlap a meglévő film adatainak módosítására, előre kitöltve a film aktuális adataival.
    *   Mentés és Mégse gombok.

## 7. API

Lásd a `docs/backend.md` fájlt a részletes API végpont leírásokért. A főbb végpontok:

*   **Felhasználók (`/api/users`)**:
    *   `POST /register`: Regisztráció
    *   `POST /login`: Bejelentkezés
    *   `POST /logout`: Kijelentkezés
*   **Filmek (`/api/movies`)**:
    *   `POST /`: Új film hozzáadása
    *   `GET /`: Filmek listázása (szűréssel, kereséssel)
    *   `GET /:id`: Egy konkrét film lekérése
    *   `PUT /:id`: Film adatainak módosítása
    *   `DELETE /:id`: Film törlése

## 8. Adatbázis séma

Lásd a `docs/backend.md` fájl "Adatmodellek" és az adatbázis séma képét (`docs/images/db.png`).

### 8.1. `felhasznalok` tábla
| Mező       | Típus   | Leírás                                   | Megkötések                 |
| ---------- | ------- | ---------------------------------------- | -------------------------- |
| `id`       | INTEGER | Egyedi azonosító                         | PRIMARY KEY, AUTOINCREMENT |
| `username` | TEXT    | Felhasználónév                           | UNIQUE, NOT NULL           |
| `password` | TEXT    | Hash-elt jelszó (bcrypt)                 | NOT NULL                   |

### 8.2. `filmek` tábla
| Mező        | Típus   | Leírás                                             | Megkötések                                                |
| ----------- | ------- | -------------------------------------------------- | --------------------------------------------------------- |
| `id`        | INTEGER | Egyedi azonosító                                   | PRIMARY KEY, AUTOINCREMENT                                |
| `user_id`   | INTEGER | A felhasználó azonosítója                          | NOT NULL, FOREIGN KEY (felhasznalok.id) ON DELETE CASCADE |
| `cim`       | TEXT    | Film címe                                          | NOT NULL                                                  |
| `ev`        | INTEGER | Megjelenési év                                     | Opcionális                                                |
| `szereplok` | TEXT    | Szereplők listája                                  | Opcionális                                                |
| `ertekeles` | INTEGER | Értékelés (1-5)                                    | Opcionális                                                |
| `velemeny`  | TEXT    | Felhasználói vélemény                              | Opcionális                                                |
| `megnezve`  | DATE    | Megnézés dátuma ('YYYY-MM-DD')                     | Opcionális (ha `NULL`, még nem nézte meg)                 |
| `hol`       | TEXT    | Hol nézte meg                                      | Opcionális                                                |

## 9. Telepítés és futtatás

### 9.1. Szükséges szoftverek
*   Node.js (LTS verzió ajánlott)
*   npm (Node.js-sel együtt települ)

### 9.2. Konfiguráció
1.  Klónozd a projekt repository-t.
2.  Navigálj a projekt gyökérkönyvtárába.
3.  Hozz létre egy `.env` fájlt a gyökérkönyvtárban a következő tartalommal (a `JWT_SECRET` értékét cseréld le egy erős, véletlenszerű stringre):
    ```
    PORT=3000
    JWT_SECRET=nagyonTitkosKulcsodLeszItt123!
    ```
4.  Telepítsd a függőségeket: `npm install`

### 9.3. Indítás
*   A szerver indítása: `npm start` vagy `node server.js`
*   Az alkalmazás elérhető lesz a `http://localhost:PORT` címen (ahol a `PORT` a `.env` fájlban megadott érték, alapértelmezetten 3000).

## 10. Tesztelés

### 10.1. Manuális API tesztelés
Az API végpontok manuális teszteléséhez a `tests` mappában található `.http` fájlok használhatók (pl. VS Code REST Client kiterjesztéssel):
*   `api_teszt1.http`: Felhasználókezelési végpontok tesztjei.
*   `api_teszt2.http`: Filmkezelési végpontok tesztjei (beleértve a szűrést is).

**Fontos megjegyzés a teszteléshez:**
*   A tesztek futtatása előtt győződj meg róla, hogy a szerver fut.
*   A regisztrációs tesztek és a már létező felhasználónevet ellenőrző tesztek függnek az adatbázis aktuális állapotától. Szükség esetén a `filmnaplo.db` fájl törölhető (a szerver újraindításakor új, üres adatbázist hoz létre), vagy egyedi felhasználóneveket kell használni a tesztek során.
*   Ha az adatbázis már tartalmaz megőrzendő adatokat, akkor az adatbázisfájlt a tesztek futtatása előtt célszerű átnevezni.

### 10.2. Kliensoldali tesztelés
A kliensoldali funkciók manuális tesztelése a böngészőben történik a különböző felhasználói forgatókönyvek végigjátszásával (regisztráció, bejelentkezés, film hozzáadása, szűrés, szerkesztés, törlés, kijelentkezés).

## 11. Jövőbeli fejlesztési lehetőségek (opcionális)
*   Kiterjesztett szűrési és rendezési opciók (pl. értékelés, év szerint).
*   Képek feltöltése a filmekhez (borítóképek).
*   Filmek importálása/exportálása.
*   Publikus filmlisták megosztása (opcionális).
*   API dokumentáció automatikus generálása (pl. Swagger/OpenAPI).
*   Automatizált tesztek (unit, integration, e2e).

