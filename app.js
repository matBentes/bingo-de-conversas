// ==========================================
// Bingo de Conversas - 1v1 Meeting
// ==========================================

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const CENTER_INDEX = 12;
const FREE_TEXT = "LIVRE";
const STORAGE_KEY = "bingo-topics";

const DEFAULT_TOPICS = [
  "Citou Elon Musk",
  "Falou de Bitcoin",
  "Mencionou um livro",
  "Deu conselho nao solicitado",
  "Usou a palavra 'mindset'",
  "Falou de foguete da SpaceX",
  "Mencionou inteligencia artificial",
  "Disse 'pensar fora da caixa'",
  "Falou de investimentos",
  "Mencionou produtividade",
  "Citou frase motivacional",
  "Falou de networking",
  "Disse 'escalar o negocio'",
  "Mencionou morning routine",
  "Falou de stoicismo",
  "Citou podcast que ouviu",
  "Mencionou NFT ou crypto",
  "Disse 'zona de conforto'",
  "Falou de meditacao",
  "Mencionou Tesla",
  "Usou buzzword em ingles",
  "Falou de passive income",
  "Mencionou biohacking",
  "Disse 'disruptivo'"
];

// State
let topics = [];
let cardTopics = [];
let marked = new Array(TOTAL_CELLS).fill(false);
let bingoLines = [];

// DOM elements
const grid = document.getElementById('bingo-grid');
const newCardBtn = document.getElementById('new-card-btn');
const resetBtn = document.getElementById('reset-btn');
const topicInput = document.getElementById('topic-input');
const addTopicBtn = document.getElementById('add-topic-btn');
const topicsList = document.getElementById('topics-list');
const topicsCount = document.getElementById('topics-count');
const bingoBanner = document.getElementById('bingo-banner');
const confettiCanvas = document.getElementById('confetti-canvas');

// ==========================================
// Storage (localStorage)
// ==========================================

function loadTopics() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    topics = JSON.parse(saved);
  } else {
    topics = [...DEFAULT_TOPICS];
    saveTopics();
  }
}

function saveTopics() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
}

function addTopic(text) {
  if (topics.includes(text)) return;
  topics.push(text);
  saveTopics();
  renderTopicsList();
}

function removeTopic(text) {
  topics = topics.filter(t => t !== text);
  saveTopics();
  renderTopicsList();
}

// ==========================================
// Topics UI
// ==========================================

function renderTopicsList() {
  topicsCount.textContent = `${topics.length} topico${topics.length !== 1 ? 's' : ''}`;
  topicsList.innerHTML = '';
  topics.forEach(text => {
    const chip = document.createElement('span');
    chip.className = 'topic-chip';
    chip.innerHTML = `
      ${text}
      <button class="remove-btn" title="Remover">&times;</button>
    `;
    chip.querySelector('.remove-btn').addEventListener('click', () => removeTopic(text));
    topicsList.appendChild(chip);
  });
}

// ==========================================
// Card Generation
// ==========================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCard() {
  const pool = [...topics];
  if (pool.length < 24) {
    const missing = 24 - pool.length;
    const available = DEFAULT_TOPICS.filter(t => !pool.includes(t));
    pool.push(...available.slice(0, missing));
  }
  const shuffled = shuffle(pool).slice(0, 24);
  cardTopics = [
    ...shuffled.slice(0, CENTER_INDEX),
    FREE_TEXT,
    ...shuffled.slice(CENTER_INDEX)
  ];
  marked = new Array(TOTAL_CELLS).fill(false);
  marked[CENTER_INDEX] = true;
  bingoLines = [];
  bingoBanner.classList.remove('visible');
  renderGrid();
}

// ==========================================
// Grid Rendering
// ==========================================

function renderGrid() {
  grid.innerHTML = '';
  cardTopics.forEach((text, i) => {
    const cell = document.createElement('div');
    cell.className = 'bingo-cell';
    cell.textContent = text;
    if (i === CENTER_INDEX) cell.classList.add('free');
    if (marked[i]) cell.classList.add('marked');
    cell.addEventListener('click', () => toggleCell(i));
    grid.appendChild(cell);
  });
  updateBingoHighlights();
}

function toggleCell(index) {
  if (index === CENTER_INDEX) return;
  marked[index] = !marked[index];
  grid.children[index].classList.toggle('marked');
  checkBingo();
}

// ==========================================
// Bingo Detection
// ==========================================

function getLines() {
  const lines = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const line = [];
    for (let c = 0; c < GRID_SIZE; c++) line.push(r * GRID_SIZE + c);
    lines.push(line);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    const line = [];
    for (let r = 0; r < GRID_SIZE; r++) line.push(r * GRID_SIZE + c);
    lines.push(line);
  }
  const d1 = [], d2 = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    d1.push(i * GRID_SIZE + i);
    d2.push(i * GRID_SIZE + (GRID_SIZE - 1 - i));
  }
  lines.push(d1, d2);
  return lines;
}

function checkBingo() {
  const lines = getLines();
  const newBingoLines = lines.filter(line => line.every(i => marked[i]));

  const hadBingo = bingoLines.length > 0;
  const hasBingo = newBingoLines.length > 0;
  bingoLines = newBingoLines;

  updateBingoHighlights();

  if (hasBingo && !hadBingo) {
    bingoBanner.classList.add('visible');
    launchConfetti();
  } else if (!hasBingo) {
    bingoBanner.classList.remove('visible');
  }
}

function updateBingoHighlights() {
  const cells = grid.children;
  const highlighted = new Set(bingoLines.flat());
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.toggle('bingo-highlight', highlighted.has(i));
  }
}

// ==========================================
// Confetti
// ==========================================

function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ['#e94560', '#533483', '#0f3460', '#f5c518', '#00d2ff', '#ff6b6b', '#48c774'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      rv: (Math.random() - 0.5) * 10
    });
  }

  let frame = 0;
  const maxFrames = 180;

  function animate() {
    if (frame >= maxFrames) {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.rotation += p.rv;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// Event Listeners
// ==========================================

newCardBtn.addEventListener('click', generateCard);

resetBtn.addEventListener('click', () => {
  marked = new Array(TOTAL_CELLS).fill(false);
  marked[CENTER_INDEX] = true;
  bingoLines = [];
  bingoBanner.classList.remove('visible');
  renderGrid();
});

addTopicBtn.addEventListener('click', handleAddTopic);
topicInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleAddTopic();
});

function handleAddTopic() {
  const text = topicInput.value.trim();
  if (!text) return;
  addTopic(text);
  topicInput.value = '';
}

// ==========================================
// Init
// ==========================================

loadTopics();
renderTopicsList();
generateCard();
