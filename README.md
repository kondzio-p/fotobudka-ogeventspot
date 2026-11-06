# OG Events Spot

Strona fotobudki OG Events z prostym panelem administracyjnym. Front w React, backend w Express, logowanie przez Supabase.

Strona: https://fotobudka-ogeventspot.pl

## Co jest w środku

- strona główna z sekcjami ofert, lokalizacji, statystyk, galerii i FAQ
- panel administracyjny z logowaniem (Supabase Auth) do zarządzania zdjęciami i filmami w galerii
- API w Express: upload i usuwanie plików (multer), lista plików, generowanie sitemap.xml
- wdrożenie na VPS: Apache jako reverse proxy, PM2, skrypt `deploy.sh`

## Technologie

React 18, TypeScript, Vite, GSAP (ScrollTrigger, SplitText), Swiper, Express 5, Supabase.

Wygląd jest wspólny z fotobudka-chojnice: `src/styles/site.css` to ten sam plik co `style/main.css` tam.

## Podgląd bez Supabase

Przy `npm run dev` bez zmiennych `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` strona startuje w trybie demo: treści z `src/data/demoPages.ts` (strona główna, Gdańsk, Słupsk), panel pod `/admin/panel` bez logowania, zmiany tylko do odświeżenia strony.

## Uruchomienie

```bash
npm install
# plik .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_LOGIN, ADMIN_PASSWORD
npm run dev      # front
npm run server   # API
```
