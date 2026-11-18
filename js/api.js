// =========================================================
// api.js - Recipe catalog powered by TheMealDB public API.
// https://www.themealdb.com/api.php  (free test key "1", no sign up)
// Features: search by name, filter by category, random recipe,
// recipe details in a modal, favorites, loading and error states.
// The last search and category are saved in localStorage.
// =========================================================

const API_BASE = "https://www.themealdb.com/api/json/v1/1/";

const catalogForm = document.getElementById("catalogSearch");
const queryInput = document.getElementById("mealQuery");
const clearButton = document.getElementById("clearSearch");
const randomButton = document.getElementById("randomMeal");
const chipsBox = document.getElementById("categoryChips");
const statusText = document.getElementById("catalogStatus");
const resultsBox = document.getElementById("results");
const mealModalElement = document.getElementById("mealModal");

// Current search, restored from localStorage
const catalogState = readJSON(STORAGE_KEYS.catalogState, { query: "", category: "All" });

// Every request gets a number; old answers that arrive late are ignored
let latestRequestId = 0;
let searchTimer = null;
let mealModal = null;

// ---------- Small helpers ----------

async function fetchFromApi(endpoint) {
    const response = await fetch(API_BASE + endpoint);
    if (!response.ok) {
        throw new Error("Server answered with status " + response.status);
    }
    return response.json();
}

// The API returns ingredients as strIngredient1..20 and strMeasure1..20
function getIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const name = (meal["strIngredient" + i] || "").trim();
        const measure = (meal["strMeasure" + i] || "").trim();
        if (name) {
            ingredients.push(measure ? measure + " " + name : name);
        }
    }
    return ingredients;
}

// Converts an API meal object into the short form used by the site
function toShortMeal(meal, fallbackCategory) {
    return {
        id: meal.idMeal,
        name: meal.strMeal,
        thumb: meal.strMealThumb,
        category: meal.strCategory || fallbackCategory || "",
        area: meal.strArea || ""
    };
}

function saveCatalogState() {
    writeJSON(STORAGE_KEYS.catalogState, catalogState);
}

// ---------- Loading / empty / error states ----------

function showLoading(text) {
    statusText.textContent = "";
    resultsBox.innerHTML =
        '<div class="loading-box" role="status">' +
        '<div class="spinner-border" aria-hidden="true"></div>' +
        '<p class="mt-3 mb-0"></p></div>';
    resultsBox.querySelector("p").textContent = text;
}

function showError(message, retry) {
    statusText.textContent = "";
    resultsBox.innerHTML =
        '<div class="error-box" role="alert"><i class="bi bi-wifi-off"></i>' +
        '<p class="mt-2"></p>' +
        '<button type="button" class="btn btn-accent"><i class="bi bi-arrow-clockwise"></i> Try again</button></div>';
    resultsBox.querySelector("p").textContent = message;
    resultsBox.querySelector("button").addEventListener("click", retry);
}

function showEmpty() {
    resultsBox.innerHTML =
        '<div class="empty-box"><i class="bi bi-emoji-frown"></i>' +
        '<p class="mt-2 mb-0">No recipes found. Try another word, for example "chicken", "soup" or "cake".</p></div>';
}

// ---------- Categories ----------

async function loadCategories() {
    let names;
    try {
        const data = await fetchFromApi("categories.php");
        names = data.categories.map(function (category) {
            return category.strCategory;
        });
    } catch (error) {
        // If the list cannot be loaded, the most popular categories are used
        names = ["Beef", "Breakfast", "Chicken", "Dessert", "Lamb", "Pasta", "Seafood", "Vegetarian"];
    }
    renderCategoryChips(["All"].concat(names));
}

function renderCategoryChips(names) {
    chipsBox.textContent = "";
    names.forEach(function (name) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "btn btn-outline-accent" + (name === catalogState.category ? " active" : "");
        chip.textContent = name;
        chip.dataset.category = name;
        chip.setAttribute("aria-pressed", name === catalogState.category ? "true" : "false");
        chipsBox.appendChild(chip);
    });
}

