// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find key DOM elements
const fetchButton = document.getElementById('fetch-button');
const gallery = document.getElementById('gallery');

// Add a fun fact container above the gallery if it doesn't exist
let funFactContainer = document.getElementById('fun-fact');
if (!funFactContainer) {
    funFactContainer = document.createElement('div');
    funFactContainer.id = 'fun-fact';
    // Insert the fun fact container just before the gallery
    const galleryElement = document.getElementById('gallery');
    galleryElement.parentNode.insertBefore(funFactContainer, galleryElement);
}

// Array of random space facts
const spaceFacts = [
    "🌌 Did you know? Space smells like seared steak, hot metal, and welding fumes.",
    "🪐 Saturn could float in water because it’s mostly made of gas.",
    "🚀 The Sun accounts for 99.86% of the mass in our solar system.",
    "🌑 A day on Venus is longer than a year on Venus!",
    "🛰 The International Space Station travels at 17,500 mph.",
    "🌠 There are more stars in the universe than grains of sand on Earth.",
    "👽 NASA is studying Mars for signs of ancient microbial life."
];

// Show a random fun fact on page load
function showRandomFunFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    funFactContainer.textContent = spaceFacts[randomIndex];
}
showRandomFunFact();

// Create modal elements
const modal = document.createElement('div');
modal.id = 'modal';
modal.innerHTML = `
  <div id="modal-content">
    <span id="modal-close">&times;</span>
    <div id="modal-media"></div>
    <h2 id="modal-title"></h2>
    <p id="modal-date"></p>
    <p id="modal-description"></p>
  </div>
`;
document.body.appendChild(modal);

// Close modal on click
document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Listen for button click
fetchButton.addEventListener('click', () => {
    const startDate = startInput.value;
    const endDate = endInput.value;

    // Validate dates
    if (!startDate || !endDate) {
        alert('Please select both a start and end date.');
        return;
    }

    // Show loading message before fetching
    gallery.innerHTML = '<p class="loading">🔄 Loading space photos…</p>';

    // Fetch APOD data
    fetchAPODs(startDate, endDate);
});

async function fetchAPODs(startDate, endDate) {
    const apiKey = 'DEMO_KEY'; // Replace with your NASA API key if you have one
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Sort the data by date ascending
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Display the gallery
        displayGallery(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        gallery.innerHTML = `<p style="color: red;">Error fetching photos: ${error.message}</p>`;
    }
}

function displayGallery(apodList) {
    // Clear existing gallery content
    gallery.innerHTML = '';

    // If no items, show a message
    if (apodList.length === 0) {
        gallery.innerHTML = '<p>No photos found for the selected date range.</p>';
        return;
    }

    // Loop through each APOD (Astronomy Picture of the Day) item
    apodList.forEach(apod => {
        // Create a container for each gallery item
        const item = document.createElement('div');
        item.classList.add('apod-item');

        // Create media element (image or video)
        let mediaElement;
        if (apod.media_type === 'video') {
            // If it's a YouTube or Vimeo video, embed it
            if (apod.url.includes('youtube.com') || apod.url.includes('youtu.be') || apod.url.includes('vimeo.com')) {
                mediaElement = document.createElement('iframe');
                mediaElement.src = apod.url;
                mediaElement.allowFullscreen = true;
                mediaElement.width = "100%";
                mediaElement.height = "200";
            } else {
                // Otherwise, show a clickable link
                mediaElement = document.createElement('a');
                mediaElement.href = apod.url;
                mediaElement.target = "_blank";
                mediaElement.textContent = "🎥 Click to view video";
                mediaElement.classList.add('video-link');
            }
        } else {
            // If it's an image, use an img tag
            mediaElement = document.createElement('img');
            mediaElement.src = apod.url;
            mediaElement.alt = apod.title;
        }

        // Add click listener to open modal with more info
        item.addEventListener('click', () => openModal(apod));

        // Create title element
        const title = document.createElement('h3');
        title.textContent = apod.title;

        // Create date element
        const date = document.createElement('p');
        date.textContent = `📅 ${apod.date}`;
        date.classList.add('apod-date');

        // Add media, title, and date to the item container
        item.appendChild(mediaElement);
        item.appendChild(title);
        item.appendChild(date);

        // Add the item to the gallery
        gallery.appendChild(item);
    });
}

function openModal(apod) {
    const modalMedia = document.getElementById('modal-media');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalDescription = document.getElementById('modal-description');

    modalMedia.innerHTML = '';

    // Add media (image or video)
    if (apod.media_type === 'video') {
        if (apod.url.includes('youtube.com') || apod.url.includes('youtu.be') || apod.url.includes('vimeo.com')) {
            const video = document.createElement('iframe');
            video.src = apod.url;
            video.allowFullscreen = true;
            video.width = "100%";
            video.height = "400";
            modalMedia.appendChild(video);
        } else {
            const link = document.createElement('a');
            link.href = apod.url;
            link.textContent = "🎥 Click here to view video";
            link.target = "_blank";
            modalMedia.appendChild(link);
        }
    } else {
        const img = document.createElement('img');
        img.src = apod.hdurl || apod.url;
        img.alt = apod.title;
        img.style.width = '100%';
        modalMedia.appendChild(img);
    }

    modalTitle.textContent = apod.title;
    modalDate.textContent = `📅 ${apod.date}`;
    modalDescription.textContent = apod.explanation;

    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}
