// Wrap everything in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

    // === 1️⃣ Welcome User ===
    const username = localStorage.getItem("username") || "User";
    const welcomeUser = document.getElementById("welcomeUser");
    if (welcomeUser) {
        welcomeUser.textContent = `Welcome, ${username}`;
    }

    // === 2️⃣ Remove overlay after 4.5s ===
    setTimeout(() => {
        const overlay = document.getElementById("welcomeOverlay");
        if (overlay) overlay.remove();
    }, 4500);

    // === 3️⃣ Elements ===
    const busGrid = document.getElementById("busGrid");
    const busDetails = document.getElementById("busDetails");
    const liveLink = document.querySelector(".live-location-link");

    if (!busGrid || !busDetails || !liveLink) {
        console.error("Dashboard elements not found");
        return;
    }

    // === 4️⃣ Generate Bus Buttons (1–30) ===
    for (let i = 1; i <= 30; i++) {
        const btn = document.createElement("button");
        btn.className = "bus-btn";
        btn.innerText = "Bus " + i;
        btn.addEventListener("click", () => showBus(i));
        busGrid.appendChild(btn);
    }

    // === 5️⃣ Show Bus Details ===
    function showBus(num) {
        fetch(`/api/bus/${num}`)
            .then(res => res.json())
            .then(response => {

                if (!response.success) {
                    alert("Bus not found");
                    return;
                }

                const data = response.data;

                document.getElementById("dDriver").innerText = data.driver;
                document.getElementById("dPhone").innerText = data.phone;
                document.getElementById("dRoute").innerText = data.route;
                document.getElementById("dTime").innerText = data.start_time;
                document.getElementById("dDest").innerText = data.destination;

                // ✅ Store bus ID for live tracking
                liveLink.dataset.bus = num;

                busDetails.style.display = "block";
            })
            .catch(err => {
                console.error(err);
                alert("Bus data not found in database");
            });
    }

    // === 6️⃣ Handle Live Location Click (FIXED) ===
    document.addEventListener("click", function(e) {
        if (e.target && e.target.classList.contains("live-location-link")) {
            e.preventDefault();

            const busId = e.target.dataset.bus;

            if (!busId) {
                alert("Please select a bus first");
                return;
            }

            // 🚀 Redirect to live map page
            window.location.href = `/live_map?bus=${busId}`;
        }
    });

    // === 7️⃣ Search Bus Function ===
    window.searchBus = function() {
        const val = parseInt(document.getElementById("busSearch").value);
        if (val >= 1 && val <= 30) {
            showBus(val);
        } else {
            alert("Please enter a valid bus number (1–30)");
        }
    };

    // === 8️⃣ Logout Function ===
    window.logout = function() {
        window.location.href = "/";
    };

});