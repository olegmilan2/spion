import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  limit,
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
  { name: 'Кинокасса', category: 'cinema', difficulty: 'easy' },
  { name: 'Буфет киноцентра', category: 'cinema', difficulty: 'easy' },
  { name: 'Съемочная площадка', category: 'cinema', difficulty: 'easy' },
  { name: 'Кинопавильон', category: 'cinema', difficulty: 'medium' },
  { name: 'Гримерный вагон', category: 'cinema', difficulty: 'medium' },
  { name: 'Монтажная студия', category: 'cinema', difficulty: 'medium' },
  { name: 'Фоли-студия', category: 'cinema', difficulty: 'medium' },
  { name: 'Постпродакшн студия', category: 'cinema', difficulty: 'hard' },
  { name: 'Кастинг-агентство', category: 'cinema', difficulty: 'hard' },
  { name: 'Павильон хромакея', category: 'cinema', difficulty: 'hard' },
  { name: 'Фестиваль короткометражек', category: 'cinema', difficulty: 'hard' },

  { name: 'Стадион', category: 'sport', difficulty: 'easy' },
  { name: 'Фитнес-клуб', category: 'sport', difficulty: 'easy' },
  { name: 'Бассейн', category: 'sport', difficulty: 'easy' },
  { name: 'Теннисный корт', category: 'sport', difficulty: 'easy' },
  { name: 'Ледовая арена', category: 'sport', difficulty: 'medium' },
  { name: 'Скалодром', category: 'sport', difficulty: 'medium' },
  { name: 'Велотрек', category: 'sport', difficulty: 'medium' },
  { name: 'Боксерский зал', category: 'sport', difficulty: 'medium' },
  { name: 'Центр подготовки олимпийцев', category: 'sport', difficulty: 'hard' },
  { name: 'Комментаторская кабина', category: 'sport', difficulty: 'hard' },
  { name: 'Спортивный допинг-контроль', category: 'sport', difficulty: 'hard' },
  { name: 'База биатлонной сборной', category: 'sport', difficulty: 'hard' },

  { name: 'Ресторан', category: 'general', difficulty: 'easy' },
  { name: 'Супермаркет', category: 'general', difficulty: 'easy' },
  { name: 'Банк', category: 'general', difficulty: 'easy' },
  { name: 'Больница', category: 'general', difficulty: 'easy' },
  { name: 'Школа', category: 'general', difficulty: 'easy' },
  { name: 'Университет', category: 'general', difficulty: 'medium' },
  { name: 'Музей', category: 'general', difficulty: 'medium' },
  { name: 'Театр', category: 'general', difficulty: 'medium' },
  { name: 'Суд', category: 'general', difficulty: 'medium' },
  { name: 'Почтовый центр', category: 'general', difficulty: 'medium' },
  { name: 'Реставрационная мастерская музея', category: 'general', difficulty: 'hard' },
  { name: 'Хранилище архива', category: 'general', difficulty: 'hard' },

  { name: 'Аэропорт', category: 'travel', difficulty: 'easy' },
  { name: 'Вокзал', category: 'travel', difficulty: 'easy' },
  { name: 'Отель', category: 'travel', difficulty: 'easy' },
  { name: 'Пляж', category: 'travel', difficulty: 'easy' },
  { name: 'Кемпинг', category: 'travel', difficulty: 'easy' },
  { name: 'Круизный лайнер', category: 'travel', difficulty: 'medium' },
  { name: 'Горнолыжный курорт', category: 'travel', difficulty: 'medium' },
  { name: 'Портовый терминал', category: 'travel', difficulty: 'medium' },
  { name: 'Транзитная зона аэропорта', category: 'travel', difficulty: 'medium' },
  { name: 'Подводная лодка', category: 'travel', difficulty: 'hard' },
  { name: 'Космическая станция', category: 'travel', difficulty: 'hard' },
  { name: 'Пограничный пункт', category: 'travel', difficulty: 'hard' },

  { name: 'Офис', category: 'work', difficulty: 'easy' },
  { name: 'Колл-центр', category: 'work', difficulty: 'easy' },
  { name: 'Коворкинг', category: 'work', difficulty: 'easy' },
  { name: 'Склад', category: 'work', difficulty: 'easy' },
  { name: 'Редакция новостей', category: 'work', difficulty: 'easy' },
  { name: 'Заводской цех', category: 'work', difficulty: 'medium' },
  { name: 'Лаборатория', category: 'work', difficulty: 'medium' },
  { name: 'Логистический хаб', category: 'work', difficulty: 'medium' },
  { name: 'Строительная площадка', category: 'work', difficulty: 'medium' },
  { name: 'Аудиторская проверка', category: 'work', difficulty: 'hard' },
  { name: 'Дата-центр', category: 'work', difficulty: 'hard' },
  { name: 'Центр управления полетами', category: 'work', difficulty: 'hard' },

  { name: 'Исторический музей', category: 'history', difficulty: 'easy' },
  { name: 'Краеведческий зал', category: 'history', difficulty: 'easy' },
  { name: 'Архив библиотеки', category: 'history', difficulty: 'easy' },
  { name: 'Экскурсия по крепости', category: 'history', difficulty: 'easy' },
  { name: 'Археологические раскопки', category: 'history', difficulty: 'medium' },
  { name: 'Средневековый замок', category: 'history', difficulty: 'medium' },
  { name: 'Античный амфитеатр', category: 'history', difficulty: 'medium' },
  { name: 'Зал древних рукописей', category: 'history', difficulty: 'medium' },
  { name: 'Военно-исторический архив', category: 'history', difficulty: 'hard' },
  { name: 'Реконструкция древней битвы', category: 'history', difficulty: 'hard' },
  { name: 'Музей эпохи Возрождения', category: 'history', difficulty: 'hard' },
  { name: 'Секретное хранилище манускриптов', category: 'history', difficulty: 'hard' },

  { name: 'IT-офис', category: 'tech', difficulty: 'easy' },
  { name: 'Сервисный центр смартфонов', category: 'tech', difficulty: 'easy' },
  { name: 'Магазин электроники', category: 'tech', difficulty: 'easy' },
  { name: 'Клуб VR-игр', category: 'tech', difficulty: 'easy' },
  { name: 'Киберспортивная арена', category: 'tech', difficulty: 'medium' },
  { name: 'Робототехническая лаборатория', category: 'tech', difficulty: 'medium' },
  { name: 'Студия разработки игр', category: 'tech', difficulty: 'medium' },
  { name: 'Центр тестирования дронов', category: 'tech', difficulty: 'medium' },
  { name: 'Центр ИИ-исследований', category: 'tech', difficulty: 'hard' },
  { name: 'Квантовая лаборатория', category: 'tech', difficulty: 'hard' },
  { name: 'Серверный бункер', category: 'tech', difficulty: 'hard' },
  { name: 'Чип-фабрика', category: 'tech', difficulty: 'hard' },

  { name: 'Патрульный участок', category: 'crime', difficulty: 'easy' },
  { name: 'Камера временного содержания', category: 'crime', difficulty: 'easy' },
  { name: 'Адвокатское бюро', category: 'crime', difficulty: 'easy' },
  { name: 'Комната допроса', category: 'crime', difficulty: 'easy' },
  { name: 'Судебный зал', category: 'crime', difficulty: 'medium' },
  { name: 'Тюрьма', category: 'crime', difficulty: 'medium' },
  { name: 'Баллистическая экспертиза', category: 'crime', difficulty: 'medium' },
  { name: 'Управление расследований', category: 'crime', difficulty: 'medium' },
  { name: 'Криминалистическая лаборатория', category: 'crime', difficulty: 'hard' },
  { name: 'Подпольное казино', category: 'crime', difficulty: 'hard' },
  { name: 'Секретный склад улик', category: 'crime', difficulty: 'hard' },
  { name: 'Точка прослушки', category: 'crime', difficulty: 'hard' },

  { name: 'Картинг', category: 'extreme', difficulty: 'easy' },
  { name: 'Веревочный парк', category: 'extreme', difficulty: 'easy' },
  { name: 'Серф-станция', category: 'extreme', difficulty: 'easy' },
  { name: 'Пейнтбольный полигон', category: 'extreme', difficulty: 'easy' },
  { name: 'Рафтинг-база', category: 'extreme', difficulty: 'medium' },
  { name: 'Парашютный аэродром', category: 'extreme', difficulty: 'medium' },
  { name: 'Каньон для хайкинга', category: 'extreme', difficulty: 'medium' },
  { name: 'Альпинистский лагерь', category: 'extreme', difficulty: 'medium' },
  { name: 'Бейсджампинг-точка', category: 'extreme', difficulty: 'hard' },
  { name: 'Штормовой яхт-клуб', category: 'extreme', difficulty: 'hard' },
  { name: 'Пещера спелеологов', category: 'extreme', difficulty: 'hard' },
  { name: 'Ледник экспедиции', category: 'extreme', difficulty: 'hard' },

  { name: 'Пятизвездочный отель', category: 'vip', difficulty: 'easy' },
  { name: 'Премиум-спа', category: 'vip', difficulty: 'easy' },
  { name: 'Бутик-галерея', category: 'vip', difficulty: 'easy' },
  { name: 'Личный шопинг-зал', category: 'vip', difficulty: 'easy' },
  { name: 'Лаунж в бизнес-терминале', category: 'vip', difficulty: 'medium' },
  { name: 'Закрытый яхт-клуб', category: 'vip', difficulty: 'medium' },
  { name: 'Личный винный погреб', category: 'vip', difficulty: 'medium' },
  { name: 'Бутик-отель на острове', category: 'vip', difficulty: 'medium' },
  { name: 'Приватный аукцион', category: 'vip', difficulty: 'hard' },
  { name: 'Закрытый гольф-клуб', category: 'vip', difficulty: 'hard' },
  { name: 'Пентхаус-вечеринка', category: 'vip', difficulty: 'hard' },
  { name: 'Закулисье люкс-показа', category: 'vip', difficulty: 'hard' }
];

