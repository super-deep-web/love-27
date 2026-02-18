const ICONS = [
  { icon: "ri-heart-3-fill", name: "corazón" },
  { icon: "ri-star-fill", name: "estrella" },
  { icon: "ri-moon-fill", name: "luna" },
  { icon: "ri-sun-fill", name: "sol" },
  { icon: "ri-leaf-fill", name: "hoja" },
  { icon: "ri-flower-fill", name: "flor" },
  { icon: "ri-music-2-fill", name: "música" },
  { icon: "ri-cloud-fill", name: "nube" },
  { icon: "ri-fire-fill", name: "fuego" },
  { icon: "ri-sparkling-fill", name: "brillo" },
  { icon: "ri-umbrella-fill", name: "paraguas" },
  { icon: "ri-seedling-fill", name: "brote" },
  { icon: "ri-trophy-fill", name: "trofeo" },
  { icon: "ri-drop-fill", name: "gota" },
  { icon: "ri-key-fill", name: "llave" },
  { icon: "ri-medal-fill", name: "medalla" },
  { icon: "ri-cake-fill", name: "pastel" },
  { icon: "ri-gift-fill", name: "regalo" },
];

const TOTAL_ROUNDS = 5;
const MAX_LIVES = 3;
const SHOW_CARDS = 6;
const SHOW_MS = 4000;
const CHOICE_SECS = 10;
const CHOICE_CARDS = 3;

let round = 0;
let score = 0;
let lives = MAX_LIVES;
let phase = "idle";
let timerID = null;
let timerLeft = CHOICE_SECS;
let shownSet = [];
let options = [];
let impostor = null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initUI() {
  const dots = document.getElementById("roundDots");
  dots.innerHTML = "";
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const d = document.createElement("div");
    d.className =
      "w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-rose/30 border-2 border-rose transition-all duration-300";
    d.id = "dot-" + i;
    dots.appendChild(d);
  }
  renderLives();
  renderScore();
}

function renderLives() {
  const row = document.getElementById("livesRow");
  row.innerHTML = "";
  for (let i = 0; i < MAX_LIVES; i++) {
    const ic = document.createElement("i");
    ic.className =
      "ri-heart-fill text-xl md:text-2xl text-mauve transition-all duration-350 " +
      (i >= lives ? "opacity-20 scale-75" : "");
    row.appendChild(ic);
  }
}

function renderScore() {
  document.getElementById("scoreTxt").textContent = score;
}

function setPhase(title, sub) {
  document.getElementById("phaseTitle").textContent = title;
  document.getElementById("phaseSub").textContent = sub || "";
  document.getElementById("phaseBanner").classList.remove("hidden");
}

function setFeedback(txt) {
  const el = document.getElementById("feedback");
  el.style.opacity = "0";
  setTimeout(() => {
    el.textContent = txt;
    el.style.opacity = "1";
  }, 160);
}

function startGame() {
  document.getElementById("startArea").classList.add("hidden");
  round = 0;
  score = 0;
  lives = MAX_LIVES;
  phase = "idle";
  initUI();
  nextRound();
}

function restartGame(from) {
  const screen = from === "win" ? "winScreen" : "overScreen";
  document.getElementById(screen).style.opacity = "0";
  document.getElementById(screen).style.pointerEvents = "none";

  document.getElementById("cardsDisplay").innerHTML = "";
  document.getElementById("timerWrap").classList.add("hidden");
  document
    .getElementById("timerBar")
    .classList.remove("bg-gradient-to-r", "from-[#f8b8c0]", "to-[#d86878]");
  document.getElementById("phaseBanner").classList.add("hidden");
  clearInterval(timerID);
  setFeedback("");

  round = 0;
  score = 0;
  lives = MAX_LIVES;
  phase = "idle";
  initUI();
  nextRound();
}

