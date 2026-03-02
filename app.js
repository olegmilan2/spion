import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteField
} from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';
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

const LOCAL_MY_ID_KEY = 'spy_my_id';
const LOCAL_NAME_KEY = 'spy_player_name';
const LOCAL_ROOM_KEY = 'spy_room_code';

const joinCard = document.getElementById('joinCard');
const lobbyCard = document.getElementById('lobbyCard');
const gameCard = document.getElementById('gameCard');

const nameInput = document.getElementById('nameInput');
const roomCodeInput = document.getElementById('roomCodeInput');
const joinBtn = document.getElementById('joinBtn');
const joinError = document.getElementById('joinError');
const globalStatus = document.getElementById('globalStatus');

const lobbyRoomText = document.getElementById('lobbyRoomText');
const roundText = document.getElementById('roundText');
const playersList = document.getElementById('playersList');
const lobbyStatus = document.getElementById('lobbyStatus');
const startRoundBtn = document.getElementById('startRoundBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');

const gameRoomText = document.getElementById('gameRoomText');
const gameRoundText = document.getElementById('gameRoundText');
const roleCard = document.getElementById('roleCard');
const roleHint = document.getElementById('roleHint');
const gameStatus = document.getElementById('gameStatus');
const newRoundBtn = document.getElementById('newRoundBtn');
const leaveFromGameBtn = document.getElementById('leaveFromGameBtn');

const state = {
  firebaseReady: false,
  db: null,
  authUid: '',
  myId: localStorage.getItem(LOCAL_MY_ID_KEY) || crypto.randomUUID(),
  myName: localStorage.getItem(LOCAL_NAME_KEY) || '',
  roomCode: localStorage.getItem(LOCAL_ROOM_KEY) || '',
  roomData: null,
  players: [],
  roomUnsub: null,
  playersUnsub: null,
  presenceTimerId: null
};

localStorage.setItem(LOCAL_MY_ID_KEY, state.myId);

function hasValidFirebaseConfig(config) {
  if (!config) return false;
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return requiredKeys.every((key) => typeof config[key] === 'string' && config[key] && !config[key].includes('YOUR_'));
}

function normalizeRoomCode(input) {
  return input.trim().toLowerCase().replace(/\s+/g, '').slice(0, 20);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isPlayerActive(player) {
  if (player.connected === false) return false;
  const lastSeenMs = toMillis(player.lastSeenAt);
  if (!lastSeenMs) return true;
  return Date.now() - lastSeenMs < 60_000;
}

function setVisible(view) {
  joinCard.classList.toggle('hidden', view !== 'join');
  lobbyCard.classList.toggle('hidden', view !== 'lobby');
  gameCard.classList.toggle('hidden', view !== 'game');
}

function showGlobalStatus(message, type = 'muted') {
  globalStatus.textContent = message;
  globalStatus.dataset.type = type;
}

function renderPlayers() {
  playersList.innerHTML = '';
  if (state.players.length === 0) {
    const li = document.createElement('li');
    li.className = 'player-item';
    li.textContent = 'Пока нет игроков';
    playersList.appendChild(li);
    return;
  }

  state.players.forEach((player) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    const suffix = player.id === state.myId ? ' (ты)' : '';
    const status = isPlayerActive(player) ? 'онлайн' : 'оффлайн';
    li.textContent = `${player.name}${suffix} • ${status}`;
    playersList.appendChild(li);
  });
}

