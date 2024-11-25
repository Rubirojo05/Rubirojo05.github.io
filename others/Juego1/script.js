// Firebase Configuración
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2KJ0N0FksQJl658h-HdvkAO8CsLue1vw",
    authDomain: "rubennrouge.tech",
    projectId: "juego1-ca38d",
    storageBucket: "juego1-ca38d.appspot.com",
    messagingSenderId: "416427181010",
    appId: "1:416427181010:web:eb9f244b8a504f6c713e0b",
    measurementId: "G-60ZB046P0X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Configurar persistencia de sesión
setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
        console.error("Error al configurar la persistencia de sesión:", error);
    });

let userId = null;
let saldo = 1500;
let nombreUsuario = null;
let nombreCambiado = sessionStorage.getItem('nombreCambiado') === 'true';

document.getElementById('botonGirar').disabled = true;
const botonCerrarSesion = document.getElementById('botonCerrarSesion');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;

        // Verificar si el usuario está autorizado
        const userDocMantenimiento = await getDoc(doc(db, "authorizedUsers", userId));
        if (!userDocMantenimiento.exists() || !userDocMantenimiento.data().authorized) {
            await signOut(auth);
            window.location.href = '/others/Mantenimiento/index.html';
            return;
        }

        // Obtener datos del ranking
        const userDoc = await getDoc(doc(db, "ranking", userId));
        if (userDoc.exists()) {
            saldo = userDoc.data().saldo;
            nombreCambiado = userDoc.data().nombreCambiado || nombreCambiado;
            nombreUsuario = userDoc.data().nombre || user.displayName || "Anónimo";
        } else {
            await setDoc(doc(db, "ranking", userId), { nombre: user.displayName || "Anónimo", saldo, nombreCambiado });
            nombreUsuario = user.displayName || "Anónimo";
        }

        actualizarSaldo();
        obtenerRanking();

        document.getElementById('botonLogin').style.display = 'none';
        document.getElementById('botonGirar').disabled = false;

        document.querySelector('.cambiar-nombre').style.display = nombreCambiado ? 'none' : 'block';
        botonCerrarSesion.style.display = 'block';
    } else {
        window.location.href = '/others/Mantenimiento/index.html';
    }
});

// Evento de cerrar sesión
botonCerrarSesion.addEventListener('click', async () => {
    await signOut(auth);
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/others/Mantenimiento/index.html';
});

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
    agregarJugador(nombreUsuario || "Anónimo", saldo);

    document.getElementById('botonGirar').disabled = true;
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = "Girando...";
    const carretes = ['carrete1', 'carrete2', 'carrete3'].map(id => document.getElementById(id));
    let giros = 20;
    let intervalo = setInterval(() => {
        carretes.forEach(carrete => carrete.textContent = obtenerSimboloAleatorio());
        giros--;
        if (giros === 0) {
            clearInterval(intervalo);
            determinarResultado(carretes);
            document.getElementById('botonGirar').disabled = saldo <= 0;
            mensaje.textContent = "¡Presiona 'Girar' para comenzar!";
        }
    }, 100);
}

// Determinar resultado de los carretes
function determinarResultado([carrete1, carrete2, carrete3]) {
    const [simbolo1, simbolo2, simbolo3] = [carrete1.textContent, carrete2.textContent, carrete3.textContent];
    if (simbolo1 === simbolo2 && simbolo2 === simbolo3) {
        saldo += 500;
        mostrarAviso(`¡Felicidades! Ganaste 500€`);
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

// Actualizar saldo
function actualizarSaldo() {
    document.getElementById('saldo').textContent = `Saldo: ${saldo}€`;
}

// Obtener ranking
async function obtenerRanking() {
    const rankingContainer = document.getElementById('ranking');
    const q = query(collection(db, "ranking"), orderBy("saldo", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    rankingContainer.innerHTML = '';
    querySnapshot.forEach((doc, index) => {
        const jugador = doc.data();
        rankingContainer.innerHTML += `<div>${index + 1}. ${jugador.nombre}: ${jugador.saldo}€</div>`;
    });
}

// Agregar jugador al ranking
async function agregarJugador(nombre, saldo) {
    await setDoc(doc(db, "ranking", userId), { nombre, saldo, nombreCambiado }, { merge: true });
    obtenerRanking();
}
