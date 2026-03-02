import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import { addDoc, collection, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, where } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';
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
  liveRoundsUnsub: null,
  hostName: '',
  roomId: '',
  roomLabel: '',
  cachedRounds: [],
  authUid: ''
};

const setupCard = document.getElementById('setupCard');
const gameCard = document.getElementById('gameCard');
const hostInput = document.getElementById('hostInput');
const roomInput = document.getElementById('roomInput');
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
const feedRoomCaption = document.getElementById('feedRoomCaption');
const statsStatus = document.getElementById('statsStatus');
const statRounds = document.getElementById('statRounds');
const statAvgMinutes = document.getElementById('statAvgMinutes');
const statTopSpy = document.getElementById('statTopSpy');
const firebaseConfig = window.FIREBASE_CONFIG || null;

let db = null;
let firebaseReady = false;

function hasValidFirebaseConfig(config) {
  if (!config) return false;
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return requiredKeys.every((key) => typeof config[key] === 'string' && config[key] && !config[key].includes('YOUR_'));
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

function setFirebaseStatus(message, type = 'muted') {
  firebaseStatus.textContent = message;
  firebaseStatus.dataset.type = type;
}

function setLiveRoundsStatus(message, type = 'muted') {
  liveRoundsStatus.textContent = message;
  liveRoundsStatus.dataset.type = type;
}

function normalizeRoomId(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40);
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
  progressText.textContent = `Комната: ${state.roomLabel}`;
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

function updateStats(docs) {
  const roundsCount = docs.length;
  statRounds.textContent = String(roundsCount);

  if (roundsCount === 0) {
    statAvgMinutes.textContent = '0 мин';
    statTopSpy.textContent = '-';
    statsStatus.textContent = `Нет данных для комнаты ${state.roomLabel || '-'}.`;
    return;
  }

  const totalMinutes = docs.reduce((sum, docItem) => sum + (Number(docItem.data().roundMinutes) || 0), 0);
  const avgMinutes = (totalMinutes / roundsCount).toFixed(1);
  statAvgMinutes.textContent = `${avgMinutes} мин`;

  const spyFrequency = new Map();
  docs.forEach((docItem) => {
    const spyName = docItem.data().spyName || 'Неизвестно';
    spyFrequency.set(spyName, (spyFrequency.get(spyName) || 0) + 1);
  });

  let topSpyName = '-';
  let topSpyCount = 0;
  spyFrequency.forEach((count, spyName) => {
    if (count > topSpyCount) {
      topSpyCount = count;
      topSpyName = spyName;
    }
  });

  statTopSpy.textContent = `${topSpyName} (${topSpyCount})`;
  statsStatus.textContent = `Статистика комнаты ${state.roomLabel || '-'}.`;
}

function renderLiveRounds(docs) {
  liveRoundsList.innerHTML = '';

  if (docs.length === 0) {
    const li = document.createElement('li');
    li.className = 'live-round-item';
    li.textContent = `В комнате ${state.roomLabel || '-'} пока нет сохраненных раундов.`;
    liveRoundsList.appendChild(li);
    updateStats(docs);
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
    meta.textContent = `Комната: ${data.roomLabel || data.roomId || '-'} • Ведущий: ${data.hostName || '-'} • Игроков: ${data.playersCount || 0} • Раунд: ${data.roundMinutes || 0} мин • ${formatRoundTime(data.createdAt || data.finishedAtIso)}`;

    li.appendChild(main);
    li.appendChild(meta);
    liveRoundsList.appendChild(li);
  });

  updateStats(docs);
}

function rerenderFromCache() {
  renderLiveRounds(state.cachedRounds);
}

