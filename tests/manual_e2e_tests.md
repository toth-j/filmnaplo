# Filmnapló alkalmazás - manuális end-to-end tesztesetek

## Előkészületek

* A teszteléshez egy tiszta böngésző munkamenet (inkognitó mód) ajánlott.
* Az alkalmazásnak futnia kell a megadott `http://localhost:3000` címen.
* Szükség lesz tesztadatokra (pl. felhasználónevek, jelszavak, filmadatok).

## 1. Felhasználói fiók kezelése

### 1.1. Regisztráció

#### **Teszt ID:** TC_USER_REG_001  

**Cím:** Sikeres felhasználói regisztráció  
**Előfeltételek:** Nincs  
**Tesztadatok:**

* Felhasználónév: `tesztfelhasznalo1` (legyen egyedi)
* Jelszó: `TesztJelszo123`

**Lépések:**

1. Nyisd meg az alkalmazás bejelentkezési oldalát (`http://localhost:3000` vagy `/index.html`).
2. Kattints a "Regisztráció" linkre (a navigációs sávban vagy az űrlap alatt).
3. Az "Felhasználónév" mezőbe írd be: `tesztfelhasznalo1`.
4. A "Jelszó" mezőbe írd be: `TesztJelszo123`.
5. A "Jelszó megerősítése" mezőbe írd be: `TesztJelszo123`.
6. Kattints a "Regisztráció" gombra.

**Elvárt eredmények:**

* Sikeres regisztrációról értesítés jelenik meg ("Sikeres regisztráció! Most már bejelentkezhetsz.").
* Az alkalmazás átirányít a bejelentkezési oldalra.
  
#### **Teszt ID:** TC_USER_REG_002  

**Cím:** Sikertelen regisztráció - Túl rövid felhasználónév  
**Előfeltételek:** Nincs  
**Tesztadatok:**

* Felhasználónév: `te`
* Jelszó: `TesztJelszo123`

**Lépések:**

1. Nyisd meg a regisztrációs oldalt.
2. Az "Felhasználónév" mezőbe írd be: `te`.
3. A "Jelszó" mezőbe írd be: `TesztJelszo123`.
4. A "Jelszó megerősítése" mezőbe írd be: `TesztJelszo123`.
5. Kattints a "Regisztráció" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy a felhasználónévnek legalább 3 karakter hosszúnak kell lennie.
* A felhasználó a regisztrációs oldalon marad.

#### **Teszt ID:** TC_USER_REG_003  

**Cím:** Sikertelen regisztráció - Túl rövid jelszó  
**Előfeltételek:** Nincs  
**Tesztadatok:**

* Felhasználónév: `tesztfelhasznalo2`
* Jelszó: `teszt`

**Lépések:**

1. Nyisd meg a regisztrációs oldalt.
2. Az "Felhasználónév" mezőbe írd be: `tesztfelhasznalo2`.
3. A "Jelszó" mezőbe írd be: `teszt`.
4. A "Jelszó megerősítése" mezőbe írd be: `teszt`.
5. Kattints a "Regisztráció" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy a jelszónak legalább 6 karakter hosszúnak kell lennie.
* A felhasználó a regisztrációs oldalon marad.

#### **Teszt ID:** TC_USER_REG_004  

**Cím:** Sikertelen regisztráció - Jelszavak nem egyeznek  
**Előfeltételek:** Nincs  
**Tesztadatok:**

* Felhasználónév: `tesztfelhasznalo3`
* Jelszó: `TesztJelszo123`
* Jelszó megerősítése: `MasikJelszo123`

**Lépések:**

1. Nyisd meg a regisztrációs oldalt.
2. Az "Felhasználónév" mezőbe írd be: `tesztfelhasznalo3`.
3. A "Jelszó" mezőbe írd be: `TesztJelszo123`.
4. A "Jelszó megerősítése" mezőbe írd be: `MasikJelszo123`.
5. Kattints a "Regisztráció" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy a jelszavak nem egyeznek.
* A felhasználó a regisztrációs oldalon marad.

