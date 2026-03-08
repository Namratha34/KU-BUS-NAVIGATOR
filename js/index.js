// ================= ELEMENTS =================
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const registerModal = document.getElementById("registerModal");
const loginModal = document.getElementById("loginModal");
const getStartedBtn = document.getElementById("getStartedBtn");
const switchToLogin = document.getElementById("switchToLogin"); // Ensure this ID exists in HTML

// ================= OPEN / CLOSE MODAL =================
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

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
}

window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) closeAllModals();
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
});

// ================= REMEMBER ME (INITIAL LOAD) =================
const savedEmail = localStorage.getItem("rememberMe");
const loginEmailInput = document.getElementById("loginEmail");
if (savedEmail && loginEmailInput) {
    loginEmailInput.value = savedEmail;
}

// ================= REGISTER =================
const registerForm = document.getElementById("registerForm");

registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const remember = document.getElementById("regRemember")?.checked;
    const regMsg = document.getElementById("regMsg");

    regMsg.innerText = "Processing...";
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
            regMsg.innerText = "Registration Successful ✔";
            if (remember) localStorage.setItem("rememberMe", email);
            setTimeout(() => {
                closeModal('registerModal');
                openModal('loginModal');
            }, 1200);
        } else {
            regMsg.style.color = "red";
            regMsg.innerText = data.message || "Registration failed";
        }
    } catch (err) {
        console.error("Register error:", err);
        regMsg.style.color = "red";
        regMsg.innerText = "Server error! Please try again.";
    }
});

// ================= LOGIN (FIXED) =================
const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // FIXED: Correctly getting elements before using them
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const rememberInput = document.getElementById("loginRemember");
    const loginMsg = document.getElementById("loginMsg");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const remember = rememberInput ? rememberInput.checked : false;

    loginMsg.innerText = "Checking...";
    loginMsg.style.color = "#555";

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            if (remember) localStorage.setItem("rememberMe", email);
            loginMsg.style.color = "green";
            loginMsg.innerText = "Login successful ✔";
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 800);
        } else {
            loginMsg.style.color = "red";
            loginMsg.innerText = data.message || "Invalid credentials";
        }
    } catch (err) {
        console.error("Login Error:", err);
        loginMsg.style.color = "red";
        loginMsg.innerText = "Server error!";
    }
});

// ================= FORGOT PASSWORD =================
function forgotPassword() {
    const email = prompt("Enter your registered email:");
    if (!email) return;

    fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(() => alert("Server error"));
}

// ================= CONTACT FORM =================
const contactForm = document.getElementById("contact-form");
contactForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    // Assuming emailjs is loaded in the HTML head
    emailjs.sendForm("service_xwbwy2i", "template_bhfphlv", this)
    .then(() => {
        alert("Message sent successfully ✅");
        contactForm.reset();
    }).catch((error) => {
        console.error("EmailJS Error:", error);
        alert("Failed to send message ❌");
    });
});