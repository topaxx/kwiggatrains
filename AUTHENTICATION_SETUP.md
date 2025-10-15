# Authenticatie Setup voor KwiggaTrains

## Overzicht
De yoga routine webapp heeft nu authenticatie toegevoegd met **X (Twitter) OAuth via Auth0** als externe identity provider. Gebruikers kunnen inloggen met hun X (Twitter) account en hun avatar wordt weergegeven in de header.

## Functionaliteiten

### 1. Login/Avatar Button
- **Locatie**: Rechtsboven in de header
- **Niet ingelogd**: Toont "Login" met user icoon
- **Ingelogd**: Toont gebruikersavatar en naam

### 2. User Modal
- **Login scherm**: X (Twitter) OAuth login knop via Auth0 Universal Login
- **User scherm**: Gebruikersinformatie met logout optie
- **Responsive**: Werkt op desktop en mobiel

### 3. Authentication State Management
- Gebruikersdata wordt opgeslagen via Auth0 SDK
- Automatische login bij herlaad van pagina
- Veilige logout functionaliteit via Auth0

## Setup Instructies

### Voor Productie Gebruik:

#### 1. **Auth0 Account Setup**
   - Ga naar [Auth0 Dashboard](https://manage.auth0.com/)
   - Maak een gratis account aan als je die nog niet hebt
   - Noteer je Auth0 domain (bijv. `your-tenant.auth0.com`)

#### 2. **Auth0 Application Configuratie**
   - Ga naar Applications → Applications in het Auth0 Dashboard
   - Klik op "Create Application"
   - Kies "Single Page Web Applications"
   - Noteer de **Client ID**
   - Ga naar Settings en configureer:
     - **Allowed Callback URLs**: `http://localhost:3000, https://yourdomain.com`
     - **Allowed Logout URLs**: `http://localhost:3000, https://yourdomain.com`
     - **Allowed Web Origins**: `http://localhost:3000, https://yourdomain.com`

#### 3. **X (Twitter) Developer Account Setup**
   - Ga naar [X Developer Portal](https://developer.twitter.com/)
   - Meld je aan voor een developer account
   - Maak een nieuw project aan: "Projects & Apps" → "Create Project"
   - Geef je project een naam (bijv. "KwiggaTrains Authentication")
   - Maak een standalone app aan of voeg een bestaande app toe aan je project

#### 4. **X (Twitter) App Configuratie**
   - In je X app settings, schakel "User authentication settings" in
   - Selecteer "OAuth 2.0" als authentication method
   - Type of App: selecteer "Web App, Automated App or Bot"
   - App Info:
     - **Website URL**: `https://YOUR_AUTH0_DOMAIN`
     - **Callback URI**: `https://YOUR_AUTH0_DOMAIN/login/callback`
     - **Terms of Service URL**: Je eigen URL
     - **Privacy Policy URL**: Je eigen URL
   - Noteer de **OAuth 2.0 Client ID** en **Client Secret**

#### 5. **X (Twitter) Social Connection in Auth0**
   - Ga naar Authentication → Social in het Auth0 Dashboard
   - Klik op "Create Connection"
   - Selecteer "X (Twitter)"
   - Vul in:
     - **Consumer Key**: Gebruik je X OAuth 2.0 Client ID
     - **Consumer Secret**: Gebruik je X OAuth 2.0 Client Secret
   - Onder Permissions, selecteer minimaal:
     - `Read user profile`
     - Optioneel: `Read user's email address`
   - Sla de connection op
   - Ga naar de Applications tab van deze connection
   - Schakel je applicatie in voor deze connection

#### 6. **Code Configuratie**
   - Open `script.js` in je project
   - Vervang op regel ~1712:
     ```javascript
     domain: 'YOUR_AUTH0_DOMAIN',  // Bijv. 'your-tenant.auth0.com'
     clientId: 'YOUR_AUTH0_CLIENT_ID',  // Je Auth0 Client ID
     ```
   - Gebruik je echte Auth0 credentials

### Voor Demo/Test Doeleinden:

De app heeft een **demo mode** ingebouwd die werkt zonder echte Auth0 setup:
- Klik op "Login met X (Twitter)" 
- Er wordt automatisch een demo gebruiker aangemaakt
- Perfect voor testen en demonstraties
- Demo mode wordt automatisch geactiveerd als Auth0 niet correct is geconfigureerd

## Code Structuur

### HTML Wijzigingen:
- Header aangepast met auth-section
- User modal toegevoegd met login/user content
- Auth0 SPA SDK script geladen via CDN

### CSS Toevoegingen:
- `.auth-section` - Positionering van login button
- `.auth-button` - Styling van login/avatar button
- `.twitter-login-button` - X (Twitter) login button styling (zwart theme)
- `.user-info` - User informatie display
- Responsive design voor mobiele apparaten

### JavaScript Functionaliteiten:
- `initAuthentication()` - Initialiseert Auth0 client en controleert auth state
- `handleTwitterLogin()` - Start Auth0 Universal Login met X connection
- `handleLogout()` - Logout via Auth0
- `updateAuthButton()` - Update header button met user info
- `simulateTwitterLogin()` - Demo login functionaliteit (fallback)

## Gebruikerservaring

1. **Eerste bezoek**: Gebruiker ziet "Login" button
2. **Klik op login**: Modal opent met X (Twitter) login optie
3. **OAuth flow**: 
   - Redirect naar Auth0 Universal Login
   - Auth0 redirect naar X (Twitter)
   - Gebruiker authoriseert de app
   - Redirect terug naar je app
4. **Na login**: Button toont avatar en naam (of nickname van X)
5. **Klik op avatar**: Modal toont gebruikersinfo en logout optie
6. **Logout**: Gebruiker wordt uitgelogd via Auth0

## Veiligheid

- **Auth0** handelt alle security best practices af
- Tokens worden veilig opgeslagen in localStorage via Auth0 SDK
- **OAuth 2.0** met PKCE flow voor Single Page Applications
- Geen gevoelige credentials in de frontend code
- Automatische token refresh via Auth0 SDK
- Logout functionaliteit verwijdert alle tokens

## API Endpoints

Auth0 gebruikt de volgende endpoints (automatisch door SDK):
- Authorization: `https://YOUR_DOMAIN/authorize`
- Token: `https://YOUR_DOMAIN/oauth/token`
- User Info: `https://YOUR_DOMAIN/userinfo`
- Logout: `https://YOUR_DOMAIN/v2/logout`

## Browser Ondersteuning

- Moderne browsers met ES6+ ondersteuning
- Auth0 SDK ondersteunt:
  - Chrome/Edge (laatste 2 versies)
  - Firefox (laatste 2 versies)
  - Safari (laatste 2 versies)
- Fallback demo mode voor testen zonder OAuth setup

## Troubleshooting

### "Auth0 client not initialized" error
- Controleer of `YOUR_AUTH0_DOMAIN` en `YOUR_AUTH0_CLIENT_ID` correct zijn ingevuld
- Controleer of Auth0 SDK correct is geladen (check browser console)
- Demo mode wordt automatisch geactiveerd als fallback

### X (Twitter) login werkt niet
- Controleer of X social connection is enabled in Auth0
- Controleer of callback URLs correct zijn geconfigureerd
- Controleer of je X app OAuth 2.0 credentials correct zijn
- Controleer of je app is toegevoegd aan een X project

### Redirect loop
- Controleer of Allowed Callback URLs correct zijn ingesteld
- Clear browser cache en cookies
- Controleer of redirect_uri in code overeenkomt met Auth0 config

## Referenties

- [Auth0 X/Twitter Login Lab](https://developer.auth0.com/resources/labs/authentication/authenticate-using-x-twitter)
- [Auth0 SPA SDK Documentation](https://auth0.com/docs/libraries/auth0-spa-js)
- [X (Twitter) OAuth 2.0 Documentation](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [X Developer Portal](https://developer.twitter.com/)

## Volgende Stappen

Voor volledige productie implementatie:
1. ✅ Vervang placeholder credentials met echte Auth0 credentials
2. ✅ Configureer X (Twitter) social connection in Auth0
3. 🔄 Implementeer backend voor gebruikersdata synchronisatie (optioneel)
4. 🔄 Voeg gebruikersspecifieke routine opslag toe (cloud sync)
5. 🔄 Implementeer data backup/restore functionaliteit
6. 🔄 Voeg andere social providers toe (Google, Facebook, etc.) via Auth0

## Kosten

- **Auth0**: Gratis tier tot 7,500 actieve gebruikers
- **X Developer**: Gratis voor basic authentication
- Ideaal voor hobby projecten en kleine apps
