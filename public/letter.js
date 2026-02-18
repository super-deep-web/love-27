function openEnvelope() {
  const env = document.getElementById("envelope");
  env.classList.add("envelope-opening");

  setTimeout(() => {
    const ent = document.getElementById("entrance");
    ent.style.transition = "opacity 0.45s, transform 0.45s";
    ent.style.opacity = "0";
    ent.style.transform = "translateY(-18px)";

    setTimeout(() => {
      ent.classList.add("hidden");
      const ls = document.getElementById("letterSection");
      ls.classList.remove("hidden");

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          ls.style.opacity = "1";
          ls.style.transform = "translateY(0)";
        }),
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 460);
  }, 580);
}

// Mostrar toast si viene del juego con puntuación
const params = new URLSearchParams(window.location.search);
const sc = params.get("score");
if (sc) {
  setTimeout(() => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "🌸 ¡Llegaste con " + sc + " puntos!";
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(16px)";
      }, 3000);
    }
  }, 1800);
}
