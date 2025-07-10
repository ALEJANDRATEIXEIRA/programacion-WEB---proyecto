// --- Parte lógica para las cosas globales ---


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

// Guarda en cache los datos de los pokémon para no consultar a cada rato la API
// en dado caso de que no se haya trabajado con ese pokémon se llama a la API para guardarlo
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

// Modal de detalle de Pokémon Esta es una función global
function mostrarModalPokemon(pokemonData) {
    const pokemonDetailModal = document.getElementById('pokemon-detail-modal');
    const modalPokemonName = document.getElementById('modal-pokemon-name');
    const modalPokemonImage = document.getElementById('modal-pokemon-image');
    const modalPokemonType = document.getElementById('modal-pokemon-type');
    const modalPokemonStats = document.getElementById('modal-pokemon-stats');
    
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

// Mapeo de colores por tipo de Pokémon
const TYPE_COLORS = {
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
};

function createPokemonCardElement(pokemon, isOpenedPack = false) {
    const cardDiv = document.createElement('div'); // Crea un nuevo div
    cardDiv.classList.add('pokemon-card', 'unlocked'); // Le añade clases CSS
    cardDiv.dataset.id = pokemon.id; // Guarda el ID del Pokémon como un atributo de datos HTML

    const imageUrl = pokemon.sprites.front_default;

    // Aplicar color de fondo según el tipo principal del Pokémon
    const mainType = pokemon.types[0]?.type?.name || 'normal';
    const bgColor = TYPE_COLORS[mainType] || TYPE_COLORS['normal'];
    cardDiv.style.backgroundColor = bgColor;
    
    cardDiv.innerHTML = `
        <img src="${imageUrl}" alt="${capitalize(pokemon.name)}">
        <p>${capitalize(pokemon.name)}</p>
    `;

    return cardDiv; // Devuelve el elemento div de la carta
}

