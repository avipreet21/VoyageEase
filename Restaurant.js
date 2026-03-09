const myAPIKey = "d72c2df924ec46a7a3137b290da06e0a";

document.addEventListener("DOMContentLoaded", function() {
    const cityInput = document.getElementById("city");
    const submitButton = document.getElementById("submit_button");
    const restaurantList = document.querySelector(".restaurant_list");
    const infoList = document.querySelector(".info_list");
    let activeButton = null;

    function createMessageItem(message) {
        const item = document.createElement("li");
        item.className = "message_item";
        item.textContent = message;
        return item;
    }

    function setRestaurantMessage(message) {
        restaurantList.innerHTML = "";
        restaurantList.appendChild(createMessageItem(message));
        activeButton = null;
    }

    function setInfoMessage(message) {
        infoList.innerHTML = "";
        infoList.appendChild(createMessageItem(message));
    }

    function createInfoItem(label, value, href) {
        const item = document.createElement("li");
        item.className = "info_item";

        const labelElement = document.createElement("span");
        labelElement.className = "info_label";
        labelElement.textContent = label;
        item.appendChild(labelElement);

        if (href) {
            const link = document.createElement("a");
            link.className = "info_link";
            link.href = href;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = value;
            item.appendChild(link);
        } else {
            item.appendChild(document.createTextNode(value));
        }

        return item;
    }

    function normalizeRestaurant(properties) {
        const raw = properties.datasource && properties.datasource.raw ? properties.datasource.raw : {};
        const cuisines = Array.isArray(raw.cuisine)
            ? raw.cuisine.join(", ")
            : raw.cuisine || "Not available";
        const website = raw.website || properties.website || "";
        const phone = raw.phone || properties.phone || "Not available";
        const openingHours = raw.opening_hours || properties.opening_hours || "Not available";

        return {
            name: properties.name || raw.name || "Unnamed restaurant",
            address: properties.formatted || [properties.address_line1, properties.address_line2].filter(Boolean).join(", ") || "Not available",
            cuisine: cuisines,
            phone: phone,
            website: website,
            openingHours: openingHours,
            coordinates: `${properties.lat?.toFixed(5) || "N/A"}, ${properties.lon?.toFixed(5) || "N/A"}`
        };
    }

    function renderRestaurantInfo(restaurant) {
        infoList.innerHTML = "";
        infoList.appendChild(createInfoItem("Restaurant", restaurant.name));
        infoList.appendChild(createInfoItem("Address", restaurant.address));
        infoList.appendChild(createInfoItem("Cuisine", restaurant.cuisine));
        infoList.appendChild(createInfoItem("Phone", restaurant.phone));
        infoList.appendChild(createInfoItem("Opening Hours", restaurant.openingHours));
        infoList.appendChild(createInfoItem("Website", restaurant.website || "Not available", restaurant.website || ""));
        infoList.appendChild(createInfoItem("Ratings", restaurant.ratings));
    }

    function renderRestaurantChoices(restaurants) {
        restaurantList.innerHTML = "";
        activeButton = null;

        restaurants.forEach(function(restaurant, index) {
            const listItem = document.createElement("li");
            const optionButton = document.createElement("button");

            optionButton.type = "button";
            optionButton.className = "restaurant_option_button";
            optionButton.textContent = `${index + 1}. ${restaurant.name}`;

            optionButton.addEventListener("click", function() {
                if (activeButton) {
                    activeButton.classList.remove("active");
                }

                optionButton.classList.add("active");
                activeButton = optionButton;
                renderRestaurantInfo(restaurant);
            });

            listItem.appendChild(optionButton);
            restaurantList.appendChild(listItem);
        });

        setInfoMessage("Choose a restaurant from the list to view its information.");
    }

    async function fetchRestaurants() {
        const city = cityInput.value.trim();

        if (!city) {
            setRestaurantMessage("Enter a city name to load restaurant options.");
            setInfoMessage("Restaurant details will appear here after you make a selection.");
            return;
        }

        setRestaurantMessage("Loading restaurant options...");
        setInfoMessage("Restaurant details will appear here after you make a selection.");

        try {
            const geocodeResponse = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&limit=1&format=json&apiKey=${myAPIKey}`);

            if (!geocodeResponse.ok) {
                throw new Error("Unable to find the selected city.");
            }

            const geocodeData = await geocodeResponse.json();
            const location = geocodeData.results && geocodeData.results[0];

            if (!location) {
                throw new Error("No city result was returned.");
            }

            const placesUrl = new URL("https://api.geoapify.com/v2/places");
            placesUrl.searchParams.set("categories", "catering.restaurant");
            placesUrl.searchParams.set("filter", `circle:${location.lon},${location.lat},5000`);
            placesUrl.searchParams.set("bias", `proximity:${location.lon},${location.lat}`);
            placesUrl.searchParams.set("limit", "8");
            placesUrl.searchParams.set("apiKey", myAPIKey);

            const placesResponse = await fetch(placesUrl.toString());

            if (!placesResponse.ok) {
                throw new Error("Unable to load restaurants for this city.");
            }

            const placesData = await placesResponse.json();
            const restaurants = (placesData.features || [])
                .map(function(feature) {
                    return normalizeRestaurant(feature.properties || {});
                })
                .filter(function(restaurant) {
                    return restaurant.name && restaurant.address;
                });

            if (restaurants.length === 0) {
                setRestaurantMessage("No restaurant options were found for this city.");
                setInfoMessage("Try another city to load a different set of restaurants.");
                return;
            }

            renderRestaurantChoices(restaurants);
        } catch (error) {
            console.error("Error fetching restaurant data:", error);
            setRestaurantMessage("Unable to load restaurants right now.");
            setInfoMessage("Try again with another city or check your connection.");
        }
    }

    submitButton.addEventListener("click", fetchRestaurants);

    cityInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchRestaurants();
        }
    });

    fetchRestaurants();
});