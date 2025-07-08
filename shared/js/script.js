

// --- 1. Seleccionar elementos HTML ---


// Elementos de la Sección "Abrir un Sobre"
const openPackButton = document.getElementById('open-pack-button'); // Botón para abrir sobres
const packResultsContainer = document.getElementById('pack-results'); // Donde se mostrarán las cartas nuevas

// Elementos de la Sección "Índice de Cartas"
const pokemonGrid = document.getElementById('pokemon-grid'); // Contenedor para mostrar las cartas del índice
const pokemonSearch = document.getElementById('pokemon-search'); // Input de búsqueda
const pokemonTypeFilter = document.querySelector('.pokemon-type-filter'); // Select de filtro por tipo
let selectedType = '';

// Elementos del Modal (si existen)
const pokemonDetailModal = document.getElementById('pokemon-detail-modal');
const closeButton = pokemonDetailModal ? pokemonDetailModal.querySelector('.close-button') : null;
const modalPokemonName = document.getElementById('modal-pokemon-name');
const modalPokemonImage = document.getElementById('modal-pokemon-image');
const modalPokemonType = document.getElementById('modal-pokemon-type');
const modalPokemonStats = document.getElementById('modal-pokemon-stats');

// --- 2. Variables de Datos Globales ---
const POKEMON_COUNT = 150;
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';
let obtainedCards = JSON.parse(localStorage.getItem('pokemonCollection')) || [];
let allPokemonData = [];
let searchTerm = '';

// --- 3. Funciones de Utilidad ---
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function saveCardsToLocalStorage() {
    localStorage.setItem('pokemonCollection', JSON.stringify(obtainedCards));
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


// --- 5. Funciones para Consumir la PokeAPI ---
const pokemonCache = {};
async function getPokemonData(id) {
    if (pokemonCache[id]) return pokemonCache[id];
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}${id}/`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        pokemonCache[id] = data;
        return data;
    } catch (error) {
        console.error(`Error al obtener datos del Pokémon ${id}:`, error);
        return null;
    }
}




function createPokemonCardElement(pokemon, isOpenedPack = false) {
    // Si es para el pack abierto (animación flip)
    if (isOpenedPack) {
        const cartaBox = document.createElement('div');
        cartaBox.className = 'carta-box';

        const carta = document.createElement('div');
        carta.className = 'carta';

        // Cara trasera (reverso)
        const caraDetras = document.createElement('div');
        caraDetras.className = 'cara detras';
        caraDetras.innerHTML = `<div>???</div>`;
        

        // Cara frontal (frente)
        const caraFrente = document.createElement('div');
        caraFrente.className = 'cara frente';
        caraFrente.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${capitalize(pokemon.name)}" width="100" height="100">
            <p>${capitalize(pokemon.name)}</p>
        `;

        carta.appendChild(caraDetras);
        carta.appendChild(caraFrente);
        cartaBox.appendChild(carta);

        // solo muestra el modal si la carta ya está volteada
         cartaBox.addEventListener('click', function () {

            if (!carta.classList.contains('volteada')) {
                carta.classList.add('volteada');
            } else {
               mostrarModalPokemon(pokemon);
            }

        });

        return cartaBox;
    } else {
        // Para el índice, la carta normal
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('pokemon-card', 'unlocked');
        cardDiv.dataset.id = pokemon.id;
        const imageUrl = pokemon.sprites.front_default;
        cardDiv.innerHTML = `
            <img src="${imageUrl}" alt="${capitalize(pokemon.name)}">
            <p>${capitalize(pokemon.name)}</p>
        `;
        return cardDiv;
    }
}







// --- 6. Lógica para Abrir Sobres (solo si existen los elementos) ---
async function openNewPack() {
    if (!openPackButton || !packResultsContainer) return;
    openPackButton.disabled = true;
    packResultsContainer.innerHTML = '';
    const chosenPokemonIds = new Set();
    while (chosenPokemonIds.size < 6) {
        const randomId = Math.floor(Math.random() * POKEMON_COUNT) + 1;
        chosenPokemonIds.add(randomId);
    }
    const idsToFetch = Array.from(chosenPokemonIds);
    const fetchPromises = idsToFetch.map(id => getPokemonData(id));
    const fetchedPokemonData = await Promise.all(fetchPromises);
    for (const pokemonData of fetchedPokemonData) {
        if (pokemonData) {
            const exists = obtainedCards.some(card => card.id === pokemonData.id);
            if (!exists) {
                const minimalPokemon = {
                    id: pokemonData.id,
                    name: pokemonData.name,
                    sprites: {
                        front_default: pokemonData.sprites.front_default
                    },
                    types: pokemonData.types,
                    stats: pokemonData.stats
                };
                obtainedCards.push(minimalPokemon);
            }
            const cardElement = createPokemonCardElement(pokemonData, true);
            packResultsContainer.appendChild(cardElement);
        }
    }
    saveCardsToLocalStorage();
    openPackButton.disabled = false;
    actualizarProgresoColeccion();
}
if (openPackButton && packResultsContainer) {
    openPackButton.addEventListener('click', openNewPack);
}

