// =========================================================
// script.js - shared code that runs on every page.
// 1. Light / dark theme   2. Header auth links   3. Toast
// 4. Scroll progress bar  5. Reveal on scroll    6. Greeting
// 7. Number counters      8. Recipe pages (search, copy, FAQ)
// 9. Star rating (About page)
// Each block first checks that its elements exist on the page.
// =========================================================

// ---------- 1. Light / dark theme ----------
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);

    if (themeToggle) {
        const isDark = theme === "dark";
        themeToggle.querySelector("i").className =
            isDark ? "bi bi-sun" : "bi bi-moon-stars";

        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        themeToggle.title = isDark ? "Light mode" : "Dark mode";
    }
}

if (themeToggle) {
    applyTheme(
        document.documentElement.getAttribute("data-bs-theme") || "light"
    );

    themeToggle.addEventListener("click", function () {
        const current =
            document.documentElement.getAttribute("data-bs-theme");

        applyTheme(current === "dark" ? "light" : "dark");
    });
}

// ---------- 2. Header authentication ----------
const currentUser = getCurrentUser();

document.querySelectorAll("[data-auth]").forEach(function (element) {
    const forUser = element.dataset.auth === "user";
    element.hidden = forUser ? !currentUser : Boolean(currentUser);
});

document.querySelectorAll("[data-user-name]").forEach(function (element) {
    if (currentUser) {
        element.textContent = currentUser.name.split(" ")[0];
    }
});

document.querySelectorAll("[data-action='logout']").forEach(function (button) {
    button.addEventListener("click", function () {
        clearCurrentUser();
        window.location.href = "index.html";
    });
});

// ---------- 3. Toast messages ----------
function showToast(message) {
    const old = document.querySelector(".toast-message");

    if (old) {
        old.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.setAttribute("role", "status");
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 2500);
}

// ---------- 4. Scroll progress bar ----------
const progressBar = document.createElement("div");
progressBar.id = "scrollProgress";
document.body.prepend(progressBar);

function updateProgressBar() {
    const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

    const percent =
        maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

    progressBar.style.width = percent + "%";
}

window.addEventListener("scroll", updateProgressBar, { passive: true });
updateProgressBar();

// ---------- 5. Reveal sections ----------
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });
} else {
    revealItems.forEach(function (item) {
        item.classList.add("visible");
    });
}

// ---------- 6. Greeting by time of day ----------
const dayGreeting = document.getElementById("dayGreeting");

if (dayGreeting) {
    const hour = new Date().getHours();
    const name = currentUser
        ? ", " + currentUser.name.split(" ")[0]
        : "";

    let icon;
    let text;

    switch (true) {
        case hour < 5:
            icon = "bi-moon-stars";
            text = "Late night" + name +
                "? A sweet dessert is always a good idea.";
            break;

        case hour < 12:
            icon = "bi-sunrise";
            text = "Good morning" + name +
                "! How about fluffy pancakes?";
            break;

        case hour < 18:
            icon = "bi-sun";
            text = "Good afternoon" + name +
                "! Time for a hearty lunch.";
            break;

        default:
            icon = "bi-sunset";
            text = "Good evening" + name +
                "! Beshbarmak for dinner?";
    }

    dayGreeting.querySelector("i").className = "bi " + icon;
    dayGreeting.querySelector("span").textContent = text;
}

// ---------- 7. Animated counters ----------
const counters = document.querySelectorAll(".counter");

function getCounterTarget(counter) {
    if (counter.dataset.source === "users") {
        return getUsers().length;
    }

    if (counter.dataset.source === "favorites") {
        return getFavorites().length;
    }

    return Number(counter.dataset.target) || 0;
}

function animateCounter(counter) {
    const target = getCounterTarget(counter);
    const duration = 1500;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);

        counter.textContent = Math.floor(progress * target);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            counter.textContent = target;
        }
    }

    requestAnimationFrame(step);
}