#### **Teszt ID:** TC_USER_REG_005  

**Cím:** Sikertelen regisztráció - Foglalt felhasználónév  
**Előfeltételek:** A `tesztfelhasznalo1` felhasználó már regisztrálva van (lásd TC_USER_REG_001).  
**Tesztadatok:**

* Felhasználónév: `tesztfelhasznalo1`
* Jelszó: `UjJelszo456`

**Lépések:**

1. Nyisd meg a regisztrációs oldalt.
2. Az "Felhasználónév" mezőbe írd be: `tesztfelhasznalo1`.
3. A "Jelszó" mezőbe írd be: `UjJelszo456`.
4. A "Jelszó megerősítése" mezőbe írd be: `UjJelszo456`.
5. Kattints a "Regisztráció" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy a felhasználónév már foglalt.
* A felhasználó a regisztrációs oldalon marad.

### 1.2. Bejelentkezés

#### **Teszt ID:** TC_USER_LOGIN_001  

**Cím:** Sikeres bejelentkezés  
**Előfeltételek:** A `tesztfelhasznalo1` felhasználó regisztrálva van és kijelentkezett állapotban van.  
**Tesztadatok:**

* Felhasználónév: `tesztfelhasznalo1`
* Jelszó: `TesztJelszo123`

**Lépések:**

1. Nyisd meg az alkalmazás bejelentkezési oldalát.
2. Az "Felhasználónév" mezőbe írd be: `tesztfelhasznalo1`.
3. A "Jelszó" mezőbe írd be: `TesztJelszo123`.
4. Kattints a "Bejelentkezés" gombra.

**Elvárt eredmények:**

* Az alkalmazás átirányít a filmlista oldalra (`/filmlista.html` vagy hasonló).
* A filmlista oldalon megjelenik a felhasználó neve (pl. "tesztfelhasznalo1 filmlistája").
* A navigációs sávban megjelennek a bejelentkezett felhasználóknak szóló opciók (pl. "Új film", "Kijelentkezés").

#### **Teszt ID:** TC_USER_LOGIN_002  

**Cím:** Sikertelen bejelentkezés - Helytelen jelszó  
**Előfeltételek:** A `tesztfelhasznalo1` felhasználó regisztrálva van.  
**Tesztadatok:**

* Felhasználónév: `tesztfelhasznalo1`
* Jelszó: `RosszJelszo`

**Lépések:**

1. Nyisd meg az alkalmazás bejelentkezési oldalát.
2. Az "Felhasználónév" mezőbe írd be: `tesztfelhasznalo1`.
3. A "Jelszó" mezőbe írd be: `RosszJelszo`.
4. Kattints a "Bejelentkezés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg (pl. "Hibás felhasználónév vagy jelszó.").
* A felhasználó a bejelentkezési oldalon marad.

#### **Teszt ID:** TC_USER_LOGIN_003  

**Cím:** Sikertelen bejelentkezés - Nem létező felhasználónév  
**Előfeltételek:** Nincs  
**Tesztadatok:**

* Felhasználónév: `nemletezofelhasznalo`
* Jelszó: `BarmilyenJelszo`

**Lépések:**

1. Nyisd meg az alkalmazás bejelentkezési oldalát.
2. Az "Felhasználónév" mezőbe írd be: `nemletezofelhasznalo`.
3. A "Jelszó" mezőbe írd be: `BarmilyenJelszo`.
4. Kattints a "Bejelentkezés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg (pl. "Hibás felhasználónév vagy jelszó.").
* A felhasználó a bejelentkezési oldalon marad.

### 1.3. Kijelentkezés

#### **Teszt ID:** TC_USER_LOGOUT_001  

**Cím:** Sikeres kijelentkezés  
**Előfeltételek:** A felhasználó be van jelentkezve.  
**Lépések:**

    1.  A navigációs sávban kattints a "Kijelentkezés" linkre.

