// --- Parte lógica para Intercambio ---

// Elementos principales de la vista de intercambio
const connectedUsersList = document.getElementById('connected-users');
const yourOfferCard = document.getElementById('your-offer-card');
const partnerOfferCard = document.getElementById('partner-offer-card');
const selectYourCardButton = document.getElementById('select-your-card-button');
const tradeButton = document.getElementById('trade-button');
const tradeMessage = document.getElementById('trade-message');

// Aquí se agregará la lógica para:
// - Mostrar usuarios conectados
// - Seleccionar carta de tu colección
// - Mostrar la carta ofrecida por el otro usuario
// - Habilitar/deshabilitar el botón de intercambio
// - Mostrar mensajes de estado



//Elementos de la vista de seleccionar cartas
const collectionModal = document.getElementById('collection-modal');
const collectionCards = document.getElementById('collection-cards');


// Variables globales para la selección
let selectedCards = [];

//Funcion de renderizado de cartas desbloqueadas
function renderUnlockedCards(container, onCardSelect) {
    container.innerHTML = '';
    if (!obtainedCards.length) {
        container.innerHTML = "<p>No tienes cartas desbloqueadas todavía.</p>";
        return;
    }

    obtainedCards.forEach(card => {
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

// Mostrar en el área de cartas seleccionadas
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

// Mostrar modal y cartas desbloqueadas
document.getElementById('select-your-card-button').addEventListener('click', () => {
    collectionModal.classList.remove('hidden');
    renderUnlockedCards(collectionCards, mostrarCartasSeleccionadas);
});

// Cerrar modal
document.getElementById('close-modal').addEventListener('click', () => {
    collectionModal.classList.add('hidden');
});








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

document.getElementById('realizar-intercambio-btn').addEventListener('click', () => {
    // Envía confirmación de intercambio
    channel.publish('confirmar-intercambio', {
        selected: selectedCards.map(c => c.id),
        clientId: ably.connection.id
    });
    intercambioConfirmado = true;
    tradeMessage.textContent = "Esperando confirmación del otro usuario...";
});

// Recibe confirmación del otro usuario
channel.subscribe('confirmar-intercambio', async (mensaje) => {
    if (mensaje.data.clientId === ably.connection.id) return; // Ignora tus propios mensajes

    // Solo intercambia si tú también confirmaste
    if (intercambioConfirmado) {
        // Quita tus cartas seleccionadas de obtainedCards
        obtainedCards = obtainedCards.filter(card => !selectedCards.some(sel => sel.id === card.id));
        // Agrega las cartas del otro usuario 
        for (const id of mensaje.data.selected) {
            const card = await getPokemonData(id);
            if (card && !obtainedCards.some(c => c.id === card.id)) {
                obtainedCards.push(card);
            }
        }

        //Guarda en local storage
        saveCardsToLocalStorage();
        // Limpia selección y actualiza UI
        selectedCards = [];
        mostrarCartasSeleccionadas([]);
        renderUnlockedCards(collectionCards, mostrarCartasSeleccionadas);
        tradeMessage.textContent = "¡Intercambio realizado!";
        intercambioConfirmado = false;
    }else{
        tradeMessage.textContent = "Esperando confirmación del otro usuario...";
    }
        
    
    
});