const EASY_GENERAL_WORDS = [
  'Парк', 'Сквер', 'Двор', 'Подъезд', 'Лифт', 'Крыша', 'Балкон', 'Остановка', 'Автобус', 'Троллейбус',
  'Трамвай', 'Метро', 'Перекресток', 'Светофор', 'Переход', 'Почта', 'Аптека', 'Булочная', 'Пекарня', 'Кофейня',
  'Чайная', 'Столовая', 'Пиццерия', 'Пельменная', 'Киоск', 'Рынок', 'Ларек', 'Касса', 'Туалет', 'Гардероб',
  'Школа', 'Класс', 'Кабинет', 'Коридор', 'Стадион', 'Трибуна', 'Поле', 'Корт', 'Бассейн', 'Каток',
  'Магазин', 'Витрина', 'Тележка', 'Кассовая зона', 'Складская полка', 'Примерочная', 'Кинотеатр', 'Зал кино', 'Сцена', 'Кулисы',
  'Музейный зал', 'Экспонат', 'Библиотека', 'Читальный зал', 'Книжная полка', 'Офис', 'Ресепшен', 'Переговорка', 'Столовая офиса', 'Копировальная',
  'Больница', 'Палата', 'Регистратура', 'Кабинет врача', 'Банк', 'Банкомат', 'Операционный зал', 'Парикмахерская', 'Салон красоты', 'Маникюрный стол',
  'Прачечная', 'Химчистка', 'Автомойка', 'Шиномонтаж', 'Заправка', 'Парковка', 'Гараж', 'Склад', 'Кладовая', 'Подвал',
  'Чердак', 'Лестница', 'Детская площадка', 'Песочница', 'Качели', 'Торговый центр', 'Фудкорт', 'Эскалатор', 'Аттракцион', 'Цирк',
  'Зоопарк', 'Вольер', 'Ферма', 'Теплица', 'Огород', 'Пляж', 'Пирс', 'Набережная', 'Лодочная станция', 'Рыбный рынок'
];

