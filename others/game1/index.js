// Al cargar la página, restaurar la partida si existe
document.addEventListener('DOMContentLoaded', () => {
    restaurarPartida();
});

// ############# DIFICULTADES #############
function facil() {
    crearTablero(4, 0.2);
}
function medio() {
    crearTablero(8, 0.17);
}
function dificil() {
    crearTablero(12, 0.22);
}
function personalizado() {
    let tamaño;
    do {
        tamaño = Number(prompt("Introduce el tamaño del tablero (4-15)"));
        if (tamaño < 4 || tamaño > 15 || isNaN(tamaño)) {
            alert("Por favor, introduce un número válido entre 4 y 15.");
        }
    } while (tamaño < 4 || tamaño > 15 || isNaN(tamaño));
    crearTablero(tamaño, 0.15);
}

// ############# TEMPORIZADOR Y BANDERAS #############

function iniciarTemporizador() {
    temporizador = setInterval(() => {
        tiempoTranscurrido++;
        actualizarTemporizador();
        guardarPartida(); // Guardar el estado cada segundo
    }, 1000);
}
function detenerTemporizador() {
    clearInterval(temporizador);
}
function actualizarTemporizador() {
    temporizadorElemento.textContent = `Tiempo: ${tiempoTranscurrido}s`;
}
function actualizarContadorBanderas() {
    contadorBanderasElemento.textContent = `Banderas: ${numBanderas}`;
    guardarPartida(); // Guardar
}


// Variables globales
let tiempoTranscurrido = 0;
let temporizador;
let numBanderas = 0;
let numBanderasAcertadas = 0;
let juegoTerminado = false; // Indica si el juego ha terminado
const contenedor = document.getElementById("contenedor");
const contadorBanderasElemento = document.getElementById("contador-banderas");
const temporizadorElemento = document.getElementById("temporizador");

// ############# CREACIÓN TABLERO #############

// Crear el tablero
let tamañoGlobal, porcentajeBombasGlobal;
function crearTablero(tamaño, porcentajeBombas) {
    tamañoGlobal = tamaño;
    porcentajeBombasGlobal = porcentajeBombas;
    dibujarTableroHTML(tamaño);
    colocarBombas(tamaño, porcentajeBombas);
    numBanderas = Math.floor(tamaño * tamaño * porcentajeBombas);
    numBanderasAcertadas = 0;
    tiempoTranscurrido = 0;
    juegoTerminado = false; // Reiniciar el estado del juego
    actualizarContadorBanderas();
    actualizarTemporizador();
    iniciarTemporizador();
    guardarPartida(); // Guardar
}

// Dibuja el tablero HTML
function dibujarTableroHTML(tamaño) {
    contenedor.style.gridTemplateColumns = `repeat(${tamaño}, 1fr)`; // Crear columna 
    contenedor.style.gridTemplateRows = `repeat(${tamaño}, 1fr)`; // Crear fila
    let contenido = "";
    for (let i = 0; i < tamaño; i++) {
        for (let j = 0; j < tamaño; j++) {
            contenido += `<div class='celda' data-row='${i}' data-col='${j}'></div>`; // Celda vacía por defecto
        }
    }
    contenedor.innerHTML = contenido;
    const celdaSize = 500 / tamaño;

    // Tamaño de las celdas y Eventos
    document.querySelectorAll('.celda').forEach(celda => { // Añadir eventos a cada celda
        celda.style.width = `${celdaSize}px`;
        celda.style.height = `${celdaSize}px`;
        celda.addEventListener('click', liberarCasilla); // Evento clic izquierdo
        celda.addEventListener('contextmenu', colocarBandera); // Evento clic derecho
    });
}

// ############# CASILLAS #############

