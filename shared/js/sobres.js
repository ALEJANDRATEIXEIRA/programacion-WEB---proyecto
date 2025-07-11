//  Parte lógica para Sobres

// Para que funcione el cerrar los detalles del pokémon
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

/**
 * Lógica principal para abrir un nuevo sobre de cartas Pokémon.
 * - Selecciona 6 Pokémon aleatorios (sin repetir) de la primera generación.
 * - Obtiene los datos de cada Pokémon desde la API.
 * - Agrega a la colección los que aún no han sido obtenidos.
 * - Renderiza las cartas obtenidas con animación de apertura.
 * - Actualiza el progreso y guarda la colección en localStorage.
 * 
 * Esta función se ejecuta al hacer clic en el botón de "Abrir Sobres".
 */
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
                obtainedCards.push(pokemonData); 
            }
            const cardElement = createPokemonCardElement(pokemonData, true);
            packResultsContainer.appendChild(cardElement);
        }
    }
    saveCardsToLocalStorage();
    openPackButton.disabled = false;
    actualizarProgresoColeccion();
}

/* 
* -Asigna el evento de abrir un nuevo sobre solo si existen los elementos en el DOM.
* -Esto asegura que la función openNewPack se ejecute al hacer clic en el botón correspondiente.
*/
if (openPackButton && packResultsContainer) {
    openPackButton.addEventListener('click', openNewPack);
}


/**
 * Crea y devuelve el elemento visual de una carta de Pokémon.
 * Si es una carta obtenida de un sobre (isOpenedPack = true), la carta tiene animación de "voltear" (flip)
 * y solo muestra el modal de detalles cuando ya ha sido volteada.
 * Si es para el índice, retorna una carta simple desbloqueada.
 *
 * @param {Object} pokemon - Objeto con los datos del Pokémon.
 * @param {boolean} isOpenedPack - Indica si la carta es de un sobre recién abierto (animación flip).
 * @returns {HTMLElement} Elemento de la carta listo para insertar en el DOM.
 */
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
        
        // Aplicar color de fondo según el tipo principal del Pokémon
        const mainType = pokemon.types[0]?.type?.name || 'normal';
        const bgColor = TYPE_COLORS[mainType] || TYPE_COLORS['normal'];
        caraFrente.style.backgroundColor = bgColor;
        
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


/**
 * Lógica de control de vistas para la sección de sobres.
 * 
 * - Alterna entre la vista previa (antes de abrir el sobre) y la vista de resultados (después de abrirlo).
 * - Al hacer clic en "Abrir Sobres", muestra la vista de resultados (las cartas obtenidas).
 * - Al hacer clic en "Abrir Otro Sobre", regresa a la vista previa y limpia los resultados anteriores.
 * - Al cargar la página, siempre inicia mostrando la vista previa.
 * 
 * Esto permite una experiencia de usuario fluida y clara al abrir sobres múltiples veces.
 */
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
        // La acción de renderizar las cartas está en otro lado :D
    });

    openAnotherPackButton.addEventListener('click', () => {
        mostrarVistaPrevia();
    });

    // Inicialmente muestra la vista previa
    mostrarVistaPrevia();
}); 