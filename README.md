# 🎮 Pokémon TCG Virtual

## Descripción del Proyecto
Pokémon TCG Virtual es una aplicación web que simula la experiencia de coleccionar cartas Pokémon de la primera generación. Permite al usuario abrir sobres virtuales, buscar y filtrar su colección, y simular intercambios con otros usuarios. La app cuenta con una interfaz moderna, navegación por vistas y animaciones para una experiencia inmersiva.

---

## Estructura y explicación de archivos principales

### **shared/js/script.js**
- Lógica y utilidades globales: manejo de la colección, progreso, utilidades de texto, obtención de datos de la PokeAPI, y renderizado de cartas y modales.

### **shared/js/index.js**
- Controla la vista principal de la colección.
- Implementa búsqueda, filtrado por tipo, renderizado de la cuadrícula de cartas y el modal de bienvenida.

### **shared/js/sobres.js**
- Lógica para abrir sobres virtuales.
- Selecciona 6 Pokémon aleatorios, los añade a la colección y muestra animaciones de apertura.

### **shared/js/intercambio.js**
- Lógica para la vista de intercambio.
- Permite seleccionar cartas para ofrecer, muestra las seleccionadas y prepara la lógica para intercambios entre usuarios.

---

## Tecnologías usadas

- **HTML5**: Estructura semántica y accesible.
- **CSS3**:  
  - Variables CSS (Custom Properties)  
  - Flexbox y Grid  
  - Animaciones y transiciones  
  - Media queries para responsive  
- **JavaScript (Vanilla)**:  
  - `async/await` para asincronía  
  - Fetch API para consumir la PokeAPI  
  - LocalStorage para persistencia  
  - Manipulación del DOM  
  - Event listeners para interacción  
- **PokeAPI** (https://pokeapi.co/): Para obtener los datos de los Pokémon.
- **Websocket** (https://ably.com/): Sugerido para la lógica de intercambio en tiempo real.

---

## ¿Cómo ejecutarlo localmente?

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/ALEJANDRATEIXEIRA/programacion-WEB---proyecto.git
   ```
2. **Abre el proyecto:**
   - Puedes abrir el archivo `index.html` directamente en tu navegador.
   - Para una mejor experiencia, usa la extensión **Live Server** en Visual Studio Code.

3. **(Opcional) Versión web:**
   - Si está disponible, puedes visitar la versión web publicada en GitHub Pages:  
     `<acá va la url>`

---

## Créditos

- [@Alejandra Teixeira](https://github.com/ALEJANDRATEIXEIRA)
- [@Juan Arocha](https://github.com/jgarocha22)
- [@Axander Chavarri](https://github.com/Axander23)

---

¡Disfruta coleccionando, abriendo sobres e intercambiando Pokémones!

---