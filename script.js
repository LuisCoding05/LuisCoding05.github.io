
let initial = true;
// Common controller and element references
const controllers = {
    main: null,
    filter: null
};

// Special image cases for broken/missing images
const specialImages = {
    'Vegetto SSJ': '../img/Vegetto_ssj.webp',
    'Trunks SSJ2': '../img/Ssj2Trunks.png'
};

// DOM Elements object for centralized reference management
const elements = {
    characters: {
        list: document.getElementById('character-list'),
        filteredList: document.getElementById('characters-filtred'),
        pagination: {
            prev: document.getElementById("PreviousCharacters"),
            init: document.getElementById("InitialCharacters"),
            next: document.getElementById("nextCharacters"),
            last: document.getElementById("LastCharacters")
        },
        paginationInput: document.getElementById("paginacion"),
        errorDisplay: document.getElementById("numePersonajes"),
        filterForm: document.getElementById("filterCharacters")
    },
    planets: {
        list: document.getElementById('planet-list'),
        filteredList: document.getElementById('planets-filtred'),
        pagination: {
            prev: document.getElementById("PreviousPlanets"),
            init: document.getElementById("InitialPlanets"),
            next: document.getElementById("nextPlanets"),
            last: document.getElementById("LastPlanets")
        },
        paginationInput: document.getElementById("paginacionPlanetas"),
        errorDisplay: document.getElementById("numePlanetas"),
        filterForm: document.getElementById("filterPlanets")
    }
};

// Common fetch function for both entities
async function fetchData(url, type, isFiltered = false) {
    // Cancel previous request if exists
    if (controllers[isFiltered ? 'filter' : 'main'] && !initial) {
        controllers[isFiltered ? 'filter' : 'main'].abort();
    }
    controllers[isFiltered ? 'filter' : 'main'] = new AbortController();

    try {
        const response = await fetch(url, { signal: controllers[isFiltered ? 'filter' : 'main'].signal });
        const data = await response.json();
        
        if (isFiltered) {
            if (Array.isArray(data) && data.length > 0) {
                await displayItems(data, type, true);
            } else {
                showNoItemsFoundMessage(type);
            }
        } else {
            const items = data.items;
            updatePaginationUrls(data.links, type);
            if (Array.isArray(items)) {
                await displayItems(items, type);
            }
        }
    } catch (error) {
        handleFetchError(error, isFiltered, type);
    }
}

