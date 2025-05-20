# Filmnapló frontend fejlesztői dokumentáció

## 1. Bevezetés

### 1.1. A Frontend célja

A Filmnapló alkalmazás frontend része felelős a felhasználói felület (UI) megjelenítéséért, a felhasználói interakciók kezeléséért, valamint a backend API-val való kommunikációért. Célja egy reszponzív, intuitív és könnyen használható felület biztosítása a felhasználók számára filmjeik kezeléséhez.

### 1.2. Használt technológiák

* **HTML5**: Az oldalak strukturális felépítése.
* **CSS3**: Az oldalak stílusának és megjelenésének testreszabása.
  * `public/css/style.css`: Egyedi stílusok.
* **JavaScript (ES6+)**: A kliensoldali logika, dinamikus tartalomkezelés, API kommunikáció.
* **Bootstrap 5.3**: Reszponzív design és előre elkészített UI komponensek (navigációs sáv, kártyák, űrlapok, gombok, stb.).

## 2. Projekt struktúra (Frontend rész)

A frontend fájlok a `public` mappában találhatóak.

## 3. JavaScript modulok és funkciók

### 3.1. `public/js/auth.js` - Felhasználói autentikáció

Ez a fájl kezeli a felhasználói fiókokkal kapcsolatos műveleteket.

* **Fő funkciók**:
  * `handleRegister(event)`: Regisztrációs űrlap adatainak feldolgozása, API hívás a `/api/users/register` végpontra.
  * `handleLogin(event)`: Bejelentkezési űrlap adatainak feldolgozása, API hívás a `/api/users/login` végpontra. Sikeres bejelentkezés után a felhasználónevet a `localStorage`-ba menti (`username` kulccsal).
  * `handleLogout(event)`: API hívás a `/api/users/logout` végpontra a kijelentkezéshez, `localStorage` törlése.
  * `updateNavUI()`: Frissíti a navigációs sáv linkjeinek láthatóságát a bejelentkezési állapot alapján (pl. "Filmnaplóm", "Kijelentkezés" megjelenítése, "Bejelentkezés", "Regisztráció" elrejtése).
* **Eseménykezelők**: Figyeli a regisztrációs, bejelentkezési űrlapok `submit` eseményét és a kijelentkezés gomb `click` eseményét.
* **Inicializálás**: Az oldal betöltődésekor lefut az `updateNavUI()` a navigáció megfelelő állapotának beállításához.

### 3.2. `public/js/movies.js` - Filmkezelés

Ez a fájl felelős a filmekkel kapcsolatos CRUD (Create, Read, Update, Delete) műveletekért és a filmlista megjelenítéséért.

* **Fő funkciók**:
  * `loadMovies()`: Lekéri a felhasználó filmjeit a `/api/movies` végpontról (figyelembe véve a szűrési és keresési paramétereket), majd megjeleníti őket a `movies.html` oldalon. Kezeli a betöltési indikátort és az "üres lista" üzenetet.
  * `renderMovieCard(movie, container)`: Létrehoz egy Bootstrap kártyát egy filmadatok alapján és hozzáadja a megadott konténerhez.
  * `handleAddOrEditMovie(event)`: Kezeli az új film hozzáadása és a meglévő film szerkesztése űrlapok beküldését. API hívásokat indít a `POST /api/movies` vagy `PUT /api/movies/:id` végpontokra.
  * `loadMovieDataForEdit()`: Betölti egy adott film adatait a szerkesztési űrlapba (`edit_movie.html`), az URL-ből kiolvasott `id` alapján.
  * `confirmDeleteMovie(movieId)`: Megerősítést kér a felhasználótól a film törlése előtt.
  * `deleteMovie(movieId)`: API hívást indít a `DELETE /api/movies/:id` végpontra a film törléséhez. Sikeres törlés után újratölti a filmlistát.
  * `handleMovieListClick(event)`: Eseménydelegálással kezeli a törlés gombokra való kattintást a filmlistában.
