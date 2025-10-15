# 🚀 Quick Start Guide - KwiggaTrains met X/Twitter Login

## Voor Nieuwe Gebruikers

### Optie 1: Demo Mode (Geen Setup Nodig) ⚡

De app werkt direct uit de doos met demo mode:

1. Open `index.html` in je browser
2. Klik op de "Login" button rechtsboven
3. Klik op "Login met X (Twitter)"
4. Je bent nu ingelogd als demo gebruiker!

**Perfect voor:** Testen, ontwikkeling, demonstraties

---

### Optie 2: Echte X/Twitter Login via Auth0 🔐

Volg deze stappen voor echte authenticatie:

#### Stap 1: Auth0 Account (5 minuten)

1. Ga naar [auth0.com](https://auth0.com) en maak een gratis account
2. Na aanmelden, noteer je **Auth0 Domain** (bijv. `jouw-naam.eu.auth0.com`)
3. Ga naar "Applications" → "Create Application"
4. Kies "Single Page Web Application"
5. Noteer je **Client ID**

#### Stap 2: Auth0 URLs Configureren (2 minuten)

In je Auth0 Application Settings, vul in:

- **Allowed Callback URLs**: 
  ```
  http://localhost:8000, http://127.0.0.1:8000
  ```
- **Allowed Logout URLs**: 
  ```
  http://localhost:8000, http://127.0.0.1:8000
  ```
- **Allowed Web Origins**: 
  ```
  http://localhost:8000, http://127.0.0.1:8000
  ```

Klik "Save Changes"

#### Stap 3: X/Twitter Developer Account (10 minuten)

1. Ga naar [developer.twitter.com](https://developer.twitter.com)
2. Aanmelden voor developer access
3. "Projects & Apps" → "Create Project"
4. Geef het een naam: "KwiggaTrains Auth"
5. Maak een nieuwe "Standalone App" aan

#### Stap 4: X App Configureren (5 minuten)

In je X app settings:

1. Klik "Set up" bij "User authentication settings"
2. Selecteer **OAuth 2.0**
3. Type of App: **Web App, Automated App or Bot**
4. App Info invullen:
   - Website URL: `https://JOUW-AUTH0-DOMAIN` (uit stap 1)
   - Callback URL: `https://JOUW-AUTH0-DOMAIN/login/callback`
5. Noteer **Client ID** en **Client Secret**

#### Stap 5: X Connection in Auth0 (3 minuten)

1. In Auth0 Dashboard → "Authentication" → "Social"
2. Klik "Create Connection"
3. Selecteer "Twitter"
4. Vul in:
   - **Consumer Key**: X Client ID (uit stap 4)
   - **Consumer Secret**: X Client Secret (uit stap 4)
5. Save
6. Tab "Applications" → Schakel je app in

#### Stap 6: Code Configureren (2 minuten)

Open `script.js` en zoek regel ~1712:

```javascript
auth0Client = await auth0.createAuth0Client({
    domain: 'JOUW-AUTH0-DOMAIN',      // ← Pas dit aan!
    clientId: 'JOUW-AUTH0-CLIENT-ID',  // ← Pas dit aan!
    // ...
});
```

Vervang met je echte credentials uit stap 1.

#### Stap 7: Testen! (1 minuut)

1. Start een lokale webserver:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   
   # PHP
   php -S localhost:8000
   ```

2. Open `http://localhost:8000`
3. Klik "Login" → "Login met X (Twitter)"
4. Je wordt doorgestuurd naar X
5. Authoriseer de app
6. Je bent ingelogd! 🎉

---

## Veelgestelde Vragen

### "Waarom heb ik een webserver nodig?"

Auth0 OAuth werkt niet met `file://` protocol. Je hebt een `http://` of `https://` URL nodig.

### "Kan ik ook andere social logins toevoegen?"

Ja! Auth0 ondersteunt Google, Facebook, GitHub, en veel meer. Voeg ze toe via Auth0 Dashboard → Authentication → Social.

### "Is dit gratis?"

Ja! Auth0 gratis tier: tot 7,500 actieve gebruikers per maand. Perfect voor hobby projecten.

### "Werkt dit voor productie?"

Ja! Vervang alleen `localhost` URLs met je productie domain in:
- Auth0 Application Settings (Callback/Logout/Web Origins)
- X App Settings (Website URL en Callback URL)

### "Ik krijg een error..."

Controleer:
1. ✅ Auth0 credentials correct ingevuld in `script.js`
2. ✅ Callback URLs exact hetzelfde in Auth0 én X
3. ✅ X app toegevoegd aan een X Project
4. ✅ X connection enabled voor je Auth0 app
5. ✅ Browser console voor details

Meer info: zie `AUTHENTICATION_SETUP.md`

---

## Volgende Stappen

✨ **Je app is nu klaar!**

Bekijk de volledige documentatie in `AUTHENTICATION_SETUP.md` voor:
- Geavanceerde configuratie
- Troubleshooting
- Security best practices
- Deployment tips

**Veel plezier met je yoga routine app! 🏋️‍♂️🧘‍♀️**