// Fetch detailed item data by ID
async function fetchItemById(id, type) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/${type.toLowerCase()}/${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${type.toLowerCase()} details:`, error);
        return null;
    }
}

// Update pagination button URLs
function updatePaginationUrls(links, type) {
    const buttons = elements[type.toLowerCase()].pagination;
    const dataAttribute = type.toLowerCase();
    
    buttons.prev.dataset[dataAttribute] = links.previous || links.first;
    buttons.next.dataset[dataAttribute] = links.next || links.last;
    buttons.init.dataset[dataAttribute] = links.first;
    buttons.last.dataset[dataAttribute] = links.last;
}

// Display items (characters or planets)
async function displayItems(items, type, filtered = false) {
    const container = filtered ? 
        elements[type.toLowerCase()].filteredList : 
        elements[type.toLowerCase()].list;
    container.innerHTML = '';

    const renderPromises = items.map(async (item) => {
        const itemCard = createBasicCard(item, type);
        
        if (type === 'Characters') {
            await enhanceCharacterCard(itemCard, item);
        } else if (type === 'Planets') {
            await enhancePlanetCard(itemCard, item);
        }
        
        container.appendChild(itemCard);
    });

    await Promise.all(renderPromises);
}

// Create basic card structure
function createBasicCard(item, type) {
    const card = document.createElement('div');
    card.className = `${type.toLowerCase().slice(0, -1)}-card`;

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    card.appendChild(nameElement);

    const imageElement = document.createElement('img');
    imageElement.className = `${type.toLowerCase().slice(0, -1)}-img fade-in`;
    imageElement.src = item.image;
    imageElement.alt = item.name;
    card.appendChild(imageElement);

    const descContainer = document.createElement('div');
    descContainer.className = 'description-container';
    const description = document.createElement('p');
    description.textContent = item.description;
    descContainer.appendChild(description);
    card.appendChild(descContainer);

    return card;
}

// Enhance character card with specific details
async function enhanceCharacterCard(card, character) {
    const characteristicsDiv = document.createElement('div');
    characteristicsDiv.classList.add('characteristics-div');

    // Add basic characteristics
    const characteristics = {
        'Raza': character.race,
        'Género': character.gender,
        'Ki': character.ki,
        'Afiliación': character.affiliation,
        'Máximo poder': character.maxKi
    };

    Object.entries(characteristics).forEach(([label, value]) => {
        const element = document.createElement('p');
        element.innerHTML = `<span class="characteristics yellow">${label}:</span> <span class="characteristics">${value}</span>`;
        characteristicsDiv.appendChild(element);
    });

    // Add transformations container
    const transformationsContainer = document.createElement('div');
    transformationsContainer.className = 'transformations';
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading-transformations';
    loadingMessage.textContent = 'Cargando transformaciones...';
    transformationsContainer.appendChild(loadingMessage);

    characteristicsDiv.appendChild(transformationsContainer);
    card.appendChild(characteristicsDiv);

    // Fetch and add transformations
    const fullCharacter = await fetchItemById(character.id, 'Characters');
    transformationsContainer.innerHTML = '';

    if (fullCharacter && fullCharacter.transformations.length > 0) {
        // Add base form button
        const originalButton = createTransformationButton('Forma base', character.image, character.ki);
        transformationsContainer.appendChild(originalButton);

        // Add transformation buttons
        fullCharacter.transformations.forEach(transformation => {
            const transformationButton = createTransformationButton(
                transformation.name,
                specialImages[transformation.name] || transformation.image,
                transformation.ki
            );
            transformationsContainer.appendChild(transformationButton);
        });
    } else {
        const noTransformationsMessage = document.createElement('p');
        noTransformationsMessage.className = "characteristics";
        noTransformationsMessage.textContent = 'Sin transformaciones conocidas';
        transformationsContainer.appendChild(noTransformationsMessage);
    }

    function createTransformationButton(name, imageUrl, ki) {
        const button = document.createElement('button');
        button.className = name === 'Forma base' ? 'transformation-btn original-btn' : 'transformation-btn';
        button.textContent = name;
        
        button.addEventListener('click', () => {
            const imageElement = card.querySelector('img');
            const kiElement = characteristicsDiv.querySelector('p:nth-child(3)');
            
            kiElement.innerHTML = `<span class="characteristics yellow">Ki:</span> <span class="characteristics">${ki}</span>`;
            imageElement.classList.add('fade-out');

            imageElement.addEventListener('animationend', () => {
                imageElement.src = imageUrl;
                imageElement.onload = () => {
                    imageElement.classList.remove('fade-out');
                    imageElement.classList.add('fade-in');
                    imageElement.addEventListener('animationend', () => {
                        imageElement.classList.remove('fade-in');
                    }, { once: true });
                };
            }, { once: true });
        });

        return button;
    }
}

// Enhance planet card with specific details
async function enhancePlanetCard(card, planet) {
    const characteristicsDiv = document.createElement('div');
    characteristicsDiv.classList.add('characteristics-div');

    // Add destruction status
    const isDestroyedElement = document.createElement('p');
    isDestroyedElement.innerHTML = `<span class="characteristics yellow">Destruido:</span> <span class="characteristics">${planet.isDestroyed ? 'Sí' : 'No'}</span>`;
    characteristicsDiv.appendChild(isDestroyedElement);
    card.appendChild(characteristicsDiv);

    // Fetch and add inhabitants
    const fullPlanet = await fetchItemById(planet.id, 'Planets');
    if (fullPlanet && fullPlanet.characters.length > 0) {
        const characterContainer = document.createElement('div');
        characterContainer.className = 'habitants-container';
        fullPlanet.characters.forEach(character => {
            const characterElement = document.createElement('p');
            characterElement.textContent = character.name;
            characterContainer.appendChild(characterElement);
        });
        card.appendChild(characterContainer);
    } else {
        const noCharactersMessage = document.createElement('p');
        noCharactersMessage.className = "characteristics yellow";
        noCharactersMessage.textContent = 'Sin personajes conocidos';
        card.appendChild(noCharactersMessage);
    }
}

// Handle filter form submission
function handleFilter(e, type) {
    const formData = new FormData(e.target.form);
    const filters = {};
    
    // Get filter values based on type
    if (type === 'Characters') {
        filters.name = formData.get('name');
        filters.gender = formData.get('gender');
        filters.race = formData.get('race');
        filters.affiliation = formData.get('affiliation');
    } else {
        filters.name = formData.get('planet-name');
        filters.isDestroyed = formData.get('isDestroyed');
    }

    // Check if all filters are empty
    if (Object.values(filters).every(value => !value)) {
        showNoItemsFoundMessage(type, true);
        return;
    }

    // Build filter URL
    let url = `https://dragonball-api.com/api/${type.toLowerCase()}?`;
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            url += `${key}=${encodeURIComponent(value)}&`;
        }
    });
    url = url.slice(0, -1);

    fetchData(url, type, true);
}

