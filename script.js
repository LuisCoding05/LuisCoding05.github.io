// DOM Elements
const elements = {
    characters: {
        prevButton: document.getElementById("PreviousCharacters"),
        initButton: document.getElementById("InitialCharacters"),
        nextButton: document.getElementById("nextCharacters"),
        lastButton: document.getElementById("LastCharacters"),
        filterForm: document.getElementById("filterCharacters"),
        paginationInput: document.getElementById("paginacion"),
        errorText: document.getElementById("numePersonajes"),
        list: document.getElementById("character-list"),
        filteredList: document.getElementById("characters-filtred")
    },
    planets: {
        prevButton: document.getElementById("PreviousPlanets"),
        initButton: document.getElementById("InitialPlanets"),
        nextButton: document.getElementById("nextPlanets"),
        lastButton: document.getElementById("LastPlanets"),
        filterForm: document.getElementById("filterPlanets"),
        paginationInput: document.getElementById("paginacionPlanetas"),
        errorText: document.getElementById("numePlanetas"),
        list: document.getElementById("planet-list"),
        filteredList: document.getElementById("planets-filtred")
    }
};

// Custom images for specific transformations
const customImages = {
    "Vegetto SSJ": "../img/Vegetto_ssj.webp",
    "Trunks SSJ2": "../img/Ssj2Trunks.png"
};

// Generic fetch function for both characters and planets
async function fetchById(type, id) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/${type}/${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return null;
    }
}

// Update pagination button URLs
function updateButtonUrls(type, links) {
    const buttons = elements[type];
    buttons.prevButton.dataset[type] = links.previous || links.first;
    buttons.nextButton.dataset[type] = links.next || links.last;
    buttons.initButton.dataset[type] = links.first;
    buttons.lastButton.dataset[type] = links.last;
}

// Fetch items (characters or planets) from URL
async function fetchItems(type, url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        const items = data.items;
        updateButtonUrls(type, data.links);
        if (Array.isArray(items)) {
            displayItems(type, items);
        } else {
            console.error(`Expected an array of ${type}`);
        }
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
}

// Create basic card elements with proper styling
function createCardElements(item, type) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `${type}-card`;

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    
    const imageElement = document.createElement('img');
    imageElement.className = `${type}-img`;
    imageElement.classList.add("fade-in");
    imageElement.src = item.image;
    imageElement.alt = item.name;

    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'description-container';
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = item.description;
    descriptionContainer.appendChild(descriptionElement);

    return { cardDiv, nameElement, imageElement, descriptionContainer };
}

// Display characters with transformations
async function displayCharacter(character) {
    const cardElements = createCardElements(character, 'character');
    const { cardDiv, nameElement, imageElement, descriptionContainer } = cardElements;

    const characteristicsDiv = document.createElement('div');
    characteristicsDiv.classList.add('characteristics-div');

    // Add basic characteristics with proper styling
    const characteristics = {
        "Raza": character.race,
        "Género": character.gender,
        "Ki": character.ki,
        "Afiliación": character.affiliation,
        "Máximo poder": character.maxKi
    };

    Object.entries(characteristics).forEach(([label, value]) => {
        const element = document.createElement('p');
        element.innerHTML = `<span class="characteristics yellow">${label}:</span> <span class="characteristics">${value}</span>`;
        characteristicsDiv.appendChild(element);
    });

    // Handle transformations
    const transformationsContainer = document.createElement('div');
    transformationsContainer.className = 'transformations';
    const fullCharacter = await fetchById('characters', character.id);

    if (fullCharacter?.transformations?.length > 0) {
        // Base form button
        const baseButton = document.createElement('button');
        baseButton.className = 'transformation-btn original-btn';
        baseButton.textContent = 'Forma base';
        baseButton.addEventListener('click', () => updateTransformation(imageElement, character.image, character.ki, characteristicsDiv));
        transformationsContainer.appendChild(baseButton);

        // Transformation buttons
        fullCharacter.transformations.forEach(transformation => {
            const button = document.createElement('button');
            button.className = 'transformation-btn';
            button.textContent = transformation.name;
            button.addEventListener('click', () => {
                const transformationImage = customImages[transformation.name] || transformation.image;
                updateTransformation(imageElement, transformationImage, transformation.ki, characteristicsDiv);
            });
            transformationsContainer.appendChild(button);
        });
    } else {
        const noTransformationsMessage = document.createElement('p');
        noTransformationsMessage.className = "characteristics";
        noTransformationsMessage.textContent = 'Sin transformaciones conocidas';
        transformationsContainer.appendChild(noTransformationsMessage);
    }

    characteristicsDiv.appendChild(transformationsContainer);
    appendElements(cardDiv, [nameElement, imageElement, descriptionContainer, characteristicsDiv]);
    return cardDiv;
}