LOCATIONS.push(
  ...EASY_GENERAL_WORDS.map((name) => ({
    name,
    category: 'general',
    difficulty: 'easy'
  }))
);

const LOCAL_MY_ID_KEY = 'spy_my_id';
const LOCAL_NAME_KEY = 'spy_player_name';
const LOCAL_AVATAR_KEY = 'spy_player_avatar';
const LOCAL_ROOM_KEY = 'spy_room_code';
const LOCAL_EXPECTED_KEY = 'spy_expected_players';
const LOCAL_CATEGORY_KEY = 'spy_location_category';
const LOCAL_DIFFICULTY_KEY = 'spy_location_difficulty';

const joinCard = document.getElementById('joinCard');
const lobbyCard = document.getElementById('lobbyCard');
const gameCard = document.getElementById('gameCard');

const nameInput = document.getElementById('nameInput');
const avatarFileInput = document.getElementById('avatarFileInput');
const avatarPreview = document.getElementById('avatarPreview');
const roomCodeInput = document.getElementById('roomCodeInput');
const expectedPlayersInput = document.getElementById('expectedPlayersInput');
const categoryInput = document.getElementById('categoryInput');
const difficultyInput = document.getElementById('difficultyInput');
const joinBtn = document.getElementById('joinBtn');
const joinError = document.getElementById('joinError');
const globalStatus = document.getElementById('globalStatus');

const lobbyRoomText = document.getElementById('lobbyRoomText');
const roundText = document.getElementById('roundText');
const lobbyTopAvatar = document.getElementById('lobbyTopAvatar');
const lobbyTopName = document.getElementById('lobbyTopName');
const playersList = document.getElementById('playersList');
const lobbyStatus = document.getElementById('lobbyStatus');
const startRoundBtn = document.getElementById('startRoundBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');