* **Oldalspecifikus logika**:
  * `movies.html`: Betölti a filmeket, beállítja a szűrőgomb eseménykezelőjét, frissíti az oldal címét a felhasználó nevével.
  * `add_movie.html`: Beállítja az űrlap `submit` eseménykezelőjét.
  * `edit_movie.html`: Betölti a szerkesztendő film adatait, majd beállítja az űrlap `submit` eseménykezelőjét.
* **API interakció**: `fetch` API-t használ a backenddel való kommunikációhoz.

## 4. HTML oldalak

### 4.1. `index.html` (Bejelentkezési oldal)

* Tartalmazza a bejelentkezési űrlapot.
* Linket biztosít a regisztrációs oldalra.
* A navigációs sávban alapértelmezetten a "Regisztráció" link aktív.
* Az `auth.js` kezeli az űrlap működését.

### 4.2. `register.html` (Regisztrációs oldal)

* Tartalmazza a regisztrációs űrlapot.
* Linket biztosít a bejelentkezési oldalra.
* A navigációs sávban alapértelmezetten a "Bejelentkezés" és "Regisztráció" linkek láthatóak.
* Az `auth.js` kezeli az űrlap működését.

### 4.3. `movies.html` (Filmlista oldal)

* Ez az oldal jeleníti meg a bejelentkezett felhasználó filmjeit.
* **Dinamikus tartalom**:
  * A címsor (`<h2 id="moviesTitle">`) a felhasználó nevével frissül (pl. "Nagy Béla filmlistája").
  * A filmkártyák dinamikusan generálódnak a `movies.js` által.
* **Funkciók**:
  * Szűrés státusz alapján (`megnézett`, `még nem megnézett`, `összes`).
  * Keresés filmcím alapján.
  * Gomb új film hozzáadásához (átirányít az `add_movie.html`-re).
  * Minden filmkártyán "Szerkesztés" (átirányít az `edit_movie.html?id=FILM_ID`-re) és "Törlés" gombok.
* A navigációs sávban az "Új film" és "Kijelentkezés" linkek láthatóak.
* A `movies.js` és `auth.js` (a kijelentkezéshez és nav frissítéshez) felelős az oldal működéséért.

### 4.4. `add_movie.html` (Új film hozzáadása oldal)

* Űrlapot tartalmaz egy új film adatainak (cím, év, szereplők, értékelés, vélemény, megnézés dátuma, hol) megadásához.
* A `movies.js` kezeli az űrlap beküldését.

### 4.5. `edit_movie.html` (Film szerkesztése oldal)

* Űrlapot tartalmaz egy meglévő film adatainak módosításához.
* Az űrlap mezői előre kitöltődnek a szerkesztendő film aktuális adataival, amelyeket a `movies.js` tölt be az URL-ben található `id` paraméter alapján.
* A `movies.js` kezeli az űrlap beküldését.

## 5. CSS stílusok (`public/css/style.css`)

* **Háttérkép**: Beállítja a `body` elem háttérképét (`hatter.jpg`), középre igazítja, és biztosítja, hogy mindig lefedje az oldalt (`background-size: cover; background-attachment: fixed;`).
* **Padding**: A `body`-nak felső padding-et ad, hogy a fixált navigációs sáv ne takarja el a tartalmat.
* **Betűtípus**: Alapértelmezett betűtípust (`Segoe UI`) állít be.
* **Filmkártyák**: Kisebb módosítások a Bootstrap kártyák megjelenésén (pl. a kártya törzsének flexibilis igazítása).
* **Lekerekített sarkok**: A bejelentkezési és regisztrációs űrlap konténerének sarkai le vannak kerekítve (`rounded-3` Bootstrap osztály).

## 6. API interakció

