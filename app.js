import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import {
  collection,
  doc,
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
  { name: 'Кинотеатр', category: 'cinema', difficulty: 'easy' },
  { name: 'Съемочная площадка', category: 'cinema', difficulty: 'medium' },
  { name: 'Кинопавильон', category: 'cinema', difficulty: 'medium' },
  { name: 'Постпродакшн студия', category: 'cinema', difficulty: 'hard' },
  { name: 'Кастинг-агентство', category: 'cinema', difficulty: 'hard' },
  { name: 'Фестиваль короткометражек', category: 'cinema', difficulty: 'hard' },
  { name: 'Стадион', category: 'sport', difficulty: 'easy' },
  { name: 'Фитнес-клуб', category: 'sport', difficulty: 'easy' },
  { name: 'Бассейн', category: 'sport', difficulty: 'easy' },
  { name: 'Ледовая арена', category: 'sport', difficulty: 'medium' },
  { name: 'Скалодром', category: 'sport', difficulty: 'medium' },
  { name: 'Велотрек', category: 'sport', difficulty: 'medium' },
  { name: 'Центр подготовки олимпийцев', category: 'sport', difficulty: 'hard' },
  { name: 'Комментаторская кабина', category: 'sport', difficulty: 'hard' },
  { name: 'Спортивный допинг-контроль', category: 'sport', difficulty: 'hard' },
  { name: 'Ресторан', category: 'general', difficulty: 'easy' },
  { name: 'Супермаркет', category: 'general', difficulty: 'easy' },
  { name: 'Банк', category: 'general', difficulty: 'easy' },
  { name: 'Больница', category: 'general', difficulty: 'easy' },
  { name: 'Школа', category: 'general', difficulty: 'easy' },
  { name: 'Университет', category: 'general', difficulty: 'medium' },
  { name: 'Музей', category: 'general', difficulty: 'medium' },
  { name: 'Театр', category: 'general', difficulty: 'medium' },
  { name: 'Суд', category: 'general', difficulty: 'medium' },
  { name: 'Полицейский участок', category: 'general', difficulty: 'medium' },
  { name: 'Похоронное бюро', category: 'general', difficulty: 'hard' },
  { name: 'Реставрационная мастерская музея', category: 'general', difficulty: 'hard' },
  { name: 'Хранилище архива', category: 'general', difficulty: 'hard' },
  { name: 'Аэропорт', category: 'travel', difficulty: 'easy' },
  { name: 'Вокзал', category: 'travel', difficulty: 'easy' },
  { name: 'Отель', category: 'travel', difficulty: 'easy' },
  { name: 'Пляж', category: 'travel', difficulty: 'easy' },
  { name: 'Круизный лайнер', category: 'travel', difficulty: 'medium' },
  { name: 'Подводная лодка', category: 'travel', difficulty: 'hard' },
  { name: 'Космическая станция', category: 'travel', difficulty: 'hard' },
  { name: 'Пограничный пункт', category: 'travel', difficulty: 'hard' },
  { name: 'Транзитная зона аэропорта', category: 'travel', difficulty: 'hard' },
  { name: 'Офис', category: 'work', difficulty: 'easy' },
  { name: 'Колл-центр', category: 'work', difficulty: 'easy' },
  { name: 'Коворкинг', category: 'work', difficulty: 'easy' },
  { name: 'Склад', category: 'work', difficulty: 'medium' },
  { name: 'Заводской цех', category: 'work', difficulty: 'medium' },
  { name: 'Лаборатория', category: 'work', difficulty: 'medium' },
  { name: 'Аудиторская проверка', category: 'work', difficulty: 'hard' },
  { name: 'Дата-центр', category: 'work', difficulty: 'hard' },
  { name: 'Центр управления полетами', category: 'work', difficulty: 'hard' },
  { name: 'Военная база', category: 'work', difficulty: 'hard' },
  { name: 'Исторический музей', category: 'history', difficulty: 'easy' },
  { name: 'Археологические раскопки', category: 'history', difficulty: 'medium' },
  { name: 'Средневековый замок', category: 'history', difficulty: 'medium' },
  { name: 'Военно-исторический архив', category: 'history', difficulty: 'hard' },
  { name: 'Реконструкция древней битвы', category: 'history', difficulty: 'hard' },
  { name: 'Музей эпохи Возрождения', category: 'history', difficulty: 'hard' },
  { name: 'IT-офис', category: 'tech', difficulty: 'easy' },
  { name: 'Сервисный центр смартфонов', category: 'tech', difficulty: 'easy' },
  { name: 'Киберспортивная арена', category: 'tech', difficulty: 'medium' },
  { name: 'Робототехническая лаборатория', category: 'tech', difficulty: 'medium' },
  { name: 'Центр ИИ-исследований', category: 'tech', difficulty: 'hard' },
  { name: 'Квантовая лаборатория', category: 'tech', difficulty: 'hard' },
  { name: 'Полицейский участок', category: 'crime', difficulty: 'easy' },
  { name: 'Судебный зал', category: 'crime', difficulty: 'medium' },
  { name: 'Тюрьма', category: 'crime', difficulty: 'medium' },
  { name: 'Криминалистическая лаборатория', category: 'crime', difficulty: 'hard' },
  { name: 'Подпольное казино', category: 'crime', difficulty: 'hard' },
  { name: 'Секретный склад улик', category: 'crime', difficulty: 'hard' },
  { name: 'Картинг', category: 'extreme', difficulty: 'easy' },
  { name: 'Веревочный парк', category: 'extreme', difficulty: 'easy' },
  { name: 'Рафтинг-база', category: 'extreme', difficulty: 'medium' },
  { name: 'Парашютный аэродром', category: 'extreme', difficulty: 'medium' },
  { name: 'Бейсджампинг-точка', category: 'extreme', difficulty: 'hard' },
  { name: 'Штормовой яхт-клуб', category: 'extreme', difficulty: 'hard' },
  { name: 'Пятизвездочный отель', category: 'vip', difficulty: 'easy' },
  { name: 'Премиум-спа', category: 'vip', difficulty: 'easy' },
  { name: 'Лаунж в бизнес-терминале', category: 'vip', difficulty: 'medium' },
  { name: 'Приватный аукцион', category: 'vip', difficulty: 'hard' },
  { name: 'Закрытый гольф-клуб', category: 'vip', difficulty: 'hard' },
  { name: 'Пентхаус-вечеринка', category: 'vip', difficulty: 'hard' }
];

