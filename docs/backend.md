**Magyarázat a `server.js` fájlhoz:**

1. **Importok és Konfiguráció:** Betölti a szükséges modulokat (`express`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `dotenv`, `path`). Beállítja a portot, JWT titkos kulcsot és a bcrypt sózási erősségét.
2. **Adatbázis Beállítása:**
   * Létrehozza a kapcsolatot a `filmnaplo.db` SQLite adatbázisfájllal (ha nem létezik, létrehozza).
   * A `createUserTable` függvény biztosítja, hogy a `users` tábla létezzen az adatbázisban a megfelelő oszlopokkal. Ez a függvény automatikusan lefut a szerver indításakor.
   * A `findUserByUsername` egy segédfüggvény a felhasználók kereséséhez.
3. **Middleware-ek:**
   * `app.use(express.json());`: Engedélyezi a bejövő JSON adatok feldolgozását a request body-ban.
   * `authenticateToken`: Ez a middleware felelős a JWT tokenek ellenőrzéséért. Bár a jelenlegi felhasználói végpontok (regisztráció, bejelentkezés) nem használják közvetlenül, a későbbi, védett (pl. filmekkel kapcsolatos) végpontokhoz elengedhetetlen lesz.
4. **Útvonalak:**
   * **`/api/users/register` (POST):**
     * Fogadja a `username` és `password` adatokat.
     * Ellenőrzi, hogy a mezők ki vannak-e töltve, és a jelszó megfelel-e az alapvető erősségi követelményeknek (itt egy egyszerű hosszellenőrzés van).
     * Ellenőrzi, hogy a felhasználónév foglalt-e már.
     * Hasheli a jelszót a `bcrypt` segítségével.
     * Beilleszti az új felhasználót az adatbázisba.
     * Sikeres regisztráció esetén 201-es státuszkóddal és üzenettel válaszol.
   * **`/api/users/login` (POST):**
     * Fogadja a `username` és `password` adatokat.
     * Megkeresi a felhasználót az adatbázisban.
     * Összehasonlítja a megadott jelszót a tárolt hashelt jelszóval a `bcrypt.compare` segítségével.
     * Sikeres azonosítás esetén generál egy JWT tokent, amely tartalmazza a felhasználó azonosítóját és nevét, és beállít egy lejárati időt.
     * Visszaküldi a tokent és néhány alapvető felhasználói adatot.
   * **`/api/users/logout` (POST):**
     * Ez a végpont jelenleg csak egy megerősítő üzenetet küld. A JWT alapú kijelentkezés főként kliensoldali feladat (a token törlése a böngésző tárolójából). Szerveroldalon bonyolultabb megoldások (pl. token tiltólista) is implementálhatók lennének, de ez egy egyszerűsített verzió.
5. **Alapvető Hibakezelő:** Egy egyszerű middleware, ami elfogja az útvonal-kezelőkben keletkező hibákat, és 500-as státuszkóddal, valamint hibaüzenettel válaszol.
6. **Szerver Indítása:** Elindítja az Express szervert a megadott porton.
   
   

**Fontos megjegyzések:**

* **Adatbázis állapota:** A regisztrációs tesztek (különösen az 5. teszt, ami a már létező felhasználónevet ellenőrzi) függnek az adatbázis aktuális állapotától. Ha többször futtatod a teszteket, előfordulhat, hogy a "testuser_reg" felhasználó már létezik. Ilyenkor vagy törölnöd kell a `filmnaplo.db` fájlt (a szerver újraindításakor új, üres adatbázis jön létre), vagy minden tesztfuttatás előtt egyedi felhasználóneveket kell használnod.

* **Port:** Győződj meg róla, hogy a `@port = 3001` sorban a helyes portszám szerepel, amin a Node.js szervered fut (az `.env` fájlod alapján).

* **Token mentése (haladó):** A REST Client lehetővé teszi a válaszból származó adatok (pl. a JWT token) elmentését és későbbi kérésekben való felhasználását. Például a sikeres bejelentkezés után így menthetnéd el a tokent:
  unfold_lesshttp
  content_copyadd
  `### Sikeres bejelentkezés és token mentése # @name loginRequest POST {{host}}/api/users/login Content-Type: {{contentType}}  {     "username": "testuser_reg",     "password": "password123" }  @token = {{loginRequest.response.body.token}}  ### Védett végpont tesztelése a mentett tokennel (későbbiekben) GET {{host}}/api/some-protected-route Authorization: Bearer {{token}}`
  Ez akkor lesz hasznos, amikor a filmek kezeléséhez szükséges védett végpontokat implementálod. 

Mindegyik alábbi végpont előtt lefut az `authenticateToken` middleware, ami biztosítja, hogy csak bejelentkezett felhasználók férhessenek hozzájuk, és a műveletek mindig az adott bejelentkezett felhasználóhoz kötődnek.

1. **`POST /api/movies`**:
   
   * **Cél**: Új filmbejegyzés hozzáadása az adatbázishoz.
   * **Működés**: A kérés törzsében (`req.body`) várja a film adatait (cím, év, rendező, értékelés stb.). A bejelentkezett felhasználó azonosítóját (`req.user.userId`) felhasználva menti el az új filmet az `movies` (a kódban `filmek`) táblába.
   * **Válasz**: Sikeres létrehozás esetén `201` státuszkóddal és az újonnan létrehozott film adataival tér vissza. Hiba esetén megfelelő státuszkódot és hibaüzenetet küld.

