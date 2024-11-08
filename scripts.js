// scripts.js
document.addEventListener("DOMContentLoaded", () => {
    const hasVisited = sessionStorage.getItem("hasVisited");

    if (hasVisited) {
        document.body.classList.remove("animate-fadein");
    } else {
        sessionStorage.setItem("hasVisited", "true");
    }
});