function nextRound() {
  if (round >= TOTAL_ROUNDS) {
    setTimeout(showWin, 700);
    return;
  }

  const dotEl = document.getElementById("dot-" + round);
  if (dotEl) {
    dotEl.classList.add("bg-mauve", "scale-130", "border-mauve");
    dotEl.classList.remove("bg-rose/30", "border-rose");
  }
  setFeedback("");

  const pool = shuffle(ICONS);
  shownSet = pool.slice(0, SHOW_CARDS);
  impostor = pool.find((c) => !shownSet.some((s) => s.icon === c.icon));

  const picks = shuffle(shownSet).slice(0, CHOICE_CARDS - 1);
  options = shuffle([...picks, impostor]);

  setPhase(
    "Ronda " + (round + 1) + " de " + TOTAL_ROUNDS,
    "Observa bien las " + SHOW_CARDS + " cartas…",
  );

  document.getElementById("timerWrap").classList.add("hidden");
  const timerBar = document.getElementById("timerBar");
  timerBar.classList.remove(
    "bg-gradient-to-r",
    "from-[#f8b8c0]",
    "to-[#d86878]",
  );
  timerBar.classList.add(
    "bg-gradient-to-r",
    "from-mint",
    "via-rose",
    "to-mauve",
  );

  const display = document.getElementById("cardsDisplay");
  display.classList.remove("grid-cols-3", "gap-4", "md:gap-6");
  display.classList.add("grid-cols-3", "gap-2", "md:gap-3.5");

  phase = "showing";
  renderCards(shownSet, false);

  setTimeout(() => flipAllCards(() => setTimeout(showChoices, 440)), SHOW_MS);
}

function makeCard(data, idx, clickable) {
  const card = document.createElement("div");
  card.className =
    "aspect-[3/4] rounded-2xl relative transition-transform duration-150 " +
    (clickable ? "cursor-pointer active:scale-95" : "");
  card.id = "card-" + idx;
  card.style.perspective = "900px";

  card.innerHTML = `
    <div class="card-flip-inner w-full h-full relative rounded-2xl">
      <div class="card-front absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-[0_5px_22px_rgba(180,100,130,0.15)] bg-gradient-to-br from-[#fef0f3] to-rose border-2 border-white/70">
        <i class="${data.icon} text-3xl md:text-4xl text-mauve-deep"></i>
        <span class="text-[10px] md:text-xs text-text-secondary font-normal tracking-wide">${data.name}</span>
      </div>
      <div class="card-back absolute inset-0 rounded-2xl flex items-center justify-center shadow-[0_5px_22px_rgba(180,100,130,0.15)] bg-gradient-to-br from-[#f2dde8] to-[#e8d2ec] border-2 border-white/55 overflow-hidden">
        <div class="absolute inset-0 opacity-100" style="background-image: repeating-linear-gradient(45deg, rgba(200, 150, 180, 0.15) 0px, rgba(200, 150, 180, 0.15) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, rgba(200, 150, 180, 0.15) 0px, rgba(200, 150, 180, 0.15) 1px, transparent 1px, transparent 10px);"></div>
        <i class="ri-sparkling-2-fill text-3xl md:text-4xl relative z-10" style="color: rgba(180, 130, 160, 0.45);"></i>
      </div>
    </div>`;

  return card;
}

function renderCards(list, faceDown) {
  const display = document.getElementById("cardsDisplay");
  display.innerHTML = "";
  list.forEach((item, i) => {
    const card = makeCard(item, i, false);
    if (faceDown) card.classList.add("card-face-down");
    card.style.opacity = "0";
    card.style.transform = "translateY(16px)";
    card.style.transition = "opacity 0.38s ease, transform 0.38s ease";
    display.appendChild(card);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        card.style.transitionDelay = i * 60 + "ms";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }),
    );
  });
}

function flipAllCards(cb) {
  const cards = document.querySelectorAll("#cardsDisplay > div");
  cards.forEach((c, i) => {
    setTimeout(() => {
      c.classList.add("card-face-down");
      if (i === cards.length - 1) setTimeout(cb, 400);
    }, i * 80);
  });
}