// Liberar casilla al hacer clic
function liberarCasilla(event) {
    if (juegoTerminado) return; // Ignorar clics si el juego ha terminado
    const celda = event.target;

    // Verificar si la celda tiene una bandera colocada
    if (celda.classList.contains('bandera')) {
        return; // Ignorar el clic izquierdo si hay una bandera
    }

    if (celda.classList.contains('bomba')) {
        mostrarBombas();
        celda.classList.add('mostrar-mina'); // Agregar estilo para mostrar la mina
        detenerTemporizador();
        alert("¡Ha explotado una mina 💥! Has perdido 😭​");
        juegoTerminado = true; // Bloquear interacciones
    } else if (!celda.classList.contains('liberada')) {
        celda.classList.add('liberada');
        const bombasCercanas = celda.dataset.bombasCercanas; // Obtener el número de bombas cercanas
        if (bombasCercanas) {
            celda.textContent = bombasCercanas; // Mostrar el número de bombas cercanas
        } else {
            const row = parseInt(celda.getAttribute('data-row'));
            const col = parseInt(celda.getAttribute('data-col'));
            liberarCasillasAdyacentes(row, col, 0);
        }
    }
    guardarPartida(); // Guardar el estado después de revelar una casilla
}

// Liberar casillas adyacentes
function liberarCasillasAdyacentes(row, col, liberadas) {
    if (liberadas >= 15 || juegoTerminado) return; // Evitar recursión si el juego ha terminado
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            const celda = document.querySelector(`.celda[data-row='${newRow}'][data-col='${newCol}']`); // Seleccionar la celda adyacente actual 
            if (
                celda &&
                !celda.classList.contains('liberada') && // Evitar liberar celdas ya liberadas
                !celda.classList.contains('bomba') && // Evitar liberar celdas con bombas
                !juegoTerminado // Evitar liberar celdas si el juego ha terminado
            ) {
                celda.classList.add('liberada'); // Marcar la celda como liberada
                const bombasCercanas = celda.dataset.bombasCercanas;
                if (bombasCercanas) {
                    celda.textContent = bombasCercanas; // Mostrar el número de bombas cercanas
                } else {
                    liberarCasillasAdyacentes(newRow, newCol, liberadas + 1); // Llamar a la función recursivamente
                }
            }
        }
    }
    guardarPartida(); // Guardar el estado después de liberar casillas adyacentes
}

// ############# BOMBAS Y BANDERAS #############

// Colocar bombas en el tablero
function colocarBombas(tamaño, porcentajeBombas) {
    const totalBombas = Math.floor(tamaño * tamaño * porcentajeBombas); // Número total de bombas aleatorias
    const celdas = document.querySelectorAll('.celda');
    let bombasColocadas = 0;
    while (bombasColocadas < totalBombas) { // Colocar bombas aleatorias
        const index = Math.floor(Math.random() * celdas.length); // Mientras no se hayan colocado todas las bombas
        const celda = celdas[index]; // Seleccionar una celda aleatoria
        if (!celda.classList.contains('bomba')) {  // Si la celda no contiene una bomba ya colocada
            celda.classList.add('bomba'); // Colocar la bomba
            bombasColocadas++; // Incrementar el contador de bombas colocadas
        }
    }
    celdas.forEach(celda => {
        if (!celda.classList.contains('bomba')) {
            const row = parseInt(celda.getAttribute('data-row'));
            const col = parseInt(celda.getAttribute('data-col'));
            const bombasCercanas = contarBombasCercanas(row, col, tamaño); // Contar bombas cercanas
            if (bombasCercanas > 0) { // Si hay bombas cercanas a la celda actual 
                celda.dataset.bombasCercanas = bombasCercanas; // Guardar el número de bombas cercanas
            }
        }
    });
    guardarPartida(); // Guardar el estado después de colocar las bombas
}

// Contar bombas cercanas (el número que indica cuantas hay alrededor de una celda)
function contarBombasCercanas(row, col, tamaño) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < tamaño && newCol >= 0 && newCol < tamaño) {
                const celda = document.querySelector(`.celda[data-row='${newRow}'][data-col='${newCol}']`); // Seleccionar la celda adyacente actual 
                if (celda && celda.classList.contains('bomba')) { // Si la celda adyacente contiene una bomba
                    count++; // Incrementar el contador de bombas (numero de bombas cercanas)
                }
            }
        }
    }
    return count;
}

// Mostrar todas las bombas cuando pierdes
function mostrarBombas() {
    const bombas = document.querySelectorAll('.bomba');
    bombas.forEach(bomba => {
        if (!bomba.classList.contains('liberada')) {
            bomba.classList.add('mostrar-mina'); // Agregar la clase 'mostrar-mina' a todas las minas no descubiertas
        }
    });
    guardarPartida(); // Guardar el estado después de mostrar las bombas
}