**Elvárt eredmények:**

* Az alkalmazás átirányít a bejelentkezési oldalra.
* A védett oldalak (pl. filmlista) nem érhetők el közvetlen URL-en keresztül sem (átirányítás a bejelentkezési oldalra).
* A navigációs sáv a kijelentkezett állapotnak megfelelő opciókat mutatja (pl. "Regisztráció").

## 2. Filmek kezelése

**Előfeltétel az alábbi tesztekhez: A `tesztfelhasznalo1` felhasználó be van jelentkezve.**

### 2.1. Új film hozzáadása

#### **Teszt ID:** TC_MOVIE_ADD_001  

**Cím:** Sikeres új film hozzáadása (minden mező kitöltve)  
**Tesztadatok:**

* Cím: `Galaxis útikalauz stopposoknak`
* Év: `2005`
* Szereplők: `Martin Freeman, Zooey Deschanel`
* Értékelés: `5`
* Vélemény: `Klasszikus!`
* Megnézve: `2023-10-26` (vagy egy érvényes dátum)
* Hol: `HBO`

**Lépések:**

1. A filmlista oldalon kattints az "Új film hozzáadása" gombra vagy a navigációs sáv "Új film" linkjére.
2. Töltsd ki az űrlapot a fenti tesztadatokkal.
3. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Az alkalmazás visszairányít a filmlista oldalra.
* Az újonnan hozzáadott film megjelenik a listában a megadott adatokkal.

#### **Teszt ID:** TC_MOVIE_ADD_002  

**Cím:** Új film hozzáadása (csak kötelező mező: Cím)  
**Tesztadatok:**

* Cím: `Egyedi filmcím kötelező`

**Lépések:**

1. Navigálj az új film hozzáadása oldalra.
2. A "Cím" mezőbe írd be: `Egyedi filmcím kötelező`.
3. A többi mezőt hagyd üresen.
4. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Az alkalmazás visszairányít a filmlista oldalra.
* Az újonnan hozzáadott film megjelenik a listában a megadott címmel. A többi adat üres vagy alapértelmezett.

#### **Teszt ID:** TC_MOVIE_ADD_003  

**Cím:** Sikertelen film hozzáadása - Hiányzó cím  
**Lépések:**

1. Navigálj az új film hozzáadása oldalra.
2. Az "Év" mezőbe írj be egy értéket (pl. `2020`), de a "Cím" mezőt hagyd üresen.
3. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy a cím megadása kötelező.
* A felhasználó az új film hozzáadása oldalon marad, a beírt adatok megmaradnak.

#### **Teszt ID:** TC_MOVIE_ADD_004  

**Cím:** Sikertelen film hozzáadása - Érvénytelen értékelés (túl magas)  
**Tesztadatok:**

* Cím: `Film túl magas értékeléssel`
* Értékelés: `7`

**Lépések:**

1. Navigálj az új film hozzáadása oldalra.
2. A "Cím" mezőbe írd be: `Film túl magas értékeléssel`.
3. Az "Értékelés" mezőbe írd be: `7`.
4. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy az értékelésnek 1 és 5 között kell lennie.
* A felhasználó az új film hozzáadása oldalon marad.

#### **Teszt ID:** TC_MOVIE_ADD_005  

**Cím:** Sikertelen film hozzáadása - Érvénytelen év (túl régi)  
**Tesztadatok:**

* Cím: `Túl régi film`
* Év: `1700`

**Lépések:**

1. Navigálj az új film hozzáadása oldalra.
2. A "Cím" mezőbe írd be: `Túl régi film`.
3. Az "Év" mezőbe írd be: `1800`.
4. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy az évszámnak egy reális tartományban kell lennie (pl. 1888 után).
* A felhasználó az új film hozzáadása oldalon marad.

#### **Teszt ID:** TC_MOVIE_ADD_006  