function markActiveChip() {
    chipsBox.querySelectorAll("button").forEach(function (chip) {
        const isActive = chip.dataset.category === catalogState.category;
        chip.classList.toggle("active", isActive);
        chip.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

// ---------- Search and filter ----------

async function loadMeals() {
    const requestId = ++latestRequestId;
    const query = catalogState.query;
    const category = catalogState.category;
    saveCatalogState();
    showLoading("Loading recipes...");

    try {
        let meals;

        if (query) {
            // Search by name, then keep only the chosen category
            const data = await fetchFromApi("search.php?s=" + encodeURIComponent(query));
            meals = (data.meals || []).map(function (meal) {
                return toShortMeal(meal);
            });
            if (category !== "All") {
                meals = meals.filter(function (meal) {
                    return meal.category === category;
                });
            }
        } else if (category !== "All") {
            // Only a category is chosen
            const data = await fetchFromApi("filter.php?c=" + encodeURIComponent(category));
            meals = (data.meals || []).map(function (meal) {
                return toShortMeal(meal, category);
            });
        } else {
            // Nothing chosen: show a default selection
            const data = await fetchFromApi("search.php?s=");
            meals = (data.meals || []).map(function (meal) {
                return toShortMeal(meal);
            });
        }

        if (requestId !== latestRequestId) {
            return; // the user already started a newer search
        }
        renderMeals(meals);
    } catch (error) {
        if (requestId === latestRequestId) {
            console.error(error);
            showError("Could not load recipes. Please check your internet connection.", loadMeals);
        }
    }
}

function renderMeals(meals) {
    let text = meals.length + (meals.length === 1 ? " recipe" : " recipes");
    if (catalogState.query) text += ' for "' + catalogState.query + '"';
    if (catalogState.category !== "All") text += " in " + catalogState.category;
    statusText.textContent = text;

    if (meals.length === 0) {
        showEmpty();
        return;
    }

    resultsBox.textContent = "";
    meals.forEach(function (meal, index) {
        resultsBox.appendChild(createMealCard(meal, index));
    });
}

function createMealCard(meal, index) {
    const card = document.createElement("article");
    card.className = "hover-card meal-result";
    card.dataset.id = meal.id;
    card.style.animationDelay = Math.min(index, 12) * 0.04 + "s";
    card.innerHTML =
        '<div class="card-img-wrap"><img loading="lazy"></div>' +
        '<div class="card-body">' +
        "<h3></h3><p class='meal-tags mb-0'></p>" +
        '<div class="card-actions">' +
        '<button type="button" class="btn btn-sm btn-accent flex-grow-1 view-btn">View recipe <i class="bi bi-arrow-right"></i></button>' +
        '<button type="button" class="btn btn-sm btn-outline-accent fav-btn"><i class="bi bi-heart"></i></button>' +
        "</div></div>";

    card.querySelector("img").src = meal.thumb + "/preview";
    card.querySelector("img").alt = meal.name;
    card.querySelector("h3").textContent = meal.name;
    card.querySelector(".meal-tags").textContent = [meal.category, meal.area].filter(Boolean).join(" · ");

    const favButton = card.querySelector(".fav-btn");
    updateFavoriteButton(favButton, isFavorite(meal.id));

    card.querySelector(".view-btn").addEventListener("click", function () {
        openMealDetails(meal.id);
    });

    favButton.addEventListener("click", function () {
        const saved = toggleFavorite(meal);
        updateFavoriteButton(favButton, saved);
        showToast(saved ? "Added to favorites" : "Removed from favorites");
    });

    return card;
}

function updateFavoriteButton(button, saved) {
    button.classList.toggle("saved", saved);
    button.querySelector("i").className = saved ? "bi bi-heart-fill" : "bi bi-heart";
    button.setAttribute("aria-label", saved ? "Remove from favorites" : "Add to favorites");
    button.setAttribute("aria-pressed", saved ? "true" : "false");
}

// ---------- Recipe details (modal) ----------

function getModal() {
    if (!mealModal) {
        mealModal = bootstrap.Modal.getOrCreateInstance(mealModalElement);
    }
    return mealModal;
}

async function openMealDetails(mealId) {
    const body = document.getElementById("mealModalBody");
    document.getElementById("mealModalTitle").textContent = "Loading...";
    body.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-secondary" role="status"></div></div>';
    getModal().show();

    try {
        const data = await fetchFromApi("lookup.php?i=" + encodeURIComponent(mealId));
        if (!data.meals) {
            throw new Error("Recipe not found");
        }
        renderMealDetails(data.meals[0]);
    } catch (error) {
        document.getElementById("mealModalTitle").textContent = "Something went wrong";
        body.innerHTML = '<p class="text-center py-4">Could not load this recipe. Please try again later.</p>';
    }
}

async function openRandomMeal() {
    setButtonLoading(randomButton, true, "Picking...");
    try {
        const data = await fetchFromApi("random.php");
        renderMealDetails(data.meals[0]);
        getModal().show();
    } catch (error) {
        showToast("Could not load a random recipe. Check your connection.");
    } finally {
        setButtonLoading(randomButton, false);
    }
}

function renderMealDetails(apiMeal) {
    const meal = toShortMeal(apiMeal);
    const body = document.getElementById("mealModalBody");
    document.getElementById("mealModalTitle").textContent = meal.name;

    body.innerHTML =
        '<img class="meal-modal-img mb-3">' +
        '<ul class="recipe-meta"></ul>' +
        '<div class="row g-4">' +
        '<div class="col-md-5"><h3 class="h5"><i class="bi bi-basket"></i> Ingredients</h3><ul class="ingredients-list"></ul></div>' +
        '<div class="col-md-7"><h3 class="h5"><i class="bi bi-list-ol"></i> Instructions</h3><p class="meal-instructions"></p></div>' +
        "</div>" +
        '<div class="d-flex flex-wrap gap-2 mt-3 modal-links"></div>';

    body.querySelector("img").src = meal.thumb;
    body.querySelector("img").alt = meal.name;

    const meta = body.querySelector(".recipe-meta");
    [["bi-tag", meal.category], ["bi-geo-alt", meal.area]].forEach(function (item) {
        if (item[1]) {
            const li = document.createElement("li");
            li.innerHTML = '<i class="bi ' + item[0] + '"></i> ';
            li.append(item[1]);
            meta.appendChild(li);
        }
    });

    const list = body.querySelector(".ingredients-list");
    getIngredients(apiMeal).forEach(function (ingredient) {
        const li = document.createElement("li");
        li.textContent = ingredient;
        list.appendChild(li);
    });

    body.querySelector(".meal-instructions").textContent = (apiMeal.strInstructions || "").trim();

    const links = body.querySelector(".modal-links");

    const favButton = document.createElement("button");
    favButton.type = "button";
    favButton.className = "btn btn-outline-accent";
    function updateModalFav() {
        const saved = isFavorite(meal.id);
        favButton.innerHTML = saved
            ? '<i class="bi bi-heart-fill"></i> Saved to favorites'
            : '<i class="bi bi-heart"></i> Add to favorites';
    }
    updateModalFav();
    favButton.addEventListener("click", function () {
        const saved = toggleFavorite(meal);
        updateModalFav();
        syncCardFavorite(meal.id, saved);
        showToast(saved ? "Added to favorites" : "Removed from favorites");
    });
    links.appendChild(favButton);

    if (apiMeal.strYoutube) {
        const video = document.createElement("a");
        video.className = "btn btn-accent";
        video.href = apiMeal.strYoutube;
        video.target = "_blank";
        video.rel = "noopener";
        video.innerHTML = '<i class="bi bi-youtube"></i> Watch video';
        links.appendChild(video);
    }
}

// Keeps the heart on the card in sync with the modal button
function syncCardFavorite(mealId, saved) {
    resultsBox.querySelectorAll(".meal-result").forEach(function (card) {
        const favButton = card.querySelector(".fav-btn");
        if (favButton && card.dataset.id === mealId) {
            updateFavoriteButton(favButton, saved);
        }
    });
}

// ---------- Events ----------

function startSearch() {
    catalogState.query = queryInput.value.trim();
    loadMeals();
}

if (catalogForm) {
    // Read links like recipes.html?category=Dessert or ?q=soup or ?meal=52772 or ?random=1
    const params = new URLSearchParams(window.location.search);
    if (params.has("category")) {
        catalogState.category = params.get("category");
        catalogState.query = "";
    }
    if (params.has("q")) {
        catalogState.query = params.get("q");
        catalogState.category = "All";
    }
    queryInput.value = catalogState.query;

    loadCategories();
    loadMeals();

    if (params.has("meal")) {
        openMealDetails(params.get("meal"));
    }
    if (params.get("random") === "1") {
        openRandomMeal();
    }

    catalogForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearTimeout(searchTimer);
        startSearch();
    });

    // Live search: results update 500 ms after the user stops typing
    queryInput.addEventListener("input", function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(startSearch, 500);
    });

    clearButton.addEventListener("click", function () {
        queryInput.value = "";
        catalogState.category = "All";
        markActiveChip();
        startSearch();
        queryInput.focus();
    });

    chipsBox.addEventListener("click", function (event) {
        const chip = event.target.closest("button[data-category]");
        if (!chip) {
            return;
        }
        catalogState.category = chip.dataset.category;
        markActiveChip();
        startSearch();
    });

    randomButton.addEventListener("click", openRandomMeal);
}
