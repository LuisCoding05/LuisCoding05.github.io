
let initial = true;
const translations = {
    filters: {
        characters: {
            name: "Nombre",
            gender: {
                label: "Género",
                options: {
                    Male: "Masculino",
                    Female: "Femenino",
                    Unknown: "Desconocido"
                }
            },
            race: {
                label: "Raza",
                options: {
                    Human: "Humano",
                    Saiyan: "Saiyan",
                    Namekian: "Namekiano",
                    Majin: "Majin",
                    "Frieza Race": "Raza Frieza",
                    Android: "Androide",
                    "Jiren Race": "Raza Jiren",
                    "God Angel": "Ángel Divino",
                    Evil: "Maligno",
                    Nucleico: "Nucleico",
                    "Nucleico benigno": "Nucleico Benigno",
                    Unknown: "Desconocido"
                }
            },
            affiliation: {
                label: "Afiliación",
                options: {
                    "Z Fighter": "Guerrero Z",
                    "Red Ribbon Army": "Ejército de la Cinta Roja",
                    "Namekian Warrior": "Guerrero Namekiano",
                    Freelancer: "Freelancer",
                    "Army of Frieza": "Ejército de Frieza",
                    "Pride Troopers": "Tropa del Orgullo",
                    "Assistant of Vermoud": "Asistente de Vermoud",
                    "God Assistant of Beerus": "Asistente Divino de Beerus",
                    Villain: "Villano",
                    Other: "Otro"
                }
            }
        },
        planets: {
            name: "Nombre",
            isDestroyed: {
                label: "Destruido",
                options: {
                    true: "Sí",
                    false: "No"
                }
            }
        }
    }
};
const sections = {
    welcome: document.getElementById('welcome-section'),
    characters: document.getElementById('characters-section'),
    planets: document.getElementById('planets-section')
};

const navLinks = {
    welcome: document.getElementById('welcome-link'),
    characters: document.getElementById('characters-link'),
    planets: document.getElementById('planets-link')
};

// Función para traducir valores
function translate(value, type, filter) {
    if (translations.filters[type]?.[filter]?.options?.[value]) {
        return translations.filters[type][filter].options[value];
    }
    return value;
}

function showSection(sectionId) {
    // Esconder las secciones
    Object.values(sections).forEach(section => {
        section.style.display = 'none';
    });
    
    // Quitar la clase activa de los links
    Object.values(navLinks).forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostar la sección seleccionada y añadir la clase activa al link
    sections[sectionId].style.display = 'block';
    navLinks[sectionId].classList.add('active');
    
    // Cargar datos si es necesario
    if (sectionId === 'characters' && sections.characters.querySelector('#character-list').children.length === 0) {
        fetchData('https://dragonball-api.com/api/characters?page=1&limit=2', 'Characters');
    } else if (sectionId === 'planets' && sections.planets.querySelector('#planet-list').children.length === 0) {
        fetchData('https://dragonball-api.com/api/planets?page=1&limit=2', 'Planets');
    }
}

// Controlador común para elementos principales y filtros
const controllers = {
    main: null,
    filter: null
};

// Casos especiales de imágenes para transformaciones
const specialImages = {
    'Vegetto SSJ': '../img/Vegetto_ssj.webp',
    'Trunks SSJ2': '../img/Ssj2Trunks.png'
};

// Objeto con los elementos del DOM
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

