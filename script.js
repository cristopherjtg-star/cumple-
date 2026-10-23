const musicToggle = document.getElementById("musicToggle");
const surpriseButton = document.getElementById("surpriseButton");
const heroSurprise = document.getElementById("heroSurprise");
const surpriseMessage = document.getElementById("surpriseMessage");
const confettiLayer = document.getElementById("confettiLayer");
const moreConfetti = document.getElementById("moreConfetti");

const toast = document.getElementById("toast");
let toastTimer;
function showToast(html) {
  toast.innerHTML = html;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.hidden = true; }, 350);
  }, 9000);
}

const YT_ID = "lY5V4hSLWY8";
const YT_URL = "https://youtu.be/" + YT_ID;
const YT_LINK = '<a href="' + YT_URL + '" target="_blank" rel="noopener">abrirla en YouTube</a>';
let ytPlayer = null;
let ytReady = false;
let lastYtError = null;
let wantMusic = false;
let userChose = false;
let useLocal = false;
const localAudio = new Audio("musica/cancion.mp3");
localAudio.loop = true;

function setMusicUI(on) {
  musicToggle.textContent = on ? "♫ Apagar música" : "♫ Activar música";
  musicToggle.setAttribute("aria-pressed", String(on));
  musicToggle.setAttribute("aria-label", on ? "Apagar la música de fondo" : "Activar la música de fondo");
  musicToggle.classList.toggle("is-playing", on);
}

function fadeVolume(setter, target = 80) {
  let volume = 0;
  setter(0);
  const timer = setInterval(() => {
    volume = Math.min(volume + 5, target);
    setter(volume);
    if (volume >= target) clearInterval(timer);
  }, 120);
}

window.onYouTubeIframeAPIReady = () => {
  const playerVars = { playsinline: 1, controls: 0, rel: 0, loop: 1, playlist: YT_ID };
  if (location.protocol.startsWith("http")) playerVars.origin = location.origin;
  ytPlayer = new YT.Player("ytPlayer", {
    width: "200",
    height: "200",
    videoId: YT_ID,
    playerVars,
    events: {
      onReady: () => { ytReady = true; },
      onStateChange: (event) => {
        if (useLocal) return;
        setMusicUI(event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING);
      },
      onError: (event) => {
        lastYtError = event.data;
        useLocal = true;
        wantMusic = false;
        setMusicUI(false);
      }
    }
  });
};
const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

async function startMusic() {
  if (useLocal) {
    try {
      localAudio.volume = 0;
      await localAudio.play();
      fadeVolume((v) => { localAudio.volume = v / 100; });
      wantMusic = true;
      setMusicUI(true);
      return true;
    } catch (error) {
      return false;
    }
  }
  if (!ytReady) return false;
  wantMusic = true;
  ytPlayer.playVideo();
  fadeVolume((v) => ytPlayer.setVolume(v));
  return true;
}

function stopMusic() {
  wantMusic = false;
  if (useLocal) localAudio.pause();
  else if (ytReady) ytPlayer.pauseVideo();
  setMusicUI(false);
}

function explainMusicFailure() {
  if (!useLocal) {
    showToast("🎵 La música se está cargando. Pulsa otra vez en unos segundos (necesita internet).");
  } else if (location.protocol === "file:" || lastYtError === 153) {
    showToast("🎵 YouTube bloquea el video si abres la web con doble clic (error " + (lastYtError || "file") + "). Ábrela con Live Server o publícala en Vercel, o puedes " + YT_LINK + ".");
  } else if (lastYtError === 101 || lastYtError === 150) {
    showToast("🎵 El dueño del video no permite reproducirlo dentro de otras webs (error " + lastYtError + "). Guarda la canción como <b>musica/cancion.mp3</b> para que suene aquí, o puedes " + YT_LINK + ".");
  } else {
    showToast("🎵 No pude reproducir la música (error " + (lastYtError || "audio") + "). Si tienes el MP3, guárdalo como <b>musica/cancion.mp3</b>, o puedes " + YT_LINK + ".");
  }
}

musicToggle.addEventListener("click", async () => {
  userChose = true;
  if (wantMusic) {
    stopMusic();
    return;
  }
  if (!(await startMusic())) explainMusicFailure();
});

// Música de fondo: arranca con el primer toque o tecla en cualquier parte (los navegadores no permiten sonido sin un gesto).
const autoEvents = ["click", "keydown"];
function autoStartMusic(event) {
  if (userChose || wantMusic) return;
  if (event.target.closest && event.target.closest("#musicToggle")) return;
  startMusic().then((ok) => {
    if (ok) autoEvents.forEach((name) => document.removeEventListener(name, autoStartMusic));
  });
}
autoEvents.forEach((name) => document.addEventListener(name, autoStartMusic));

setMusicUI(false);
window.setTimeout(() => {
  if (!wantMusic && !lastYtError) showToast("🎵 Toca cualquier parte de la página para que suene la música de fondo.");
}, 1500);

function launchConfetti(amount = 90) {
  const colors = ["#e86b91", "#f5c95d", "#b9a0f3", "#91d8c3", "#ff9f77", "#f6d8e1"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--duration", `${2 + Math.random() * 2.2}s`);
    piece.style.setProperty("--drift", `${Math.random() * 220 - 110}px`);
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    confettiLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function openSurprise() {
  surpriseMessage.hidden = false;
  surpriseButton.textContent = "¡Sorpresa desbloqueada! 💗";
  launchConfetti(120);
  surpriseMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}

surpriseButton.addEventListener("click", openSurprise);
heroSurprise.addEventListener("click", () => {
  document.getElementById("final").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(openSurprise, 450);
});
moreConfetti.addEventListener("click", () => launchConfetti(130));

// Fallback for browsers that do not support smooth scrolling.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Aparición suave al hacer scroll
const revealTargets = document.querySelectorAll(".polaroid, .timeline-item, .letter, .section-heading, .final-section > *");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => { el.classList.add("reveal"); observer.observe(el); });
}

// Ver las fotos en grande
const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.hidden = true;
lightbox.innerHTML = '<img alt=""><button type="button" aria-label="Cerrar">×</button>';
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector("img");
const closeLightbox = () => { lightbox.hidden = true; };
document.querySelectorAll(".memory-card img, .hero-photo img").forEach((img) => {
  img.style.cursor = "zoom-in";
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
  });
});
lightbox.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeLightbox(); });
