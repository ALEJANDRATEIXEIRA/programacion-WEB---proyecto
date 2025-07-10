// --- Parte lógica para Sobres ---

//Para que funcione el cerrar los detalles del pokémon
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

// --- Lógica para Abrir Sobres 
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

if (openPackButton && packResultsContainer) {
    openPackButton.addEventListener('click', openNewPack);
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


// Lógica para mostrar las vistas de sobres

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