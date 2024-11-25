// Importa las funciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBTWp2vJuSqVbDoOflKJdjIeCzpDMGiagk",
    authDomain: "accesojuego1.firebaseapp.com",
    projectId: "accesojuego1",
    storageBucket: "accesojuego1.firebasestorage.app",
    messagingSenderId: "945600838765",
    appId: "1:945600838765:web:abb0924584af688d2f5364",
    measurementId: "G-PX3V453V2Z"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Manejar el botón de acceso
document.getElementById('testAccess').addEventListener('click', async () => {
    // Obtén el correo y la contraseña desde los campos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Inicia sesión con los valores proporcionados
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verifica si el usuario está autorizado
        const userDoc = await getDoc(doc(db, "authorizedUsers", user.uid));

        if (userDoc.exists()) {
            document.getElementById('status').textContent = "Acceso concedido. Redirigiendo...";
            localStorage.setItem('mantenimientoAuthToken', await user.getIdToken()); // Guardar token de autenticación en localStorage
            setTimeout(() => {
                window.location.href = "/others/Juego1/index.html";
            }, 2000);
        } else {
            document.getElementById('status').textContent = "No tienes autorización para acceder.";
            await signOut(auth);
        }
    } catch (error) {
        document.getElementById('status').textContent = "No tienes autorización para acceder.";
    }
});