function renderRoom() {
  const room = state.roomData;
  if (!room) return;

  const roundNumber = room.roundNumber || 1;
  lobbyRoomText.textContent = `Комната: ${state.roomCode}`;
  roundText.textContent = `Раунд #${roundNumber}`;
  gameRoomText.textContent = `Комната: ${state.roomCode}`;
  gameRoundText.textContent = `Раунд #${roundNumber}`;

  renderPlayers();

  if (room.state === 'started') {
    setVisible('game');
    const iAmSpy = room.spyId === state.myId;
    roleCard.className = `role-card ${iAmSpy ? 'spy' : 'safe'}`;
    roleCard.textContent = iAmSpy ? 'Ты ШПИОН' : `Локация: ${room.location || '-'}`;
    roleHint.textContent = iAmSpy
      ? 'Задача: вычислить локацию и не выдать себя.'
      : 'Задача: задавать вопросы и найти шпиона.';
    gameStatus.textContent = 'Раунд синхронизирован. Все игроки получили роли.';
  } else {
    setVisible('lobby');
    const activeCount = state.players.filter(isPlayerActive).length;
    lobbyStatus.textContent = activeCount >= 3
      ? 'Готово к старту. Нажми «Старт раунда».'
      : 'Нужно минимум 3 активных игрока для старта.';
  }
}

function clearSubscriptions() {
  if (state.roomUnsub) {
    state.roomUnsub();
    state.roomUnsub = null;
  }
  if (state.playersUnsub) {
    state.playersUnsub();
    state.playersUnsub = null;
  }
}

function roomRef() {
  return doc(state.db, 'rooms', state.roomCode);
}

function playerRef(playerId) {
  return doc(state.db, 'rooms', state.roomCode, 'players', playerId);
}

function subscribeRoom() {
  clearSubscriptions();

  state.roomUnsub = onSnapshot(
    roomRef(),
    (snap) => {
      if (!snap.exists()) {
        showGlobalStatus('Комната была удалена.', 'error');
        return;
      }
      state.roomData = snap.data();
      renderRoom();
    },
    (error) => {
      showGlobalStatus(`Ошибка room snapshot: ${error.message}`, 'error');
    }
  );

  const playersQuery = query(collection(state.db, 'rooms', state.roomCode, 'players'), orderBy('joinedAt'));
  state.playersUnsub = onSnapshot(
    playersQuery,
    (snapshot) => {
      state.players = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderPlayers();
      if (state.roomData && state.roomData.state !== 'started') {
        const activeCount = state.players.filter(isPlayerActive).length;
        lobbyStatus.textContent = activeCount >= 3
          ? 'Готово к старту. Нажми «Старт раунда».'
          : 'Нужно минимум 3 активных игрока для старта.';
      }
    },
    (error) => {
      showGlobalStatus(`Ошибка players snapshot: ${error.message}`, 'error');
    }
  );
}