// Colocar o quitar bandera
function colocarBandera(event) {
    if (juegoTerminado) return; // Desactiva click derecho si el juego ha terminado
    event.preventDefault();
    const celda = event.target;

    if (!celda.classList.contains('liberada')) {
        if (celda.classList.contains('bandera')) {
            celda.classList.remove('bandera'); // Quitar bandera
            numBanderas++;
            if (celda.classList.contains('bomba')) numBanderasAcertadas--;
        } else {
            celda.classList.add('bandera'); // Colocar bandera
            numBanderas--;
            if (celda.classList.contains('bomba')) numBanderasAcertadas++;
        }
        actualizarContadorBanderas();
        verificarVictoria();
    }
    guardarPartida(); // Guardar
}

// ############# VICTORIA #############

// Verificar victoria
function verificarVictoria() {
    //Si el número de banderas acertadas es igual al número de bombas, el jugador ha ganado
    if (numBanderasAcertadas === Math.floor(tamañoGlobal * tamañoGlobal * porcentajeBombasGlobal)) {
        detenerTemporizador();
        alert("¡Has ganado! 🏆​");
        detenerTemporizador();
        juegoTerminado = true; // Bloquear interacciones
        guardarPartida();
    }
}


// ############# GUARDAR Y RESTAURAR PARTIDA #############

// Guardar el estado del juego en localStorage en formato JSON
function guardarPartida() {
    const estado = {
        tamaño: tamañoGlobal,
        porcentajeBombas: porcentajeBombasGlobal,
        tiempoTranscurrido: tiempoTranscurrido,
        numBanderas: numBanderas,
        numBanderasAcertadas: numBanderasAcertadas,
        juegoTerminado: juegoTerminado,
        celdas: Array.from(document.querySelectorAll('.celda')).map(celda => ({
            row: celda.getAttribute('data-row'),
            col: celda.getAttribute('data-col'),
            clases: Array.from(celda.classList),
            dataset: Object.assign({}, celda.dataset),
        })),
    };
    localStorage.setItem('buscaminas', JSON.stringify(estado)); // Guardar el estado en localStorage como JSON
}

// Restaurar el estado del juego desde localStorage
function restaurarPartida() {
    const estadoGuardado = localStorage.getItem('buscaminas'); // Obtener el estado guardado
    if (estadoGuardado) {
        const estado = JSON.parse(estadoGuardado); // Parsear el JSON guardado para obtener el estado

        // Restaurar variables globales
        tamañoGlobal = estado.tamaño;
        porcentajeBombasGlobal = estado.porcentajeBombas;
        tiempoTranscurrido = estado.tiempoTranscurrido;
        numBanderas = estado.numBanderas;
        numBanderasAcertadas = estado.numBanderasAcertadas;
        juegoTerminado = estado.juegoTerminado;

        // Reconstruir el tablero
        dibujarTableroHTML(tamañoGlobal);
        estado.celdas.forEach(celdaEstado => {
            const celda = document.querySelector(
                `.celda[data-row='${celdaEstado.row}'][data-col='${celdaEstado.col}']`
            );
            if (celda) {
                celda.classList.remove(...celda.classList); // Limpiar clases existentes
                celda.classList.add(...celdaEstado.clases); // Restaurar clases
                Object.keys(celdaEstado.dataset).forEach(key => {
                    celda.dataset[key] = celdaEstado.dataset[key];

                    // Mostrar el número de bombas cercanas si la celda está liberada
                    if (celda.classList.contains('liberada') && key === 'bombasCercanas' && celda.dataset.bombasCercanas > 0) {
                        celda.textContent = celda.dataset.bombasCercanas;
                    } else {
                        celda.textContent = ''; // Limpiar contenido si no aplica
                    }
                });
            }
        });

        // Actualizar Interfaz
        actualizarContadorBanderas();
        actualizarTemporizador();

        // Reanudar temporizador si el juego no ha terminado
        if (!juegoTerminado) {
            iniciarTemporizador();
        }
    }
}
