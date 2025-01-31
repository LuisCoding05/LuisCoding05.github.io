document.addEventListener('DOMContentLoaded', () => {
    let controller;
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Obtener el ID del personaje/planeta
    const type = urlParams.get('type'); // Obtener el tipo (character o planet)

    const detailContainer = document.getElementById('detail-container');
    const characterName = document.getElementById('character-name');
    const characterImage = document.getElementById('character-image');
    const characterDescription = document.getElementById('character-description');
    const characterDetails = document.getElementById('character-details');
    const transformationsButtons = document.getElementById('transformations-buttons');
    const transformationDetails = document.getElementById('transformation-details');
    const transformationSection = document.getElementById('transformations-div');

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

    if (id && type) {
        if (controller) {
            controller.abort();
        }

        controller = new AbortController();
        const signal = controller.signal;
        fetch(`https://dragonball-api.com/api/${type}/${id}`, {signal})
            .then(response => response.json())
            .then(data => {
                
                // Mostrar información básica
                characterName.textContent = data.name;
                characterImage.src = data.image;
                characterImage.alt = data.name;
                characterDescription.textContent = data.description;
                
                // Crea el botón de toggle
                const toggleButton = document.createElement('button');
                toggleButton.className = 'description-toggle';
                toggleButton.textContent = 'Mostrar más';

                // Inserta el botón después de la descripción
                characterDescription.insertAdjacentElement('afterend', toggleButton);

                // Controlador para el toggle
                toggleButton.addEventListener('click', () => {
                    characterDescription.classList.toggle('expanded');
                    toggleButton.textContent = characterDescription.classList.contains('expanded') 
                        ? 'Mostrar menos' 
                        : 'Mostrar más';
                });

                // Oculta el botón si el texto es corto
                if (characterDescription.scrollHeight === characterDescription.clientHeight) {
                    toggleButton.style.display = 'none';
                }

                // Mostrar detalles según el tipo
                if (type === 'characters') {
                    transformationSection.style.display = 'block';
                    const translatedGender = translations.filters.characters.gender.options[data.gender] || data.gender;
                    // Mostrar la raza traducida
                    const translatedRace = translations.filters.characters.race.options[data.race] || data.race;
                    //Afiliación traducida
                    const translatedAffiliation = translations.filters.characters.affiliation.options[data.affiliation] || data.affiliation;
                    characterDetails.innerHTML = `
                        <p><strong>Raza:</strong> ${translatedRace}</p>
                        <p><strong>Género:</strong> ${translatedGender}</p>
                        <p><strong>Ki:</strong> ${data.ki}</p>
                        <p><strong>Ki máximo:</strong> ${data.maxKi}</p>
                        <p><strong>Afiliación:</strong> ${translatedAffiliation}</p>
                        <p><strong>planeta:</strong> <a href="detail.html?id=${data.originPlanet.id}&type=planets">${data.originPlanet.name}</a></p>
                    `;

                    // Mostrar transformaciones si es un personaje
                    if (data.transformations && data.transformations.length > 0) {
                        transformationsButtons.innerHTML = '<h4>Selecciona una transformación:</h4>';
                        data.transformations.forEach(transformation => {
                            const button = document.createElement('button');
                            button.textContent = transformation.name;
                            button.addEventListener('click', () => {
                                showTransformation(transformation);
                            });
                            transformationsButtons.appendChild(button);
                        });

                        // Mostrar la forma base como primera opción
                        const baseFormButton = document.createElement('button');
                        baseFormButton.textContent = 'Forma base';
                        baseFormButton.addEventListener('click', () => {
                            showTransformation({
                                name: 'Forma base',
                                image: data.image,
                                ki: data.ki,
                                description: data.description
                            });
                        });
                        transformationsButtons.prepend(baseFormButton);
                    } else {
                        transformationsButtons.innerHTML = '<p>No hay transformaciones disponibles.</p>';
                    }
                } else if (type === 'planets') {
                    transformationSection.style.display = 'none';
                    // Mostrar detalles específicos de planetas
                    characterDetails.innerHTML = `
                        <p><strong>Destruido:</strong> ${data.isDestroyed ? 'Sí' : 'No'}</p>
                        <p><strong>Población:</strong></p>
                    `;

                    const characterContainer = document.createElement('div');
                    characterContainer.className = 'habitants-container';
                    if(data.characters.length > 0){
                    data.characters.forEach(character => {
                        const characterLink = document.createElement('a');
                        characterLink.textContent = character.name;
                        characterLink.href = `detail.html?id=${character.id}&type=characters`;
                        characterLink.className = 'clickable-character';
                        
                        characterContainer.appendChild(characterLink);
                    });
                    characterDetails.appendChild(characterContainer);
                    }else{
                        const noCharactersMessage = document.createElement('p');
                        noCharactersMessage.className = "characteristics yellow";
                        noCharactersMessage.textContent = 'Sin personajes conocidos';
                        characterDetails.appendChild(noCharactersMessage);
                    }

                }
            })
            .catch(error => {
                console.error('Error fetching details:', error);
                detailContainer.innerHTML = `<p>Error al cargar la información.</p>`;
            });
    } else {
        detailContainer.innerHTML = `<p>No se encontró información.</p>`;
    }

    // Función para mostrar la transformación seleccionada (solo para personajes)
    function showTransformation(transformation) {
        characterImage.classList.add('fade-out');
        characterImage.addEventListener('animationend', () => {
            characterImage.src = transformation.image;
            characterImage.alt = transformation.name;
            characterImage.classList.remove('fade-out');
            characterImage.classList.add('fade-in');
            characterImage.addEventListener('animationend', () => {
                characterImage.classList.remove('fade-in');
            }, { once: true });
        }, { once: true });

        transformationDetails.innerHTML = `
            <p><strong>Nombre:</strong> ${transformation.name}</p>
            <p><strong>Ki:</strong> ${transformation.ki}</p>
        `;
    }
});