2. **`GET /api/movies`**:
   
   * **Cél**: A bejelentkezett felhasználó összes filmbejegyzésének listázása.
   * **Működés**: Lekérdezi az `movies` (a kódban `filmek`) táblából azokat a filmeket, amelyek a bejelentkezett felhasználóhoz (`req.user.userId`) tartoznak. A filmeket a létrehozás ideje (`letrehozva`) szerint csökkenő sorrendben adja vissza.
   * **Válasz**: `200` státuszkóddal és a felhasználó filmjeinek listájával (JSON tömb) tér vissza.

3. **`GET /api/movies/:id`**:
   
   * **Cél**: Egy konkrét filmbejegyzés adatainak lekérése azonosító alapján.
   * **Működés**: Az URL-ben (`req.params.id`) kapott azonosító alapján megkeresi a filmet az `movies` (a kódban `filmek`) táblában. Csak akkor adja vissza a filmet, ha az létezik ÉS a bejelentkezett felhasználóhoz (`req.user.userId`) tartozik.
   * **Válasz**: Sikeres találat esetén `200` státuszkóddal és a film adataival tér vissza. Ha a film nem található, vagy a felhasználónak nincs jogosultsága megtekinteni, `404` státuszkódot küld. Érvénytelen azonosító esetén `400`-at.

4. **`PUT /api/movies/:id`**:
   
   * **Cél**: Egy meglévő filmbejegyzés adatainak módosítása.
   * **Működés**: Az URL-ben (`req.params.id`) kapott azonosító alapján azonosítja a módosítandó filmet. A kérés törzsében (`req.body`) várja a frissítendő adatokat. Csak azokat a mezőket frissíti, amelyek a kérésben szerepelnek. Ellenőrzi, hogy a film a bejelentkezett felhasználóhoz (`req.user.userId`) tartozik-e. A `frissitve` mezőt automatikusan beállítja az aktuális időpontra.
   * **Válasz**: Sikeres módosítás esetén `200` státuszkóddal és a frissített film adataival tér vissza. Ha a film nem található, vagy a felhasználónak nincs jogosultsága módosítani, `404`-et küld. Érvénytelen adatok vagy azonosító esetén `400`-at.

5. **`DELETE /api/movies/:id`**:
   
   * **Cél**: Egy filmbejegyzés törlése azonosító alapján.
   * **Működés**: Az URL-ben (`req.params.id`) kapott azonosító alapján törli a filmet az `movies` (a kódban `filmek`) táblából. Csak akkor hajtja végre a törlést, ha a film létezik ÉS a bejelentkezett felhasználóhoz (`req.user.userId`) tartozik.
   * **Válasz**: Sikeres törlés esetén `204` ("No Content") státuszkóddal tér vissza (nincs válasz törzs). Ha a film nem található, vagy a felhasználónak nincs jogosultsága törölni, `404`-et küld. Érvénytelen azonosító esetén `400`-at.

Ezek a végpontok alkotják a filmekkel kapcsolatos CRUD (Create, Read, Update, Delete) műveletek alapját a backend oldalon.



**Magyarázat a tesztfájlhoz:**

* **Változók (`@host`, `@contentType`, stb.)**: Globális változók a kérések egyszerűsítésére.
* **`{{$randomInt}}`**: Ez a REST Client kiterjesztés egy dinamikus változója, ami minden futtatáskor egyedi felhasználónevet generál, így a regisztrációs teszt többször is futtatható.
* **`@authToken`**: Ezt a változót a bejelentkezési kérés (`loginTestUser`) válaszából dinamikusan töltjük fel a `>` utáni szkript blokk segítségével.
* **`@createdMovieId`**: Ezt a változót az első sikeres film létrehozási kérés (`addMovieSuccess`) válaszából töltjük fel.
* **`# @name requestName`**: Ez a sor elnevezi a kérést, így a REST Client kiterjesztésben külön-külön is futtathatók.
* **Sorrend**:
  1. Először regisztrálunk egy teszt felhasználót.
  2. Majd bejelentkezünk vele, hogy megszerezzük az `authToken`-t.
  3. Ezután következnek a filmekkel kapcsolatos tesztek, amelyek már használják ezt a tokent és a létrehozott film ID-ját.
* **Teszt esetek**:
  * **Sikeres műveletek**: Ellenőrzik a végpontok helyes működését érvényes adatokkal és authentikációval.
  * **Hibás adatok**: Tesztelik a validációt (pl. hiányzó cím, érvénytelen értékelés).
  * **Authentikációs hibák**: Ellenőrzik, hogy a védett végpontok valóban visszautasítják-e a kéréseket érvényes token nélkül.
  * **Nem található erőforrások**: Tesztelik a `404 Not Found` válaszokat (pl. nem létező film ID).
* **Kliensoldali szkriptelés (`> {% ... %}`)**: A REST Client kiterjesztés lehetővé teszi JavaScript kód futtatását a válasz után, amit itt a token és az ID kinyerésére és globális változókba mentésére használunk.