// fetch común para ambas entidades
async function fetchData(url, type, isFiltered = false) {
    // Cancelar la solicitud previa si existe
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

// Buscar un item por su id y tipo
async function fetchItemById(id, type) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/${type.toLowerCase()}/${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${type.toLowerCase()} details:`, error);
        return null;
    }
}

// Actualizar los botones de paginación
function updatePaginationUrls(links, type) {
    const buttons = elements[type.toLowerCase()].pagination;
    const dataAttribute = type.toLowerCase();
    
    buttons.prev.dataset[dataAttribute] = links.previous || links.first;
    buttons.next.dataset[dataAttribute] = links.next || links.last;
    buttons.init.dataset[dataAttribute] = links.first;
    buttons.last.dataset[dataAttribute] = links.last;
}

// Mostrar items
async function displayItems(items, type, filtered = false) {
    const container = filtered ? 
        elements[type.toLowerCase()].filteredList : 
        elements[type.toLowerCase()].list;
    container.innerHTML = '';

    const renderPromises = items.map(async (item) => {
        const itemCard = createBasicCard(item, type);
        
        if (type === 'Characters') {
            await enhanceCharacterCard(itemCard, item);
            
            // Traducir detalles
            const characteristicsDiv = itemCard.querySelector('.characteristics-div');
            characteristicsDiv.querySelectorAll('p').forEach(p => {
                const spans = p.querySelectorAll('span');
                if (spans.length === 2) { // Solo si hay 2 spans
                    const [labelSpan, valueSpan] = spans;
                    const label = labelSpan.textContent.replace(':', '');
                    const translatedLabel = translate(label, 'characters', label.toLowerCase());
                    const translatedValue = translate(valueSpan.textContent, 'characters', label.toLowerCase());
                    
                    labelSpan.textContent = `${translatedLabel}:`;
                    valueSpan.textContent = translatedValue;
                }
            });
            
        } else if (type === 'Planets') {
            await enhancePlanetCard(itemCard, item);
        }
        
        container.appendChild(itemCard);
    });

    await Promise.all(renderPromises);
}

// Dentro de la función createBasicCard, agregar un evento de clic a la tarjeta
function createBasicCard(item, type) {
    const card = document.createElement('div');
    card.className = `${type.toLowerCase().slice(0, -1)}-card`;

    // Resto del código para crear la tarjeta...
    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    card.appendChild(nameElement);

    const imageElement = document.createElement('img');
    imageElement.className = `${type.toLowerCase().slice(0, -1)}-img fade-in`;
    imageElement.src = item.image;
    imageElement.alt = item.name;
    card.appendChild(imageElement);

    // Agregar evento de clic para redirigir a la página de detalle
    imageElement.addEventListener('click', () => {
        // Redirigir a la página de detalle con el ID y tipo del personaje/planeta
        window.location.href = `detail.html?id=${item.id}&type=${type.toLowerCase()}`;
    });

    return card;
}

// Mejorar la tarjeta del personaje con detalles específicos
async function enhanceCharacterCard(card, character) {
    const characteristicsDiv = document.createElement('div');
    characteristicsDiv.classList.add('characteristics-div');
    const translatedGender = translations.filters.characters.gender.options[character.gender] || character.gender;
    const translatedAffiliation = translations.filters.characters.affiliation.options[character.affiliation] || character.affiliation;
    // Añadir características básicas
    const characteristics = {
        'Raza': character.race,
        'género': translatedGender,
        'Ki': character.ki,
        'Afiliación': translatedAffiliation,
    };
    const detailsElement = document.createElement('p');
    detailsElement.innerHTML = `
        <span class="characteristics yellow">Detalles:</span> 
        <span class="characteristics">pulsa la imagen del personaje para más detalles</span>
    `;
    characteristicsDiv.appendChild(detailsElement);

    Object.entries(characteristics).forEach(([label, value]) => {
        const element = document.createElement('p');
        element.innerHTML = `<span class="characteristics yellow">${label}:</span> <span class="characteristics">${value}</span>`;
        characteristicsDiv.appendChild(element);
    });

    // añadir el contenedor de las transformaciones
    const transformationsContainer = document.createElement('div');
    transformationsContainer.className = 'transformations';
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading-transformations';
    loadingMessage.textContent = 'Cargando transformaciones...';
    transformationsContainer.appendChild(loadingMessage);

    characteristicsDiv.appendChild(transformationsContainer);
    card.appendChild(characteristicsDiv);

    // Fetch y transformaciones
    const fullCharacter = await fetchItemById(character.id, 'Characters');
    transformationsContainer.innerHTML = '';

    if (fullCharacter && fullCharacter.transformations.length > 0) {
        // Añadir botón de la forma base
        const originalButton = createTransformationButton('Forma base', character.image, character.ki);
        transformationsContainer.appendChild(originalButton);

        // Añadir botones de transformaciones
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

// Mejorar la tarjeta del planeta con detalles específicos
async function enhancePlanetCard(card, planet) {
    const characteristicsDiv = document.createElement('div');
    characteristicsDiv.classList.add('characteristics-div');

    // Estado de destrucción
    const isDestroyedElement = document.createElement('p');
    isDestroyedElement.innerHTML = `<span class="characteristics yellow">Destruido:</span> <span class="characteristics">${planet.isDestroyed ? 'Sí' : 'No'}</span>`;
    characteristicsDiv.appendChild(isDestroyedElement);
    const detailsElement = document.createElement('p');
    detailsElement.innerHTML = `<span class="characteristics yellow">Detalles:</span> <span class="characteristics">pulsa la imagen del personaje para más detalles</span>`;
    characteristicsDiv.appendChild(detailsElement);
    card.appendChild(characteristicsDiv);
}

// Manejar el filtrado
function handleFilter(e, type) {
    const formData = new FormData(e.target.form);
    const filters = {};
    
    // Obtener el filtro según el tipo de entidad
    if (type === 'Characters') {
        filters.name = formData.get('name');
        filters.gender = formData.get('gender');
        filters.race = formData.get('race');
        filters.affiliation = formData.get('affiliation');
    } else {
        filters.name = formData.get('planet-name');
        filters.isDestroyed = formData.get('isDestroyed');
    }

    // Revisar si todos los filtros están vacíos
    if (Object.values(filters).every(value => !value)) {
        showNoItemsFoundMessage(type, true);
        return;
    }

    // Construir la url con los filtros
    let url = `https://dragonball-api.com/api/${type.toLowerCase()}?`;
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            url += `${key}=${encodeURIComponent(value)}&`;
        }
    });
    url = url.slice(0, -1);

    fetchData(url, type, true);
}

// Enseñas un mensaje si no se encuentran items
function showNoItemsFoundMessage(type, isEmpty = false) {
    const container = elements[type.toLowerCase()].filteredList;
    const message = isEmpty ? 
        "Los filtros están vacíos. Por favor, ingresa algún criterio." :
        `No se encontraron ${type.toLowerCase()} con los filtros seleccionados`;
    
    container.innerHTML = `<p class="main__text">${message}</p>`;
}

// Manejar los errores del fetch
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

// Manejar el input de los cambios de paginación
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

// Inicialización de los eventos
function initializeEventListeners() {
    ['Characters', 'Planets'].forEach(type => {
        const typeElements = elements[type.toLowerCase()];
        
        // botones de paginación
        Object.values(typeElements.pagination).forEach(button => {
            button.addEventListener('click', (e) => {
                const url = e.target.dataset[type.toLowerCase()];
                fetchData(url, type);
            });
        });
        // Paginación input
        typeElements.paginationInput.addEventListener('input', () => handlePaginationInput(type));

        // Formulario de filtrado
        typeElements.filterForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => handleFilter(e, type));
        });

        typeElements.filterForm.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => handleFilter(e, type));
        });
    });
}

// Inicialización de la página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar los eventos de los links de navegación
    Object.entries(navLinks).forEach(([sectionId, link]) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(sectionId);
        });
    });
    
    // Enseñar la sección de bienvenida
    showSection('welcome');
    
    // Inicializar otros eventos
    initializeEventListeners();
    initial = false;
});