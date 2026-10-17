/* =========================================================
   Assignment 4 - JavaScript
   Task 1: Form validation (sign-up form on about.html)
   Task 3: Popup subscription form (index.html)
   This file is linked in every HTML page; each block only
   runs if its elements exist on the current page.
   ========================================================= */

/* ---------- helpers ---------- */
function showError(input, message) {
    var error = document.getElementById(input.id + "Error");
    input.classList.add("is-invalid-custom");
    input.classList.remove("is-valid-custom");
    if (error) {
        error.textContent = message;
        error.classList.add("visible");
    }
}

function clearError(input) {
    var error = document.getElementById(input.id + "Error");
    input.classList.remove("is-invalid-custom");
    input.classList.add("is-valid-custom");
    if (error) {
        error.textContent = "";
        error.classList.remove("visible");
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ---------- field validators (return true if OK) ---------- */
function validateName(input) {
    var value = input.value.trim();
    if (value === "") {
        showError(input, "Name is required.");
        return false;
    }
    if (value.length < 2) {
        showError(input, "Name must be at least 2 characters.");
        return false;
    }
    clearError(input);
    return true;
}

function validateEmail(input) {
    var value = input.value.trim();
    if (value === "") {
        showError(input, "Email is required.");
        return false;
    }
    if (!isValidEmail(value)) {
        showError(input, "Enter a valid email, e.g. name@example.com.");
        return false;
    }
    clearError(input);
    return true;
}

function validatePassword(input) {
    var value = input.value;
    if (value === "") {
        showError(input, "Password is required.");
        return false;
    }
    if (value.length < 8) {
        showError(input, "Password must be at least 8 characters.");
        return false;
    }
    clearError(input);
    return true;
}

function validateConfirm(input, passwordInput) {
    if (input.value === "") {
        showError(input, "Please confirm your password.");
        return false;
    }
    if (input.value !== passwordInput.value) {
        showError(input, "Passwords do not match.");
        return false;
    }
    clearError(input);
    return true;
}

/* =========================================================
   TASK 1: FORM VALIDATION
   ========================================================= */
var signupForm = document.getElementById("signupForm");

if (signupForm) {
    var suName = document.getElementById("suName");
    var suEmail = document.getElementById("suEmail");
    var suPassword = document.getElementById("suPassword");
    var suConfirm = document.getElementById("suConfirm");
    var suSuccess = document.getElementById("signupSuccess");

    // live feedback when the user leaves a field
    suName.addEventListener("blur", function () { validateName(suName); });
    suEmail.addEventListener("blur", function () { validateEmail(suEmail); });
    suPassword.addEventListener("blur", function () { validatePassword(suPassword); });
    suConfirm.addEventListener("blur", function () { validateConfirm(suConfirm, suPassword); });

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();               // stop the page reload
        suSuccess.classList.remove("visible");

        // run ALL validators so every error is shown at once
        var okName = validateName(suName);
        var okEmail = validateEmail(suEmail);
        var okPassword = validatePassword(suPassword);
        var okConfirm = validateConfirm(suConfirm, suPassword);

        if (okName && okEmail && okPassword && okConfirm) {
            suSuccess.textContent = "Thank you, " + suName.value.trim() + "! Your account was created successfully.";
            suSuccess.classList.add("visible");
            signupForm.reset();
            [suName, suEmail, suPassword, suConfirm].forEach(function (el) {
                el.classList.remove("is-valid-custom", "is-invalid-custom");
            });
        }
    });
}

/* =========================================================
   TASK 3: POPUP SUBSCRIPTION FORM
   ========================================================= */
var openPopupBtn = document.getElementById("openPopupBtn");
var popupOverlay = document.getElementById("popupOverlay");

if (openPopupBtn && popupOverlay) {
    var closePopupBtn = document.getElementById("closePopupBtn");
    var popupForm = document.getElementById("popupForm");
    var popEmail = document.getElementById("popEmail");
    var popSuccess = document.getElementById("popupSuccess");

    function openPopup() {
        popupOverlay.classList.add("open");
        popEmail.focus();
    }

    function closePopup() {
        popupOverlay.classList.remove("open");
    }

    openPopupBtn.addEventListener("click", openPopup);
    closePopupBtn.addEventListener("click", closePopup);

    // click on the dark area OUTSIDE the white box closes the popup
    popupOverlay.addEventListener("click", function (event) {
        if (event.target === popupOverlay) {
            closePopup();
        }
    });

    // Escape key also closes it
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closePopup();
        }
    });

    popupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        popSuccess.classList.remove("visible");

        if (validateEmail(popEmail)) {
            popSuccess.textContent = "Subscribed! Thank you for joining Simple Recipes.";
            popSuccess.classList.add("visible");
            popupForm.reset();
            popEmail.classList.remove("is-valid-custom", "is-invalid-custom");
            setTimeout(closePopup, 1500);
        }
    });
}
