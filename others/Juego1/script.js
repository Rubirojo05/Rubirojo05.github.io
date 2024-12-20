// Firebase Configuración
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDoc, setDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2KJ0N0FksQJl658h-HdvkAO8CsLue1vw",
    authDomain: "juego1-ca38d.firebaseapp.com",
    projectId: "juego1-ca38d",
    storageBucket: "juego1-ca38d.appspot.com",
    messagingSenderId: "416427181010",
    appId: "1:416427181010:web:eb9f244b8a504f6c713e0b",
    measurementId: "G-60ZB046P0X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Variables globales
let userId = null;
let saldo = 1500; // Establecer saldo inicial en 1.500€
let nombreUsuario = null;
let nombreCambiado = sessionStorage.getItem('nombreCambiado') === 'true';

// Desactivar botón de girar antes de iniciar sesión
document.getElementById('botonGirar').disabled = true;

document.getElementById('botonCambiarNombre').disabled = saldo < 1000; // Desactivar botón de cambiar nombre si el saldo es menor a 1000

// Referencia al botón de cerrar sesión y nombre de la sesión
const botonCerrarSesion = document.getElementById('botonCerrarSesion');
const sessionNameElement = document.getElementById('sessionName');

// Verificar el estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        const userDoc = await getDoc(doc(db, "ranking", userId));
        if (userDoc.exists()) {
            saldo = userDoc.data().saldo;
            nombreCambiado = userDoc.data().nombreCambiado || nombreCambiado;
            nombreUsuario = userDoc.data().nombre; // Asegurarse de recuperar el nombre guardado
        } else {
            await agregarJugador(user.displayName || "Anónimo", saldo);
            nombreUsuario = user.displayName || "Anónimo";
        }

        localStorage.setItem('nombreUsuario', nombreUsuario);
        actualizarSaldo();
        obtenerRanking();
        document.getElementById('botonLogin').style.display = 'none';
        document.getElementById('botonGirar').disabled = false;

        if (!nombreCambiado) {
            document.querySelector('.cambiar-nombre').style.display = 'block';
        } else {
            document.querySelector('.cambiar-nombre').style.display = 'none';
        }

        botonCerrarSesion.style.display = 'block';
        sessionNameElement.style.display = 'block';
        sessionNameElement.textContent = "Sesión Iniciada: " + nombreUsuario;
    } else {
        document.getElementById('botonLogin').style.display = 'block';
        document.querySelector('.cambiar-nombre').style.display = 'none';
        botonCerrarSesion.style.display = 'none';
        sessionNameElement.style.display = 'none';
    }
});

// Iniciar sesión con Google
document.getElementById('botonLogin').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        userId = user.uid;
        const userDoc = await getDoc(doc(db, "ranking", userId));
        if (userDoc.exists()) {
            saldo = userDoc.data().saldo;
            nombreCambiado = userDoc.data().nombreCambiado || nombreCambiado;
            nombreUsuario = userDoc.data().nombre; // Asegurarse de recuperar el nombre guardado
        } else {
            await agregarJugador(user.displayName || "Anónimo", saldo);
            nombreUsuario = user.displayName || "Anónimo";
        }

        localStorage.setItem('nombreUsuario', nombreUsuario);
        actualizarSaldo();
        obtenerRanking();
        document.getElementById('botonLogin').style.display = 'none';
        document.getElementById('botonGirar').disabled = false;

        if (!nombreCambiado) {
            document.querySelector('.cambiar-nombre').style.display = 'block';
        } else {
            document.querySelector('.cambiar-nombre').style.display = 'none';
        }

        botonCerrarSesion.style.display = 'block';
        sessionNameElement.style.display = 'block';
        sessionNameElement.textContent = "Sesión Iniciada: " + nombreUsuario;
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
});

