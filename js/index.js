

    // ================= ELEMENTS =================
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const registerModal = document.getElementById("registerModal");
    const loginModal = document.getElementById("loginModal");
    const getStartedBtn = document.getElementById("getStartedBtn");





    // ================= OPEN / CLOSE MODAL =================
   registerBtn?.addEventListener("click", () => openModal("registerModal"));
loginBtn?.addEventListener("click", () => openModal("loginModal"));
getStartedBtn?.addEventListener("click", () => {
    openModal("registerModal");
});
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

    // Close on outside click
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            closeAllModals();
        }
    });

    // Close on ESC
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });

    // ================= REMEMBER ME =================
    const savedEmail = localStorage.getItem("rememberMe");
    if (savedEmail && document.getElementById("loginEmail")) {
        document.getElementById("loginEmail").value = savedEmail;
    }

    // ================= REGISTER =================
   const registerForm = document.getElementById("registerForm");

registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const remember = document.getElementById("regRemember").checked;
    const regMsg = document.getElementById("regMsg");

    regMsg.innerText = "Processing...";
    regMsg.style.color = "#555";

    try {
        const res = await fetch("http://127.0.0.1:5000/api/register", {
method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (data.success) {
            regMsg.style.color = "green";
            regMsg.innerText = "Registration Successful ✔";

            // Optional: remember me
            if (remember) localStorage.setItem("rememberMe", email);

            // Switch to login modal after short delay
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

    // ================= LOGIN =================
    const loginForm = document.getElementById("loginForm");
    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        const remember = loginRemember.checked;
        const loginMsg = document.getElementById("loginMsg");

        loginMsg.innerText = "Checking...";
        loginMsg.style.color = "#555";

        try {
            const res = await fetch("http://127.0.0.1:5000/api/login", {
                 method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            let data;
try {
    data = await res.json();
} catch {
    throw new Error("Invalid JSON from server");
}


            if (data.success) {
                if (remember) localStorage.setItem("rememberMe", email);
                loginMsg.style.color = "green";
                loginMsg.innerText = "Login successful ✔";
                setTimeout(() => {
                    window.location.href = "/dashboard"
                },800);
            }else {
                loginMsg.style.color = "red";
                loginMsg.innerText = data.message;
            }
        } catch (err) {
            console.error(err);
            loginMsg.style.color = "red";
            loginMsg.innerText = "Server error!";
        }
    });


// ================= FORGOT PASSWORD =================
function forgotPassword() {
    const email = prompt("Enter your registered email:");
    if (!email) return;

    fetch("http://127.0.0.1:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(() => alert("Server error"));
}

// ================= CONTACT FORM (EmailJS) =================
const contactForm = document.getElementById("contact-form");

contactForm?.addEventListener("submit", function(e) {
    e.preventDefault();

    emailjs.sendForm(
        "service_xwbwy2i",     // 👈 paste service ID
        "template_bhfphlv",    // 👈 paste template ID
        this
    ).then(() => {
        alert("Message sent successfully ✅");
        contactForm.reset();
    }).catch((error) => {
        console.error("EmailJS Error:", error);
        alert("Failed to send message ❌");
    });
});



