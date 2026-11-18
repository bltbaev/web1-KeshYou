// Runs in <head> before the page is drawn.
// Applies the saved theme right away, so the page never "flashes" white in dark mode.
(function () {
    var theme = "light";
    try {
        if (localStorage.getItem("sr_theme") === "dark") {
            theme = "dark";
        }
    } catch (error) {
        // localStorage can be blocked (private mode) - the light theme is used then.
    }
    document.documentElement.setAttribute("data-bs-theme", theme);
})();