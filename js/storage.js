// =========================================================
// storage.js - everything the site keeps in localStorage.
// There is no backend, so users, the login session, favorites,
// search state and messages are all saved in the browser.
// =========================================================

const STORAGE_KEYS = {
    theme: "sr_theme",
    users: "sr_users",
    session: "sr_currentUser",
    catalogState: "sr_catalogState",
    messages: "sr_messages",
    rating: "sr_rating"
};

// Safe JSON read: returns the fallback if the key is empty or broken
function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Could not save to localStorage:", error);
    }
}

// ---------- Users and session ----------

function getUsers() {
    return readJSON(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
    writeJSON(STORAGE_KEYS.users, users);
}

function findUserByEmail(email) {
    const wanted = email.trim().toLowerCase();
    return getUsers().find(function (user) {
        return user.email === wanted;
    }) || null;
}

// Returns the logged-in user object, or null for a guest
function getCurrentUser() {
    const email = localStorage.getItem(STORAGE_KEYS.session);
    return email ? findUserByEmail(email) : null;
}

function setCurrentUser(email) {
    localStorage.setItem(STORAGE_KEYS.session, email.trim().toLowerCase());
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.session);
}

// ---------- Favorite recipes ----------
// Every user has an own list; guests share the "guest" list.

function favoritesKey() {
    const user = getCurrentUser();
    return "sr_favorites_" + (user ? user.email : "guest");
}

function getFavorites() {
    return readJSON(favoritesKey(), []);
}

function isFavorite(mealId) {
    return getFavorites().some(function (meal) {
        return meal.id === mealId;
    });
}

// Adds the meal if it is not saved yet, otherwise removes it.
// Returns true when the meal is now in favorites.
function toggleFavorite(meal) {
    let favorites = getFavorites();

    if (isFavorite(meal.id)) {
        favorites = favorites.filter(function (item) {
            return item.id !== meal.id;
        });
        writeJSON(favoritesKey(), favorites);
        return false;
    }

    favorites.push({ id: meal.id, name: meal.name, thumb: meal.thumb, category: meal.category || "" });
    writeJSON(favoritesKey(), favorites);
    return true;
}

function removeFavorite(mealId) {
    const favorites = getFavorites().filter(function (item) {
        return item.id !== mealId;
    });
    writeJSON(favoritesKey(), favorites);
}
