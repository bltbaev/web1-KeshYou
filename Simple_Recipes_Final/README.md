# Simple Recipes — Complete Website

This is a complete static multi-page website. Open `index.html` in a browser or deploy the directory with GitHub Pages.

## Pages
- index.html — home with live search and category filters
- about.html — team and validated feedback form
- breakfast.html, lunch.html, dinner.html, dessert.html — searchable recipe categories
- login.html, signup.html, profile.html — localStorage-based demo accounts and saved recipes
- api.html — live recipe search using TheMealDB public API (requires internet)

## Design and navigation
- Click the circular SR brand to open a slide-out Categories drawer. Close with X, overlay click or Escape.
- The top header contains Home, About Us, Log In, Recipe API and Profile, not meal categories.
- Responsive beige/orange design, consistent About Us layout, persistent dark mode.
- All included images are local SVG illustrations so the website also works without network. Replace SVGs with photos as needed.

## Security note
Signup/login is a classroom demonstration using browser localStorage, NOT real authentication. Passwords are stored in browser storage, so do not use a personal or reused password. This demo must not be used to authenticate users in production.

## Deploy
Upload all files and folders from this directory to the root of your GitHub Pages repository. In Settings > Pages, select Deploy from a branch / main / root.
