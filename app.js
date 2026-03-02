const LOCATIONS = [
  'Аэропорт',
  'Банк',
  'Больница',
  'Военная база',
  'Казино',
  'Кинотеатр',
  'Космическая станция',
  'Круизный лайнер',
  'Музей',
  'Отель',
  'Пиратский корабль',
  'Подводная лодка',
  'Полицейский участок',
  'Пляж',
  'Ресторан',
  'Самолет',
  'Стадион',
  'Супермаркет',
  'Театр',
  'Университет',
  'Цирк'
];

const state = {
  players: [],
  spyIndex: -1,
  location: '',
  currentIndex: 0,
  timerSeconds: 0,
  timerId: null
};

const setupCard = document.getElementById('setupCard');
const gameCard = document.getElementById('gameCard');
const playersInput = document.getElementById('playersInput');
const minutesInput = document.getElementById('minutesInput');
const startBtn = document.getElementById('startBtn');
const setupError = document.getElementById('setupError');
const progressText = document.getElementById('progressText');
const timerText = document.getElementById('timerText');
const playerName = document.getElementById('playerName');
const hintText = document.getElementById('hintText');
const roleCard = document.getElementById('roleCard');
const showRoleBtn = document.getElementById('showRoleBtn');
const nextBtn = document.getElementById('nextBtn');
const roundEnd = document.getElementById('roundEnd');
const hostRevealBtn = document.getElementById('hostRevealBtn');
const hostAnswer = document.getElementById('hostAnswer');
const newRoundBtn = document.getElementById('newRoundBtn');

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function parsePlayers(raw) {
  return raw
    .split(/[\n,]/g)
    .map((name) => name.trim())
    .filter(Boolean);
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updatePlayerView() {
  const total = state.players.length;
  const current = state.currentIndex + 1;
  const name = state.players[state.currentIndex];
  progressText.textContent = `Игрок ${current} из ${total}`;
  playerName.textContent = name;
  hintText.textContent = 'Нажми кнопку, чтобы увидеть роль.';
  roleCard.className = 'role-card hidden';
  roleCard.textContent = '';
  showRoleBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');
}

function showRole() {
  const isSpy = state.currentIndex === state.spyIndex;
  roleCard.classList.remove('hidden');
  roleCard.classList.toggle('spy', isSpy);
  roleCard.classList.toggle('safe', !isSpy);
  roleCard.textContent = isSpy ? 'Ты ШПИОН. Вычисли локацию.' : `Локация: ${state.location}`;
  hintText.textContent = 'Запомни роль и передай устройство дальше.';
  showRoleBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');
}

function endRevealPhase() {
  playerName.textContent = 'Раунд начался';
  progressText.textContent = 'Роли выданы';
  hintText.textContent = 'Обсуждайте и задавайте вопросы.';
  roleCard.className = 'role-card hidden';
  showRoleBtn.classList.add('hidden');
  nextBtn.classList.add('hidden');
  roundEnd.classList.remove('hidden');
}

function nextPlayer() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.players.length) {
    endRevealPhase();
    return;
  }
  updatePlayerView();
}

function tickTimer() {
  if (state.timerSeconds <= 0) {
    timerText.textContent = '00:00';
    clearInterval(state.timerId);
    state.timerId = null;
    return;
  }
  state.timerSeconds -= 1;
  timerText.textContent = formatTime(state.timerSeconds);
}

function startTimer(minutes) {
  if (state.timerId) clearInterval(state.timerId);
  state.timerSeconds = Math.max(1, Math.floor(minutes * 60));
  timerText.textContent = formatTime(state.timerSeconds);
  state.timerId = setInterval(tickTimer, 1000);
}

function startRound() {
  const players = parsePlayers(playersInput.value);
  const minutes = Number(minutesInput.value);

  if (players.length < 3) {
    setupError.textContent = 'Нужно минимум 3 игрока.';
    return;
  }

  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 30) {
    setupError.textContent = 'Длительность должна быть от 1 до 30 минут.';
    return;
  }

  setupError.textContent = '';
  state.players = players;
  state.spyIndex = randomInt(players.length);
  state.location = LOCATIONS[randomInt(LOCATIONS.length)];
  state.currentIndex = 0;
  roundEnd.classList.add('hidden');
  hostAnswer.classList.add('hidden');
  hostAnswer.textContent = '';

  setupCard.classList.add('hidden');
  gameCard.classList.remove('hidden');
  updatePlayerView();
  startTimer(minutes);
}

function showHostAnswer() {
  hostAnswer.textContent = `Шпион: ${state.players[state.spyIndex]}. Локация: ${state.location}.`;
  hostAnswer.classList.remove('hidden');
}

function resetToSetup() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
  timerText.textContent = '00:00';
  gameCard.classList.add('hidden');
  setupCard.classList.remove('hidden');
}

startBtn.addEventListener('click', startRound);
showRoleBtn.addEventListener('click', showRole);
nextBtn.addEventListener('click', nextPlayer);
hostRevealBtn.addEventListener('click', showHostAnswer);
newRoundBtn.addEventListener('click', resetToSetup);
