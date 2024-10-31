const fs = require('fs');
const path = require('path');

const apiUrl = "https://restcountries.com/v3.1/name/";

// Function to fetch country data based on user input
async function fetchCountryByName() {
  const countryInput = document.getElementById("country-input").value.trim();
  if (!countryInput) {
    alert("Please enter a country name.");
    return;
  }

  try {
    const response = await fetch(apiUrl + countryInput);
    if (!response.ok) {
      alert("Country not found. Please try again.");
      return;
    }

    const countryData = await response.json();
    displayCountryDetails(countryData[0]);
    fetchNearbyCountries(countryData[0].borders); // Fetch nearby countries
  } catch (error) {
    console.error("Error fetching country data:", error);
  }
}

// Function to fetch and display nearby countries
async function fetchNearbyCountries(borders) {
  if (!borders || borders.length === 0) {
    document.getElementById("nearby-countries").innerHTML = "<p>No neighboring countries found.</p>";
    return;
  }

  const nearbyCountriesList = await Promise.all(borders.map(async (border) => {
    const response = await fetch(apiUrl + border);
    if (response.ok) {
      const countryData = await response.json();
      return `<li>${countryData[0].name.common}</li>`; // Use common name
    } else {
      return `<li>${border} (not found)</li>`;
    }
  }));

  // Display nearby countries
  const nearbyCountriesElement = document.getElementById("nearby-countries");
  nearbyCountriesElement.innerHTML = `
    <h4>Nearby Countries:</h4>
    <ul>${nearbyCountriesList.join("")}</ul>
  `;
}

// Function to display detailed information for a specific country
function displayCountryDetails(country) {
  const countryDetails = document.getElementById("country-details");
  countryDetails.innerHTML = `
    <h3>${country.name.common}</h3>
    <p><strong>Area:</strong> ${country.area} km²</p>
    <p><strong>Region:</strong> ${country.region}</p>
    <p><strong>Subregion:</strong> ${country.subregion}</p>
    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
    <p><strong>Language(s):</strong> ${Object.values(country.languages || {}).join(", ")}</p>
    <p><strong>Timezone:</strong> ${country.timezones.join(", ")}</p>
    <p><strong>Population:</strong> ${country.population}</p>
    <img src="${country.flags.png}" alt="Flag of ${country.name.common}" width="100">
    <img src="${country.coatOfArms.png}" alt="Coat of Arms of ${country.name.common}" width="100">
  `;
}

// Function to add a new itinerary item and save it to both localStorage and a file
function addToItinerary() {
  const activity = document.getElementById("activity-input").value.trim();
  const date = document.getElementById("date-input").value;
  const time = document.getElementById("time-input").value;

  if (!activity || !date || !time) {
    alert("Please enter all itinerary details.");
    return;
  }

  // Get existing itinerary items from localStorage or initialize an empty array
  const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
  const itineraryItem = { id: Date.now(), activity, date, time };
  itinerary.push(itineraryItem);
  localStorage.setItem("itinerary", JSON.stringify(itinerary));

  // Prepare content for the text file
  const filePath = path.join(__dirname, 'itinerary.txt');
  const itineraryContent = itinerary.map(item => 
    `Activity: ${item.activity}, Date: ${item.date}, Time: ${item.time}`
  ).join("\n");

  // Write to the text file
  fs.writeFile(filePath, itineraryContent, (err) => {
    if (err) {
      console.error("Error saving itinerary to file:", err);
      alert("Failed to save itinerary to file.");
    } else {
      alert("Itinerary item added and saved to file!");
    }
  });

  // Redirect to the itinerary page
  window.location.href = "itinerary.html";
}

// Function to delete an itinerary item
function deleteItineraryItem(id) {
  let itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
  itinerary = itinerary.filter(item => item.id !== id);

  // Update the text file
  const filePath = path.join(__dirname, 'itinerary.txt');
  const itineraryContent = itinerary.map(item => 
    `Activity: ${item.activity}, Date: ${item.date}, Time: ${item.time}`
  ).join("\n");

  fs.writeFile(filePath, itineraryContent, (err) => {
    if (err) {
      console.error("Error updating itinerary file:", err);
      alert("Failed to update itinerary file.");
    } else {
      localStorage.setItem("itinerary", JSON.stringify(itinerary));
      renderItinerary(); // Assuming you have a renderItinerary function
      alert("Itinerary item deleted!");
    }
  });
}

// Function to clear the entire itinerary
function clearItinerary() {
  localStorage.removeItem("itinerary");
  fs.writeFile(path.join(__dirname, 'itinerary.txt'), "", (err) => {
    if (err) {
      console.error("Error clearing itinerary file:", err);
      alert("Failed to clear itinerary from file.");
    } else {
      alert("Itinerary cleared!");
      renderItinerary(); // Assuming you have a renderItinerary function
    }
  });
}

// Attach functions to buttons
document.getElementById("search-btn").addEventListener("click", fetchCountryByName);
document.getElementById("add-itinerary-btn").addEventListener("click", addToItinerary);
document.getElementById("clear-itinerary-btn").addEventListener("click", clearItinerary);
