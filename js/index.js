// ================= ELEMENTS =================
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const registerModal = document.getElementById("registerModal");
const loginModal = document.getElementById("loginModal");
const getStartedBtn = document.getElementById("getStartedBtn");
const switchToLogin = document.getElementById("switchToLogin");

// ================= MODAL CONTROLS =================
registerBtn?.addEventListener("click", () => openModal("registerModal"));
loginBtn?.addEventListener("click", () => openModal("loginModal"));
getStartedBtn?.addEventListener("click", () => openModal("registerModal"));

switchToLogin?.addEventListener("click", () => {
    closeAllModals();
    openModal("loginModal");
});

function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "block";
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => {
        m.style.display = "none";
    });
}

window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) closeAllModals();
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
});

// ================= REMEMBER ME LOAD =================
const savedEmail = localStorage.getItem("rememberMe");
const loginEmailInput = document.getElementById("loginEmail");

if (savedEmail && loginEmailInput) {
    loginEmailInput.value = savedEmail;
}

// ================= REGISTER =================
const registerForm = document.getElementById("registerForm");

registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("regUsername")?.value.trim() || "";
    const email = document.getElementById("regEmail")?.value.trim() || "";
    const password = document.getElementById("regPassword")?.value.trim() || "";
    const regMsg = document.getElementById("regMsg");

    regMsg.innerText = "Creating account...";
    regMsg.style.color = "#555";

    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (data.success) {
            regMsg.style.color = "green";
            regMsg.innerText = "Account created successfully!";

            alert("Registration successful");

            closeAllModals();
            openModal("loginModal");
        } else {
            regMsg.style.color = "red";
            regMsg.innerText = data.message || "Registration failed";
        }
    } catch (err) {
        console.error("Register error:", err);
        regMsg.style.color = "red";
        regMsg.innerText = "Server error. Try again later.";
    }
});

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const rememberInput = document.getElementById("loginRemember");
    const loginMsg = document.getElementById("loginMsg");

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";
    const remember = rememberInput?.checked || false;

    loginMsg.innerText = "Checking credentials...";
    loginMsg.style.color = "#555";

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            if (remember) {
                localStorage.setItem("rememberMe", email);
            } else {
                localStorage.removeItem("rememberMe");
            }

            localStorage.setItem("username", data.username || "");

            window.location.href = "/dashboard";
        } else {
            loginMsg.innerText = data.message || "Invalid credentials";
            loginMsg.style.color = "red";
        }
    } catch (err) {
        console.error("Login error:", err);
        loginMsg.innerText = "Server error. Try again later.";
        loginMsg.style.color = "red";
    }
});

// ================= FORGOT PASSWORD =================
window.forgotPassword = function () {
    const email = prompt("Enter your registered email:");
    if (!email) return;

    fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(res => res.json())
        .then(data => alert(data.message || "Check your email"))
        .catch(err => {
            console.error(err);
            alert("Server error");
        });
};

// ================= CONTACT FORM =================
const contactForm = document.getElementById("contact-form");

contactForm?.addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm("service_xwbwy2i", "template_bhfphlv", this)
        .then(() => {
            alert("Message sent successfully ✅");
            contactForm.reset();
        })
        .catch((error) => {
            console.error("EmailJS Error:", error);
            alert("Failed to send message ❌");
        });
});