if (counters.length > 0 && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
        counterObserver.observe(counter);
    });
} else {
    counters.forEach(function (counter) {
        counter.textContent = getCounterTarget(counter);
    });
}

// ---------- 8. Recipe pages ----------

// 8.1 Search within recipe pages
const pageSearch = document.getElementById("pageSearch");

if (pageSearch) {
    const searchResult = document.getElementById("searchResult");

    const textBlocks = document.querySelectorAll(
        "[data-searchable] li, .faq-question span, .faq-answer p"
    );

    textBlocks.forEach(function (block) {
        block.dataset.original = block.textContent.trim();
    });

    pageSearch.addEventListener("input", function () {
        const keyword = pageSearch.value.trim();

        const safeWord = keyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp("(" + safeWord + ")", "gi");
        let matches = 0;

        textBlocks.forEach(function (block) {
            const original = block.dataset.original;
            block.textContent = original;

            if (keyword !== "" && regex.test(original)) {
                block.textContent = "";

                original.split(regex).forEach(function (part, index) {
                    if (index % 2 === 1) {
                        const mark = document.createElement("mark");
                        mark.className = "highlight";
                        mark.textContent = part;
                        block.appendChild(mark);
                        matches++;
                    } else {
                        block.append(part);
                    }
                });
            }

            regex.lastIndex = 0;
        });

        document.querySelectorAll(".faq-item").forEach(function (item) {
            item.classList.toggle(
                "open",
                keyword !== "" && item.querySelector("mark") !== null
            );
        });

        searchResult.textContent =
            keyword === ""
                ? ""
                : matches === 0
                    ? "No matches"
                    : "Matches found: " + matches;
    });
}

// 8.2 Copy ingredients
document.querySelectorAll(".copy-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        const list = document.getElementById(button.dataset.copyTarget);

        const text = Array.from(list.querySelectorAll("li"))
            .map(function (item) {
                return "- " + item.textContent.trim();
            })
            .join("\n");

        navigator.clipboard.writeText(text)
            .then(function () {
                const icon = button.querySelector("i");
                icon.className = "bi bi-check2";

                showToast("Ingredients copied to clipboard");

                setTimeout(function () {
                    icon.className = "bi bi-clipboard";
                }, 2000);
            })
            .catch(function () {
                showToast(
                    "Sorry, copying is not allowed in this browser."
                );
            });
    });
});

// 8.3 FAQ
document.querySelectorAll(".faq-question").forEach(function (question) {
    question.addEventListener("click", function () {
        const item = question.closest(".faq-item");
        item.classList.toggle("open");

        question.setAttribute(
            "aria-expanded",
            item.classList.contains("open") ? "true" : "false"
        );
    });
});

// ---------- 9. Star rating ----------
const starRating = document.getElementById("starRating");

if (starRating) {
    const stars = starRating.querySelectorAll(".star");
    const ratingMessage = document.getElementById("ratingMessage");

    let savedRating =
        Number(localStorage.getItem(STORAGE_KEYS.rating)) || 0;

    function paintStars(count, className) {
        stars.forEach(function (star, index) {
            star.classList.remove("hovered", "selected");

            if (index < count) {
                star.classList.add(className);
            }
        });
    }

    function showRatingText() {
        ratingMessage.textContent = savedRating
            ? "Thank you! You rated us " + savedRating + " out of 5."
            : "Click a star to rate our recipes.";
    }

    paintStars(savedRating, "selected");
    showRatingText();

    stars.forEach(function (star, index) {
        star.addEventListener("mouseenter", function () {
            paintStars(index + 1, "hovered");
        });

        star.addEventListener("click", function () {
            savedRating = index + 1;

            localStorage.setItem(STORAGE_KEYS.rating, savedRating);

            paintStars(savedRating, "selected");
            showRatingText();
            showToast("Thanks for your rating!");
        });
    });

    starRating.addEventListener("mouseleave", function () {
        paintStars(savedRating, "selected");
    });
}

// Current year in footer
document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
});