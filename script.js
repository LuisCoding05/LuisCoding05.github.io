// Obtener referencias a los elementos del DOM

//botones de paginacion
const botonPrevio = document.getElementById("PreviousCharacters");
const botonIniciales = document.getElementById("InitialCharacters");
const botonSiguientes = document.getElementById("nextCharacters");
const botonLast = document.getElementById("LastCharacters");
//formularios de filtrado de datos
const formFilter = document.getElementById("filterCharacters");
const formPlanetsFilter = document.getElementById("filterPlanets");
//párrafo de error de planetas
const errorNumPlanetas = document.getElementById("numePlanetas");
const errorNumPersonajes = document.getElementById("numePersonajes");
//Números de personajes y planetas por páginación
const inputPaginacion = document.getElementById("paginacion");
const inputPaginacionPlanetas = document.getElementById("paginacionPlanetas");

// Botones de paginación
const paginationButtons = [botonPrevio, botonIniciales, botonSiguientes, botonLast];

// Imágenes de personajes(Algunas fotos están defectuosas o no están)
const vegettoSsjFoto = "../img/Vegetto_ssj.webp";
const ssj2TrunksFoto = "../img/Ssj2Trunks.png";

// Función para obtener un personaje por ID
async function fetchCharacterById(id) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/characters/${id}`);
        const character = await response.json();
        return character;
    } catch (error) {
        console.error('Error fetching character:', error);
        return null;
    }
}

// Función para actualizar las URLs de los botones de paginación
function buttonUrls(links) {
    if (links.previous) {botonPrevio.dataset.personajes = links.previous;}
    else {botonPrevio.dataset.personajes = links.first;}

    if (links.next) {botonSiguientes.dataset.personajes = links.next;}
    else {botonSiguientes.dataset.personajes = links.last;}

    botonIniciales.dataset.personajes = links.first;
    botonLast.dataset.personajes = links.last;
}

// Función para obtener personajes desde una URL
async function fetchCharacters(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        const characters = data.items;
        const links = data.links;
        buttonUrls(links);
        if (Array.isArray(characters)) {
            displayCharacters(characters);
        } else {
            console.error('Expected an array of characters');
        }
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
}

// Función para mostrar los personajes en el DOM
/**
 * Función asíncrona para mostrar una lista de personajes en la interfaz.
 * @param {Array} characters - Array de objetos de personajes, cada uno con información básica.
 * @param {boolean} filtred - Indica si se deben mostrar personajes filtrados (opcional, por defecto false).
 */
async function displayCharacters(characters, filtred = false) {
    // Determina el contenedor donde se mostrarán los personajes según si son filtrados o no.
    const characterList = filtred ? document.getElementById('characters-filtred') : document.getElementById('character-list');
    characterList.innerHTML = ''; // Limpia el contenido previo del contenedor.

    // Mapea cada personaje a una operación asíncrona para renderizar su información.
    const renderPromises = characters.map(async (character) => {
        const characterDiv = document.createElement('div'); // Contenedor principal del personaje.
        characterDiv.className = 'character-card';

        // Crea y agrega el nombre del personaje.
        const nameElement = document.createElement('h3');
        nameElement.textContent = character.name;
        characterDiv.appendChild(nameElement);

        // Crea y agrega la imagen del personaje.
        const imageElement = document.createElement('img');
        imageElement.className = 'character-img';
        imageElement.classList.add("fade-in"); // Clase para efecto visual.
        imageElement.src = character.image; // URL de la imagen.
        imageElement.alt = character.name; // Texto alternativo para accesibilidad.
        characterDiv.appendChild(imageElement);

        // Contenedor para la descripción del personaje.
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'description-container';

        // Crea y agrega la descripción del personaje.
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = character.description;
        descriptionContainer.appendChild(descriptionElement);
        characterDiv.appendChild(descriptionContainer);

        // Contenedor para las características del personaje.
        const characteristicsDiv = document.createElement('div');
        characteristicsDiv.classList.add('characteristics-div');

        // Crea y agrega cada característica del personaje.
        const raceElement = document.createElement('p');
        raceElement.innerHTML = `<span class="characteristics yellow">Raza:</span> <span class="characteristics">${character.race}</span>`;
        characteristicsDiv.appendChild(raceElement);

        const genderElement = document.createElement('p');
        genderElement.innerHTML = `<span class="characteristics yellow">Género:</span> <span class="characteristics">${character.gender}</span>`;
        characteristicsDiv.appendChild(genderElement);

        const kiElement = document.createElement('p');
        kiElement.innerHTML = `<span class="characteristics yellow">Ki:</span> <span class="characteristics">${character.ki}</span>`;
        characteristicsDiv.appendChild(kiElement);

        const affiliationElement = document.createElement('p');
        affiliationElement.innerHTML = `<span class="characteristics yellow">Afiliación:</span> <span class="characteristics">${character.affiliation}</span>`;
        characteristicsDiv.appendChild(affiliationElement);

        const maxKiElement = document.createElement('p');
        maxKiElement.innerHTML = `<span class="characteristics yellow">Máximo poder:</span> <span class="characteristics">${character.maxKi}</span>`;
        characteristicsDiv.appendChild(maxKiElement);

        // Contenedor para las transformaciones del personaje.
        const transformationsContainer = document.createElement('div');
        transformationsContainer.className = 'transformations';
        const loadingMessage = document.createElement('p');
        loadingMessage.className = 'loading-transformations';
        loadingMessage.textContent = 'Cargando transformaciones...';
        transformationsContainer.appendChild(loadingMessage);
        characterDiv.appendChild(transformationsContainer);

        characteristicsDiv.appendChild(transformationsContainer);
        characterDiv.appendChild(characteristicsDiv);
        characterList.appendChild(characterDiv);

        // Llama a una API para obtener información detallada del personaje.
        const fullCharacter = await fetchCharacterById(character.id);
        transformationsContainer.innerHTML = ''; // Limpia el mensaje de "Cargando transformaciones".

        // Si tiene transformaciones conocidas, se crean botones interactivos.
        const transformations = Array.from(fullCharacter.transformations);
        if (fullCharacter && transformations.length > 0) {
            // Botón para la forma base del personaje.
            const originalButton = document.createElement('button');
            originalButton.className = 'transformation-btn original-btn';
            originalButton.textContent = 'Forma base';
            originalButton.dataset.image = character.image;
            transformationsContainer.appendChild(originalButton);

            // Evento para cambiar la imagen y el Ki al volver a la forma base.
            originalButton.addEventListener('click', () => {
                imageElement.src = character.image;
                kiElement.innerHTML = `<span class="characteristics yellow">Ki:</span> <span class="characteristics">${character.ki}</span>`;
                kiElement.className = "characteristics yellow";
            });

            // Botones para cada transformación.
            transformations.forEach((transformation) => {
                const transformationButton = document.createElement('button');
                transformationButton.className = 'transformation-btn';
                transformationButton.textContent = transformation.name;
                transformationButton.dataset.image = transformation.image;
                transformationsContainer.appendChild(transformationButton);

                // Evento para cambiar la imagen y el Ki al seleccionar una transformación.
                transformationButton.addEventListener('click', () => {
                    kiElement.innerHTML = `<span class="characteristics yellow">Ki:</span> <span class="characteristics">${transformation.ki}</span>`;
                    imageElement.classList.add('fade-out');

                    imageElement.addEventListener('animationend', () => {
                        // Cambia la imagen dependiendo de la transformación(Estos son los casos de imágenes defectuosas).
                        switch (transformation.name) {
                            case "Vegetto SSJ":
                                imageElement.src = vegettoSsjFoto; // Imagen específica de Vegetto SSJ.
                                break;
                            case "Trunks SSJ2":
                                imageElement.src = ssj2TrunksFoto; // Imagen específica de Trunks SSJ2.
                                break;
                            default:
                                imageElement.src = transformation.image; // Imagen por defecto.
                                break;
                        }

                        // Reinicia la animación de la imagen.
                        imageElement.onload = () => {
                            imageElement.classList.remove('fade-out');
                            imageElement.classList.add('fade-in');
                            imageElement.addEventListener('animationend', () => {
                                imageElement.classList.remove('fade-in');
                            }, { once: true });
                        };
                    }, { once: true });
                });
            });
        } else {
            // Si no tiene transformaciones, muestra un mensaje indicativo.
            const noTransformationsMessage = document.createElement('p');
            noTransformationsMessage.className = "characteristics";
            noTransformationsMessage.textContent = 'Sin transformaciones conocidas';
            transformationsContainer.appendChild(noTransformationsMessage);
        }
    });

    // Espera a que todas las operaciones de renderizado terminen.
    await Promise.all(renderPromises);
    console.log('Todas las tarjetas han sido renderizadas.');
}


// Añadir eventos a los botones de paginación
paginationButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const personajes = event.target.dataset.personajes;
        fetchCharacters(personajes);
    });
});

// Función para obtener personajes filtrados desde una URL
async function fetchFiltredCharacters(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        if (Array.isArray(data) && data.length > 0) {
            displayCharacters(data, true);
        } else {
            showNoCharactersFoundMessage();
        }
    } catch (error) {
        console.error('Error fetching characters:', error);
        showNoCharactersFoundMessage();
    }
}

// Mostrar mensaje si no se encuentran personajes
function showNoCharactersFoundMessage() {
    const characterList = document.getElementById('characters-filtred');
    const textoError = document.createElement("p");
    textoError.textContent = "No se encontraron personajes con los filtros seleccionados";
    characterList.innerHTML = '';
    characterList.appendChild(textoError);
}

// Función para buscar personajes según los filtros
function buscarPersonajes(e) {
    e.preventDefault();
    //Obtenemos los valores del formulario
    const nombre = document.getElementById('name').value;
    const genero = document.getElementById('gender').value;
    const raza = document.getElementById('race').value;
    const afiliacion = document.getElementById('affiliation').value;
    const characterList = document.getElementById('characters-filtred');

    //Url inicial
    let url = "https://dragonball-api.com/api/characters?";

    //Si todos los filtros están vacíos se lo decimos al usuario
    const fields = [nombre, genero, raza, afiliacion];
    if (fields.every(field => field === "")) {
        const textoError = document.createElement("p");
        textoError.textContent = "Los filtros están vacíos. Por favor, ingresa algún criterio.";
        characterList.innerHTML = '';
        characterList.appendChild(textoError);
        return;
    }

    //Para cada criterio, si no está vacío se añade a la url
    if (nombre) {
        url += `name=${encodeURIComponent(nombre)}&`;
    }
    if (genero) {
        url += `gender=${encodeURIComponent(genero)}&`;
    }
    if (raza) {
        url += `race=${encodeURIComponent(raza)}&`;
    }
    if (afiliacion) {
        url += `affiliation=${encodeURIComponent(afiliacion)}&`;
    }

    //Quitamos la "&" del final
    url = url.slice(0, -1);

    console.log("URL de búsqueda:", url);
    fetchFiltredCharacters(url);
}

// Función para decidir el número de personajes a mostrar por página
function decideCharactersNum() {
    const characterList = document.getElementById('character-list');
    characterList.innerHTML = '';
    switch (true) {
        case parseInt(inputPaginacion.value) > 10:
            errorNumPersonajes.textContent = "La paginación máxima es de 10 personajes";
            fetchCharacters(`https://dragonball-api.com/api/characters?page=1&limit=10`);
            break;

        case parseInt(inputPaginacion.value) < 1:
            errorNumPersonajes.textContent = "Debe de haber al menos un personaje";
            fetchCharacters(`https://dragonball-api.com/api/characters?page=1&limit=1`);
            break;

        default:
            errorNumPersonajes.textContent = '';
            fetchCharacters(`https://dragonball-api.com/api/characters?page=1&limit=${inputPaginacion.value}`);
            break;
    }
}

