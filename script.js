

// --- 1. Seleccionar elementos HTML ---

// Elementos de Navegación (botones del menú inferior)
const navIndexButton = document.getElementById('nav-index');
const navOpenPackButton = document.getElementById('nav-open-pack');
const navTradeButton = document.getElementById('nav-trade');

// Secciones de Contenido (las pantallas que se muestran)
const indexSection = document.getElementById('index-section');
const openPackSection = document.getElementById('open-pack-section');
const tradeSection = document.getElementById('trade-section');

// Elementos de la Sección "Abrir un Sobre"
const openPackButton = document.getElementById('open-pack-button'); // Botón para abrir sobres
const packResultsContainer = document.getElementById('pack-results'); // Donde se mostrarán las cartas nuevas

// Elementos de la Sección "Índice de Cartas" (usaremos el mismo grid)
const pokemonGrid = document.getElementById('pokemon-grid'); // Contenedor para mostrar las cartas del índice

// Elementos del Modal (los seleccionaremos de una vez, aunque la lógica del modal va en Fase 3)
const pokemonDetailModal = document.getElementById('pokemon-detail-modal');
const closeButton = pokemonDetailModal.querySelector('.close-button');
const modalPokemonName = document.getElementById('modal-pokemon-name');
const modalPokemonImage = document.getElementById('modal-pokemon-image');
const modalPokemonType = document.getElementById('modal-pokemon-type');
const modalPokemonStats = document.getElementById('modal-pokemon-stats');

// --- 2. Variables de Datos Globales ---

const POKEMON_COUNT = 150; // El número total de Pokémon que consideraremos (los primeros 150)
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/'; // URL base de la PokeAPI

// Array para almacenar las cartas que el usuario ha obtenido.
// Intentamos cargar desde localStorage al inicio. Si no hay datos guardados, será un array vacío.
let obtainedCards = JSON.parse(localStorage.getItem('pokemonCollection')) || [];

// NUEVO en Fase 3 (lo dejamos aquí para que esté listo):
// Este array guardará una lista básica de todos los Pokémon (ID, nombre) para el índice.
let allPokemonData = [];

// --- 3. Funciones de Utilidad (Ayudantes) ---

// Función para capitalizar la primera letra de una cadena (ej. 'pikachu' -> 'Pikachu')
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para guardar el array 'obtainedCards' en el almacenamiento local del navegador
function saveCardsToLocalStorage() {
    localStorage.setItem('pokemonCollection', JSON.stringify(obtainedCards));
    console.log("Colección de cartas guardada en localStorage.");
}



function actualizarProgresoColeccion() {
    const progreso = obtainedCards.length;
    const total = POKEMON_COUNT;
    const progressBar = document.getElementById('collection-progress');
    const progressLabel = document.getElementById('progress-label');
    if (progressBar) progressBar.value = progreso;
    if (progressBar) progressBar.max = total;
    if (progressLabel) progressLabel.textContent = `${progreso} / ${total} Pokémones desbloqueados`;
}





// --- 4. Lógica de Navegación ---

// Función principal para mostrar una sección y ocultar las demás
function showSection(sectionToShow) {
    // 1. Ocultar todas las secciones de contenido
    indexSection.classList.remove('active');
    openPackSection.classList.remove('active');
    tradeSection.classList.remove('active');

    // 2. Quitar la clase 'active' (que indica el botón seleccionado) de todos los botones de navegación
    navIndexButton.classList.remove('active');
    navOpenPackButton.classList.remove('active');
    navTradeButton.classList.remove('active');

    // 3. Mostrar la sección deseada (añadir 'active') y activar su botón correspondiente
    sectionToShow.classList.add('active');
    if (sectionToShow === indexSection) {
        navIndexButton.classList.add('active');
        // Cuando mostramos el índice, necesitamos que se actualice
        renderPokemonGrid(); // Esta función la implementaremos en Fase 3
    } else if (sectionToShow === openPackSection) {
        navOpenPackButton.classList.add('active');
    } else if (sectionToShow === tradeSection) {
        navTradeButton.classList.add('active');
    }
}

// --- Asignar Event Listeners (Detectores de Clic) a los botones de navegación ---
navIndexButton.addEventListener('click', () => showSection(indexSection));
navOpenPackButton.addEventListener('click', () => showSection(openPackSection));
navTradeButton.addEventListener('click', () => showSection(tradeSection));

// --- Mostrar la sección del índice por defecto al cargar la página ---
// Esto asegura que al abrir la app, siempre empieces en el índice de cartas
showSection(indexSection);





// --- 5. Funciones para Consumir la PokeAPI ---