function startLiveRoundsSync() {
  if (!db || !firebaseReady || !state.roomId) return;

  if (state.liveRoundsUnsub) {
    state.liveRoundsUnsub();
    state.liveRoundsUnsub = null;
  }

  const roundsQuery = query(
    collection(db, 'spy_rounds'),
    where('roomId', '==', state.roomId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  state.liveRoundsUnsub = onSnapshot(
    roundsQuery,
    (snapshot) => {
      state.cachedRounds = snapshot.docs;
      rerenderFromCache();
    },
    (error) => {
      setLiveRoundsStatus(`Ошибка чтения ленты: ${error.message}`, 'error');
    }
  );
}

function refreshRoomBinding() {
  feedRoomCaption.textContent = `Показана комната: ${state.roomLabel || '-'}.`;
  if (!db) {
    setLiveRoundsStatus('Firebase не настроен: общая лента отключена.', 'error');
  } else if (!firebaseReady) {
    setLiveRoundsStatus('Подключение к общей базе...', 'muted');
  } else if (!state.roomId) {
    setLiveRoundsStatus('Укажи комнату, чтобы включить синхронизацию.', 'muted');
  } else {
    setLiveRoundsStatus(`Онлайн: синхронизация комнаты ${state.roomLabel || '-'}.`, 'ok');
    startLiveRoundsSync();
  }
  rerenderFromCache();
}

function restoreProfile() {
  const savedHost = localStorage.getItem('spy_host_name') || '';
  const savedRoom = localStorage.getItem('spy_room_label') || '';

  hostInput.value = savedHost;
  roomInput.value = savedRoom;
}

function persistProfile() {
  localStorage.setItem('spy_host_name', state.hostName);
  localStorage.setItem('spy_room_label', state.roomLabel);
}

function startRound() {
  const players = parsePlayers(playersInput.value);
  const minutes = Number(minutesInput.value);
  const hostName = hostInput.value.trim();
  const roomLabel = roomInput.value.trim();
  const roomId = normalizeRoomId(roomLabel);

  if (!hostName) {
    setupError.textContent = 'Укажи ник ведущего.';
    return;
  }

  if (!roomId) {
    setupError.textContent = 'Укажи название комнаты.';
    return;
  }

  if (players.length < 3) {
    setupError.textContent = 'Нужно минимум 3 игрока.';
    return;
  }

  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 30) {
    setupError.textContent = 'Длительность должна быть от 1 до 30 минут.';
    return;
  }

  setupError.textContent = '';
  state.hostName = hostName;
  state.roomId = roomId;
  state.roomLabel = roomLabel;
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
  persistProfile();

  if (!db) {
    setFirebaseStatus('Firebase не настроен: результат сохранен не будет.');
  } else if (!firebaseReady) {
    setFirebaseStatus('Подключение к Firebase...');
  } else {
    setFirebaseStatus('Firebase подключен. Результат будет сохранен после открытия ответа.');
  }

  refreshRoomBinding();

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
    createdAt: serverTimestamp(),
    roomId: state.roomId,
    roomLabel: state.roomLabel,
    hostName: state.hostName,
    createdByUid: state.authUid
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

if (hasValidFirebaseConfig(firebaseConfig)) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  const auth = getAuth(app);
  signInAnonymously(auth)
    .then((authResult) => {
      firebaseReady = true;
      state.authUid = authResult.user.uid;
      refreshRoomBinding();
    })
    .catch((error) => {
      firebaseReady = false;
      console.error('Firebase auth error:', error.message);
      setLiveRoundsStatus(`Ошибка авторизации Firebase: ${error.message}`, 'error');
    });
} else {
  setLiveRoundsStatus('Firebase не настроен: общая лента отключена.', 'error');
}

restoreProfile();
state.hostName = hostInput.value.trim();
state.roomLabel = roomInput.value.trim();
state.roomId = normalizeRoomId(state.roomLabel);

startBtn.addEventListener('click', startRound);
showRoleBtn.addEventListener('click', showRole);
nextBtn.addEventListener('click', nextPlayer);
hostRevealBtn.addEventListener('click', () => {
  showHostAnswer();
});
newRoundBtn.addEventListener('click', resetToSetup);
hostInput.addEventListener('input', (event) => {
  state.hostName = event.target.value.trim();
});
roomInput.addEventListener('input', (event) => {
  state.roomLabel = event.target.value.trim();
  state.roomId = normalizeRoomId(state.roomLabel);
  state.cachedRounds = [];
  refreshRoomBinding();
});

refreshRoomBinding();