function showChoices() {
  setPhase(
    "¿Cuál NO estaba?",
    "Tienes " + CHOICE_SECS + " s · ¡Elige la carta que no es!",
  );

  document.getElementById("timerWrap").classList.remove("hidden");
  startTimer();
  phase = "choosing";

  const display = document.getElementById("cardsDisplay");
  display.innerHTML = "";
  display.classList.remove("grid-cols-3", "gap-2", "md:gap-3.5");
  display.classList.add("grid-cols-3", "gap-4", "md:gap-6");

  options.forEach((item, i) => {
    const card = makeCard(item, i, true);
    card.classList.add("card-face-down");

    // Ajustar tamaños para modo elección
    const front = card.querySelector(".card-front i");
    const label = card.querySelector(".card-front span");
    front.className = front.className.replace(
      "text-3xl md:text-4xl",
      "text-4xl md:text-5xl",
    );
    label.className = label.className.replace(
      "text-[10px] md:text-xs",
      "text-xs md:text-sm",
    );

    card.addEventListener("click", () => handlePick(i, item));
    display.appendChild(card);
    setTimeout(() => card.classList.remove("card-face-down"), 130 + i * 160);
  });
}

function startTimer() {
  clearInterval(timerID);
  timerLeft = CHOICE_SECS;
  const bar = document.getElementById("timerBar");
  bar.style.width = "100%";

  timerID = setInterval(() => {
    timerLeft -= 0.1;
    const pct = Math.max(0, (timerLeft / CHOICE_SECS) * 100);
    bar.style.width = pct + "%";

    if (timerLeft <= 3 && !bar.classList.contains("from-[#f8b8c0]")) {
      bar.classList.remove("from-mint", "via-rose", "to-mauve");
      bar.classList.add("from-[#f8b8c0]", "to-[#d86878]");
    }

    if (timerLeft <= 0) {
      clearInterval(timerID);
      if (phase === "choosing") onTimeout();
    }
  }, 100);
}

function stopTimer() {
  clearInterval(timerID);
  document.getElementById("timerBar").style.width = "0%";
}

function lockCards() {
  document.querySelectorAll("#cardsDisplay > div").forEach((c) => {
    c.classList.remove("cursor-pointer", "active:scale-95");
    c.style.pointerEvents = "none";
  });
}

function onTimeout() {
  phase = "result";
  stopTimer();
  lockCards();
  lives--;
  renderLives();
  highlightImpostor();
  setFeedback("⏰ ¡Tiempo agotado! Era: " + impostor.name);
  markDot("wrong");
  round++;
  setTimeout(lives > 0 ? nextRound : showGameOver, 2300);
}

function handlePick(idx, item) {
  if (phase !== "choosing") return;
  phase = "result";
  stopTimer();
  lockCards();

  const cardEl = document.getElementById("card-" + idx);
  const correct = item.icon === impostor.icon;

  if (correct) {
    cardEl.classList.add("animate-pop-correct");
    const front = cardEl.querySelector(".card-front");
    front.classList.remove("from-[#fef0f3]", "to-rose");
    front.classList.add("from-[#dcf5ec]", "to-[#a8e8d0]");

    const pts = Math.max(10, Math.round(timerLeft * 15));
    score += pts;
    renderScore();
    setFeedback("✨ ¡Correcto! +" + pts + " puntos");
    markDot("correct");
    round++;
    setTimeout(nextRound, 1500);
  } else {
    cardEl.classList.add("animate-shake-wrong");
    const front = cardEl.querySelector(".card-front");
    front.classList.remove("from-[#fef0f3]", "to-rose");
    front.classList.add("from-[#fde8d8]", "to-[#f5b2ba]");

    lives--;
    renderLives();
    highlightImpostor();
    setFeedback("Incorrecto · La respuesta era: " + impostor.name);
    markDot("wrong");
    round++;
    setTimeout(lives > 0 ? nextRound : showGameOver, 2300);
  }
}

