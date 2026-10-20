# Dialog & Data – AI-coach

Detta är en färdig kodintegration, inte en redan driftsatt AI-tjänst.

## Publicera på Netlify
1. Skapa en API-nyckel på https://platform.openai.com/api-keys (API-fakturering kan behöva aktiveras).
2. Publicera denna mapp som ett Netlify-projekt, t.ex. via Git-repo.
3. I Netlify > Environment variables: lägg till `OPENAI_API_KEY` med nyckelvärdet. Lägg aldrig nyckeln i HTML eller Git.
4. Gör en ny deploy efter att variabeln har sparats.
5. Öppna Netlify-webbplatsens index.html och kör testet. Klicka på "Skapa personlig AI-analys".
6. Om du vill ha kvar index.html på GitHub Pages: ändra `AI_BACKEND_URL` i index.html till din Netlify-webbplats (https://...netlify.app) och publicera om filen på GitHub Pages.
7. För GitHub Pages: sätt `ALLOWED_ORIGIN` i Netlify till den exakta ursprungsadressen för din webbplats (t.ex. https://anvandare.github.io) och deploya igen.

## Integritet och produktion
- Testresultaten skickas till OpenAI först efter användarens aktiva val.
- `store:false` är satt i API-anropet.
- API-nyckeln hålls server-side.
- För offentlig produktion: komplettera med rate limiting, autentisering eller CAPTCHA, kostnadstak och integritetstext enligt GDPR.
- Webbläsaren behöver internetanslutning och backend måste vara driftsatt.
- Den befintliga regelbaserade analysen fungerar utan API.