// Función para decidir el número de planetas a mostrar por página
function decidePlanetsNum() {
    const planetList = document.getElementById('planet-list');
    planetList.innerHTML = '';
    switch (true) {
        case parseInt(inputPaginacionPlanetas.value) > 10:
            errorNumPlanetas.textContent = "La paginación máxima es de 10 planetas";
            fetchPlanets(`https://dragonball-api.com/api/planets?page=1&limit=10`);
            break;

        case parseInt(inputPaginacionPlanetas.value) < 1:
            errorNumPlanetas.textContent = "Debe de haber al menos un planeta";
            fetchPlanets(`https://dragonball-api.com/api/planets?page=1&limit=1`);
            break;

        default:
            errorNumPlanetas.textContent = '';
            fetchPlanets(`https://dragonball-api.com/api/planets?page=1&limit=${inputPaginacionPlanetas.value}`);
            break;
    }
}

// Obtener referencias a los botones de paginación de planetas
const planetBotonPrevio = document.getElementById("PreviousPlanets");
const planetBotonIniciales = document.getElementById("InitialPlanets");
const planetBotonSiguientes = document.getElementById("nextPlanets");
const planetBotonLast = document.getElementById("LastPlanets");

const planetPaginationButtons = [planetBotonPrevio, planetBotonIniciales, planetBotonSiguientes, planetBotonLast];