// Caché para almacenar los datos de Pokémon ya obtenidos y evitar peticiones repetidas a la API
const pokemonCache = {};

// Función asíncrona para obtener los datos detallados de un Pokémon por su ID
async function getPokemonData(id) {
    // 1. Verificar si los datos del Pokémon ya están en nuestra caché
    if (pokemonCache[id]) {
        console.log(`Cargando Pokémon ${id} desde caché.`);
        return pokemonCache[id]; // Si está en caché, lo devolvemos directamente
    }

    try {
        // 2. Si no está en caché, hacemos la petición a la PokeAPI
        console.log(`Obteniendo Pokémon ${id} de la PokeAPI.`);
        const response = await fetch(`${POKEAPI_BASE_URL}${id}/`);

        // 3. Verificar si la petición fue exitosa (código de estado 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Convertir la respuesta a formato JSON
        const data = await response.json();

        // 5. Almacenar los datos en caché antes de devolverlos
        pokemonCache[id] = data;
        return data; // Devolver los datos del Pokémon
    } catch (error) {
        // 6. Manejo de errores si algo sale mal durante la petición
        console.error(`Error al obtener datos del Pokémon ${id}:`, error);
        return null; // Devolvemos null si hay un error para indicar que falló
    }
}

// Función para crear un elemento HTML (una "carta") para un Pokémon
function createPokemonCardElement(pokemon, isOpenedPack = false) {
    const cardDiv = document.createElement('div'); // Crea un nuevo div
    cardDiv.classList.add('pokemon-card', 'unlocked'); // Le añade clases CSS
    cardDiv.dataset.id = pokemon.id; // Guarda el ID del Pokémon como un atributo de datos HTML

    // La URL de la imagen del sprite frontal del Pokémon
    const imageUrl = pokemon.sprites.front_default;

    // Rellenar el contenido del div con la imagen y el nombre del Pokémon
    cardDiv.innerHTML = `
        <img src="${imageUrl}" alt="${capitalize(pokemon.name)}">
        <p>${capitalize(pokemon.name)}</p>
    `;

    // Si la carta viene de "abrir un sobre", añadimos una clase especial
    // para futuros efectos de animación si los quieres
    if (isOpenedPack) {
        cardDiv.classList.add('newly-opened');
    }

    return cardDiv; // Devuelve el elemento div de la carta
}




// --- 6. Lógica para Abrir Sobres ---

// Función asíncrona para simular la apertura de un sobre de Pokémon
async function openNewPack() {
    openPackButton.disabled = true; // Deshabilita el botón para evitar que se presione varias veces
    packResultsContainer.innerHTML = ''; // Limpia los resultados de sobres anteriores

    const chosenPokemonIds = new Set(); // Usamos un Set para asegurar que los IDs sean únicos
    
    // Elegir 6 IDs de Pokémon aleatorios y únicos
    while (chosenPokemonIds.size < 6) {
        // Genera un ID entre 1 y POKEMON_COUNT (150)
        const randomId = Math.floor(Math.random() * POKEMON_COUNT) + 1;
        chosenPokemonIds.add(randomId); // Añade el ID al Set (si ya existe, no se añade de nuevo)
    }

    // Convertir el Set de IDs a un Array para poder iterar
    const idsToFetch = Array.from(chosenPokemonIds);

    // Obtener los datos de los 6 Pokémon de la PokeAPI de forma paralela
    // Esto es más eficiente que hacer 6 peticiones una tras otra
    const fetchPromises = idsToFetch.map(id => getPokemonData(id));
    const fetchedPokemonData = await Promise.all(fetchPromises); // Espera a que todas las peticiones terminen

    // Procesar y mostrar cada carta obtenida
    for (const pokemonData of fetchedPokemonData) {
        if (pokemonData) { // Asegurarse de que los datos se obtuvieron correctamente
            // Añadir la carta a la colección del usuario si no la tiene ya
            const exists = obtainedCards.some(card => card.id === pokemonData.id);
            if (!exists) {
                obtainedCards.push(pokemonData); // Añade el objeto completo del Pokémon
            }

            // Crear el elemento HTML de la carta y añadirlo al contenedor de resultados
            const cardElement = createPokemonCardElement(pokemonData, true); // 'true' indica que es una carta de sobre
            packResultsContainer.appendChild(cardElement);
        }
    }

    saveCardsToLocalStorage(); // Guardar la colección actualizada en localStorage
   
    openPackButton.disabled = false; // Vuelve a habilitar el botón "Abrir Sobres"
    console.log("¡Sobre abierto! Tu colección actual:", obtainedCards);


    //Actualiza el progreso
    actualizarProgresoColeccion();
}

