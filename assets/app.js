var activs = [];
var trigdoneS = 0;
var worker = new Worker('assets/checker.js');
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var layerG = L.markerClusterGroup();

function decode(encoded) {
    var points = []
    var index = 0,
        len = encoded.length;
    var lat = 0,
        lng = 0;
    while (index < len) {
        var b, shift = 0,
            result = 0;
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5
        } while (b >= 0x20);
        var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charAt(index++).charCodeAt(0) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5
        } while (b >= 0x20);
        var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        points.push({
            latitude: (lat / 1E5),
            longitude: (lng / 1E5)
        })
    }
    return points
}
const code = new URLSearchParams(window.location.search).get("code");
var token;
if (code) {
    $.post(
        "https://www.strava.com/api/v3/oauth/token", {
            client_id: 45484,
            client_secret: "653fa2a0f7b07383c032015397c86e0959f3ebe9",
            code: code,
            grant_type: "authorization_code"
        },
        function(result) {
            localStorage.setItem("access", result.access_token);
            localStorage.setItem("token", result.refresh_token);
            location.replace("https://whip-curvy-beet.glitch.me");
        }
    );
}
worker.addEventListener('message', function(e) {
    var data = e.data;
    if (data[0] === true) {
        trigdoneS++;
        $("#list").append($("<li>" + data[1] + "✔</li>"));
        var marker = L.marker([data[2], data[3]], {
            icon: greenIcon
        });
    } else {
        $("#list").append($("<li>" + data[1] + "</li>"));
        var marker = L.marker([data[2], data[3]]);
    }
    marker.bindPopup("<h2>" + data[1] + "</h2>");
    layerG.addLayer(marker);
    $("#stats").text(trigdoneS + "/661")
});
if (localStorage.getItem("access")) {
    var access = localStorage.getItem("access");
    $.get(
        "https://www.strava.com/api/v3/athlete/activities?per_page=200", {
            access_token: access
        },
        function(result) {
            layerG.clearLayers();
            result.forEach(function(data) {
                if (data.map.summary_polyline != null) {
                    var tempdecoded = decode(data.map.summary_polyline)
                    tempdecoded.forEach(function(singlede) {
                        singlede.longitude = singlede.longitude;
                        singlede.latitude = singlede.latitude;
                        activs.push(singlede)
                    })
                }
            })
            worker.postMessage(['activs', activs]);
            fetch("https://cdn.glitch.com/dd49ab0c-c778-4839-967f-afbd577da72e%2FWales%20-%20Wales.kml?v=1597669398781")
                .then(response => response.text())
                .then(function(data) {
                    $(data).find("Placemark").each(function(index, value) {
                        var pcoord = $(this).find("coordinates").text();
                        var pname = $(this).find("name").text();
                        worker.postMessage(['test', pcoord, pname]);
                    });
                });
            $.get(
                "https://www.strava.com/api/v3/athlete", {
                    access_token: access
                },
                function(result) {
                    $("#icon").attr("src", result.profile_medium);
                    $("#stravaname").text(result.firstname + " " + result.lastname);
                    $("#loginlink").hide();
                    $("#profile").show();
                });
        })
}

function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("token");
    location.replace("https://whip-curvy-beet.glitch.me");
}