async function ensureRoomAndJoin() {
  const room = roomRef();

  await runTransaction(state.db, async (tx) => {
    const snap = await tx.get(room);

    if (!snap.exists()) {
      tx.set(room, {
        roomCode: state.roomCode,
        ownerId: state.myId,
        state: 'lobby',
        roundNumber: 1,
        createdByUid: state.authUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      tx.update(room, {
        updatedAt: serverTimestamp()
      });
    }
  });

  await setDoc(
    playerRef(state.myId),
    {
      id: state.myId,
      name: state.myName,
      connected: true,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      uid: state.authUid
    },
    { merge: true }
  );

  if (state.presenceTimerId) clearInterval(state.presenceTimerId);
  state.presenceTimerId = setInterval(() => {
    updateDoc(playerRef(state.myId), {
      connected: true,
      lastSeenAt: serverTimestamp()
    }).catch(() => {});
  }, 15000);
}

async function joinRoom() {
  const name = nameInput.value.trim();
  const code = normalizeRoomCode(roomCodeInput.value);

  if (!state.firebaseReady || !state.db) {
    joinError.textContent = 'Firebase еще не готов. Подожди пару секунд.';
    return;
  }

  if (!name) {
    joinError.textContent = 'Введи ник.';
    return;
  }

  if (!code) {
    joinError.textContent = 'Введи код комнаты.';
    return;
  }

  joinError.textContent = '';
  state.myName = name;
  state.roomCode = code;
  localStorage.setItem(LOCAL_NAME_KEY, state.myName);
  localStorage.setItem(LOCAL_ROOM_KEY, state.roomCode);

  try {
    await ensureRoomAndJoin();
    subscribeRoom();
    setVisible('lobby');
    showGlobalStatus(`Подключено к комнате ${state.roomCode}.`, 'ok');
  } catch (error) {
    joinError.textContent = `Ошибка входа: ${error.message}`;
  }
}

async function startRound() {
  if (!state.roomData || state.roomData.state === 'started') {
    lobbyStatus.textContent = 'Раунд уже стартовал.';
    return;
  }

  const eligiblePlayers = state.players.filter(isPlayerActive);
  if (eligiblePlayers.length < 3) {
    lobbyStatus.textContent = 'Нужно минимум 3 активных игрока в лобби.';
    return;
  }

  const spyPlayer = randomItem(eligiblePlayers);
  const location = randomItem(LOCATIONS);

  try {
    await runTransaction(state.db, async (tx) => {
      const room = roomRef();
      const snap = await tx.get(room);

      if (!snap.exists()) {
        throw new Error('Комната не найдена');
      }

      const data = snap.data();
      if (data.state === 'started') {
        throw new Error('Раунд уже запущен другим игроком');
      }

      tx.update(room, {
        state: 'started',
        spyId: spyPlayer.id,
        location,
        startedBy: state.myId,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    lobbyStatus.textContent = 'Раунд запущен. Раздаем роли...';
  } catch (error) {
    lobbyStatus.textContent = `Старт отклонен: ${error.message}`;
  }
}

async function resetRound() {
  if (!state.roomData || state.roomData.state !== 'started') {
    gameStatus.textContent = 'Раунд еще не начат.';
    return;
  }

  try {
    await runTransaction(state.db, async (tx) => {
      const room = roomRef();
      const snap = await tx.get(room);

      if (!snap.exists()) {
        throw new Error('Комната не найдена');
      }

      const data = snap.data();
      const nextRound = (data.roundNumber || 1) + 1;

      tx.update(room, {
        state: 'lobby',
        roundNumber: nextRound,
        spyId: deleteField(),
        location: deleteField(),
        startedBy: deleteField(),
        startedAt: deleteField(),
        updatedAt: serverTimestamp()
      });
    });

    gameStatus.textContent = 'Переключено в лобби. Можно запускать новый раунд.';
  } catch (error) {
    gameStatus.textContent = `Ошибка нового раунда: ${error.message}`;
  }
}

async function leaveRoom() {
  if (state.presenceTimerId) {
    clearInterval(state.presenceTimerId);
    state.presenceTimerId = null;
  }

  if (state.db && state.roomCode) {
    try {
      await updateDoc(playerRef(state.myId), {
        connected: false,
        lastSeenAt: serverTimestamp()
      });
    } catch (error) {
      // ignore disconnect errors
    }
  }

  clearSubscriptions();
  state.roomData = null;
  state.players = [];
  setVisible('join');
}

async function initFirebase() {
  const firebaseConfig = window.FIREBASE_CONFIG || null;
  if (!hasValidFirebaseConfig(firebaseConfig)) {
    showGlobalStatus('Firebase не настроен: заполни firebase-config.js', 'error');
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    state.db = getFirestore(app);
    const auth = getAuth(app);
    const result = await signInAnonymously(auth);
    state.authUid = result.user.uid;
    state.firebaseReady = true;
    showGlobalStatus('Firebase подключен.', 'ok');
  } catch (error) {
    showGlobalStatus(`Ошибка Firebase: ${error.message}`, 'error');
  }
}

function restoreInputs() {
  nameInput.value = state.myName;
  roomCodeInput.value = state.roomCode;
}

joinBtn.addEventListener('click', joinRoom);
startRoundBtn.addEventListener('click', startRound);
newRoundBtn.addEventListener('click', resetRound);
leaveRoomBtn.addEventListener('click', leaveRoom);
leaveFromGameBtn.addEventListener('click', leaveRoom);

window.addEventListener('beforeunload', () => {
  if (state.db && state.roomCode) {
    updateDoc(playerRef(state.myId), {
      connected: false,
      lastSeenAt: serverTimestamp()
    }).catch(() => {});
  }
});

setVisible('join');
restoreInputs();
initFirebase();
