// Parte lógica para Mi Colección

// Búsqueda por nombre de Pokémon
if (pokemonSearch && pokemonGrid) {
    pokemonSearch.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        renderPokemonGrid();
    });
}

/**
 * --- Drag-to-scroll para los chips de tipo ---
 * - Permite desplazar horizontalmente la barra de filtros de tipo Pokémon arrastrando con el mouse.
 * - Mejora la experiencia en dispositivos donde hay muchos tipos y no caben todos en pantalla.
 */
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

// Filtro por tipo de los Pokémon
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

// Listener de los Modal de Información de los Pokemón
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

// Modal para la Bienvenida de nuevos Usuarios
window.addEventListener('DOMContentLoaded', () => {
    const welcomeModal = document.getElementById('welcome-modal');
    const closeWelcome = document.getElementById('close-welcome');
    if (welcomeModal && closeWelcome) {
        // Listeners SIEMPRE activos
        closeWelcome.addEventListener('click', () => {
            welcomeModal.classList.add('hidden');
            localStorage.setItem('welcomeShown', 'true');
        });
        
        welcomeModal.addEventListener('click', (e) => {
            if (e.target === welcomeModal) {
                welcomeModal.classList.add('hidden');
                localStorage.setItem('welcomeShown', 'true');
            }
        });

        if (!localStorage.getItem('welcomeShown')) {
            welcomeModal.classList.remove('hidden');
        } else {
            welcomeModal.classList.add('hidden');
        }
    }
});

/**
 * Renderiza la cuadrícula de cartas Pokémon en la vista de colección.
 * - Filtra los Pokémon por nombre (búsqueda) y por tipo si hay uno seleccionado.
 * - Muestra las cartas desbloqueadas con su imagen, nombre y color de fondo según el tipo principal.
 * - Las cartas bloqueadas muestran "???" y no permiten ver detalles.
 * - Al hacer clic en una carta desbloqueada, muestra el modal de detalles.
 * - Actualiza la barra y el texto de progreso de la colección.
 */
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
    // Filtro por tipo si hay tipo seleccionado
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
            
            // Aplicar color de fondo según el tipo principal del Pokémon
            const mainType = unlockedPokemonData.types[0]?.type?.name || 'normal';
            const bgColor = TYPE_COLORS[mainType] || TYPE_COLORS['normal'];
            cardDiv.style.backgroundColor = bgColor;
            
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

// --- Carga inicial de la colección ---

/**
 * Descarga la lista de nombres e IDs de los 150 Pokémon de la primera generación desde la PokeAPI.
 * - Guarda los datos mínimos (id y nombre) en el arreglo global allPokemonData.
 * - Llama a renderPokemonGrid() para mostrar la cuadrícula inicial de la colección.
 * - Maneja errores de red o de la API mostrando un mensaje en consola.
 */
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

/**
 * - Si existe el contenedor de la cuadrícula de Pokémon, inicia la carga de la lista base de Pokémon.
 * - Esto asegura que la colección se renderice solo en la vista correspondiente.
 */
if (pokemonGrid) {
    fetchAllPokemonNamesAndIds(); 
} 