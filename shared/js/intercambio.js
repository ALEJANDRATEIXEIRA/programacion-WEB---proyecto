// Parte lógica para el Intercambio

/* ==========================
     Sección de Variables
   ==========================
*/

// Elementos principales de la vista de intercambio
const connectedUsersList = document.getElementById('connected-users');
const yourOfferCard = document.getElementById('your-offer-card');
const partnerOfferCard = document.getElementById('partner-offer-card');
const selectYourCardButton = document.getElementById('select-your-card-button');
const tradeButton = document.getElementById('trade-button');
const tradeMessage = document.getElementById('trade-message');


//Elementos de la vista de seleccionar cartas
const collectionModal = document.getElementById('collection-modal');
const collectionCards = document.getElementById('collection-cards');

// Elementos de búsqueda
const pokemonSearchTrade = document.getElementById('pokemon-search-trade');

// Variables globales para la selección
let selectedCards = [];
let searchTermTrade = '';

/**
 * Renderiza las cartas desbloqueadas del usuario en el contenedor indicado para la vista de intercambio.
 * - Permite filtrar las cartas por nombre usando la variable searchTermTrade.
 * - Muestra un mensaje si no hay cartas desbloqueadas o si ningún Pokémon coincide con el filtro.
 * - Permite seleccionar o deseleccionar cartas (máximo 3), resaltando las seleccionadas.
 * - Al seleccionar/deseleccionar, actualiza la visualización y llama a la función onCardSelect con las cartas seleccionadas.
 *
 * @param {HTMLElement} container - Contenedor donde se renderizan las cartas.
 * @param {Function} onCardSelect - Callback que recibe el array de cartas seleccionadas.
 */
function renderUnlockedCards(container, onCardSelect) {
    container.innerHTML = '';
    if (!obtainedCards.length) {
        container.innerHTML = "<p>No tienes cartas desbloqueadas todavía.</p>";
        return;
    }

    // Filtrar cartas según búsqueda por nombre
    let filteredCards = obtainedCards;
    
    // Filtro por nombre
    if (searchTermTrade && searchTermTrade.length > 0) {
        filteredCards = filteredCards.filter(card =>
            card.name.toLowerCase().includes(searchTermTrade.toLowerCase())
        );
    }

    if (filteredCards.length === 0) {
        container.innerHTML = "<p>No se encontraron Pokémon con los filtros aplicados.</p>";
        return;
    }

    filteredCards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('pokemon-card', 'unlocked');
        cardDiv.dataset.id = card.id;

        // Resalta si está seleccionada
        if (selectedCards.some(c => c.id === card.id)) {
            cardDiv.classList.add('selected');
        }

        cardDiv.innerHTML = `
            <img src="${card.sprites.front_default}" alt="${capitalize(card.name)}">
            <p>${capitalize(card.name)}</p>
        `;

        // Al hacer click: selecciona o deselecciona
        cardDiv.addEventListener('click', () => {
            const idx = selectedCards.findIndex(c => c.id === card.id);
            if (idx !== -1) {
                // Si ya está seleccionada, la quita
                selectedCards.splice(idx, 1);
            } else if (selectedCards.length < 3) {
                // Si no está y hay menos de 3, la añade
                selectedCards.push(card);
            }
            // Actualiza visualmente
            renderUnlockedCards(container, onCardSelect);
            // Muestra las seleccionadas
            onCardSelect(selectedCards);
        });

        container.appendChild(cardDiv);
    });
}

/**
 * Muestra visualmente las cartas seleccionadas para el intercambio en el área de oferta.
 * - Renderiza las cartas seleccionadas en el contenedor correspondiente.
 * - Habilita o deshabilita el botón de intercambio según la cantidad de cartas seleccionadas (solo permite entre 1 y 3).
 * - Actualiza el indicador visual de cuántas cartas han sido seleccionadas.
 * - Envía la selección actual al otro usuario (función enviarSeleccion).
 *
 * @param {Array} cards - Array de cartas seleccionadas para el intercambio.
 */
function mostrarCartasSeleccionadas(cards) {
    const offer = document.getElementById('your-offer-card');
    offer.innerHTML = '';
    cards.forEach(card => {
        offer.innerHTML += `
            <div class="pokemon-card mini">
                <img src="${card.sprites.front_default}" alt="${capitalize(card.name)}">
                <p>${capitalize(card.name)}</p>
            </div>
        `;
    });
    //limitar el botón de intercambio solo si hay 1-3 seleccionadas:
    document.getElementById('realizar-intercambio-btn').disabled = cards.length === 0 || cards.length > 3;

     // ACTUALIZA EL INDICADOR 
    const indicator = document.getElementById('selected-indicator');
    if (indicator) {
        let html = `<span>${cards.length}/3</span>`;
        
        indicator.innerHTML = html;
    }
    //envia la seleccion al otro usuario
    enviarSeleccion();

}

/** 
 * - Al hacer clic en el botón para seleccionar cartas, muestra el modal de selección
 * - Al renderiza las cartas desbloqueadas del usuario para que pueda elegir cuáles ofrecer en el intercambio.
*/
document.getElementById('select-your-card-button').addEventListener('click', () => {
    collectionModal.classList.remove('hidden');
    renderUnlockedCards(collectionCards, mostrarCartasSeleccionadas);
});

/**
 * - Al hacer clic en el botón de cerrar, oculta el modal de selección de cartas.
 * - Esto permite al usuario salir del modal sin realizar ninguna acción.
 */