// Show message when no items are found
function showNoItemsFoundMessage(type, isEmpty = false) {
    const container = elements[type.toLowerCase()].filteredList;
    const message = isEmpty ? 
        "Los filtros están vacíos. Por favor, ingresa algún criterio." :
        `No se encontraron ${type.toLowerCase()} con los filtros seleccionados`;
    
    container.innerHTML = `<p class="main__text">${message}</p>`;
}

// Handle fetch errors
function handleFetchError(error, isFiltered, type) {
    if (error.name === "AbortError") {
        console.log(`Solicitud de ${isFiltered ? 'filtrado de ' : ''}${type.toLowerCase()} cancelada`);
        return;
    }
    console.error(`Error fetching ${type.toLowerCase()}:`, error);
    if (isFiltered) {
        showNoItemsFoundMessage(type);
    }
}

// Handle pagination input changes
function handlePaginationInput(type) {
    const { paginationInput, errorDisplay, list } = elements[type.toLowerCase()];
    list.innerHTML = '';
    
    const value = parseInt(paginationInput.value);
    let limit;

    if (value > 10) {
        errorDisplay.classList.add('main__text');
        errorDisplay.textContent = `La paginación máxima es de 10 ${type.toLowerCase()}`;
        limit = 10;
    } else if (value < 1) {
        errorDisplay.classList.add('main__text');
        errorDisplay.textContent = `Debe de haber al menos un ${type.slice(0, -1).toLowerCase()}`;
        limit = 1;
    } else {
        errorDisplay.textContent = '';
        limit = value;
    }

    fetchData(`https://dragonball-api.com/api/${type.toLowerCase()}?page=1&limit=${limit}`, type);
}

// Initialize event listeners
function initializeEventListeners() {
    ['Characters', 'Planets'].forEach(type => {
        const typeElements = elements[type.toLowerCase()];
        
        // Pagination buttons
        Object.values(typeElements.pagination).forEach(button => {
            button.addEventListener('click', (e) => {
                const url = e.target.dataset[type.toLowerCase()];
                fetchData(url, type);
            });
        });
        // Pagination input
        typeElements.paginationInput.addEventListener('input', () => handlePaginationInput(type));

        // Filter form
        typeElements.filterForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => handleFilter(e, type));
        });

        typeElements.filterForm.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => handleFilter(e, type));
        });
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    fetchData('https://dragonball-api.com/api/characters?page=1&limit=4', 'Characters');
    fetchData('https://dragonball-api.com/api/planets?page=1&limit=4', 'Planets');
    initializeEventListeners();
    initial = false;
});