**Cím:** Sikertelen film hozzáadása - Érvénytelen dátumformátum (Megnézve)  
**Tesztadatok:**

* Cím: `Film rossz dátummal`
* Megnézve: `2023-13-01` (vagy `26/10/2023`)

**Lépések:**

1. Navigálj az új film hozzáadása oldalra.
2. A "Cím" mezőbe írd be: `Film rossz dátummal`.
3. A "Megnézve" mezőbe írd be: `2023-13-01`.
4. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy a dátum formátuma érvénytelen (YYYY-MM-DD formátumot vár).
* A felhasználó az új film hozzáadása oldalon marad.

#### **Teszt ID:** TC_MOVIE_ADD_007  

**Cím:** Új film hozzáadása - "Mégse" gomb működése  
**Lépések:**

1. Navigálj az új film hozzáadása oldalra.
2. Tölts ki néhány mezőt (pl. Cím: `Teszt film mégse`).
3. Kattints a "Mégse" gombra.

**Elvárt eredmények:**

* Az alkalmazás visszairányít a filmlista oldalra.
* A `Teszt Film Mégse` című film nem kerül hozzáadásra a listához.

### 2.2. Filmek listázása

#### **Teszt ID:** TC_MOVIE_LIST_001  

**Cím:** Filmek listázása (ha vannak filmek)  
**Előfeltételek:** Legalább egy film hozzá lett adva a felhasználóhoz (pl. TC_MOVIE_ADD_001).  
**Lépések:**

1. Navigálj a filmlista oldalra (vagy frissítsd az oldalt).
   **Elvárt eredmények:**

* A felhasználóhoz tartozó filmek kártya formátumban megjelennek.
* Minden kártya tartalmazza a film címét, évét és egyéb megadott adatait.
* Minden kártyán látható a "Szerkesztés" és "Törlés" gomb.

#### **Teszt ID:** TC_MOVIE_LIST_002  

**Cím:** Filmek listázása (ha nincsenek filmek)  
**Előfeltételek:** A felhasználó be van jelentkezve, de még nem adott hozzá filmet (vagy minden filmjét törölte).  
**Lépések:**

1. Navigálj a filmlista oldalra.

**Elvárt eredmények:**

* Egy üzenet jelenik meg, amely tájékoztatja a felhasználót, hogy nincsenek filmjei (pl. "Nincsenek filmek a listádban. Adj hozzá egyet!").
* Az üzenet tartalmazhat egy linket az új film hozzáadása oldalra.

### 2.3. Film szerkesztése

#### **Teszt ID:** TC_MOVIE_EDIT_001  

**Cím:** Sikeres filmadat módosítás  
**Előfeltételek:** A `Galaxis útikalauz stopposoknak` film hozzá van adva (TC_MOVIE_ADD_001).  
**Tesztadatok (módosításhoz):**

* Cím: `Galaxis útikalauz stopposoknak (Rendezői Változat)`  
* Értékelés: `4`  
* Vélemény: `Még mindig nagyszerű, de az eredeti könyv jobb.`

**Lépések:**

1. A filmlista oldalon keresd meg a `Galaxis útikalauz stopposoknak` című filmet.
2. Kattints a film kártyáján található "Szerkesztés" gombra.
3. Az alkalmazás átirányít a film szerkesztése oldalra, az űrlap előre ki van töltve a film adataival.
4. Módosítsd a "Cím", "Értékelés" és "Vélemény" mezőket a fenti tesztadatokkal.
5. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Az alkalmazás visszairányít a filmlista oldalra.
* A film adatai frissültek a listában a módosított értékekkel.

#### **Teszt ID:** TC_MOVIE_EDIT_002  

**Cím:** Film szerkesztése - Érvénytelen értékelés  
**Előfeltételek:** Egy film hozzá van adva.  
**Tesztadatok (módosításhoz):**

* Értékelés: `0`

**Lépések:**

1. Egy meglévő film kártyáján kattints a "Szerkesztés" gombra.
2. Módosítsd az "Értékelés" mezőt `0`-ra.
3. Kattints a "Mentés" gombra.

