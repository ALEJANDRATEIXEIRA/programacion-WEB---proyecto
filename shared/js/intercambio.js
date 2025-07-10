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
    // Si quieres limitar el botón de intercambio solo si hay 1-3 seleccionadas:
    document.getElementById('trade-button').disabled = cards.length === 0 || cards.length > 3;
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