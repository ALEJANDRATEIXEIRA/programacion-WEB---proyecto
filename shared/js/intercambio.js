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

// Ejemplo de listener básico se puede eliminarl o adaptarlo
if (selectYourCardButton) {
    selectYourCardButton.addEventListener('click', () => {
        alert('Aquí se abriría tu colección para seleccionar una carta.');
    });
} 