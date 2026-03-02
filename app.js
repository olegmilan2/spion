import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js';

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
  timerId: null,
  roundMinutes: 0,
  roundStartedAt: '',
  resultSaved: false,
  liveRoundsUnsub: null
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
const firebaseStatus = document.getElementById('firebaseStatus');
const newRoundBtn = document.getElementById('newRoundBtn');
const liveRoundsStatus = document.getElementById('liveRoundsStatus');
const liveRoundsList = document.getElementById('liveRoundsList');
const firebaseConfig = window.FIREBASE_CONFIG || null;

let db = null;
let firebaseReady = false;

function hasValidFirebaseConfig(config) {
  if (!config) return false;
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return requiredKeys.every((key) => typeof config[key] === 'string' && config[key] && !config[key].includes('YOUR_'));
}

if (hasValidFirebaseConfig(firebaseConfig)) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  const auth = getAuth(app);
  signInAnonymously(auth)
    .then(() => {
      firebaseReady = true;
      setLiveRoundsStatus('Онлайн: изменения синхронизируются для всех.', 'ok');
      startLiveRoundsSync();
    })
    .catch((error) => {
      firebaseReady = false;
      console.error('Firebase auth error:', error.message);
      setLiveRoundsStatus(`Ошибка авторизации Firebase: ${error.message}`, 'error');
    });
} else {
  setLiveRoundsStatus('Firebase не настроен: общая лента отключена.', 'error');
}

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

function setFirebaseStatus(message, type = 'muted') {
  firebaseStatus.textContent = message;
  firebaseStatus.dataset.type = type;
}

function setLiveRoundsStatus(message, type = 'muted') {
  liveRoundsStatus.textContent = message;
  liveRoundsStatus.dataset.type = type;
}

function formatRoundTime(value) {
  if (!value) return 'время неизвестно';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'время неизвестно';
  return date.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}

function renderLiveRounds(docs) {
  liveRoundsList.innerHTML = '';

  if (docs.length === 0) {
    const li = document.createElement('li');
    li.className = 'live-round-item';
    li.textContent = 'Пока нет сохраненных раундов.';
    liveRoundsList.appendChild(li);
    return;
  }

  docs.forEach((roundDoc) => {
    const data = roundDoc.data();
    const li = document.createElement('li');
    li.className = 'live-round-item';

    const main = document.createElement('p');
    main.className = 'live-round-main';
    main.textContent = `${data.spyName || 'Неизвестно'} был шпионом на локации "${data.location || 'Неизвестно'}"`;

    const meta = document.createElement('p');
    meta.className = 'live-round-meta';
    meta.textContent = `Игроков: ${data.playersCount || 0} • Раунд: ${data.roundMinutes || 0} мин • ${formatRoundTime(data.createdAt || data.finishedAtIso)}`;

    li.appendChild(main);
    li.appendChild(meta);
    liveRoundsList.appendChild(li);
  });
}

function startLiveRoundsSync() {
  if (!db || !firebaseReady) return;

  if (state.liveRoundsUnsub) {
    state.liveRoundsUnsub();
    state.liveRoundsUnsub = null;
  }

  const roundsQuery = query(collection(db, 'spy_rounds'), orderBy('createdAt', 'desc'), limit(20));
  state.liveRoundsUnsub = onSnapshot(
    roundsQuery,
    (snapshot) => {
      renderLiveRounds(snapshot.docs);
    },
    (error) => {
      setLiveRoundsStatus(`Ошибка чтения ленты: ${error.message}`, 'error');
    }
  );
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
  state.roundMinutes = minutes;
  state.roundStartedAt = new Date().toISOString();
  state.resultSaved = false;
  roundEnd.classList.add('hidden');
  hostAnswer.classList.add('hidden');
  hostAnswer.textContent = '';
  if (!db) {
    setFirebaseStatus('Firebase не настроен: результат сохранен не будет.');
  } else if (!firebaseReady) {
    setFirebaseStatus('Подключение к Firebase...');
  } else {
    setFirebaseStatus('Firebase подключен. Результат будет сохранен после открытия ответа.');
  }

  setupCard.classList.add('hidden');
  gameCard.classList.remove('hidden');
  updatePlayerView();
  startTimer(minutes);
}

async function saveRoundResult() {
  if (!db || !firebaseReady || state.resultSaved) return;

  const payload = {
    players: state.players,
    playersCount: state.players.length,
    spyName: state.players[state.spyIndex],
    location: state.location,
    roundMinutes: state.roundMinutes,
    startedAtIso: state.roundStartedAt,
    finishedAtIso: new Date().toISOString(),
    createdAt: serverTimestamp()
  };

  await addDoc(collection(db, 'spy_rounds'), payload);
  state.resultSaved = true;
}

async function showHostAnswer() {
  hostAnswer.textContent = `Шпион: ${state.players[state.spyIndex]}. Локация: ${state.location}.`;
  hostAnswer.classList.remove('hidden');

  if (!db) {
    setFirebaseStatus('Запись в Firestore отключена: заполни firebase-config.js', 'error');
    return;
  }

  if (!firebaseReady) {
    setFirebaseStatus('Firebase еще подключается. Повтори через пару секунд.', 'error');
    return;
  }

  try {
    await saveRoundResult();
    setFirebaseStatus('Результат раунда сохранен в Firestore.', 'ok');
  } catch (error) {
    setFirebaseStatus(`Ошибка сохранения: ${error.message}`, 'error');
  }
}

function resetToSetup() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
  timerText.textContent = '00:00';
  setFirebaseStatus('');
  gameCard.classList.add('hidden');
  setupCard.classList.remove('hidden');
}

startBtn.addEventListener('click', startRound);
showRoleBtn.addEventListener('click', showRole);
nextBtn.addEventListener('click', nextPlayer);
hostRevealBtn.addEventListener('click', () => {
  showHostAnswer();
});
newRoundBtn.addEventListener('click', resetToSetup);
