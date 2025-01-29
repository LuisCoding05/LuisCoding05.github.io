document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Obtener el ID del personaje
    const type = urlParams.get('type'); // Obtener el tipo (character o planet)

    const detailContainer = document.getElementById('detail-container');
    const characterName = document.getElementById('character-name');
    const characterImage = document.getElementById('character-image');
    const characterDescription = document.getElementById('character-description');
    const characterDetails = document.getElementById('character-details');
    const transformationsButtons = document.getElementById('transformations-buttons');
    const transformationDetails = document.getElementById('transformation-details');

    if (id && type === 'characters') {
        fetch(`https://dragonball-api.com/api/characters/${id}`)
            .then(response => response.json())
            .then(data => {
                // Mostrar información básica del personaje
                characterName.textContent = data.name;
                characterImage.src = data.image;
                characterImage.alt = data.name;
                characterDescription.textContent = data.description;

                // Mostrar detalles del personaje
                characterDetails.innerHTML = `
                    <p><strong>Raza:</strong> ${data.race}</p>
                    <p><strong>Género:</strong> ${data.gender}</p>
                    <p><strong>Ki:</strong> ${data.ki}</p>
                    <p><strong>Afiliación:</strong> ${data.affiliation}</p>
                `;

                // Mostrar transformaciones
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
            })
            .catch(error => {
                console.error('Error fetching details:', error);
                detailContainer.innerHTML = `<p>Error al cargar la información.</p>`;
            });
    } else {
        detailContainer.innerHTML = `<p>No se encontró información.</p>`;
    }

    // Función para mostrar la transformación seleccionada
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