const gameRoomText = document.getElementById('gameRoomText');
const gameRoundText = document.getElementById('gameRoundText');
const gameTopAvatar = document.getElementById('gameTopAvatar');
const gameTopName = document.getElementById('gameTopName');
const roundAlert = document.getElementById('roundAlert');
const roleCard = document.getElementById('roleCard');
const roleHint = document.getElementById('roleHint');
const votePanel = document.getElementById('votePanel');
const voteCandidates = document.getElementById('voteCandidates');
const voteStatus = document.getElementById('voteStatus');
const chatPanel = document.getElementById('chatPanel');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const gameStatus = document.getElementById('gameStatus');
const showRoleCardBtn = document.getElementById('showRoleCardBtn');
const newRoundBtn = document.getElementById('newRoundBtn');
const leaveFromGameBtn = document.getElementById('leaveFromGameBtn');
const roleRevealModal = document.getElementById('roleRevealModal');
const roleRevealTitle = document.getElementById('roleRevealTitle');
const roleRevealText = document.getElementById('roleRevealText');
const roleRevealBtn = document.getElementById('roleRevealBtn');

const state = {
  firebaseReady: false,
  db: null,
  authUid: '',
  myId: localStorage.getItem(LOCAL_MY_ID_KEY) || crypto.randomUUID(),
  myName: localStorage.getItem(LOCAL_NAME_KEY) || '',
  myAvatar: localStorage.getItem(LOCAL_AVATAR_KEY) || '',
  roomCode: localStorage.getItem(LOCAL_ROOM_KEY) || '',
  expectedPlayers: Number(localStorage.getItem(LOCAL_EXPECTED_KEY) || 3),
  locationCategory: localStorage.getItem(LOCAL_CATEGORY_KEY) || 'all',
  locationDifficulty: localStorage.getItem(LOCAL_DIFFICULTY_KEY) || 'all',
  roomData: null,
  players: [],
  votes: [],
  chat: [],
  roomUnsub: null,
  playersUnsub: null,
  votesUnsub: null,
  chatUnsub: null,
  presenceTimerId: null,
  lastRevealToken: ''
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

function getLocationPool(category, difficulty) {
  const filtered = LOCATIONS.filter((item) => {
    const categoryOk = category === 'all' || item.category === category;
    const difficultyOk = difficulty === 'all' || item.difficulty === difficulty;
    return categoryOk && difficultyOk;
  });

  return filtered.length > 0 ? filtered : LOCATIONS;
}

function getHistoryKey(category, difficulty) {
  return `${category}__${difficulty}`;
}

function pickLocationForRoom(roomData) {
  const category = roomData.locationCategory || 'all';
  const difficulty = roomData.locationDifficulty || 'all';
  const previousLocationName = roomData.lastLocation || roomData.location || '';
  const historyKey = getHistoryKey(category, difficulty);
  const historyMap = roomData.locationHistory && typeof roomData.locationHistory === 'object'
    ? roomData.locationHistory
    : {};

  const pool = getLocationPool(category, difficulty);
  const used = Array.isArray(historyMap[historyKey]) ? historyMap[historyKey] : [];
  let available = pool.filter((item) => !used.includes(item.name));
  let nextUsed = used;

  if (available.length === 0) {
    available = pool.filter((item) => item.name !== previousLocationName);
    if (available.length === 0) available = pool;
    nextUsed = [];
  }

  const picked = randomItem(available);
  const updatedHistory = {
    ...historyMap,
    [historyKey]: [...nextUsed, picked.name]
  };

  return {
    picked,
    updatedHistory
  };
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

function renderAvatarPreview(avatarUrl, name) {
  avatarPreview.innerHTML = '';
  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = name || 'avatar';
    img.addEventListener('error', () => {
      avatarPreview.textContent = getInitials(name);
    });
    avatarPreview.appendChild(img);
    return;
  }
  avatarPreview.textContent = getInitials(name);
}

function renderTopAvatar(target, avatarUrl, name) {
  target.innerHTML = '';
  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = name || 'avatar';
    img.addEventListener('error', () => {
      target.textContent = getInitials(name);
    });
    target.appendChild(img);
    return;
  }
  target.textContent = getInitials(name);
}

async function imageFileToDataUrl(file) {
  const rawDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
    img.src = rawDataUrl;
  });

  const maxSide = 320;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function hideRoleReveal() {
  roleRevealModal.classList.add('hidden');
}

function buildRoundRevealToken(roomData) {
  const roundNumber = Number(roomData.roundNumber || 1);
  const startedAt = toMillis(roomData.startedAt);
  return `${state.roomCode}:${roundNumber}:${startedAt}`;
}

