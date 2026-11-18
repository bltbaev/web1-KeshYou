// =========================================================
// auth.js - Sign Up, Log In and Profile (simulated with localStorage).
// Note: this is a front-end only simulation for the course project.
// A real site would send the data to a server and never keep
// plain passwords in the browser.
// =========================================================

// ---------- Sign Up (signup.html) ----------
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    if (getCurrentUser()) {
        window.location.replace("profile.html");
    }

    const signupMessage = document.getElementById("signupMessage");

    const validateSignup = setupValidation(signupForm, {
        suName: [Validators.required("name"), Validators.name],
        suEmail: [Validators.required("email"), Validators.email],
        suPhone: [Validators.required("phone number"), Validators.phone],
        suPassword: [Validators.required("password"), Validators.password],
        suConfirm: [
            Validators.required("password again"),
            Validators.matches("suPassword", "Passwords do not match.")
        ],
        suTerms: [
            Validators.checked("Please accept the terms to create an account.")
        ]
    });

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        hideFormMessage(signupMessage);

        if (!validateSignup()) {
            showFormMessage(
                signupMessage,
                "Please fix the highlighted fields.",
                "error"
            );
            return;
        }

        const emailInput = document.getElementById("suEmail");
        const email = emailInput.value.trim().toLowerCase();

        if (findUserByEmail(email)) {
            setFieldError(
                emailInput,
                "An account with this email already exists. Try logging in."
            );
            emailInput.focus();
            return;
        }

        const newUser = {
            name: document.getElementById("suName").value.trim(),
            email: email,
            phone: toStandardPhone(document.getElementById("suPhone").value),
            password: document.getElementById("suPassword").value,
            createdAt: new Date().toISOString()
        };

        const users = getUsers();
        users.push(newUser);
        saveUsers(users);

        const submitButton = signupForm.querySelector("button[type='submit']");
        setButtonLoading(submitButton, true, "Creating account...");

        showFormMessage(
            signupMessage,
            "Account created! Redirecting to log in...",
            "success"
        );

        setTimeout(function () {
            window.location.href =
                "login.html?registered=1&email=" + encodeURIComponent(email);
        }, 1200);
    });
}

// ---------- Log In (login.html) ----------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    if (getCurrentUser()) {
        window.location.replace("profile.html");
    }

    const loginMessage = document.getElementById("loginMessage");
    const params = new URLSearchParams(window.location.search);

    if (params.get("registered") === "1") {
        showFormMessage(
            loginMessage,
            "Your account is ready. Please log in.",
            "success"
        );
    }

    if (params.get("email")) {
        document.getElementById("liEmail").value = params.get("email");
    }

    if (params.get("next") === "profile") {
        showFormMessage(
            loginMessage,
            "Please log in to see your profile.",
            "error"
        );
    }

    const validateLogin = setupValidation(loginForm, {
        liEmail: [Validators.required("email"), Validators.email],
        liPassword: [
            Validators.required("password"),
            Validators.minLength(8, "Password")
        ]
    });

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        hideFormMessage(loginMessage);

        if (!validateLogin()) {
            return;
        }

        const user = findUserByEmail(
            document.getElementById("liEmail").value
        );
        const password = document.getElementById("liPassword").value;

        if (!user || user.password !== password) {
            showFormMessage(
                loginMessage,
                "Incorrect email or password. Please try again.",
                "error"
            );
            return;
        }

        setCurrentUser(user.email);

        const submitButton = loginForm.querySelector("button[type='submit']");
        setButtonLoading(submitButton, true, "Logging in...");

        setTimeout(function () {
            window.location.href = "profile.html";
        }, 700);
    });
}

// ---------- Profile (profile.html) ----------
const profilePage = document.getElementById("profilePage");

if (profilePage) {
    const user = getCurrentUser();

    if (!user) {
        window.location.replace("login.html?next=profile");
    } else {
        renderProfile(user);
        renderFavorites();
    }
}

function renderProfile(user) {
    const joined = new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("profileAvatar").textContent =
        user.name.charAt(0).toUpperCase();

    document.getElementById("profileName").textContent = user.name;

    document.getElementById("profileGreeting").textContent =
        "Welcome back, " + user.name.split(" ")[0] + "!";

    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profilePhone").textContent =
        formatPhone(user.phone);

    document.getElementById("profileJoined").textContent = joined;

    const lastSearch = readJSON(STORAGE_KEYS.catalogState, null);
    const lastSearchText = document.getElementById("profileLastSearch");

    if (lastSearch && (lastSearch.query || lastSearch.category !== "All")) {
        const parts = [];

        if (lastSearch.query) {
            parts.push('"' + lastSearch.query + '"');
        }

        if (lastSearch.category && lastSearch.category !== "All") {
            parts.push(lastSearch.category);
        }

        lastSearchText.textContent = parts.join(" in ");
    } else {
        lastSearchText.textContent = "No searches yet";
    }
}

function renderFavorites() {
    const list = document.getElementById("favoritesList");
    const favorites = getFavorites();

    document.getElementById("favoritesCount").textContent = favorites.length;
    list.textContent = "";

    if (favorites.length === 0) {
        list.innerHTML =
            '<div class="empty-box"><i class="bi bi-heart"></i>' +
            "<p class='mt-2 mb-3'>You have no favorite recipes yet.</p>" +
            '<a href="recipes.html" class="btn btn-accent">' +
            'Find recipes <i class="bi bi-arrow-right"></i></a></div>';
        return;
    }

    favorites.forEach(function (meal) {
        const card = document.createElement("article");
        card.className = "hover-card meal-result";

        card.innerHTML =
            '<div class="card-img-wrap"><img alt="" loading="lazy"></div>' +
            '<div class="card-body">' +
            "<h3></h3><p class='meal-tags mb-0'></p>" +
            '<div class="card-actions">' +
            '<a class="btn btn-sm btn-outline-accent flex-grow-1">' +
            'Open <i class="bi bi-arrow-right"></i></a>' +
            '<button type="button" class="btn btn-sm btn-outline-danger" ' +
            'aria-label="Remove from favorites">' +
            '<i class="bi bi-trash"></i></button>' +
            "</div></div>";

        card.querySelector("img").src = meal.thumb;
        card.querySelector("img").alt = meal.name;
        card.querySelector("h3").textContent = meal.name;
        card.querySelector(".meal-tags").textContent =
            meal.category || "Saved recipe";

        card.querySelector("a").href =
            "recipes.html?meal=" + encodeURIComponent(meal.id);

        card.querySelector("button").addEventListener("click", function () {
            removeFavorite(meal.id);
            renderFavorites();
            showToast("Removed from favorites");
        });

        list.appendChild(card);
    });
}