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

    if (!busGrid || !busDetails) {
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
            .then(res => {
                if (!res.ok) throw new Error("Bus not found");
                return res.json();
            })
            .then(data => {
                document.getElementById("dBus").innerText = data.bus_number;
                document.getElementById("dDriver").innerText = data.driver_name;
                document.getElementById("dPhone").innerText = data.driver_phone;
                document.getElementById("dRoute").innerText = data.route;
                document.getElementById("dTime").innerText = data.start_time;
                document.getElementById("dDest").innerText = data.end_point;

                const liveLink = document.querySelector(".live-location-link");
                if (data.live_location) {
                    const [lat, lng] = data.live_location.split(",");
                    liveLink.dataset.lat = lat;
                    liveLink.dataset.lng = lng;
                } else {
                    liveLink.dataset.lat = "";
                    liveLink.dataset.lng = "";
                }

                busDetails.style.display = "block"; // Show the details section
            })
            .catch(err => {
                alert("Bus data not found in database");
                console.error(err);
            });
    }

    // === 6️⃣ Handle Live Location Click ===
    document.addEventListener("click", function(e) {
        if (e.target && e.target.classList.contains("live-location-link")) {
            e.preventDefault();

            const lat = parseFloat(e.target.dataset.lat);
            const lng = parseFloat(e.target.dataset.lng);

            if (isNaN(lat) || isNaN(lng)) {
                alert("Live location not available for this bus");
                return;
            }

            const mapWindow = window.open("", "Live Location", "width=600,height=500");

            mapWindow.document.write(`
                <html>
                <head>
                    <title>Bus Live Location</title>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
                    <style>
                        html, body { margin:0; height:100%; }
                        #map { height:100%; width:100%; }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <script>
                        var map = L.map('map').setView([${lat}, ${lng}], 16);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(map);
                        L.marker([${lat}, ${lng}]).addTo(map)
                            .bindPopup('🚌 Bus is here')
                            .openPopup();
                    <\/script>
                </body>
                </html>
            `);
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