document.getElementById('close-modal').addEventListener('click', () => {
    collectionModal.classList.add('hidden');
});

// Event listener para búsqueda por nombre
if (pokemonSearchTrade) {
    pokemonSearchTrade.addEventListener('input', (e) => {
        searchTermTrade = e.target.value.trim();
        renderUnlockedCards(collectionCards, mostrarCartasSeleccionadas);
    });
}

// Variables y lógica para el otro usuario
let partnerSelectedCards = [];
let partnerObtainedCards = []; // mostrar la colección del otro usuario


// Enviar y recibir selección de cartas por Ably
// Suponiendo que tienes el canal Ably ya inicializado como 'channel'
const ably = new Ably.Realtime("SCSImw.9aUeHw:jihBHGok1r44dnvJI157TPyGoD6oSVb1VcYQw2zb7QY")
ably.connection.once("connected", () => {
    console.log("Connected to Ably!")
})

const channel = ably.channels.get('intercambio-canal');

// Enviar selección al otro usuario cada vez que cambie
function enviarSeleccion() {
    channel.publish('seleccion-cartas', {
        selected: selectedCards.map(c => c.id),
        clientId: ably.connection.id
    });
}

//Suscripcion para recibir la seleccion del otro usuario
channel.subscribe('seleccion-cartas', async (mensaje) => {
    if (mensaje.data.clientId === ably.connection.id) return; // Ignora tus propios mensajes

    // Obtén los datos de cada Pokémon seleccionado por el otro usuario
    const partnerCardsPromises = mensaje.data.selected.map(id => getPokemonData(id));
    partnerSelectedCards = await Promise.all(partnerCardsPromises);

     console.log("Cartas obtenidas del otro usuario:", partnerSelectedCards);
    mostrarCartasSeleccionadasPartner(partnerSelectedCards);
});


//Mostrar las cartas seleccionadas del otro usuario
function mostrarCartasSeleccionadasPartner(cards) {
    const offer = document.getElementById('partner-offer-card');
    offer.innerHTML = '';
    console.log("Mostrando cartas del otro usuario:", cards);
    if (!cards || cards.length === 0) {
        offer.textContent = 'Esperando oferta';
        return;
    }
    cards.forEach(card => {
        if (!card) return;
        offer.innerHTML += `
            <div class="pokemon-card mini">
                <img src="${card.sprites.front_default}" alt="${capitalize(card.name)}">
                <p>${capitalize(card.name)}</p>
            </div>
        `;
    });
}


//Intercambio de cartas cuando ambos confirmen

let intercambioConfirmado = false;
let partnerConfirmado = false;


document.getElementById('realizar-intercambio-btn').addEventListener('click', () => {
    channel.publish('confirmar-intercambio', {
        clientId: ably.connection.id
    });
    intercambioConfirmado = true;
    tradeMessage.textContent = "Esperando confirmación del otro usuario...";

    if (partnerConfirmado) {
        realizarIntercambio();
    }
});


channel.subscribe('confirmar-intercambio', async (mensaje) => {
    if (mensaje.data.clientId === ably.connection.id) return;
    partnerConfirmado = true;
    if (intercambioConfirmado) {
        await realizarIntercambio();
    }
});


async function realizarIntercambio() {
    // Quitar tus cartas seleccionadas de obtainedCards
    obtainedCards = obtainedCards.filter(card => !selectedCards.some(sel => sel.id === card.id));

    // Agregar las cartas seleccionadas del otro usuario
    for (const card of partnerSelectedCards) {
        if (card && !obtainedCards.some(c => c.id === card.id)) {
            obtainedCards.push(card);
        }
    }

    // Limpiar selección y actualizar UI
    selectedCards = [];
    partnerSelectedCards = [];
    mostrarCartasSeleccionadas([]);
    mostrarCartasSeleccionadasPartner([]);
    renderUnlockedCards(collectionCards, mostrarCartasSeleccionadas);

    tradeMessage.textContent = "¡Intercambio realizado!";
    intercambioConfirmado = false;
    partnerConfirmado = false;
    saveCardsToLocalStorage();
}


channel.subscribe('sync-request', (mensaje) => {
    // Si el que pide no soy yo y yo tengo cartas seleccionadas, le envío mi selección
    if (mensaje.data.clientId !== ably.connection.id && selectedCards.length > 0) {
        enviarSeleccion();
    }
});

// Unirse a la presencia al entrar
channel.presence.enter({ username: 'Usuario ' + ably.connection.id });

// Escuchar cambios en la presencia
channel.presence.subscribe('enter', actualizarUsuariosConectados);
channel.presence.subscribe('leave', actualizarUsuariosConectados);

async function actualizarUsuariosConectados() {
    const members = await channel.presence.get();
    const lista = document.getElementById('connected-users');
    lista.innerHTML = '';
    members.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member.data.username;
        lista.appendChild(li);
    });
}

async function intentarUnirse() {
    const members = await channel.presence.get();
    if (members.length >= 2) {
        alert('El máximo de usuarios conectados es 2.');
        return;
    }
    channel.presence.enter({ username: 'Usuario ' + ably.connection.id });
}

// Al entrar a la vista de int
document.addEventListener('DOMContentLoaded', () => {
    intentarUnirse();
    channel.publish('sync-request', { clientId: ably.connection.id });
    enviarSeleccion(); // <-- Esto asegura que el otro usuario reciba tu selección al entrar
});


//Cierra los canales cuando se sale de la vista
window.addEventListener('beforeunload', () => {
    channel.detach();
    ably.close();
});