//Logica para mostrar las vistas de sobres
document.addEventListener('DOMContentLoaded', () => {
    const preOpenView = document.getElementById('pre-open-view');
    const postOpenView = document.getElementById('post-open-view');
    const openPackButton = document.getElementById('open-pack-button');
    const openAnotherPackButton = document.getElementById('open-another-pack-button');
    const packResultsContainer = document.getElementById('pack-results');

    function mostrarVistaPrevia() {
        preOpenView.style.display = '';
        postOpenView.style.display = 'none';
        packResultsContainer.innerHTML = '';
    }

    function mostrarVistaResultados() {
        preOpenView.style.display = 'none';
        postOpenView.style.display = '';
    }

    openPackButton.addEventListener('click', async () => {
        
        mostrarVistaResultados();
        //La accion de renderizar las cartas esta en otro lado :D 
    });

    openAnotherPackButton.addEventListener('click', () => {
        mostrarVistaPrevia();
    });

    // Inicialmente muestra la vista previa
    mostrarVistaPrevia();
});





// --- 7. Lógica para el Índice de Cartas (solo si existe el grid) ---
if (pokemonSearch && pokemonGrid) {
    pokemonSearch.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderPokemonGrid();
    });
}


// Esto sirve para el scroll arrastrado para seleccionar el tipo
if (pokemonTypeFilter) {
    let isDown = false;
    let startX;
    let scrollLeft;
    pokemonTypeFilter.addEventListener('mousedown', (e) => {
        isDown = true;
        pokemonTypeFilter.classList.add('dragging');
        startX = e.pageX - pokemonTypeFilter.offsetLeft;
        scrollLeft = pokemonTypeFilter.scrollLeft;
    });
    pokemonTypeFilter.addEventListener('mouseleave', () => {
        isDown = false;
        pokemonTypeFilter.classList.remove('dragging');
    });
    pokemonTypeFilter.addEventListener('mouseup', () => {
        isDown = false;
        pokemonTypeFilter.classList.remove('dragging');
    });
    pokemonTypeFilter.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - pokemonTypeFilter.offsetLeft;
        const walk = (x - startX) * 1.5; // velocidad de arrastre
        pokemonTypeFilter.scrollLeft = scrollLeft - walk;
    });
}

if (pokemonTypeFilter && pokemonGrid) {
    pokemonTypeFilter.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.classList.contains('type')) {
            pokemonTypeFilter.querySelectorAll('.type').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            selectedType = e.target.dataset.type;
            renderPokemonGrid();
        }
    });
}

