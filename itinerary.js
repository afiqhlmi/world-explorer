const fs = require('fs');
const path = require('path');

function addToItinerary() {
    const activity = document.getElementById("activity-input").value.trim();
    const date = document.getElementById("date-input").value;
    const time = document.getElementById("time-input").value;

    if (!activity || !date || !time) {
        alert("Please enter all itinerary details.");
        return;
    }

    const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    const itineraryItem = { id: Date.now(), activity, date, time };
    itinerary.push(itineraryItem);
    localStorage.setItem("itinerary", JSON.stringify(itinerary));

    saveItineraryToFile(itinerary);
    clearInputFields();
    alert("Itinerary item added!"); // Notify the user
    renderItinerary(); // Render after confirmation
}

function saveItineraryToFile(itinerary) {
    const filePath = path.join(__dirname, 'itinerary.txt');
    const itineraryContent = itinerary.map(item =>
        `Activity: ${item.activity}, Date: ${item.date}, Time: ${item.time}`
    ).join("\n");

    fs.writeFile(filePath, itineraryContent, (err) => {
        if (err) {
            console.error("Error saving itinerary to file:", err);
            alert("Failed to save itinerary to file.");
        }
    });
}

function deleteItineraryItem(id) {
    let itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    itinerary = itinerary.filter(item => item.id !== id);
    localStorage.setItem("itinerary", JSON.stringify(itinerary));

    saveItineraryToFile(itinerary);
    alert("Itinerary item deleted!");
    renderItinerary(); // Render after deletion
}

function editItineraryItem(id) {
    const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    const itemToEdit = itinerary.find(item => item.id === id);

    if (itemToEdit) {
        document.getElementById("activity-input").value = itemToEdit.activity;
        document.getElementById("date-input").value = itemToEdit.date;
        document.getElementById("time-input").value = itemToEdit.time;
        document.getElementById("edit-id").value = itemToEdit.id;

        document.getElementById("add-itinerary-btn").style.display = 'none';
        document.getElementById("update-itinerary-btn").style.display = 'inline-block';
    }
}

function updateItineraryItem() {
    const id = document.getElementById("edit-id").value;
    const activity = document.getElementById("activity-input").value.trim();
    const date = document.getElementById("date-input").value;
    const time = document.getElementById("time-input").value;

    if (!activity || !date || !time) {
        alert("Please enter all itinerary details.");
        return;
    }

    let itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    itinerary = itinerary.map(item => {
        if (item.id === parseInt(id)) {
            return { id: item.id, activity, date, time };
        }
        return item;
    });

    localStorage.setItem("itinerary", JSON.stringify(itinerary));
    saveItineraryToFile(itinerary);

    clearInputFields();
    alert("Itinerary item updated!"); // Notify the user
    renderItinerary(); // Render after update

    document.getElementById("add-itinerary-btn").style.display = 'inline-block';
    document.getElementById("update-itinerary-btn").style.display = 'none';
}

function clearInputFields() {
    document.getElementById("activity-input").value = '';
    document.getElementById("date-input").value = '';
    document.getElementById("time-input").value = '';
    document.getElementById("edit-id").value = '';
}

function renderItinerary() {
    const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    const itineraryList = document.getElementById("itinerary-list");
    itineraryList.innerHTML = '';

    if (itinerary.length === 0) {
        itineraryList.style.display = 'none'; // Hide if no items
        return;
    }

    itinerary.forEach(item => {
        const itineraryItem = document.createElement("div");
        itineraryItem.className = "itinerary-item";
        itineraryItem.innerHTML = `
            <h4>${item.activity}</h4>
            <p><strong>Date:</strong> ${item.date}</p>
            <p><strong>Time:</strong> ${item.time}</p>
            <button onclick="editItineraryItem(${item.id})">Edit</button>
            <button onclick="deleteItineraryItem(${item.id})">Delete</button>
        `;
        itineraryList.appendChild(itineraryItem);
    });

    itineraryList.style.display = 'block'; // Show when there are items
}

function searchItinerary() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const itinerary = JSON.parse(localStorage.getItem("itinerary")) || [];
    
    if (!query) {
        alert("Please enter a search term.");
        return;
    }

    const filteredItinerary = itinerary.filter(item =>
        item.activity.toLowerCase().includes(query)
    );
    
    if (filteredItinerary.length === 0) {
        alert("No results found."); // Notify if no results
    } else {
        alert(`${filteredItinerary.length} result(s) found.`); // Notify the number of results
    }
    
    renderSearchResults(filteredItinerary);
}

function renderSearchResults(results) {
    const searchResults = document.getElementById("search-results");
    searchResults.innerHTML = '';

    results.forEach(item => {
        const resultItem = document.createElement("div");
        resultItem.className = "itinerary-item"; 
        resultItem.innerHTML = `
            <h4>${item.activity}</h4>
            <p><strong>Date:</strong> ${item.date}</p>
            <p><strong>Time:</strong> ${item.time}</p>
        `;
        searchResults.appendChild(resultItem);
    });
}

// Event listeners
document.getElementById("add-itinerary-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to add this activity to your itinerary?")) {
        addToItinerary();
    }
});

document.getElementById("update-itinerary-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to update this activity in your itinerary?")) {
        updateItineraryItem();
    }
});

document.getElementById("clear-itinerary-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the entire itinerary?")) {
        localStorage.removeItem("itinerary");
        fs.writeFile(path.join(__dirname, 'itinerary.txt'), "", (err) => {
            if (err) {
                console.error("Error clearing itinerary file:", err);
                alert("Failed to clear itinerary from file.");
            } else {
                renderItinerary();
                alert("Itinerary cleared!");
            }
        });
    }
});

document.getElementById("search-itinerary-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to search for this activity?")) {
        searchItinerary();
    }
});

window.onload = renderItinerary;
