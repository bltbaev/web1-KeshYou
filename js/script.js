function setError(inputId, isOk, message) {
    document.getElementById(inputId + "Error").textContent = isOk ? "" : message;
    return isOk;
}

var signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = document.getElementById("suName").value.trim();
        var email = document.getElementById("suEmail").value.trim();
        var password = document.getElementById("suPassword").value;
        var confirm = document.getElementById("suConfirm").value;

        var okName = setError("suName", name !== "", "Name is required");
        var okEmail = setError("suEmail", /^\S+@\S+\.\S+$/.test(email), "Enter a valid email");
        var okPassword = setError("suPassword", password.length >= 8, "Password must be at least 8 characters");
        var okConfirm = setError("suConfirm", confirm !== "" && confirm === password, "Passwords do not match");

        var message = document.getElementById("signupSuccess");
        if (okName && okEmail && okPassword && okConfirm) {
            message.textContent = "Account created!";
            signupForm.reset();
        } else {
            message.textContent = "";
        }
    });
}

document.querySelectorAll(".faq-question").forEach(function (question) {
    question.addEventListener("click", function () {
        var answer = question.nextElementSibling;
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});

var popup = document.getElementById("popup");

if (popup) {
    document.getElementById("openPopup").addEventListener("click", function () {
        popup.classList.add("open");
    });

    document.getElementById("closePopup").addEventListener("click", function () {
        popup.classList.remove("open");
    });

    popup.addEventListener("click", function (event) {
        if (event.target === popup) {
            popup.classList.remove("open");
        }
    });

    document.getElementById("popupForm").addEventListener("submit", function (event) {
        event.preventDefault();
        var email = document.getElementById("popEmail").value.trim();
        var message = document.getElementById("popupSuccess");
        if (setError("popEmail", /^\S+@\S+\.\S+$/.test(email), "Enter a valid email")) {
            message.textContent = "Subscribed!";
            document.getElementById("popupForm").reset();
        } else {
            message.textContent = "";
        }
    });
}

var colorBtn = document.getElementById("colorBtn");

if (colorBtn) {
    var colors = ["#f7f0e6", "#fde2e4", "#e2ece9", "#dfe7fd", "#fff1c1"];
    var colorIndex = 0;

    colorBtn.addEventListener("click", function () {
        colorIndex = (colorIndex + 1) % colors.length;
        document.body.style.backgroundColor = colors[colorIndex];
    });
}

var dateTime = document.getElementById("dateTime");

if (dateTime) {
    function showDateTime() {
        var now = new Date();
        var date = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        var time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        dateTime.textContent = date + ", " + time;
    }

    showDateTime();
    setInterval(showDateTime, 1000);
}
