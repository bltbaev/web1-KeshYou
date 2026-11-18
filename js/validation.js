// =========================================================
// validation.js - form validation written in JavaScript.
// Forms use "novalidate", so the browser does not validate;
// every check below returns "" when the value is fine,
// or a friendly error message that is shown under the field.
// =========================================================

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const PHONE_PATTERN = /^(\+7|8)\d{10}$/;
const NAME_PATTERN = /^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\s'-]+$/;

const Validators = {
    required: function (label) {
        return function (value) {
            return value === "" ? "Please enter your " + label + "." : "";
        };
    },

    name: function (value) {
        if (value.length < 2 || !NAME_PATTERN.test(value)) {
            return "Name should be at least 2 letters and contain no numbers or symbols.";
        }
        return "";
    },

    email: function (value) {
        return EMAIL_PATTERN.test(value)
            ? ""
            : "Please enter a valid email, for example name@gmail.com.";
    },

    phone: function (value) {
        return PHONE_PATTERN.test(normalizePhone(value))
            ? ""
            : "Please enter a phone number like +7 701 234 56 78.";
    },

    password: function (value) {
        const missing = [];
        if (value.length < 8) missing.push("at least 8 characters");
        if (!/[A-Z]/.test(value)) missing.push("an uppercase letter");
        if (!/[a-z]/.test(value)) missing.push("a lowercase letter");
        if (!/\d/.test(value)) missing.push("a number");
        return missing.length
            ? "Password needs " + missing.join(", ") + "."
            : "";
    },

    minLength: function (min, label) {
        return function (value) {
            return value.length < min
                ? label + " should be at least " + min + " characters long."
                : "";
        };
    },

    matches: function (otherInputId, message) {
        return function (value) {
            return value === document.getElementById(otherInputId).value.trim()
                ? ""
                : message;
        };
    },

    checked: function (message) {
        return function (value) {
            return value ? "" : message;
        };
    },

    selected: function (message) {
        return function (value) {
            return value ? "" : message;
        };
    }
};

function normalizePhone(value) {
    return value.replace(/[\s\-()]/g, "");
}

function toStandardPhone(value) {
    const digits = normalizePhone(value);
    return digits.startsWith("8") ? "+7" + digits.slice(1) : digits;
}

function formatPhone(phone) {
    const match = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone || "");
    return match
        ? "+7 " + match[1] + " " + match[2] + " " + match[3] + " " + match[4]
        : phone;
}

function getFieldValue(input) {
    if (input.type === "checkbox") {
        return input.checked ? "yes" : "";
    }
    return input.hasAttribute("data-password")
        ? input.value
        : input.value.trim();
}

function setFieldError(input, message) {
    const errorBox = document.getElementById(input.id + "Error");
    input.classList.toggle("is-invalid", Boolean(message));
    input.classList.toggle("is-valid", !message && input.type !== "checkbox");
    input.setAttribute("aria-invalid", message ? "true" : "false");

    if (errorBox) {
        errorBox.textContent = message;
    }
}

function validateField(input, checks) {
    const value = getFieldValue(input);

    for (const check of checks) {
        const message = check(value);
        if (message) {
            setFieldError(input, message);
            return false;
        }
    }

    setFieldError(input, "");
    return true;
}

function setupValidation(form, rules) {
    const fieldIds = Object.keys(rules);

    fieldIds.forEach(function (id) {
        const input = document.getElementById(id);
        const eventName =
            input.type === "checkbox" || input.tagName === "SELECT"
                ? "change"
                : "input";

        input.addEventListener("blur", function () {
            input.dataset.touched = "true";
            validateField(input, rules[id]);
        });

        input.addEventListener(eventName, function () {
            if (input.dataset.touched) {
                validateField(input, rules[id]);
            }
        });
    });

    return function validateAll() {
        let firstInvalid = null;

        fieldIds.forEach(function (id) {
            const input = document.getElementById(id);
            input.dataset.touched = "true";

            if (!validateField(input, rules[id]) && !firstInvalid) {
                firstInvalid = input;
            }
        });

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return firstInvalid === null;
    };
}

function showFormMessage(box, text, type) {
    box.textContent = text;
    box.className = "form-message " + type;
}

function hideFormMessage(box) {
    box.textContent = "";
    box.className = "form-message";
}

function setButtonLoading(button, isLoading, loadingText) {
    if (isLoading) {
        button.dataset.originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML =
            '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ' +
            loadingText;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalHtml;
    }
}

document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
    button.addEventListener("click", function () {
        const input = document.getElementById(button.dataset.togglePassword);
        const show = input.type === "password";

        input.type = show ? "text" : "password";
        button.querySelector("i").className =
            show ? "bi bi-eye-slash" : "bi bi-eye";
        button.setAttribute(
            "aria-label",
            show ? "Hide password" : "Show password"
        );
    });
});