const LOCAL_MY_ID_KEY = 'spy_my_id';
const LOCAL_NAME_KEY = 'spy_player_name';
const LOCAL_ROOM_KEY = 'spy_room_code';
const LOCAL_EXPECTED_KEY = 'spy_expected_players';
const LOCAL_CATEGORY_KEY = 'spy_location_category';
const LOCAL_DIFFICULTY_KEY = 'spy_location_difficulty';

const joinCard = document.getElementById('joinCard');
const lobbyCard = document.getElementById('lobbyCard');
const gameCard = document.getElementById('gameCard');

const nameInput = document.getElementById('nameInput');
const roomCodeInput = document.getElementById('roomCodeInput');
const expectedPlayersInput = document.getElementById('expectedPlayersInput');
const categoryInput = document.getElementById('categoryInput');
const difficultyInput = document.getElementById('difficultyInput');
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
  expectedPlayers: Number(localStorage.getItem(LOCAL_EXPECTED_KEY) || 3),
  locationCategory: localStorage.getItem(LOCAL_CATEGORY_KEY) || 'all',
  locationDifficulty: localStorage.getItem(LOCAL_DIFFICULTY_KEY) || 'all',
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

function pickLocation(category, difficulty) {
  const filtered = LOCATIONS.filter((item) => {
    const categoryOk = category === 'all' || item.category === category;
    const difficultyOk = difficulty === 'all' || item.difficulty === difficulty;
    return categoryOk && difficultyOk;
  });

  const pool = filtered.length > 0 ? filtered : LOCATIONS;
  return randomItem(pool);
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
  const roomCategory = room.locationCategory || state.locationCategory || 'all';
  const roomDifficulty = room.locationDifficulty || state.locationDifficulty || 'all';
  categoryInput.value = roomCategory;
  difficultyInput.value = roomDifficulty;
  lobbyRoomText.textContent = `Комната: ${state.roomCode}`;
  roundText.textContent = `Раунд #${roundNumber}`;
  gameRoomText.textContent = `Комната: ${state.roomCode}`;
  gameRoundText.textContent = `Раунд #${roundNumber}`;

  renderPlayers();

  if (room.state === 'started') {
    setVisible('game');
    const iAmSpy = room.spyId === state.myId || room.spyUid === state.authUid;
    roleCard.className = `role-card ${iAmSpy ? 'spy' : 'safe'}`;
    roleCard.textContent = iAmSpy ? 'Ты ШПИОН' : `Локация: ${room.location || '-'}`;
    roleHint.textContent = iAmSpy
      ? 'Задача: вычислить локацию и не выдать себя.'
      : 'Задача: задавать вопросы и найти шпиона.';
    gameStatus.textContent = 'Раунд синхронизирован. Все игроки получили роли.';
  } else {
    setVisible('lobby');
    const activeCount = state.players.filter(isPlayerActive).length;
    const expected = Number(room.expectedPlayers || state.expectedPlayers || 3);
    lobbyStatus.textContent = activeCount === expected
      ? `Готово к старту. Игроков: ${activeCount}/${expected}. Фильтр: ${roomCategory}/${roomDifficulty}.`
      : `Ожидаем игроков: ${activeCount}/${expected}. Фильтр: ${roomCategory}/${roomDifficulty}.`;
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
        const expected = Number(state.roomData.expectedPlayers || state.expectedPlayers || 3);
        const roomCategory = state.roomData.locationCategory || state.locationCategory || 'all';
        const roomDifficulty = state.roomData.locationDifficulty || state.locationDifficulty || 'all';
        lobbyStatus.textContent = activeCount === expected
          ? `Готово к старту. Игроков: ${activeCount}/${expected}. Фильтр: ${roomCategory}/${roomDifficulty}.`
          : `Ожидаем игроков: ${activeCount}/${expected}. Фильтр: ${roomCategory}/${roomDifficulty}.`;
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
        expectedPlayers: state.expectedPlayers,
        locationCategory: state.locationCategory,
        locationDifficulty: state.locationDifficulty,
        createdByUid: state.authUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      const data = snap.data();
      const currentExpected = Number(data.expectedPlayers || 3);
      const currentCategory = data.locationCategory || 'all';
      const currentDifficulty = data.locationDifficulty || 'all';

      if (
        data.ownerId === state.myId &&
        (currentExpected !== state.expectedPlayers ||
          currentCategory !== state.locationCategory ||
          currentDifficulty !== state.locationDifficulty)
      ) {
        tx.update(room, {
          expectedPlayers: state.expectedPlayers,
          locationCategory: state.locationCategory,
          locationDifficulty: state.locationDifficulty,
          updatedAt: serverTimestamp()
        });
      } else {
        state.expectedPlayers = currentExpected;
        state.locationCategory = currentCategory;
        state.locationDifficulty = currentDifficulty;
      }

      tx.update(room, { updatedAt: serverTimestamp() });
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
  const expected = Number(expectedPlayersInput.value);
  const category = categoryInput.value;
  const difficulty = difficultyInput.value;

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

  if (!Number.isInteger(expected) || expected < 3 || expected > 20) {
    joinError.textContent = 'Количество игроков: от 3 до 20.';
    return;
  }

  if (!['all', 'general', 'cinema', 'sport', 'travel', 'work', 'history', 'tech', 'crime', 'extreme', 'vip'].includes(category)) {
    joinError.textContent = 'Неизвестная категория.';
    return;
  }

  if (!['all', 'easy', 'medium', 'hard'].includes(difficulty)) {
    joinError.textContent = 'Неизвестная сложность.';
    return;
  }

  joinError.textContent = '';
  state.myName = name;
  state.roomCode = code;
  state.expectedPlayers = expected;
  state.locationCategory = category;
  state.locationDifficulty = difficulty;
  localStorage.setItem(LOCAL_NAME_KEY, state.myName);
  localStorage.setItem(LOCAL_ROOM_KEY, state.roomCode);
  localStorage.setItem(LOCAL_EXPECTED_KEY, String(state.expectedPlayers));
  localStorage.setItem(LOCAL_CATEGORY_KEY, state.locationCategory);
  localStorage.setItem(LOCAL_DIFFICULTY_KEY, state.locationDifficulty);

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
  const expected = Number(state.roomData.expectedPlayers || state.expectedPlayers || 3);
  if (eligiblePlayers.length !== expected) {
    lobbyStatus.textContent = `Нужно ровно ${expected} активных игроков. Сейчас: ${eligiblePlayers.length}.`;
    return;
  }

  const spyPlayer = randomItem(eligiblePlayers);
  const roomCategory = state.roomData.locationCategory || 'all';
  const roomDifficulty = state.roomData.locationDifficulty || 'all';
  const locationItem = pickLocation(roomCategory, roomDifficulty);
  const location = locationItem.name;

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
        spyUid: spyPlayer.uid || '',
        location,
        locationCategory: roomCategory,
        locationDifficulty: roomDifficulty,
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
        spyUid: deleteField(),
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
  expectedPlayersInput.value = String(Math.max(3, Math.min(20, state.expectedPlayers || 3)));
  categoryInput.value = state.locationCategory;
  difficultyInput.value = state.locationDifficulty;
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