function showRoleReveal(roomData, iAmSpy, iAmEliminated) {
  if (iAmEliminated) {
    roleRevealTitle.className = '';
    roleRevealTitle.textContent = 'Карта роли';
    roleRevealText.textContent = 'Роль: ожидание. Локация: недоступна до нового раунда.';
  } else if (iAmSpy) {
    roleRevealTitle.className = 'role-reveal-title-spy';
    roleRevealTitle.textContent = 'Карта роли';
    roleRevealText.textContent = 'Роль: ШПИОН. Локация: скрыта. Слушай ответы и вычисли место.';
  } else {
    roleRevealTitle.className = 'role-reveal-title-safe';
    roleRevealTitle.textContent = 'Карта роли';
    roleRevealText.textContent = `Роль: НЕ шпион. Локация: ${roomData.location || '-'}`;
  }

  roleRevealModal.classList.remove('hidden');
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

function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part[0].toUpperCase()).join('');
}

function activeAlivePlayers() {
  return state.players.filter((player) => isPlayerActive(player) && player.eliminated !== true);
}

function currentRoundVotes() {
  const roundNumber = Number(state.roomData?.roundNumber || 1);
  const voteStage = Number(state.roomData?.voteStage || 1);
  return state.votes.filter(
    (vote) => Number(vote.roundNumber || 0) === roundNumber && Number(vote.voteStage || 1) === voteStage
  );
}

function voteByMe() {
  return currentRoundVotes().find((vote) => vote.id === state.myId) || null;
}

