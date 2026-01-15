const urlParams = new URLSearchParams(window.location.search);
const busId = urlParams.get("bus");

document.getElementById("busNum").innerText = "Bus " + busId;

function startSharing() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    document.getElementById("status").innerText = "Sharing location...";

    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            fetch("http://127.0.0.1:5000/api/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bus_id: busId,
                    lat: lat,
                    lng: lng
                })
            });
        },
        (error) => {
            alert("Location permission denied");
        },
        { enableHighAccuracy: true }
    );
}