// Evento de cerrar sesión
botonCerrarSesion.addEventListener('click', () => {
    auth.signOut().then(() => {
        sessionStorage.clear();
        localStorage.removeItem('nombreUsuario');
        window.location.reload();
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});

// Actualizar saldo y estado del botón de cambiar nombre
function actualizarSaldo() {
    const saldoElemento = document.getElementById('saldo');
    saldoElemento.textContent = `Saldo: ${saldo}€`;
    document.getElementById('botonGirar').disabled = saldo <= 0;
    document.getElementById('botonCambiarNombre').disabled = saldo < 1000;
}

// Obtener ranking
async function obtenerRanking() {
    const rankingContainer = document.getElementById('ranking');
    const q = query(collection(db, "ranking"), orderBy("saldo", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    rankingContainer.innerHTML = '';
    let posicion = 1;
    querySnapshot.forEach((doc) => {
        const jugador = doc.data();
        if (jugador.nombre && jugador.saldo !== undefined) {
            const div = document.createElement('div');
            div.textContent = `${posicion}. ${jugador.nombre}: ${jugador.saldo}€`;
            rankingContainer.appendChild(div);
            posicion++;
        }
    });
}

// Agregar jugador al ranking
async function agregarJugador(nombre, saldo) {
    if (!nombre || nombre.trim() === "" || /[^a-zA-Z0-9]/.test(nombre) || nombre.length > 20) {
        mostrarAviso("Por favor, introduce un nombre válido (sin caracteres especiales, máximo 20 caracteres).");
        return;
    }

    try {
        await setDoc(doc(db, "ranking", userId), { nombre, saldo, nombreCambiado }, { merge: true });
        obtenerRanking();
    } catch (error) {
        console.error("Error al guardar el jugador:", error);
    }
}

// Función para obtener un símbolo aleatorio
function obtenerSimboloAleatorio() {
    const simbolos = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐'];
    return simbolos[Math.floor(Math.random() * simbolos.length)];
}

// Girar los carretes
function girarCarretes() {
    if (saldo <= 0) {
        mostrarAviso("Saldo insuficiente. Recarga para seguir jugando.");
        return;
    }
    saldo -= 50;
    actualizarSaldo();
    agregarJugador(nombreUsuario || user.displayName || "Anónimo", saldo);

    botonGirar.disabled = true;
    mensaje.textContent = "Girando...";

    let giros = 20;
    let intervalo1 = setInterval(() => {
        carrete1.textContent = obtenerSimboloAleatorio();
        giros--;
        if (giros === 0) {
            clearInterval(intervalo1);
            detenerCarrete2();
        }
    }, 100);

    function detenerCarrete2() {
        giros = 20;
        let intervalo2 = setInterval(() => {
            carrete2.textContent = obtenerSimboloAleatorio();
            giros--;
            if (giros === 0) {
                clearInterval(intervalo2);
                detenerCarrete3();
            }
        }, 100);
    }

    function detenerCarrete3() {
        giros = 20;
        let intervalo3 = setInterval(() => {
            carrete3.textContent = obtenerSimboloAleatorio();
            giros--;
            if (giros === 0) {
                clearInterval(intervalo3);
                determinarResultado();
                botonGirar.disabled = saldo <= 0;
                mensaje.textContent = "¡Presiona 'Girar' para comenzar!";
            }
        }, 100);
    }
}

// Determinar resultado de los carretes
function determinarResultado() {
    const simbolo1 = carrete1.textContent;
    const simbolo2 = carrete2.textContent;
    const simbolo3 = carrete3.textContent;

    if (simbolo1 === simbolo2 && simbolo2 === simbolo3) {
        const premio = 500;
        saldo += premio;
        mostrarAviso(`¡Felicidades! Ganaste ${premio}€`);
    } else {
        mostrarAviso("¡Inténtalo de nuevo!");
    }
    actualizarSaldo();
}

// Mostrar aviso
function mostrarAviso(texto) {
    const aviso = document.getElementById('aviso');
    aviso.textContent = texto;
    aviso.classList.add("mostrar");
    setTimeout(() => aviso.classList.remove("mostrar"), 3000);
}

// Evento de girar
document.getElementById('botonGirar').addEventListener('click', girarCarretes);

// Cambiar nombre
document.getElementById('botonCambiarNombre').addEventListener('click', async () => {
    nombreUsuario = document.getElementById('nombreUsuario').value.trim();
    if (nombreUsuario && !/[^a-zA-Z0-9]/.test(nombreUsuario) && nombreUsuario.length <= 20) {
        if (saldo >= 1000) {
            saldo -= 1000;
            actualizarSaldo();
            nombreCambiado = true;
            sessionStorage.setItem('nombreCambiado', 'true');
            await agregarJugador(nombreUsuario, saldo);
            localStorage.setItem('nombreUsuario', nombreUsuario);
            document.querySelector('.cambiar-nombre').style.display = 'none';
            mostrarAviso('Nombre cambiado exitosamente.');
        } else {
            mostrarAviso('Saldo insuficiente para cambiar el nombre.');
        }
    }
});