// --- Asignar Event Listener al botón "Abrir Sobres" ---
openPackButton.addEventListener('click', openNewPack);


// --- 7. Lógica para el Índice de Cartas (Versión Básica de Fase 2) ---

// Función para cargar los IDs y nombres de los 150 Pokémon iniciales (para el índice)
async function fetchAllPokemonNamesAndIds() {
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}?limit=${POKEMON_COUNT}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Mapeamos los resultados para obtener solo el ID y el nombre
        allPokemonData = data.results.map((pokemon, index) => ({
            id: index + 1, // La API devuelve desde 0, pero los IDs de Pokémon son desde 1
            name: pokemon.name,
        }));
        
        console.log("Datos básicos de 150 Pokémon cargados para el índice.");
        renderPokemonGrid(); // Llama a renderPokemonGrid() una vez que los datos básicos estén listos
    } catch (error) {
        console.error("Error al cargar la lista de Pokémon para el índice:", error);
    }
}









// Función para mostrar el modal con los datos del Pokémon
function mostrarModalPokemon(pokemonData) {
    modalPokemonName.textContent = capitalize(pokemonData.name);
    modalPokemonImage.src = pokemonData.sprites.front_default;
    modalPokemonImage.alt = capitalize(pokemonData.name);
    modalPokemonType.textContent = pokemonData.types.map(t => capitalize(t.type.name)).join(', ');
    // Limpiar y rellenar las estadísticas
    modalPokemonStats.innerHTML = '';
    pokemonData.stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${capitalize(stat.stat.name)}: ${stat.base_stat}`;
        modalPokemonStats.appendChild(li);
    });
    pokemonDetailModal.classList.remove('hidden');
}

// Evento para cerrar el modal
closeButton.addEventListener('click', () => {
    pokemonDetailModal.classList.add('hidden');
});
pokemonDetailModal.addEventListener('click', (e) => {
    if (e.target === pokemonDetailModal) {
        pokemonDetailModal.classList.add('hidden');
    }
});












// Función para renderizar (dibujar) la cuadrícula de Pokémon en la sección de Índice
function renderPokemonGrid() {
    pokemonGrid.innerHTML = ''; // Limpiar el contenido actual del grid

    // Si allPokemonData aún no se ha cargado, no hacemos nada (esperaremos a fetchAllPokemonNamesAndIds)
    if (allPokemonData.length === 0) {
        console.log("allPokemonData aún no está listo, esperando...");
        return;
    }

    // Iterar sobre TODOS los 150 Pokémon (o los que estén en allPokemonData)
    allPokemonData.forEach(pokemon => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('pokemon-card'); // Clase CSS básica para cada recuadro
        cardDiv.dataset.id = pokemon.id; // Guarda el ID del Pokémon

        // Verificar si este Pokémon está en la colección 'obtainedCards' del usuario
        const isUnlocked = obtainedCards.some(card => card.id === pokemon.id);

        if (isUnlocked) {
            // Si la carta está desbloqueada, encontrar sus datos completos en 'obtainedCards'
            const unlockedPokemonData = obtainedCards.find(card => card.id === pokemon.id);
            cardDiv.classList.add('unlocked'); // Añadir clase CSS para los estilos de "desbloqueado"
            // Usar la imagen y nombre reales del Pokémon desbloqueado
            const imageUrl = unlockedPokemonData.sprites.front_default;
            cardDiv.innerHTML = `
                <img src="${imageUrl}" alt="${capitalize(unlockedPokemonData.name)}">
                <p>${capitalize(unlockedPokemonData.name)}</p>
            `;
            // En la Fase 3, añadiremos el evento de clic para abrir el modal
            cardDiv.addEventListener('click', () => {
                
               mostrarModalPokemon(unlockedPokemonData);
            });
        } else {
            // Si la carta NO está desbloqueada
            cardDiv.classList.add('locked'); // Añadir clase CSS para los estilos de "bloqueado"
            cardDiv.innerHTML = `?`; // Mostrar el signo de interrogación
            cardDiv.addEventListener('click', () => {
                console.log(`Pokémon ${pokemon.name} (ID: ${pokemon.id}) aún no descubierto.`);
            });
        }
        pokemonGrid.appendChild(cardDiv); // Añadir el recuadro de la carta al contenedor del grid
    });

    //Actualiza el progreso
    actualizarProgresoColeccion();
}







// --- Llamar a la función para precargar los datos básicos y renderizar el índice al inicio ---
// Es vital que esto se llame una vez que el script está cargado y listo.
fetchAllPokemonNamesAndIds();
