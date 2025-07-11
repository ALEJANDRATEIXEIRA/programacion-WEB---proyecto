// Parte lógica para las cosas globales

/* ==========================
     Sección de Variables
   ==========================
*/

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

// Variables de Datos Globales
const POKEMON_COUNT = 150;
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';
let obtainedCards = JSON.parse(localStorage.getItem('pokemonCollection')) || [];
let allPokemonData = [];
let searchTerm = '';
const pokemonCache = [];
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


/**
 * Convierte la primera letra de un string a mayúscula y deja el resto igual.
 * Útil para mostrar nombres de Pokémon y tipos de forma más legible en la interfaz.
 *
 * @param {string} string - El texto a capitalizar.
 * @returns {string} El texto con la primera letra en mayúscula.
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Guarda la colección de cartas obtenidas en el almacenamiento local del navegador.
 * Así, la colección del usuario se conserva aunque cierre o recargue la página.
 */
function saveCardsToLocalStorage() {
    localStorage.setItem('pokemonCollection', JSON.stringify(obtainedCards));
}

/**
 * Guarda la colección actual de cartas Pokémon del usuario en el localStorage.
 * Permite que la colección persista entre sesiones y recargas de la página.
 */
function actualizarProgresoColeccion() {
    const progreso = obtainedCards.length;
    const total = POKEMON_COUNT;
    const progressBar = document.getElementById('collection-progress');
    const progressLabel = document.getElementById('progress-label');
    if (progressBar) progressBar.value = progreso;
    if (progressBar) progressBar.max = total;
    if (progressLabel) progressLabel.textContent = `${progreso} / ${total} Pokémones desbloqueados`;
}

/**
 * Obtiene los datos de un Pokémon por su ID.
 * - Si ya está en la caché local (pokemonCache), lo devuelve directamente para evitar peticiones repetidas.
 * - Si no está, consulta la PokeAPI, extrae solo los campos necesarios y los guarda en la caché.
 * - Devuelve un objeto simplificado con la información relevante del Pokémon.
 *
 * @param {number} id - El ID del Pokémon a consultar.
 * @returns {Object} Objeto con los datos mínimos del Pokémon (id, nombre, sprite, tipos y estadísticas).
 */
async function getPokemonData(id) {
    let pokemon = pokemonCache.find(p => p.id === id);
    if (pokemon) return pokemon;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemonData = await response.json();

    // Solo guarda los campos necesarios
    const minimalData = {
        id: pokemonData.id,
        name: pokemonData.name,
        sprites: {
            front_default: pokemonData.sprites.front_default
        },
        types: pokemonData.types,
        stats: pokemonData.stats
    };

    pokemonCache.push(minimalData);
    return minimalData;
}


/**
 * Muestra el modal con los detalles de un Pokémon seleccionado.
 * - Rellena el modal con el nombre, imagen, tipos y estadísticas del Pokémon.
 * - Utiliza la función capitalize para mostrar los textos de forma legible.
 * - Hace visible el modal en pantalla.
 *
 * @param {Object} pokemonData - Objeto con los datos del Pokémon a mostrar.
 */
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

/**
 * Crea y devuelve el elemento visual (div) de una carta de Pokémon para mostrar en la colección.
 * - Asigna clases CSS y el ID del Pokémon como atributo de datos.
 * - Muestra la imagen y el nombre del Pokémon.
 * - Aplica un color de fondo según el tipo principal del Pokémon usando TYPE_COLORS.
 *
 * @param {Object} pokemon - Objeto con los datos del Pokémon.
 * @param {boolean} isOpenedPack - (Opcional) Indica si la carta es de un sobre abierto (no usado aquí).
 * @returns {HTMLElement} Elemento div listo para insertar en el DOM.
 */
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