function markDot(state) {
  const el = document.getElementById("dot-" + round);
  if (el) {
    el.classList.remove("bg-mauve", "scale-130", "border-mauve");
    if (state === "correct") {
      el.classList.add("bg-[#7ecfaa]", "border-[#7ecfaa]", "scale-115");
    } else {
      el.classList.add("bg-[#f09aa0]", "border-[#f09aa0]", "scale-115");
    }
  }
}

function highlightImpostor() {
  options.forEach((o, i) => {
    if (o.icon === impostor.icon) {
      const el = document.getElementById("card-" + i);
      if (el) {
        el.style.outline = "3px solid #a07888";
        el.style.outlineOffset = "3px";
      }
    }
  });
}

function showGameOver() {
  phase = "over";
  document.getElementById("overBody").innerHTML =
    'Se acabaron tus <strong class="text-mauve-deep font-bold">3 vidas</strong>.<br>' +
    "Llegaste a la ronda " +
    round +
    ' con <strong class="text-mauve-deep font-bold">' +
    score +
    " pts</strong>.<br>¡Inténtalo de nuevo! 😊";

  document.getElementById("overStats").innerHTML = `
    <div class="flex flex-col items-center gap-1 bg-rose/20 border-[1.5px] border-rose/40 rounded-2xl p-4 px-5 min-w-[76px]">
      <span class="font-serif text-3xl md:text-4xl text-mauve-deep leading-none">${score}</span>
      <span class="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider">Puntos</span>
    </div>
    <div class="flex flex-col items-center gap-1 bg-rose/20 border-[1.5px] border-rose/40 rounded-2xl p-4 px-5 min-w-[76px]">
      <span class="font-serif text-3xl md:text-4xl text-mauve-deep leading-none">${round}</span>
      <span class="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider">Rondas</span>
    </div>`;

  const screen = document.getElementById("overScreen");
  screen.style.opacity = "1";
  screen.style.pointerEvents = "all";
}

function showWin() {
  launchConfetti();

  document.getElementById("winStats").innerHTML = `
    <div class="flex flex-col items-center gap-1 bg-rose/20 border-[1.5px] border-rose/40 rounded-2xl p-4 px-5 min-w-[76px]">
      <span class="font-serif text-3xl md:text-4xl text-mauve-deep leading-none">${score}</span>
      <span class="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider">Puntos</span>
    </div>
    <div class="flex flex-col items-center gap-1 bg-rose/20 border-[1.5px] border-rose/40 rounded-2xl p-4 px-5 min-w-[76px]">
      <span class="font-serif text-3xl md:text-4xl text-mauve-deep leading-none">${lives}</span>
      <span class="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider">Vidas</span>
    </div>
    <div class="flex flex-col items-center gap-1 bg-rose/20 border-[1.5px] border-rose/40 rounded-2xl p-4 px-5 min-w-[76px]">
      <span class="font-serif text-3xl md:text-4xl text-mauve-deep leading-none">${TOTAL_ROUNDS}</span>
      <span class="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider">Rondas</span>
    </div>`;

  const screen = document.getElementById("winScreen");
  screen.style.opacity = "1";
  screen.style.pointerEvents = "all";
}

function goToLetter() {
  window.location.href = "/carta?score=" + score;
}

function launchConfetti() {
  const colors = [
    "#f5c2c7",
    "#e8d5f5",
    "#d5f0e8",
    "#fde8ec",
    "#c9a0b0",
    "#fde5d0",
    "#f0d8e8",
  ];
  const stage = document.getElementById("confettiStage");

  for (let i = 0; i < 75; i++) {
    setTimeout(() => {
      const p = document.createElement("div");
      p.className = "piece absolute -top-4 animate-fall";
      p.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${7 + Math.random() * 8}px;
        height: ${7 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "3px"};
        animation-duration: ${2.2 + Math.random() * 2.4}s;
        animation-delay: ${Math.random() * 0.5}s;
        opacity: 1;
      `;
      stage.appendChild(p);
      setTimeout(() => p.remove(), 5200);
    }, i * 35);
  }
}

initUI();