// Función para obtener un planeta por ID
async function fetchPlanetById(id) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/planets/${id}`);
        const planet = await response.json();
        return planet;
    } catch (error) {
        console.error('Error fetching planet:', error);
        return null;
    }
}

// Función para actualizar las URLs de los botones de paginación de planetas
function planetButtonUrls(links) {
    if (links.previous) {planetBotonPrevio.dataset.planetas = links.previous;}
    else {planetBotonPrevio.dataset.planetas = links.first;}

    if (links.next) {planetBotonSiguientes.dataset.planetas = links.next;}
    else {planetBotonSiguientes.dataset.planetas = links.last;}

    planetBotonIniciales.dataset.planetas = links.first;
    planetBotonLast.dataset.planetas = links.last;
}

// Función para obtener planetas desde una URL
async function fetchPlanets(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        const planets = data.items;
        const links = data.links;
        planetButtonUrls(links);
        if (Array.isArray(planets)) {
            displayPlanets(planets);
        } else {
            console.error('Expected an array of planets');
        }
    } catch (error) {
        console.error('Error fetching planets:', error);
    }
}


/**
 * Función asíncrona para mostrar una lista de planetas en la interfaz.
 * @param {Array} planets - Array de objetos de planetas, cada uno con información básica.
 * @param {boolean} filtred - Indica si se deben mostrar planetas filtrados (opcional, por defecto false).
 */
async function displayPlanets(planets, filtred = false) {
    // Determina el contenedor donde se mostrarán los planetas según si son filtrados o no.
    const planetList = filtred ? document.getElementById('planets-filtred') : document.getElementById('planet-list');
    planetList.innerHTML = ''; // Limpia el contenido previo del contenedor.

    // Mapea cada planeta a una operación asíncrona para renderizar su información.
    const renderPromises = planets.map(async (planet) => {
        const planetDiv = document.createElement('div'); // Contenedor principal del planeta.
        planetDiv.className = 'planet-card';

        // Crea y agrega el nombre del planeta.
        const nameElement = document.createElement('h3');
        nameElement.textContent = planet.name;
        planetDiv.appendChild(nameElement);

        // Crea y agrega la imagen del planeta.
        const imageElement = document.createElement('img');
        imageElement.className = 'planet-img';
        imageElement.classList.add("fade-in"); // Clase para efecto visual.
        imageElement.src = planet.image; // URL de la imagen.
        imageElement.alt = planet.name; // Texto alternativo para accesibilidad.
        planetDiv.appendChild(imageElement);

        // Crea y agrega el contenedor para la descripción.
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'description-container';
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = planet.description;
        descriptionContainer.appendChild(descriptionElement);
        planetDiv.appendChild(descriptionContainer);

        // Crea y agrega las características del planeta (como si está destruido).
        const characteristicsDiv = document.createElement('div');
        characteristicsDiv.classList.add('characteristics-div');
        const isDestroyedElement = document.createElement('p');
        isDestroyedElement.innerHTML = `<span class="characteristics yellow">Destruido:</span> <span class="characteristics">${planet.isDestroyed ? 'Sí' : 'No'}</span>`;
        characteristicsDiv.appendChild(isDestroyedElement);
        planetDiv.appendChild(characteristicsDiv);

        planetList.appendChild(planetDiv); // Agrega la tarjeta del planeta al contenedor principal.

        // Busca información completa del planeta utilizando su ID.
        const fullPlanet = await fetchPlanetById(planet.id);
        if (fullPlanet && fullPlanet.characters.length > 0) {
            // Si hay personajes asociados al planeta, los agrega a la tarjeta.
            const characterContainer = document.createElement('div');
            characterContainer.className = 'habitants-container';
            fullPlanet.characters.forEach((character) => {
                const characterElement = document.createElement('p');
                characterElement.textContent = character.name;
                characterContainer.appendChild(characterElement);
            });
            planetDiv.appendChild(characterContainer);
        } else {
            // Si no hay personajes conocidos, muestra un mensaje indicándolo.
            const noCharactersMessage = document.createElement('p');
            noCharactersMessage.className = "characteristics yellow";
            noCharactersMessage.textContent = 'Sin personajes conocidos';
            planetDiv.appendChild(noCharactersMessage);
        }
    });

    // Espera a que todas las operaciones de renderizado hayan terminado.
    await Promise.all(renderPromises);
    console.log('Todas las tarjetas de planetas han sido renderizadas.');
}


// Añadir eventos a los botones de paginación de planetas
planetPaginationButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const planetas = event.target.dataset.planetas;
        fetchPlanets(planetas);
    });
});

// Función para obtener planetas filtrados desde una URL
async function fetchFiltredPlanets(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        if (Array.isArray(data) && data.length > 0) {
            displayPlanets(data, true);
        } else {
            showNoPlanetsFoundMessage();
        }
    } catch (error) {
        console.error('Error fetching planets:', error);
        showNoPlanetsFoundMessage();
    }
}

// Mostrar mensaje si no se encuentran planetas
function showNoPlanetsFoundMessage() {
    const planetList = document.getElementById('planets-filtred');
    const textoError = document.createElement("p");
    textoError.textContent = "No se encontraron planetas con los filtros seleccionados";
    planetList.innerHTML = '';
    planetList.appendChild(textoError);
}

// Función para buscar planetas según los filtros
function buscarPlanetas(e) {
    e.preventDefault();

    const nombre = document.getElementById('planet-name').value;
    const destruido = document.getElementById('isDestroyed').value;
    const planetList = document.getElementById('planets-filtred');

    let url = "https://dragonball-api.com/api/planets?";

    const fields = [nombre, destruido];
    if (fields.every(field => field === "")) {
        const textoError = document.createElement("p");
        textoError.textContent = "Los filtros están vacíos. Por favor, ingresa algún criterio.";
        planetList.innerHTML = '';
        planetList.appendChild(textoError);
        return;
    }

    if (nombre) {
        url += `name=${encodeURIComponent(nombre)}&`;
    }
    if (destruido) {
        url += `isDestroyed=${encodeURIComponent(destruido)}&`;
    }

    url = url.slice(0, -1);

    console.log("URL de búsqueda:", url);
    fetchFiltredPlanets(url);
}

// Añadir eventos a los formularios y elementos de paginación
formFilter.addEventListener("submit", buscarPersonajes);
formPlanetsFilter.addEventListener("submit", buscarPlanetas);

//Cargamos para tener datos iniciales algunos personajes y planetas
document.addEventListener('DOMContentLoaded', () => {
    fetchCharacters('https://dragonball-api.com/api/characters?page=1&limit=4');
    fetchPlanets('https://dragonball-api.com/api/planets?page=1&limit=4');
});

/*Si cambia el input se ejecuta la función que cambia
la cantidad de personas o planetas mostrados por página*/
inputPaginacion.addEventListener("input", decideCharactersNum);
inputPaginacionPlanetas.addEventListener("input", decidePlanetsNum);