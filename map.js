document.addEventListener("DOMContentLoaded", function() {
    let latitude;
    let longitude;
    let marker_user;
    let marker1;
    let marker2;
    let lat_arr = [];
    let lon_arr = [];

    const map = L.map('my-map').setView([38.908838755401035, -77.02346458179596], 15);


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            map.setView([latitude, longitude], 12);
        });
    }

    const myAPIKey = "d72c2df924ec46a7a3137b290da06e0a";

    const isRetina = L.Browser.retina;

    const baseUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
    const retinaUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";

    L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
        apiKey: myAPIKey,
        maxZoom: 20,
        id: 'osm-bright'
    }).addTo(map);

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    const autocompleteInput = new autocomplete.GeocoderAutocomplete(
        document.getElementById("autocomplete"),
        myAPIKey,
        {});

    const autocompleteInput2 = new autocomplete.GeocoderAutocomplete(
        document.getElementById("autocomplete2"),
        myAPIKey,
        {});

    const markerIcon = L.icon({
        iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%232ea2ff&size=large&scaleFactor=2&apiKey=${myAPIKey}`,
        iconSize: [38, 56],
        iconAnchor: [19, 51],
        popupAnchor: [0, -60]
    });

    autocompleteInput.on('select', (location) => {
        if (location) {
            if (marker1) {
                marker1.remove();
            }
            marker1 = L.marker([location.properties.lat, location.properties.lon], {
                icon: markerIcon
            }).addTo(map);

            map.panTo([location.properties.lat, location.properties.lon]);
            lat_arr[0] = location.properties.lat;
            lon_arr[0] = location.properties.lon;
        }
    });

    autocompleteInput2.on('select', (location) => {
        if (location) {
            if (marker2) {
                marker2.remove();
            }
            marker2 = L.marker([location.properties.lat, location.properties.lon], {
                icon: markerIcon
            }).addTo(map);

            map.panTo([location.properties.lat, location.properties.lon]);
            lat_arr[1] = location.properties.lat;
            lon_arr[1] = location.properties.lon;
        }
    });

    document.getElementById("onroute").onclick = function() {
        const fromWaypoint = [lat_arr[0], lon_arr[0]];
        const toWaypoint = [lat_arr[1], lon_arr[1]];

        fetch(`https://api.geoapify.com/v1/routing?waypoints=${fromWaypoint.join(',')}|${toWaypoint.join(',')}&mode=drive&apiKey=${myAPIKey}`)
            .then(res => res.json())
            .then(result => {
                L.geoJSON(result, {
                    style: (feature) => {
                        return {
                            color: "rgba(20, 137, 255, 0.7)",
                            weight: 5
                        };
                    }
                }).bindPopup((layer) => {
                    return `${layer.feature.properties.distance} ${layer.feature.properties.distance_units}, ${layer.feature.properties.time}`
                }).addTo(map);

                const turnByTurns = [];
                result.features.forEach(feature => feature.properties.legs.forEach((leg, legIndex) => leg.steps.forEach(step => {
                    const pointFeature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": feature.geometry.coordinates[legIndex][step.from_index]
                        },
                        "properties": {
                            "instruction": step.instruction.text
                        }
                    }
                    turnByTurns.push(pointFeature);
                })));

                L.geoJSON({
                    type: "FeatureCollection",
                    features: turnByTurns
                }, {
                    pointToLayer: function(feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: 5,
                            fillColor: "#fff",
                            color: "#555",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 1
                        });
                    }
                }).bindPopup((layer) => {
                    return `${layer.feature.properties.instruction}`
                }).addTo(map);

            }).catch(error => console.log(error));
    }

    document.getElementById("restart").onclick = function() {
        document.querySelectorAll('.geoapify-autocomplete-input').forEach(function(input) {
            input.value = '';
        });

        var inputElement = document.querySelector('#autocomplete .geoapify-autocomplete-input');
        inputElement.placeholder = "Enter an address here";

        lat_arr = [];
        lon_arr = [];

        if (marker1) {
            marker1.remove();
        }
        if (marker2) {
            marker2.remove();
        }

        map.eachLayer(function(layer) {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });
    }
    const usermarker = L.icon({
        iconUrl: 'icons/my location.png',
        iconSize: [38, 56], // Adjust the size if needed
        iconAnchor: [19, 51], // Adjust the anchor point if needed
        popupAnchor: [0, -60] // Adjust the popup anchor if needed
    });

    function updateUserLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        });
        if (latitude !== undefined && longitude !== undefined) {
            if (marker_user) {
                marker_user.setLatLng([latitude, longitude]);
            } else {
                marker_user = L.marker([latitude, longitude], {
                    icon: usermarker
                }).addTo(map);
            }
        }
    }

    var intervalId; // Declare a variable to hold the interval ID
    
    function updateUserview() {
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            map.setView([latitude, longitude], 25); // Set view inside the callback
        });
    }
    
    locationToggle.addEventListener('change', function() {
        if (this.checked) {
            // If toggle is checked, update map to current location every 3 seconds
            updateUserview();
            intervalId = setInterval(updateUserview, 3000); // Store the interval ID
        } else {
            // If toggle is unchecked, stop updating map
            clearInterval(intervalId); // Clear the interval using the stored ID
            map.setView([latitude, longitude], 12);
        }
    }); 

    document.getElementById("my_location").onclick = function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        });
        if (latitude !== undefined && longitude !== undefined)  {
            if (marker1) {
                marker1.remove();
            }
            marker1 = L.marker([latitude,longitude], {
                icon: markerIcon
            }).addTo(map);

            map.panTo([latitude,longitude]);
            lat_arr[0] = latitude;
            lon_arr[0] = longitude;
            var inputElement = document.querySelector('#autocomplete .geoapify-autocomplete-input');
            inputElement.placeholder = "My location";
        }
        
    }
   
    updateUserLocation();
    setInterval(updateUserLocation, 5000);
});

