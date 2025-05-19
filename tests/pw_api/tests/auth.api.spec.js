import { test, expect } from '@playwright/test';

const host = 'http://localhost:3000'; // Győződj meg róla, hogy ez a helyes cím

test.describe('Authentication API Tests (api_teszt1.http alapján)', () => {
  // A teszteket ebben a csoportban sorban futtatjuk, hogy az állapotok (pl. regisztrált felhasználó)
  // a várt módon öröklődjenek a tesztek között, ahogy az .http fájl is feltételezi.
  test.describe.configure({ mode: 'serial' });

  const mainTestUser = { // Megfelel az .http fájl "testuser_reg" felhasználójának
    username: "testuser_reg",
    password: "password123"
  };
  const anotherPassword = "anotherpassword";

  // --- Regisztrációs tesztek ---


  test('1. Új felhasználó regisztrációja (testuser_reg)', async ({ request }) => {
    const response = await request.post(`${host}/api/users/register`, {
      data: {
        username: mainTestUser.username,
        password: mainTestUser.password
      }
    });
    // Mivel nincs törlési végpont, elfogadjuk a 201 (létrehozva) vagy a 409 (már létezik) státuszt.
    // Így a tesztcsomag többször is lefuthat anélkül, hogy ez a lépés hibát okozna.
    // A lényeg, hogy a 'mainTestUser' létezzen a további tesztekhez.
    expect([201, 409]).toContain(response.status());
  });

  test('2. Regisztráció - Hiányzó felhasználónév', async ({ request }) => {
    const response = await request.post(`${host}/api/users/register`, {
      data: {
        password: "password123"
      }
    });
    expect(response.status()).toBe(400);
  });

  test('3. Regisztráció - Hiányzó jelszó', async ({ request }) => {
    const response = await request.post(`${host}/api/users/register`, {
      data: {
        username: "testuser_nopass" // Az .http fájl alapján
      }
    });
    expect(response.status()).toBe(400);
  });

  test('4. Regisztráció - Túl rövid jelszó', async ({ request }) => {
    const response = await request.post(`${host}/api/users/register`, {
      data: {
        username: "testuser_shortpass", // Az .http fájl alapján
        password: "123"
      }
    });
    expect(response.status()).toBe(400);
  });

  test('5. Regisztráció - Már létező felhasználónév (testuser_reg)', async ({ request }) => {
    // Ez a teszt feltételezi, hogy az '1. Új felhasználó regisztrációja' teszt már lefutott
    // és létrehozta a mainTestUser.username felhasználót.
    const response = await request.post(`${host}/api/users/register`, {
      data: {
        username: mainTestUser.username,
        password: anotherPassword
      }
    });
    expect(response.status()).toBe(409);
  });

  // --- Bejelentkezési tesztek ---

  test('6. Sikeres bejelentkezés (testuser_reg)', async ({ request }) => {
    // Ez a teszt feltételezi, hogy mainTestUser.username létezik és a jelszava mainTestUser.password.
    const response = await request.post(`${host}/api/users/login`, {
      data: {
        username: mainTestUser.username,
        password: mainTestUser.password
      }
    });
    expect(response.status()).toBe(200);
    // A HTTP-Only cookie-t a Playwright `request` kontextusa automatikusan kezeli.
  });

  test('7. Bejelentkezés - Hibás jelszó (testuser_reg)', async ({ request }) => {
    const response = await request.post(`${host}/api/users/login`, {
      data: {
        username: mainTestUser.username,
        password: "wrongpassword"
      }
    });
    expect(response.status()).toBe(401);
  });

  test('8. Bejelentkezés - Nem létező felhasználó', async ({ request }) => {
    const response = await request.post(`${host}/api/users/login`, {
      data: {
        username: "nonexistentuser", // Az .http fájl alapján
        password: "password123"
      }
    });
    expect(response.status()).toBe(401);
  });

  test('9. Bejelentkezés - Hiányzó felhasználónév', async ({ request }) => {
    const response = await request.post(`${host}/api/users/login`, {
      data: {
        password: "password123"
      }
    });
    expect(response.status()).toBe(400);
  });

  test('10. Bejelentkezés - Hiányzó jelszó (testuser_reg)', async ({ request }) => {
    const response = await request.post(`${host}/api/users/login`, {
      data: {
        username: mainTestUser.username
      }
    });
    expect(response.status()).toBe(400);
  });

  // --- Kijelentkezési tesztek ---

  test('11. Sikeres kijelentkezés (testuser_reg)', async ({ request }) => {
    // Az .http fájlban ez két lépés (egy @name-el ellátott bejelentkezés, majd a kijelentkezés).
    // Playwright-ben egy teszten belül kell kezelnünk, hogy a session (cookie) aktív legyen.
    // Fontos: Minden `test(async ({ request }) => ...)` egy új, tiszta `request` kontextust kap.
    // Tehát a 6. tesztben történt bejelentkezés session-je itt nem él. Újra be kell jelentkezni.

    // 1. lépés: Bejelentkezés ebben a teszt kontextusban, hogy aktív session jöjjön létre.
    const loginResponse = await request.post(`${host}/api/users/login`, {
      data: {
        username: mainTestUser.username,
        password: mainTestUser.password
      }
    });
    // Biztosítjuk, hogy a bejelentkezés sikeres volt, mielőtt kijelentkeznénk.
    // A soros futtatás biztosítja, hogy a mainTestUser már regisztrálva lett az 1. tesztben.
    expect(loginResponse.status(), `A kijelentkezés előtti bejelentkezés ('${mainTestUser.username}') sikertelen volt.`).toBe(200);

    // 2. lépés: Kijelentkezés.
    // A `request` kontextus most már tartalmazza a fenti bejelentkezésből származó cookie-t.
    const logoutResponse = await request.post(`${host}/api/users/logout`);
    expect(logoutResponse.status()).toBe(200);
  });
});