**Elvárt eredmények:**

* Hibaüzenet jelenik meg, amely jelzi, hogy az értékelésnek 1 és 5 között kell lennie.
* A felhasználó a film szerkesztése oldalon marad, a módosítások nem mentődnek el.

#### **Teszt ID:** TC_MOVIE_EDIT_003  

**Cím:** Film szerkesztése - "Mégse" gomb működése  
**Előfeltételek:** Egy film hozzá van adva.  
**Lépések:**

1. Egy meglévő film kártyáján kattints a "Szerkesztés" gombra.
2. Módosíts néhány adatot (pl. Cím: `Átmeneti cím`).
3. Kattints a "Mégse" gombra.

**Elvárt eredmények:**

* Az alkalmazás visszairányít a filmlista oldalra.
* A film adatai nem módosultak a listában.

### 2.4. Film törlése

#### **Teszt ID:** TC_MOVIE_DELETE_001  

**Cím:** Sikeres film törlése (megerősítéssel)  
**Előfeltételek:** Az `Egyedi filmcím` film hozzá van adva (TC_MOVIE_ADD_002).  
**Lépések:**

1. A filmlista oldalon keresd meg az `Egyedi Filmcím` című filmet.
2. Kattints a film kártyáján található "Törlés" gombra.
3. Ha megjelenik egy megerősítő kérdés (pl. "Biztosan törölni szeretnéd ezt a filmet?"), kattints az "Igen" vagy "Törlés" gombra.

**Elvárt eredmények:**

* A film eltűnik a filmlistából.
* Sikeres törlésről értesítés jelenhet meg (opcionális).

#### **Teszt ID:** TC_MOVIE_DELETE_002  

**Cím:** Film törlésének megszakítása (megerősítésnél "Nem")  
**Előfeltételek:** A `Galaxis útikalauz stopposoknak (Rendezői változat)` film létezik a listában.  
**Lépések:**

1. A filmlista oldalon keresd meg a filmet.
2. Kattints a film kártyáján található "Törlés" gombra.
3. Ha megjelenik egy megerősítő kérdés, kattints a "Nem" vagy "Mégse" gombra.

**Elvárt eredmények:**

* A film továbbra is látható a filmlistában.

## 3. Filmek szűrése és keresése

*(Előfeltétel az alábbi tesztekhez: A `tesztfelhasznalo1` felhasználó be van jelentkezve. Az alábbi filmek hozzáadása szükséges a teszteléshez, ha még nem léteznek):*

* Film 1 (Megnézett): Cím: `Megnézett film alfa`, Év: `2022`, Megnézve: `2022-01-01`
* Film 2 (Nem megnézett): Cím: `Nem megnézett film béta`, Év: `2023`, Megnézve: (üres)
* Film 3 (Megnézett, kereshető): Cím: `Különleges kulcsszó film megnézve`, Év: `2021`, Megnézve: `2021-05-10`
* Film 4 (Nem megnézett, kereshető): Cím: `Másik különleges film nem megnézve`, Év: `2024`, Megnézve: (üres)

### 3.1. Szűrés státusz alapján

#### **Teszt ID:** TC_MOVIE_FILTER_001  

**Cím:** Szűrés "Megnézett" státuszra  
**Lépések:**

1. A filmlista oldalon, a "Szűrés státusz alapján" legördülő listából válaszd ki a "Megnézett" opciót.
2. Kattints a "Szűrés/Keresés" gombra.

**Elvárt eredmények:**

* Csak azok a filmek jelennek meg a listában, amelyeknek van "Megnézve" dátuma (Film 1, Film 3).
* A "Nem megnézett film béta" és a "Másik különleges film nem megnézve" nem látható.

#### **Teszt ID:** TC_MOVIE_FILTER_002  

**Cím:** Szűrés "Még nem megnézett" státuszra  
**Lépések:**

