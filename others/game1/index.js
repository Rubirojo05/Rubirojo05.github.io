//TABLERO PREDETERMINADO

//DIFICULTAD FACIL
function facil() {
    const contenedor = document.getElementById('contenedor');
    contenedor.style.gridTemplateColumns = `repeat(4, 1fr)`;
    contenedor.style.gridTemplateRows = `repeat(4, 1fr)`;

    let contenido = "";
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            contenido += "<div class='celda'></div>";
        }
    }
    contenedor.innerHTML = contenido;

    const celdaSize = 500 / 4; // Ajusta 500 al tamaño deseado del contenedor
    document.querySelectorAll('.celda').forEach(celda => {
        celda.style.width = `${celdaSize}px`;
        celda.style.height = `${celdaSize}px`;
    });
}

//DIFICULTAD MEDIA
function medio() {
    const contenedor = document.getElementById('contenedor');
    contenedor.style.gridTemplateColumns = `repeat(8, 1fr)`;
    contenedor.style.gridTemplateRows = `repeat(8, 1fr)`;

    let contenido = "";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            contenido += "<div class='celda'></div>";
        }
    }
    contenedor.innerHTML = contenido;

    const celdaSize = 500 / 8; // Ajusta 500 al tamaño deseado del contenedor
    document.querySelectorAll('.celda').forEach(celda => {
        celda.style.width = `${celdaSize}px`;
        celda.style.height = `${celdaSize}px`;
    });
}

//DIFICULTAD DIFICIL
function dificil() {
    const contenedor = document.getElementById('contenedor');
    contenedor.style.gridTemplateColumns = `repeat(12, 1fr)`;
    contenedor.style.gridTemplateRows = `repeat(12, 1fr)`;

    let contenido = "";
    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 12; j++) {
            contenido += "<div class='celda'></div>";
        }
    }
    contenedor.innerHTML = contenido;

    const celdaSize = 500 / 12; // Ajusta 500 al tamaño deseado del contenedor
    document.querySelectorAll('.celda').forEach(celda => {
        celda.style.width = `${celdaSize}px`;
        celda.style.height = `${celdaSize}px`;
    });
}

//DIFICULTAD PERSONALIZADA
function personalizado() {
    let tamaño;
    do {
        tamaño = Number(prompt("Introduce el tamaño del tablero (4-15)"));
        if (tamaño < 4 || tamaño > 15 || isNaN(tamaño)) {
            alert("Por favor, introduce un número válido entre 4 y 15.");
        }
    } while (tamaño < 4 || tamaño > 15 || isNaN(tamaño));

    const contenedor = document.getElementById('contenedor');
    contenedor.style.gridTemplateColumns = `repeat(${tamaño}, 1fr)`;
    contenedor.style.gridTemplateRows = `repeat(${tamaño}, 1fr)`;

    let contenido = "";
    for (let i = 0; i < tamaño; i++) {
        for (let j = 0; j < tamaño; j++) {
            contenido += "<div class='celda'></div>";
        }
    }
    contenedor.innerHTML = contenido;

    const celdaSize = 500 / tamaño; // Ajusta 500 al tamaño deseado del contenedor
    document.querySelectorAll('.celda').forEach(celda => {
        celda.style.width = `${celdaSize}px`;
        celda.style.height = `${celdaSize}px`;
    });
}



