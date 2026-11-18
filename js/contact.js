// =========================================================
// contact.js - "Ask the Chef" form on contact.html.
// Messages are validated, then saved in localStorage
// (there is no server in this project).
// =========================================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    const contactMessage = document.getElementById("contactMessage");

    const user = getCurrentUser();

    if (user) {
        document.getElementById("cName").value = user.name;
        document.getElementById("cEmail").value = user.email;
        document.getElementById("cPhone").value = formatPhone(user.phone);
    }

    const validateContact = setupValidation(contactForm, {
        cName: [Validators.required("name"), Validators.name],
        cEmail: [Validators.required("email"), Validators.email],
        cPhone: [Validators.required("phone number"), Validators.phone],
        cTopic: [Validators.selected("Please choose a topic.")],
        cMessage: [
            Validators.required("message"),
            Validators.minLength(10, "Message")
        ]
    });

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        hideFormMessage(contactMessage);

        if (!validateContact()) {
            showFormMessage(
                contactMessage,
                "Please fix the highlighted fields.",
                "error"
            );
            return;
        }

        const message = {
            name: document.getElementById("cName").value.trim(),
            email: document.getElementById("cEmail").value.trim().toLowerCase(),
            phone: toStandardPhone(document.getElementById("cPhone").value),
            topic: document.getElementById("cTopic").value,
            text: document.getElementById("cMessage").value.trim(),
            sentAt: new Date().toISOString()
        };

        const submitButton = contactForm.querySelector("button[type='submit']");
        setButtonLoading(submitButton, true, "Sending...");

        setTimeout(function () {
            const messages = readJSON(STORAGE_KEYS.messages, []);
            messages.push(message);
            writeJSON(STORAGE_KEYS.messages, messages);

            setButtonLoading(submitButton, false);

            showFormMessage(
                contactMessage,
                "Thank you, " + message.name +
                "! The chef will answer within 2 days.",
                "success"
            );

            document.getElementById("cTopic").value = "";
            document.getElementById("cMessage").value = "";

            ["cTopic", "cMessage"].forEach(function (id) {
                const input = document.getElementById(id);
                input.classList.remove("is-valid");
                delete input.dataset.touched;
            });
        }, 900);
    });
}