1. A "Szűrés státusz alapján" legördülő listából válaszd ki a "Még nem megnézett" opciót.
2. Kattints a "Szűrés/Keresés" gombra.

**Elvárt eredmények:**

* Csak azok a filmek jelennek meg, amelyeknek nincs "Megnézve" dátuma (Film 2, Film 4).
* A "Megnézett film alfa" és a "Különleges kulcsszó film megnézve" nem látható.

#### **Teszt ID:** TC_MOVIE_FILTER_003  

**Cím:** Szűrés "Összes" státuszra  
**Lépések:**

1. A "Szűrés státusz alapján" legördülő listából válaszd ki az "Összes" opciót.
2. Kattints a "Szűrés/Keresés" gombra.

**Elvárt eredmények:**

* Az összes hozzáadott film megjelenik a listában (Film 1, Film 2, Film 3, Film 4).

### 3.2. Keresés cím alapján

#### **Teszt ID:** TC_MOVIE_SEARCH_001  

**Cím:** Keresés címben létező kulcsszóra  
**Tesztadatok:**  

* Keresőszó: `Különleges`

**Lépések:**

1. Állítsd a státusz szűrőt "Összes"-re.
2. A "Keresés címben" mezőbe írd be: `Különleges`.
3. Kattints a "Szűrés/Keresés" gombra.

**Elvárt eredmények:**

* Csak azok a filmek jelennek meg, amelyek címében szerepel a "Különleges" szó (Film 3, Film 4).

#### **Teszt ID:** TC_MOVIE_SEARCH_002  

**Cím:** Keresés címben nem létező kulcsszóra  
**Tesztadatok:**

* Keresőszó: `NemlétezőXYZ`

**Lépések:**

1. Állítsd a státusz szűrőt "Összes"-re.
2. A "Keresés címben" mezőbe írd be: `NemlétezőXYZ`.
3. Kattints a "Szűrés/Keresés" gombra.
**Elvárt eredmények:**

* A lista üres.

### 3.3. Kombinált szűrés és keresés

#### **Teszt ID:** TC_MOVIE_COMBO_001

**Cím:** Kombinált szűrés: "Megnézett" ÉS a címben "Különleges"
**Tesztadatok:**

* Keresőszó: `Különleges`

**Lépések:**

1. A "Szűrés státusz alapján" legördülő listából válaszd ki a "Megnézett" opciót.
2. A "Keresés címben" mezőbe írd be: `Különleges`.
3. Kattints a "Szűrés/Keresés" gombra.

**Elvárt eredmények:**

* Csak a "Különleges kulcsszó film megnézve" (Film 3) jelenik meg.

#### **Teszt ID:** TC_MOVIE_COMBO_002  

**Cím:** Kombinált szűrés: "Még nem megnézett" ÉS a címben "Különleges"  
**Tesztadatok:**

* Keresőszó: `Különleges`

**Lépések:**

1. A "Szűrés státusz alapján" legördülő listából válaszd ki a "Még nem megnézett" opciót.
2. A "Keresés címben" mezőbe írd be: `Különleges`.
3. Kattints a "Szűrés/Keresés" gombra.
**Elvárt eredmények:**

* Csak a "Másik különleges film nem megnézve" (Film 4) jelenik meg.

## 4. Felhasználói dokumentáció elérhetősége

#### **Teszt ID:** TC_HELP_001  

**Cím:** Felhasználói útmutató linkjének ellenőrzése a bejelentkezési oldalon  
**Előfeltételek:** A felhasználó kijelentkezett állapotban van, a bejelentkezési oldalon (`index.html`).  

**Lépések:**

1. Keresd meg a "Nézd meg az útmutatót!" linket a bejelentkezési oldalon.
2. Kattints a linkre.

**Elvárt eredmények:**

* A felhasználói dokumentáció (`help.html`) megnyílik egy új böngészőfülön vagy ablakban.
* A dokumentáció tartalma helyesen jelenik meg.