async function tryResolveVotes() {
  if (!state.roomData || state.roomData.state !== 'started') return;

  const voteStage = Number(state.roomData.voteStage || 1);
  if (Number(state.roomData.resolvedVoteStage || 0) === voteStage) return;

  const alivePlayers = activeAlivePlayers();
  const votes = currentRoundVotes();
  if (alivePlayers.length < 2) return;
  if (votes.length < alivePlayers.length) return;

  const counters = new Map();
  votes.forEach((vote) => {
    if (!vote.targetPlayerId) return;
    counters.set(vote.targetPlayerId, (counters.get(vote.targetPlayerId) || 0) + 1);
  });

  if (counters.size === 0) return;

  const sorted = Array.from(counters.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return String(a[0]).localeCompare(String(b[0]));
  });

  const eliminatedPlayerId = sorted[0][0];
  const eliminatedPlayer = state.players.find((player) => player.id === eliminatedPlayerId);
  const eliminatedPlayerName = eliminatedPlayer ? eliminatedPlayer.name : 'Игрок';

  try {
    await runTransaction(state.db, async (tx) => {
      const room = roomRef();
      const roomSnap = await tx.get(room);
      if (!roomSnap.exists()) throw new Error('Комната не найдена');
      const roomData = roomSnap.data();

      if (roomData.state !== 'started') return;
      const currentStage = Number(roomData.voteStage || 1);
      if (Number(roomData.resolvedVoteStage || 0) === currentStage) return;
      if (roomData.roundNumber !== state.roomData.roundNumber) return;

      if (eliminatedPlayerId === roomData.spyId) {
        tx.update(playerRef(eliminatedPlayerId), {
          eliminated: true,
          waiting: true,
          lastSeenAt: serverTimestamp()
        });

        tx.update(room, {
          state: 'finished',
          lastVoteResult: 'spy_found',
          eliminatedPlayerId,
          eliminatedPlayerName,
          resolvedVoteStage: currentStage,
          winner: 'civilians',
          updatedAt: serverTimestamp()
        });
      } else {
        tx.update(playerRef(eliminatedPlayerId), {
          eliminated: true,
          waiting: true,
          lastSeenAt: serverTimestamp()
        });

        tx.update(room, {
          lastVoteResult: 'wrong',
          eliminatedPlayerId,
          eliminatedPlayerName,
          resolvedVoteStage: currentStage,
          voteStage: currentStage + 1,
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch (error) {
    // another client can resolve first; safe to ignore race
  }
}

function renderVotePanel() {
  if (!state.roomData || state.roomData.state !== 'started') {
    votePanel.classList.add('hidden');
    return;
  }

  const me = state.players.find((player) => player.id === state.myId);
  if (!me || me.eliminated === true) {
    votePanel.classList.add('hidden');
    return;
  }

  votePanel.classList.remove('hidden');
  voteCandidates.innerHTML = '';

  const playersForVote = activeAlivePlayers().filter((player) => player.id !== state.myId);
  const myVote = voteByMe();
  const votes = currentRoundVotes();
  const voteCounts = new Map();
  votes.forEach((vote) => {
    if (!vote.targetPlayerId) return;
    voteCounts.set(vote.targetPlayerId, (voteCounts.get(vote.targetPlayerId) || 0) + 1);
  });

  if (state.roomData.lastVoteResult === 'wrong') {
    voteStatus.textContent = `Вы выбрали не того (${state.roomData.eliminatedPlayerName || 'игрок'} выбыл). Игра продолжается.`;
  } else {
    voteStatus.textContent = myVote
      ? `Твой голос принят (этап ${state.roomData.voteStage || 1}). Проголосовало ${votes.length}/${activeAlivePlayers().length}.`
      : `Этап ${state.roomData.voteStage || 1}. Проголосовало ${votes.length}/${activeAlivePlayers().length}.`;
  }

  if (playersForVote.length === 0) {
    const li = document.createElement('li');
    li.className = 'vote-item';
    li.textContent = 'Нет доступных кандидатов для голосования.';
    voteCandidates.appendChild(li);
    return;
  }

  playersForVote.forEach((player) => {
    const li = document.createElement('li');
    li.className = 'vote-item';

    const button = document.createElement('button');
    button.className = 'vote-card';
    const isSelected = myVote?.targetPlayerId === player.id;
    const votesForPlayer = voteCounts.get(player.id) || 0;

    const left = document.createElement('span');
    left.className = 'vote-card-left';

    const avatar = document.createElement('span');
    avatar.className = 'vote-avatar';
    if (player.avatarUrl) {
      const img = document.createElement('img');
      img.src = player.avatarUrl;
      img.alt = player.name || 'avatar';
      img.addEventListener('error', () => {
        avatar.textContent = getInitials(player.name);
      });
      avatar.appendChild(img);
    } else {
      avatar.textContent = getInitials(player.name);
    }

    const name = document.createElement('span');
    name.className = 'vote-card-name';
    name.textContent = `${isSelected ? '✓ ' : ''}${player.name}`;

    const count = document.createElement('span');
    count.className = 'vote-card-count';
    count.textContent = `${votesForPlayer} голос(ов)`;

    left.appendChild(avatar);
    left.appendChild(name);
    button.appendChild(left);
    button.appendChild(count);

    if (isSelected) button.classList.add('selected');
    if (Boolean(myVote)) button.classList.add('disabled');
    button.disabled = Boolean(myVote);
    button.addEventListener('click', () => {
      castVote(player.id);
    });

    li.appendChild(button);
    voteCandidates.appendChild(li);
  });
}

function formatChatTime(value) {
  const ms = toMillis(value);
  if (!ms) return '';
  return new Date(ms).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderChat() {
  if (!state.roomData || (state.roomData.state !== 'started' && state.roomData.state !== 'finished')) {
    chatPanel.classList.add('hidden');
    return;
  }

  chatPanel.classList.remove('hidden');
  chatMessages.innerHTML = '';

  if (state.chat.length === 0) {
    const li = document.createElement('li');
    li.className = 'chat-message';
    li.textContent = 'Чат пуст. Напиши первое сообщение.';
    chatMessages.appendChild(li);
    return;
  }

  state.chat.forEach((msg) => {
    const li = document.createElement('li');
    li.className = 'chat-message';

    const meta = document.createElement('p');
    meta.className = 'chat-meta';
    const time = formatChatTime(msg.createdAt);
    meta.textContent = `${msg.senderName || 'Игрок'}${time ? ` • ${time}` : ''}`;

    const text = document.createElement('p');
    text.className = 'chat-text';
    text.textContent = msg.text || '';

    li.appendChild(meta);
    li.appendChild(text);
    chatMessages.appendChild(li);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  if (!state.roomData || (state.roomData.state !== 'started' && state.roomData.state !== 'finished')) return;

  try {
    await addDoc(chatCollectionRef(), {
      senderId: state.myId,
      senderName: state.myName,
      senderUid: state.authUid,
      roundNumber: state.roomData.roundNumber || 1,
      text: text.slice(0, 180),
      createdAt: serverTimestamp()
    });
    chatInput.value = '';
  } catch (error) {
    gameStatus.textContent = `Ошибка отправки в чат: ${error.message}`;
  }
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
  const me = state.players.find((player) => player.id === state.myId);
  const topName = me?.name || state.myName || 'Игрок';
  const topAvatar = me?.avatarUrl || state.myAvatar || '';
  lobbyTopName.textContent = topName;
  gameTopName.textContent = topName;
  renderTopAvatar(lobbyTopAvatar, topAvatar, topName);
  renderTopAvatar(gameTopAvatar, topAvatar, topName);

  renderPlayers();

  if (room.state === 'started' || room.state === 'finished') {
    setVisible('game');
    roundAlert.className = 'round-alert hidden';
    roundAlert.textContent = '';
    const iAmEliminated = me?.eliminated === true;
    const iAmSpy = room.spyId === state.myId || room.spyUid === state.authUid;
    const revealToken = buildRoundRevealToken(room);

    if (room.state === 'started' && revealToken !== state.lastRevealToken) {
      state.lastRevealToken = revealToken;
      showRoleReveal(room, iAmSpy, iAmEliminated);
    }

    roleCard.className = 'role-card';
    roleCard.textContent = 'Личные данные роли скрыты в игре.';
    roleHint.textContent = iAmEliminated
      ? 'Ты в режиме ожидания. При необходимости открой карту кнопкой.'
      : 'Если забыл роль, нажми "Показать карту".';

    if (room.state === 'finished' && room.lastVoteResult === 'spy_found') {
      roundAlert.className = 'round-alert success';
      roundAlert.textContent = `Шпион найден: ${room.eliminatedPlayerName || 'игрок'}. Раунд завершен.`;
      gameStatus.textContent = `Шпион найден (${room.eliminatedPlayerName || 'игрок'}). Раунд завершен.`;
      votePanel.classList.add('hidden');
    } else if (room.lastVoteResult === 'wrong') {
      roundAlert.className = 'round-alert warning';
      roundAlert.textContent = `Вы выбрали не того: ${room.eliminatedPlayerName || 'игрок'}. Игра продолжается.`;
      gameStatus.textContent = `Вы выбрали не того (${room.eliminatedPlayerName || 'игрок'}). Игра продолжается.`;
      renderVotePanel();
    } else {
      gameStatus.textContent = 'Раунд синхронизирован. Все игроки получили роли.';
      renderVotePanel();
    }
    renderChat();
  } else {
    setVisible('lobby');
    hideRoleReveal();
    roundAlert.className = 'round-alert hidden';
    roundAlert.textContent = '';
    votePanel.classList.add('hidden');
    chatPanel.classList.add('hidden');
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
  if (state.votesUnsub) {
    state.votesUnsub();
    state.votesUnsub = null;
  }
  if (state.chatUnsub) {
    state.chatUnsub();
    state.chatUnsub = null;
  }
}

function roomRef() {
  return doc(state.db, 'rooms', state.roomCode);
}

function playerRef(playerId) {
  return doc(state.db, 'rooms', state.roomCode, 'players', playerId);
}

function voteRef(voterId) {
  return doc(state.db, 'rooms', state.roomCode, 'votes', voterId);
}

function chatCollectionRef() {
  return collection(state.db, 'rooms', state.roomCode, 'chat');
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

  const votesQuery = query(collection(state.db, 'rooms', state.roomCode, 'votes'));
  state.votesUnsub = onSnapshot(
    votesQuery,
    (snapshot) => {
      state.votes = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      if (state.roomData?.state === 'started') {
        renderVotePanel();
        tryResolveVotes();
      }
    },
    (error) => {
      showGlobalStatus(`Ошибка votes snapshot: ${error.message}`, 'error');
    }
  );

  const chatQuery = query(chatCollectionRef(), orderBy('createdAt', 'asc'), limit(60));
  state.chatUnsub = onSnapshot(
    chatQuery,
    (snapshot) => {
      state.chat = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderChat();
    },
    (error) => {
      showGlobalStatus(`Ошибка chat snapshot: ${error.message}`, 'error');
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
        locationHistory: {},
        lastLocation: '',
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
      avatarUrl: state.myAvatar,
      connected: true,
      eliminated: false,
      waiting: false,
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
  localStorage.setItem(LOCAL_AVATAR_KEY, state.myAvatar);
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

      const { picked, updatedHistory } = pickLocationForRoom(data);

      tx.update(room, {
        state: 'started',
        spyId: spyPlayer.id,
        spyUid: spyPlayer.uid || '',
        location: picked.name,
        lastLocation: picked.name,
        locationCategory: data.locationCategory || 'all',
        locationDifficulty: data.locationDifficulty || 'all',
        locationHistory: updatedHistory,
        eliminatedPlayerId: deleteField(),
        eliminatedPlayerName: deleteField(),
        lastVoteResult: deleteField(),
        winner: deleteField(),
        voteStage: 1,
        resolvedVoteStage: 0,
        startedBy: state.myId,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await Promise.all(
      state.players.map((player) =>
        updateDoc(playerRef(player.id), {
          eliminated: false,
          waiting: false,
          lastSeenAt: serverTimestamp()
        }).catch(() => {})
      )
    );

    lobbyStatus.textContent = 'Раунд запущен. Раздаем роли...';
  } catch (error) {
    lobbyStatus.textContent = `Старт отклонен: ${error.message}`;
  }
}

async function castVote(targetPlayerId) {
  if (!state.roomData || state.roomData.state !== 'started') return;
  if (voteByMe()) return;

  const me = state.players.find((player) => player.id === state.myId);
  if (!me || me.eliminated === true) return;

  try {
    await setDoc(
      voteRef(state.myId),
      {
        voterId: state.myId,
        voterName: state.myName,
        targetPlayerId,
        roundNumber: state.roomData.roundNumber,
        voteStage: state.roomData.voteStage || 1,
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
    renderVotePanel();
    await tryResolveVotes();
  } catch (error) {
    voteStatus.textContent = `Ошибка голосования: ${error.message}`;
  }
}

async function resetRound() {
  if (!state.roomData || (state.roomData.state !== 'started' && state.roomData.state !== 'finished')) {
    gameStatus.textContent = 'Раунд еще не начат.';
    return;
  }

  const eligiblePlayers = state.players.filter(isPlayerActive);
  const expected = Number(state.roomData.expectedPlayers || state.expectedPlayers || 3);
  if (eligiblePlayers.length !== expected) {
    gameStatus.textContent = `Невозможно начать сразу: нужно ровно ${expected} активных игроков, сейчас ${eligiblePlayers.length}.`;
    return;
  }

  const spyPlayer = randomItem(eligiblePlayers);

  try {
    await runTransaction(state.db, async (tx) => {
      const room = roomRef();
      const snap = await tx.get(room);

      if (!snap.exists()) {
        throw new Error('Комната не найдена');
      }

      const data = snap.data();
      const nextRound = (data.roundNumber || 1) + 1;
      const { picked, updatedHistory } = pickLocationForRoom(data);

      tx.update(room, {
        state: 'started',
        roundNumber: nextRound,
        spyId: spyPlayer.id,
        spyUid: spyPlayer.uid || '',
        location: picked.name,
        locationCategory: data.locationCategory || 'all',
        locationDifficulty: data.locationDifficulty || 'all',
        locationHistory: updatedHistory,
        lastLocation: picked.name,
        eliminatedPlayerId: deleteField(),
        eliminatedPlayerName: deleteField(),
        lastVoteResult: deleteField(),
        winner: deleteField(),
        voteStage: 1,
        resolvedVoteStage: 0,
        startedBy: state.myId,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await Promise.all(
      state.players.map((player) =>
        updateDoc(playerRef(player.id), {
          eliminated: false,
          waiting: false,
          lastSeenAt: serverTimestamp()
        }).catch(() => {})
      )
    );

    gameStatus.textContent = 'Новый раунд запущен сразу.';
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
  state.votes = [];
  state.chat = [];
  state.lastRevealToken = '';
  hideRoleReveal();
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
  renderAvatarPreview(state.myAvatar, state.myName);
}

joinBtn.addEventListener('click', joinRoom);
startRoundBtn.addEventListener('click', startRound);
newRoundBtn.addEventListener('click', () => {
  const ok = window.confirm('Начать новый раунд сейчас? Текущий прогресс голосования будет сброшен.');
  if (!ok) return;
  resetRound();
});
leaveRoomBtn.addEventListener('click', leaveRoom);
leaveFromGameBtn.addEventListener('click', leaveRoom);
showRoleCardBtn.addEventListener('click', () => {
  if (!state.roomData || (state.roomData.state !== 'started' && state.roomData.state !== 'finished')) return;
  const me = state.players.find((player) => player.id === state.myId);
  const iAmEliminated = me?.eliminated === true;
  const iAmSpy = state.roomData.spyId === state.myId || state.roomData.spyUid === state.authUid;
  showRoleReveal(state.roomData, iAmSpy, iAmEliminated);
});
nameInput.addEventListener('input', () => {
  if (!state.myAvatar) {
    renderAvatarPreview('', nameInput.value.trim());
  }
});
avatarFileInput.addEventListener('change', async () => {
  const file = avatarFileInput.files && avatarFileInput.files[0];
  if (!file) return;
  try {
    const dataUrl = await imageFileToDataUrl(file);
    state.myAvatar = dataUrl;
    renderAvatarPreview(dataUrl, nameInput.value.trim() || state.myName);
  } catch (error) {
    showGlobalStatus(`Ошибка загрузки аватара: ${error.message}`, 'error');
  }
});
chatSendBtn.addEventListener('click', sendChatMessage);
roleRevealBtn.addEventListener('click', hideRoleReveal);
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendChatMessage();
  }
});

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
