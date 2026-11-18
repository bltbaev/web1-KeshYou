# Simple Recipes

A multi-page responsive recipe website for people who wants the simple cooks.


Team: Zangar Baltabay, Iliyas Kalmen, Bekarys Kambarov

## Pages
| Page | What it does |
|---|---|
| index.html | Home: greeting by time of day, meal categories, live stats, gallery |
| recipes.html | Recipe catalog from TheMealDB API: search, category filter, random recipe, favorites |
| breakfast.html, lunch.html, dinner.html, dessert.html | Signature recipes with in-page search, copy ingredients, FAQ |
| about.html | Project goal, target audience, team, star rating |
| contact.html | "Ask the chef" form with validation |
| signup.html, login.html, profile.html | Simulated authentication with localStorage |

## Features
- Responsive layout: CSS Grid + Bootstrap 5 (desktop, tablet, mobile)
- Light / dark mode, saved in localStorage and kept on every page
- Sign up / log in / profile simulated with localStorage
- JavaScript form validation (no HTML validation attributes, all forms use `novalidate`)
- Live search and category filter, last search and favorites saved in localStorage
- TheMealDB API with loading state and error handling
- Hover effects, scroll reveal, animated counters; respects `prefers-reduced-motion`

## Structure
```
/
├── index.html, about.html, contact.html, recipes.html, ...
├── css/style.css
├── js/
│   ├── theme-init.js   applies saved theme before the page is drawn
│   ├── storage.js      localStorage helpers (users, session, favorites)
│   ├── script.js       shared code: theme, header, animations, recipe pages
│   ├── validation.js   form validation rules and helpers
│   ├── auth.js         sign up, log in, profile
│   ├── contact.js      contact form
│   └── api.js          TheMealDB recipe catalog
└── images/
```

## Run locally
Open `index.html` in a browser, or use live link: https://bltbaev.github.io/web1-KeshYou/
