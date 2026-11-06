# OG Events Spot

Strona fotobudki OG Events z podstronami miast i panelem do edycji treści. Każde miasto ma swoją stronę pod lokalne SEO, a treści i zdjęcia zmienia się w panelu, bez kodu.

Strona: https://fotobudka-ogeventspot.pl

## Co jest w środku

- strona główna i podstrony miast (`/gdansk`, `/sopot` i inne) renderowane na serwerze z danych w Supabase
- puste pola miasta dziedziczą treść ze strony głównej
- panel `/admin`: logowanie, edycja stron, dodawanie miast, upload zdjęć do galerii
- wygląd wspólny z fotobudka-chojnice.pl (pliki w `public/assets`)

## Technologie

Astro 5 (SSR, adapter Node), Supabase, CSS bez frameworka. Fonty i skrypty hostowane lokalnie.

## Uruchomienie

```bash
npm install
cp .env.example .env   # adres i klucz anon z Supabase
npm run dev
```

## Wdrożenie

Build na serwerze (`npm run build`), potem obraz Dockera z `dist`. Katalog `public/media` jest podpięty do kontenera jako wolumen, żeby zdjęcia wgrane w panelu nie znikały przy aktualizacji.