// Display planets with inhabitants
async function displayPlanet(planet) {
    const cardElements = createCardElements(planet, 'planet');
    const { cardDiv, nameElement, imageElement, descriptionContainer } = cardElements;

    const characteristicsDiv = document.createElement('div');
    characteristicsDiv.classList.add('characteristics-div');

    const isDestroyedElement = document.createElement('p');
    isDestroyedElement.innerHTML = `<span class="characteristics yellow">Destruido:</span> <span class="characteristics">${planet.isDestroyed ? 'Sí' : 'No'}</span>`;
    characteristicsDiv.appendChild(isDestroyedElement);

    const fullPlanet = await fetchById('planets', planet.id);
    if (fullPlanet?.characters?.length > 0) {
        const characterContainer = document.createElement('div');
        characterContainer.className = 'habitants-container';
        fullPlanet.characters.forEach(character => {
            const characterElement = document.createElement('p');
            characterElement.textContent = character.name;
            characterContainer.appendChild(characterElement);
        });
        characteristicsDiv.appendChild(characterContainer);
    } else {
        const noCharactersMessage = document.createElement('p');
        noCharactersMessage.className = "characteristics yellow";
        noCharactersMessage.textContent = 'Sin personajes conocidos';
        characteristicsDiv.appendChild(noCharactersMessage);
    }

    appendElements(cardDiv, [nameElement, imageElement, descriptionContainer, characteristicsDiv]);
    return cardDiv;
}

// Generic display function for both types
async function displayItems(type, items, filtered = false) {
    const container = filtered ? elements[type].filteredList : elements[type].list;
    container.innerHTML = '';

    const displayFunction = type === 'characters' ? displayCharacter : displayPlanet;
    const displayPromises = items.map(item => displayFunction(item));

    const cards = await Promise.all(displayPromises);
    cards.forEach(card => container.appendChild(card));
    console.log(`All ${type} cards have been rendered.`);
}

// Helper function to append multiple elements
function appendElements(parent, elements) {
    elements.forEach(element => parent.appendChild(element));
}

// Update transformation image with animation
function updateTransformation(imageElement, newImage, newKi, characteristicsDiv) {
    imageElement.classList.add('fade-out');
    imageElement.addEventListener('animationend', () => {
        imageElement.src = newImage;
        imageElement.onload = () => {
            imageElement.classList.remove('fade-out');
            imageElement.classList.add('fade-in');
            imageElement.addEventListener('animationend', () => {
                imageElement.classList.remove('fade-in');
            }, { once: true });
        };

        // Update Ki display
        const kiElement = characteristicsDiv.querySelector('p:nth-child(3)');
        if (kiElement) {
            kiElement.innerHTML = `<span class="characteristics yellow">Ki:</span> <span class="characteristics">${newKi}</span>`;
        }
    }, { once: true });
}

// Handle pagination limits
function handlePagination(type) {
    const { paginationInput, errorText, list } = elements[type];
    const value = parseInt(paginationInput.value);
    list.innerHTML = '';

    let limit;
    if (value > 10) {
        errorText.textContent = `La paginación máxima es de 10 ${type}`;
        limit = 10;
    } else if (value < 1) {
        errorText.textContent = `Debe de haber al menos un ${type.slice(0, -1)}`;
        limit = 1;
    } else {
        errorText.textContent = '';
        limit = value;
    }

    fetchItems(type, `https://dragonball-api.com/api/${type}?page=1&limit=${limit}`);
}

// Handle search form submission
function handleSearch(type, e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = new URLSearchParams();
    let hasFilters = false;

    formData.forEach((value, key) => {
        if (value) {
            // Handle special case for planet-name
            const paramKey = key === 'planet-name' ? 'name' : key;
            params.append(paramKey, value);
            hasFilters = true;
        }
    });

    if (!hasFilters) {
        showNoItemsFoundMessage(type, "Los filtros están vacíos. Por favor, ingresa algún criterio.");
        return;
    }

    const url = `https://dragonball-api.com/api/${type}?${params.toString()}`;
    console.log("Search URL:", url);
    fetchFilteredItems(type, url);
}

// Fetch filtered items
async function fetchFilteredItems(type, url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            displayItems(type, data, true);
        } else {
            showNoItemsFoundMessage(type);
        }
    } catch (error) {
        console.error(`Error fetching filtered ${type}:`, error);
        showNoItemsFoundMessage(type);
    }
}

// Show no items found message
function showNoItemsFoundMessage(type, message = `No se encontraron ${type} con los filtros seleccionados`) {
    const container = elements[type].filteredList;
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    container.innerHTML = '';
    container.appendChild(errorMessage);
}

// Initialize event listeners
function initializeEventListeners() {
    ['characters', 'planets'].forEach(type => {
        // Pagination buttons
        const buttons = [
            elements[type].prevButton,
            elements[type].initButton,
            elements[type].nextButton,
            elements[type].lastButton
        ];

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                fetchItems(type, e.target.dataset[type]);
            });
        });

        // Pagination input
        elements[type].paginationInput.addEventListener('input', () => handlePagination(type));

        // Filter form
        elements[type].filterForm.addEventListener('submit', (e) => handleSearch(type, e));
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchItems('characters', 'https://dragonball-api.com/api/characters?page=1&limit=4');
    fetchItems('planets', 'https://dragonball-api.com/api/planets?page=1&limit=4');
    initializeEventListeners();
});