async function fetchAllPokemonNamesAndIds() {
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}?limit=${POKEMON_COUNT}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        allPokemonData = data.results.map((pokemon, index) => ({
            id: index + 1,
            name: pokemon.name,
        }));
        renderPokemonGrid();
    } catch (error) {
        console.error("Error al cargar la lista de Pokémon para el índice:", error);
    }
}
function mostrarModalPokemon(pokemonData) {
    if (!pokemonDetailModal) return;
    modalPokemonName.textContent = capitalize(pokemonData.name);
    modalPokemonImage.src = pokemonData.sprites.front_default;
    modalPokemonImage.alt = capitalize(pokemonData.name);
    modalPokemonType.textContent = pokemonData.types.map(t => capitalize(t.type.name)).join(', ');
    modalPokemonStats.innerHTML = '';
    pokemonData.stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${capitalize(stat.stat.name)}: ${stat.base_stat}`;
        modalPokemonStats.appendChild(li);
    });
    pokemonDetailModal.classList.remove('hidden');
}
if (closeButton && pokemonDetailModal) {
    closeButton.addEventListener('click', () => {
        pokemonDetailModal.classList.add('hidden');
    });
    pokemonDetailModal.addEventListener('click', (e) => {
        if (e.target === pokemonDetailModal) {
            pokemonDetailModal.classList.add('hidden');
        }
    });
}
function renderPokemonGrid() {
    if (!pokemonGrid) return;
    pokemonGrid.innerHTML = '';
    if (allPokemonData.length === 0) return;
    let filteredPokemon = allPokemonData;
    if (searchTerm && searchTerm.length > 0) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
    }
    // Filtro por tipo si hay llega haver un tipo seleccionado
    if (selectedType && selectedType.length > 0) {
        filteredPokemon = filteredPokemon.filter(pokemon => {
            const unlocked = obtainedCards.find(card => card.id === pokemon.id);
            if (!unlocked) return false;
            return unlocked.types.some(t => t.type.name === selectedType);
        });
    }
    filteredPokemon.forEach(pokemon => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('pokemon-card');
        cardDiv.dataset.id = pokemon.id;
        const isUnlocked = obtainedCards.some(card => card.id === pokemon.id);
        if (isUnlocked) {
            const unlockedPokemonData = obtainedCards.find(card => card.id === pokemon.id);
            cardDiv.classList.add('unlocked');
            const imageUrl = unlockedPokemonData.sprites.front_default;
            cardDiv.innerHTML = `
                <img src="${imageUrl}" alt="${capitalize(unlockedPokemonData.name)}">
                <p>${capitalize(unlockedPokemonData.name)}</p>
            `;
            cardDiv.addEventListener('click', () => {
                mostrarModalPokemon(unlockedPokemonData);
            });
        } else {
            cardDiv.classList.add('locked');
            cardDiv.innerHTML = `???`;
            cardDiv.addEventListener('click', () => {
                console.log(`Pokémon ${pokemon.name} (ID: ${pokemon.id}) aún no descubierto.`);
            });
        }
        pokemonGrid.appendChild(cardDiv);
    });
    actualizarProgresoColeccion();
}
if (pokemonGrid) {
    fetchAllPokemonNamesAndIds();
}


async function fetchAllPokemonNamesAndIds() {
    try {
        const response = await fetch(`${POKEAPI_BASE_URL}?limit=${POKEMON_COUNT}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        allPokemonData = data.results.map((pokemon, index) => ({
            id: index + 1,
            name: pokemon.name,
        }));
        renderPokemonGrid();
    } catch (error) {
        console.error("Error al cargar la lista de Pokémon para el índice:", error);
    }
}
function mostrarModalPokemon(pokemonData) {
    if (!pokemonDetailModal) return;
    modalPokemonName.textContent = capitalize(pokemonData.name);
    modalPokemonImage.src = pokemonData.sprites.front_default;
    modalPokemonImage.alt = capitalize(pokemonData.name);
    modalPokemonType.textContent = pokemonData.types.map(t => capitalize(t.type.name)).join(', ');
    modalPokemonStats.innerHTML = '';
    pokemonData.stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${capitalize(stat.stat.name)}: ${stat.base_stat}`;
        modalPokemonStats.appendChild(li);
    });
    pokemonDetailModal.classList.remove('hidden');
}
if (closeButton && pokemonDetailModal) {
    closeButton.addEventListener('click', () => {
        pokemonDetailModal.classList.add('hidden');
    });
    pokemonDetailModal.addEventListener('click', (e) => {
        if (e.target === pokemonDetailModal) {
            pokemonDetailModal.classList.add('hidden');
        }
    });
}
function renderPokemonGrid() {
    if (!pokemonGrid) return;
    pokemonGrid.innerHTML = '';
    if (allPokemonData.length === 0) return;
    // Filtrar por nombre si hay búsqueda
    let filteredPokemon = allPokemonData;
    if (searchTerm && searchTerm.length > 0) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
    }
    // Filtrar por tipo si hay tipo seleccionado
    if (selectedType && selectedType.length > 0) {
        filteredPokemon = filteredPokemon.filter(pokemon => {
            // Buscar el Pokémon en obtainedCards para ver sus tipos
            const unlocked = obtainedCards.find(card => card.id === pokemon.id);
            if (!unlocked) return false;
            return unlocked.types.some(t => t.type.name === selectedType);
        });
    }
    filteredPokemon.forEach(pokemon => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('pokemon-card');
        cardDiv.dataset.id = pokemon.id;
        const isUnlocked = obtainedCards.some(card => card.id === pokemon.id);
        if (isUnlocked) {
            const unlockedPokemonData = obtainedCards.find(card => card.id === pokemon.id);
            cardDiv.classList.add('unlocked');
            const imageUrl = unlockedPokemonData.sprites.front_default;
            cardDiv.innerHTML = `
                <img src="${imageUrl}" alt="${capitalize(unlockedPokemonData.name)}">
                <p>${capitalize(unlockedPokemonData.name)}</p>
            `;
            cardDiv.addEventListener('click', () => {
                mostrarModalPokemon(unlockedPokemonData);
            });
        } else {
            cardDiv.classList.add('locked');
            cardDiv.innerHTML = `???`;
            cardDiv.addEventListener('click', () => {
                console.log(`Pokémon ${pokemon.name} (ID: ${pokemon.id}) aún no descubierto.`);
            });
        }
        pokemonGrid.appendChild(cardDiv);
    });
    actualizarProgresoColeccion();
}
if (pokemonGrid) {
    fetchAllPokemonNamesAndIds();
}
