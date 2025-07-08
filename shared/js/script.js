

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

// Elementos de la Sección "Índice de Cartas"
const pokemonGrid = document.getElementById('pokemon-grid'); // Contenedor para mostrar las cartas del índice

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

// --- 4. Lógica de Navegación (solo si existen los botones) ---
function showSection(sectionToShow) {
    if (indexSection) indexSection.classList.remove('active');
    if (openPackSection) openPackSection.classList.remove('active');
    if (tradeSection) tradeSection.classList.remove('active');
    if (navIndexButton) navIndexButton.classList.remove('active');
    if (navOpenPackButton) navOpenPackButton.classList.remove('active');
    if (navTradeButton) navTradeButton.classList.remove('active');
    if (sectionToShow) {
        sectionToShow.classList.add('active');
        if (sectionToShow === indexSection && navIndexButton) {
            navIndexButton.classList.add('active');
            renderPokemonGrid();
        } else if (sectionToShow === openPackSection && navOpenPackButton) {
            navOpenPackButton.classList.add('active');
        } else if (sectionToShow === tradeSection && navTradeButton) {
            navTradeButton.classList.add('active');
        }
    }
}
if (navIndexButton && indexSection) navIndexButton.addEventListener('click', () => showSection(indexSection));
if (navOpenPackButton && openPackSection) navOpenPackButton.addEventListener('click', () => showSection(openPackSection));
if (navTradeButton && tradeSection) navTradeButton.addEventListener('click', () => showSection(tradeSection));
if (indexSection && !openPackSection && !tradeSection) showSection(indexSection);

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
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('pokemon-card', 'unlocked');
    cardDiv.dataset.id = pokemon.id;
    const imageUrl = pokemon.sprites.front_default;
    cardDiv.innerHTML = `
        <img src="${imageUrl}" alt="${capitalize(pokemon.name)}">
        <p>${capitalize(pokemon.name)}</p>
    `;
    if (isOpenedPack) cardDiv.classList.add('newly-opened');
    return cardDiv;
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
            // Asignar evento para mostrar el modal de detalles si existe el modal
            if (typeof mostrarModalPokemon === 'function' && pokemonDetailModal) {
                cardElement.addEventListener('click', () => {
                    mostrarModalPokemon(pokemonData);
                });
            }
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

// --- 7. Lógica para el Índice de Cartas (solo si existe el grid) ---
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
    allPokemonData.forEach(pokemon => {
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
            cardDiv.innerHTML = `?`;
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