* A kliensoldali JavaScript a `fetch` API-t használja aszinkron HTTP kérések küldésére a backend API végpontokra.
* A kérések `Content-Type` fejléce `application/json` a `POST` és `PUT` metódusoknál.
* A válaszok JSON formátumban érkeznek.
* **Autentikáció**: A backend által beállított `authToken` HTTP-only cookie-t a böngésző automatikusan csatolja a kérésekhez. A frontend kód közvetlenül nem fér hozzá ehhez a cookie-hoz.
* **Felhasználói adatok**: A bejelentkezett felhasználó nevét az `auth.js` a `localStorage`-ban tárolja (`username` kulccsal) a UI testreszabásához (pl. `movies.html` cím).
* **Hibakezelés**:
  * A `fetch` válaszának `response.ok` tulajdonsága ellenőrzésre kerül.
  * Hiba esetén a `response.json()` segítségével próbálja feldolgozni a hibaüzenetet tartalmazó JSON választ.
  * A `showMessage` függvény segítségével jeleníti meg a hibaüzeneteket a felhasználónak.
  * Speciális hibakódok (pl. 401 Unauthorized) kezelése, ami átirányításhoz vagy kijelentkeztetéshez vezethet.

## 7. Fontosabb UI komponensek és funkciók

* **Navigációs sáv**: Bootstrap `navbar` komponens, fixált a képernyő tetején. Tartalma dinamikusan változik a `auth.js` `updateNavUI()` függvénye által a bejelentkezési állapotnak megfelelően.
* **Filmkártyák (`movies.html`)**: Bootstrap `card` komponensek, amelyek egy rácsrendszerben (`row`, `col-md-4`) jelennek meg. Dinamikusan generálja a `movies.js`.
* **Űrlapok**: Standard HTML űrlapok Bootstrap stílusokkal. A kliensoldali validáció (pl. kötelező mezők) és az adatok feldolgozása JavaScriptben történik, mielőtt az API hívás megtörténne.
* **Szűrés és keresés (`movies.html`)**:
  * Egy `select` legördülő menü a státusz alapú szűréshez.
  * Egy `input type="text"` mező a címben való kereséshez.
  * Egy "Szűrés/Keresés" gomb, ami újra meghívja a `loadMovies()` függvényt az aktuális szűrési értékekkel.
* **Betöltési indikátor (`movies.html`)**: Egy Bootstrap `spinner` jelenik meg, amíg a filmadatok töltődnek a szerverről.
* **Üzenetek (`showMessage`)**: Bootstrap `alert` komponensek használatával jelennek meg a felhasználói visszajelzések (siker, hiba, információ).

## 8. Frontend futtatása

A frontend fájlokat a Node.js/Express backend szolgálja ki statikus fájlokként a `public` mappából. Tehát a frontend futtatásához a backend szervert kell elindítani (`npm start` vagy `node server.js`), majd a böngészőben megnyitni a `http://localhost:PORT` címet (ahol `PORT` a konfigurált portszám).

## 9. Manuális tesztelés

A frontend alkalmazás funkcionalitásának és felhasználói élményének ellenőrzése érdekében manuális tesztelési esetek kerültek kidolgozásra. Ezek a tesztek lefedik a főbb felhasználói utakat, a felhasználói felület elemeinek helyes működését, valamint a reszponzivitást különböző eszközökön.

A részletes manuális tesztelési esetek és a tesztelési folyamat leírása a következő dokumentumban található:

* `tests/manual_e2e_tests.md`

**Megjegyzések**:

* A tesztek futtatása előtt győződj meg róla, hogy a szerver fut.
* A regisztrációs tesztek és a már létező felhasználónevet ellenőrző tesztek függnek az adatbázis aktuális állapotától. Szükség esetén a `filmnaplo.db` fájl törölhető (a szerver újraindításakor új, üres adatbázist hoz létre), vagy egyedi felhasználóneveket kell használni a tesztek során.
* Ha az adatbázis már tartalmaz megőrzendő adatokat, akkor az adatbázisfájlt a tesztek futtatása előtt célszerű átnevezni.

A tesztek futtatását a `tests/test_execution_log.xlsx` fájlban dokumentáljuk.
