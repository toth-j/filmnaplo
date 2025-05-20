# Filmnapló

**Projekt célja:** Egy olyan egyszerű webalkalmazás fejlesztése, amely lehetővé teszi a regisztrált felhasználók számára, hogy saját, személyes listát vezessenek azokról a filmekről, amelyeket láttak vagy meg szeretnének nézni. Minden felhasználó kizárólag a saját, másoktól független filmadatait kezeli és látja.

**Kezelendő adatok:**

* **Felhasználói adatok:**
  * Felhasználónév (egyedi).
  * Biztonságosan tárolt (hashelt) jelszó.
* **Felhasználó filmbejegyzései:** Minden bejegyzés egy adott felhasználóhoz kötődik, és a következő adatokat tartalmazza:
  * Film címe (kötelező).
  * Megjelenési éve (opcionális, szám).
  * Szereplő(k) (opcionális, szöveg).
  * Személyes értékelés (1-5 skálán, opcionális, szám).
  * Rövid személyes jegyzet/vélemény (opcionális, hosszabb szöveg).
  * Megnézés módosítás dátuma (Ha NULL, akkor még nem néztük meg).
  * Hol néztük vagy hol fogjuk nézni (opcionális, szöveg).

Az alkalmazásnak reszponzívnak kell lennie (legalább mobil és asztali nézetre optimalizálva).

## Telepítés és futtatás

### Szükséges szoftverek

* Node.js (LTS verzió ajánlott)
* npm (Node.js-sel együtt települ)

### Konfiguráció

1. Klónozd a projekt repository-t.
2. Navigálj a projekt gyökérkönyvtárába.
3. Hozz létre egy `.env` fájlt a gyökérkönyvtárban a következő tartalommal (a `JWT_SECRET` értékét cseréld le egy erős, véletlenszerű stringre):
    ```
    PORT=3000
    JWT_SECRET=nagyonTitkosKulcsodLeszItt123!
    ```
4. Telepítsd a függőségeket: `npm install`

### Indítás

* A szerver indítása: `npm start` vagy `node server.js`
* Az alkalmazás elérhető lesz a `http://localhost:PORT` címen (ahol a `PORT` a `.env` fájlban megadott érték, alapértelmezetten 3000).

## Dokumentáció

* A specifikáció, valamint a frontend és a backend dokumentációja a [docs mappában](docs/) található.

## Tesztelés

* A manuális tesztek a [tests mappában](tests/) találhatók.
