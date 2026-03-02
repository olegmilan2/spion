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

const SPY_SECRET_ACTIONS = [
  'На 3 секунды высуни язык',
  'Незаметно подмигни два раза',
  'Коснись своего уха и продолжай говорить',
  'Скажи фразу: "интересный вопрос"',
  'Почеши свой затылок во время ответа',
  'На секунду прикрой один глаз',
  'Сложи руки в замок и отпусти',
  'Скажи слово "логично" в ответе',
  'Постучи своими пальцами по столу 3 раза',
  'Сделай короткую паузу перед ответом',
  'Поправь свой воротник или футболку',
  'Потрогай свой нос кончиком пальца',
  'Улыбнись и сразу стань серьезным',
  'На секунду отвернись в сторону',
  'Скажи: "я бы так не сказал"',
  'Повтори последнее слово собеседника',
  'Кивни 3 раза подряд',
  'Скрести руки на груди на пару секунд',
  'Проведи рукой по своим волосам',
  'Скажи фразу: "это спорно"',
  'Поцелуй себя в руку',
  'Потри ладони друг о друга',
  'Коснись своего подбородка',
  'Поправь рукав на своей руке',
  'Сделай глубокий вдох и медленный выдох',
  'Проведи пальцем по своей брови',
  'Сожми кулак и разожми',
  'На секунду прикуси нижнюю губу',
  'Слегка наклони голову и верни обратно',
  'Быстро моргни 4 раза',
  'Коснись своего лба тыльной стороной ладони',
  'Проведи рукой по своей щеке',
  'Сложи ладони лодочкой на секунду',
  'Коснись ключицы кончиками пальцев',
  'Потрогай мочку своего уха',
  'Проведи пальцами по своим губам',
  'Подними плечи и опусти',
  'Сожми губы в линию на секунду',
  'Ненадолго подними брови',
  'Проведи ладонью по своей шее',
  'Сделай вид, что поправляешь челку',
  'Коснись своей переносицы',
  'Скажи: "секунду, мысль поймал"',
  'Поверни кисть и посмотри на свою ладонь',
  'Сцепи пальцы и слегка потяни',
  'Сложи губы трубочкой на секунду',
  'Проведи пальцем по контуру своей ладони',
  'Коснись своего виска',
  'Ненадолго упрись локтями в стол',
  'Скажи: "мне нужно уточнить формулировку"'
];

const GENERIC_CIVILIAN_ROLES = [
  'Стажер',
  'Координатор',
  'Организатор',
  'Техник',
  'Сотрудник',
  'Наблюдатель',
  'Администратор',
  'Посетитель'
];

const CATEGORY_ROLE_POOL = {
  general: [
    'Хирург', 'Терапевт', 'Медсестра', 'Пациент', 'Фельдшер',
    'Судья', 'Прокурор', 'Адвокат', 'Секретарь суда', 'Пристав',
    'Шеф-повар', 'Официант', 'Бариста', 'Кассир', 'Администратор зала',
    'Учитель', 'Директор школы', 'Библиотекарь', 'Лаборант', 'Экскурсовод музея'
  ],
  cinema: [
    'Режиссер', 'Оператор', 'Сценарист', 'Продюсер', 'Кастинг-директор',
    'Киномеханик', 'Монтажер', 'Звукорежиссер', 'Гример', 'Костюмер',
    'Актер', 'Дублер', 'Осветитель', 'Хлопушка', 'Реквизитор',
    'Кассир кинотеатра', 'Контролер билетов', 'Продавец попкорна', 'PR-менеджер фестиваля', 'Кинокритик'
  ],
  sport: [
    'Футболист', 'Баскетболист', 'Теннисист', 'Пловец', 'Боксер',
    'Тренер', 'Ассистент тренера', 'Судья матча', 'Комментатор', 'Стюард стадиона',
    'Физиотерапевт', 'Массажист команды', 'Спортивный врач', 'Администратор арены', 'Инструктор фитнеса',
    'Скалолаз', 'Биатлонист', 'Хоккеист', 'Велогонщик', 'Спортивный журналист'
  ],
  travel: [
    'Пилот', 'Второй пилот', 'Бортпроводник', 'Диспетчер', 'Сотрудник регистрации',
    'Сотрудник досмотра', 'Пограничник', 'Таможенник', 'Гид', 'Турист',
    'Капитан лайнера', 'Матрос', 'Механик порта', 'Портье отеля', 'Консьерж',
    'Инструктор горнолыжки', 'Спасатель пляжа', 'Водитель шаттла', 'Оператор багажа', 'Агент турагентства'
  ],
  work: [
    'Проектный менеджер', 'Аналитик', 'Бухгалтер', 'HR-специалист', 'Офис-менеджер',
    'Оператор колл-центра', 'Логист', 'Кладовщик', 'Инженер', 'Технолог',
    'Сварщик', 'Строитель', 'Прораб', 'Редактор новостей', 'Журналист',
    'Системный администратор', 'DevOps-инженер', 'Лаборант', 'Оператор станка', 'Контролер качества'
  ],
  history: [
    'Археолог', 'Историк', 'Экскурсовод крепости', 'Реконструктор', 'Архивариус',
    'Хранитель фонда', 'Реставратор рукописей', 'Куратор экспозиции', 'Антиквар', 'Этнограф',
    'Музейный смотритель', 'Специалист по манускриптам', 'Генеалог', 'Нумизмат', 'Палеограф',
    'Историк искусства', 'Сотрудник военно-исторического архива', 'Лектор музея', 'Консультант выставки', 'Сценограф реконструкции'
  ],
  tech: [
    'Frontend-разработчик', 'Backend-разработчик', 'QA-инженер', 'Data Scientist', 'ML-инженер',
    'Инженер по робототехнике', 'Оператор дрона', 'Киберспортсмен', 'Гейм-дизайнер', '3D-художник',
    'Сервисный инженер', 'Специалист техподдержки', 'Сетевой инженер', 'Инженер микросхем', 'Админ дата-центра',
    'Исследователь квантовых систем', 'Инженер VR-лаборатории', 'Продакт-менеджер', 'UI/UX-дизайнер', 'Тестировщик железа'
  ],
  crime: [
    'Следователь', 'Оперуполномоченный', 'Криминалист', 'Судмедэксперт', 'Эксперт-баллист',
    'Прокурор', 'Адвокат', 'Судья', 'Пристав', 'Охранник тюрьмы',
    'Дежурный участка', 'Аналитик улик', 'Понятый', 'Секретарь суда', 'Детектив',
    'Сотрудник прослушки', 'Информатор', 'Спецагент', 'Охранник подпольного клуба', 'Свидетель'
  ],
  extreme: [
    'Инструктор по серфингу', 'Рафтинг-гид', 'Парашютист', 'Альпинист', 'Спелеолог',
    'Инструктор скалодрома', 'Капитан яхты', 'Штурман экспедиции', 'Спасатель МЧС', 'Инструктор картинга',
    'Оператор тросовой трассы', 'Гид каньона', 'Техник снаряжения', 'Бейсджампер', 'Каякер',
    'Сноубордист', 'Лавинный спасатель', 'Организатор экспедиции', 'Метеонаблюдатель', 'Механик квадроциклов'
  ],
  vip: [
    'Личный ассистент', 'Консьерж люкс-отеля', 'Сомелье', 'Ювелир-консультант', 'Аукционист',
    'Коллекционер', 'Охранник VIP-зоны', 'Ивент-менеджер', 'Имидж-стилист', 'Личный водитель',
    'Шеф-повар private dining', 'Директор бутика', 'Куратор частной галереи', 'Гольф-инструктор', 'Яхт-менеджер',
    'PR-агент звезды', 'Специалист VIP-лаунжа', 'Организатор закрытых показов', 'Инвестор', 'Гость пентхауса'
  ]
};

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
const LOCAL_SPY_COUNT_KEY = 'spy_count';
const LOCAL_SPY_MODE_KEY = 'spy_mode';
const LOCAL_GAME_VARIANT_KEY = 'spy_game_variant';
const LOCAL_CATEGORY_KEY = 'spy_location_category';
const LOCAL_DIFFICULTY_KEY = 'spy_location_difficulty';

const joinCard = document.getElementById('joinCard');
const lobbyCard = document.getElementById('lobbyCard');
const gameCard = document.getElementById('gameCard');

const nameInput = document.getElementById('nameInput');
const avatarPickerBtn = document.getElementById('avatarPickerBtn');
const avatarFileInput = document.getElementById('avatarFileInput');
const avatarPreview = document.getElementById('avatarPreview');
const roomCodeInput = document.getElementById('roomCodeInput');
const expectedPlayersInput = document.getElementById('expectedPlayersInput');
const spyCountGrid = document.getElementById('spyCountGrid');
const spyCountInput = document.getElementById('spyCountInput');
const spyModeGrid = document.getElementById('spyModeGrid');
const spyModeInput = document.getElementById('spyModeInput');
const gameVariantGrid = document.getElementById('gameVariantGrid');
const gameVariantInput = document.getElementById('gameVariantInput');
const categoryGrid = document.getElementById('categoryGrid');
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
const roleRevealCard = document.getElementById('roleRevealCard');
const roleRevealTitle = document.getElementById('roleRevealTitle');
const roleRevealText = document.getElementById('roleRevealText');
const roleRevealBtn = document.getElementById('roleRevealBtn');
const rulesMeta = document.getElementById('rulesMeta');
const rulesList = document.getElementById('rulesList');

const state = {
  firebaseReady: false,
  db: null,
  authUid: '',
  myId: localStorage.getItem(LOCAL_MY_ID_KEY) || crypto.randomUUID(),
  myName: localStorage.getItem(LOCAL_NAME_KEY) || '',
  myAvatar: localStorage.getItem(LOCAL_AVATAR_KEY) || '',
  roomCode: localStorage.getItem(LOCAL_ROOM_KEY) || '',
  expectedPlayers: Number(localStorage.getItem(LOCAL_EXPECTED_KEY) || 3),
  spyCount: Number(localStorage.getItem(LOCAL_SPY_COUNT_KEY) || 1),
  spyMode: localStorage.getItem(LOCAL_SPY_MODE_KEY) || 'blind',
  gameVariant: localStorage.getItem(LOCAL_GAME_VARIANT_KEY) || 'classic',
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
  lastRevealToken: '',
  recoveringRoom: false
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

function setSpyModeUI(mode) {
  spyModeInput.value = mode === 'known' ? 'known' : 'blind';
  if (spyModeGrid) {
    const cells = spyModeGrid.querySelectorAll('.mode-cell');
    cells.forEach((cell) => {
      cell.classList.toggle('active', cell.dataset.mode === spyModeInput.value);
    });
  }
  renderRules();
}

function setSpyCountUI(count) {
  const safeCount = Number(count) === 2 ? '2' : '1';
  spyCountInput.value = safeCount;
  if (spyCountGrid) {
    const cells = spyCountGrid.querySelectorAll('.mode-cell');
    cells.forEach((cell) => {
      cell.classList.toggle('active', cell.dataset.spyCount === safeCount);
    });
  }
  renderRules();
}

function setGameVariantUI(variant) {
  const allowed = ['classic', 'classic_roles', 'hide'];
  gameVariantInput.value = allowed.includes(variant) ? variant : 'classic';
  if (gameVariantGrid) {
    const cells = gameVariantGrid.querySelectorAll('.mode-cell');
    cells.forEach((cell) => {
      cell.classList.toggle('active', cell.dataset.variant === gameVariantInput.value);
    });
  }
  renderRules();
}

function setCategoryUI(category) {
  const allowed = ['all', 'general', 'cinema', 'sport', 'travel', 'work', 'history', 'tech', 'crime', 'extreme', 'vip'];
  const safeCategory = allowed.includes(category) ? category : 'all';
  categoryInput.value = safeCategory;
  if (categoryGrid) {
    const cells = categoryGrid.querySelectorAll('.mode-cell');
    cells.forEach((cell) => {
      cell.classList.toggle('active', cell.dataset.category === safeCategory);
    });
  }
}

function renderRules() {
  if (!rulesMeta || !rulesList) return;
  const spyCount = Number(spyCountInput.value) === 2 ? 2 : 1;
  const spyMode = spyModeInput.value === 'known' ? 'known' : 'blind';
  const gameVariant = ['classic', 'classic_roles', 'hide'].includes(gameVariantInput.value)
    ? gameVariantInput.value
    : 'classic';
  const spyModeLabel = spyMode === 'known' ? 'сговор' : 'вслепую';
  const gameVariantLabel = gameVariant === 'hide'
    ? 'прятки на виду'
    : gameVariant === 'classic_roles'
      ? 'классика с ролью'
      : 'классика';

  rulesMeta.textContent = `Текущие правила: ${spyCount} шпион(а), режим ${spyModeLabel}, вариант ${gameVariantLabel}.`;

  const items = [
    'Все игроки вводят один и тот же код комнаты и ждут полный состав в лобби.',
    `В раунде ${spyCount} шпион(а). Мирным нужно вычислить ${spyCount === 2 ? 'обоих' : 'его'} голосованием.`,
    spyMode === 'known'
      ? 'Режим "Сговор": шпионы знают друг друга и могут действовать вместе.'
      : 'Режим "Вслепую": шпионы не знают, кто их напарник.',
    gameVariant === 'hide'
      ? 'Вариант "Прятки на виду": каждому шпиону дается секретное действие, которое нужно выполнить незаметно, без контакта с другими игроками.'
      : gameVariant === 'classic_roles'
        ? 'Вариант "Классика с ролью": мирные получают роль внутри локации (например, хирург в больнице), это делает обсуждение глубже.'
        : 'Вариант "Классика": стандартная игра без секретных действий и без ролей мирных.',
    'После старта все получают карту роли: шпиону скрытая локация, мирным название локации.',
    'Во время обсуждения задавайте вопросы по локации, не раскрывая ее напрямую.',
    'В голосовании выберите подозреваемого: неверный выбор убирает игрока, а раунд продолжается.',
    'Раунд заканчивается, когда найдены все шпионы или шпион(ы) перехитрили мирных.'
  ];

  rulesList.innerHTML = '';
  items.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    rulesList.appendChild(li);
  });
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDistinct(items, count) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.max(0, Math.min(count, arr.length)));
}

function pickSecretActions(count) {
  return pickDistinct(SPY_SECRET_ACTIONS, count);
}

function getCategoryRolePool(category) {
  const direct = CATEGORY_ROLE_POOL[category];
  if (Array.isArray(direct) && direct.length > 0) return direct;
  return GENERIC_CIVILIAN_ROLES;
}

function pickCivilianRoles(players, locationCategory) {
  const pool = [...getCategoryRolePool(locationCategory)];
  const shuffledPlayers = pickDistinct(players, players.length);
  const rolesByPlayer = {};

  shuffledPlayers.forEach((player, index) => {
    if (index < pool.length) {
      rolesByPlayer[player.id] = pool[index];
      return;
    }
    rolesByPlayer[player.id] = randomItem(pool);
  });

  return rolesByPlayer;
}

function getSpyIdsFromRoom(roomData) {
  if (Array.isArray(roomData.spyIds)) return roomData.spyIds.filter(Boolean);
  if (roomData.spyId) return [roomData.spyId];
  return [];
}

function getSpyUidsFromRoom(roomData) {
  if (Array.isArray(roomData.spyUids)) return roomData.spyUids.filter(Boolean);
  if (roomData.spyUid) return [roomData.spyUid];
  return [];
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

function isStaleRound(roomData) {
  const startedAtMs = toMillis(roomData?.startedAt);
  if (!startedAtMs) return true;
  return Date.now() - startedAtMs > 10 * 60 * 1000;
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

let flipAudioContext = null;

function playFlipSound() {
  const AudioCtxCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxCtor) return;

  if (!flipAudioContext) {
    flipAudioContext = new AudioCtxCtor();
  }
  const ctx = flipAudioContext;

  const ensureRunning = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
  ensureRunning.then(() => {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.42, now);
    master.connect(ctx.destination);

    const makeTick = (start, fromHz, toHz, peakGain) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(fromHz, start);
      osc.frequency.exponentialRampToValueAtTime(toHz, start + 0.11);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1300, start);
      filter.Q.setValueAtTime(0.8, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.115);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc.start(start);
      osc.stop(start + 0.13);
    };

    makeTick(now, 1100, 360, 0.48);
    makeTick(now + 0.055, 860, 300, 0.32);
  }).catch(() => {});
}

function buildRoundRevealToken(roomData) {
  const roundNumber = Number(roomData.roundNumber || 1);
  const startedAt = toMillis(roomData.startedAt);
  return `${state.roomCode}:${roundNumber}:${startedAt}`;
}

function showRoleReveal(roomData, iAmSpy, iAmEliminated) {
  const spyCount = Number(roomData.spyCount || getSpyIdsFromRoom(roomData).length || 1);
  const spyMode = roomData.spyMode || state.spyMode || 'blind';
  const gameVariant = roomData.gameVariant || state.gameVariant || 'classic';
  if (iAmEliminated) {
    roleRevealTitle.className = '';
    roleRevealTitle.textContent = 'Карта роли';
    roleRevealText.textContent = 'Роль: ожидание. Локация: недоступна до нового раунда.';
  } else if (iAmSpy) {
    const spyIds = getSpyIdsFromRoom(roomData);
    const mySecretAction = roomData.spyActions && typeof roomData.spyActions === 'object'
      ? roomData.spyActions[state.myId]
      : '';
    const partnerNames = state.players
      .filter((player) => spyIds.includes(player.id) && player.id !== state.myId)
      .map((player) => player.name);
    const partnerText = spyMode === 'known' && partnerNames.length > 0
      ? ` Напарники: ${partnerNames.join(', ')}.`
      : '';
    const actionText = gameVariant === 'hide' && mySecretAction
      ? ` Секретное действие: ${mySecretAction}. Важно: выполняй только на себе, не трогай других игроков.`
      : '';

    roleRevealTitle.className = 'role-reveal-title-spy';
    roleRevealTitle.textContent = 'Карта роли';
    roleRevealText.textContent = `Роль: ШПИОН (${spyCount} в раунде). Режим: ${spyMode === 'known' ? 'сговор' : 'вслепую'}. Локация: скрыта.${partnerText}${actionText}`;
  } else {
    roleRevealTitle.className = 'role-reveal-title-safe';
    roleRevealTitle.textContent = 'Карта роли';
    const roleForMe = roomData.civilianRoles && typeof roomData.civilianRoles === 'object'
      ? roomData.civilianRoles[state.myId]
      : '';
    if (gameVariant === 'classic_roles' && roleForMe) {
      roleRevealText.textContent = `Ты ${String(roleForMe).toLowerCase()}. Локация: ${roomData.location || '-'}`;
    } else {
      roleRevealText.textContent = `Ты не шпион. Локация: ${roomData.location || '-'}`;
    }
  }

  roleRevealModal.classList.remove('hidden');
  if (roleRevealCard) {
    roleRevealCard.classList.remove('flip-in');
    void roleRevealCard.offsetWidth;
    roleRevealCard.classList.add('flip-in');
  }
}

function showGlobalStatus(message, type = 'muted') {
  globalStatus.textContent = message;
  globalStatus.dataset.type = type;
}

function renderPlayers() {
  playersList.innerHTML = '';
  if (state.players.length === 0) {
    const li = document.createElement('li');
    li.className = 'player-item empty';
    li.textContent = 'Пока нет игроков';
    playersList.appendChild(li);
    return;
  }

  state.players.forEach((player) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    const status = isPlayerActive(player) ? 'онлайн' : 'оффлайн';

    const avatar = document.createElement('span');
    avatar.className = 'player-avatar';
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

    const main = document.createElement('div');
    main.className = 'player-main';
    const name = document.createElement('p');
    name.className = 'player-name';
    name.textContent = player.id === state.myId ? `${player.name} (ты)` : player.name;
    const sub = document.createElement('p');
    sub.className = 'player-sub';
    sub.textContent = player.eliminated === true ? 'ожидание до нового раунда' : 'в игре';
    main.appendChild(name);
    main.appendChild(sub);

    const badge = document.createElement('span');
    badge.className = `player-badge${status === 'оффлайн' ? ' offline' : ''}`;
    badge.textContent = status;

    li.appendChild(avatar);
    li.appendChild(main);
    li.appendChild(badge);
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
      const spyIds = getSpyIdsFromRoom(roomData);
      const foundSpyIds = Array.isArray(roomData.foundSpyIds) ? roomData.foundSpyIds : [];
      const isSpy = spyIds.includes(eliminatedPlayerId);

      if (isSpy) {
        const nextFound = foundSpyIds.includes(eliminatedPlayerId)
          ? foundSpyIds
          : [...foundSpyIds, eliminatedPlayerId];
        const allFound = spyIds.length > 0 && nextFound.length >= spyIds.length;

        tx.update(playerRef(eliminatedPlayerId), {
          eliminated: true,
          waiting: true,
          lastSeenAt: serverTimestamp()
        });

        if (allFound) {
          tx.update(room, {
            state: 'finished',
            lastVoteResult: 'all_spies_found',
            eliminatedPlayerId,
            eliminatedPlayerName,
            foundSpyIds: nextFound,
            resolvedVoteStage: currentStage,
            winner: 'civilians',
            updatedAt: serverTimestamp()
          });
        } else {
          tx.update(room, {
            state: 'started',
            lastVoteResult: 'spy_found_continue',
            eliminatedPlayerId,
            eliminatedPlayerName,
            foundSpyIds: nextFound,
            resolvedVoteStage: currentStage,
            voteStage: currentStage + 1,
            updatedAt: serverTimestamp()
          });
        }
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
  const roomSpyCount = Number(room.spyCount || state.spyCount || 1);
  const roomSpyMode = room.spyMode || state.spyMode || 'blind';
  const roomGameVariant = room.gameVariant || state.gameVariant || 'classic';
  setCategoryUI(roomCategory);
  difficultyInput.value = roomDifficulty;
  setSpyCountUI(Math.max(1, Math.min(2, roomSpyCount)));
  setSpyModeUI(roomSpyMode);
  setGameVariantUI(roomGameVariant);
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
    const spyIds = getSpyIdsFromRoom(room);
    const spyUids = getSpyUidsFromRoom(room);
    const iAmSpy = spyIds.includes(state.myId) || spyUids.includes(state.authUid);
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

    if (room.state === 'finished' && room.lastVoteResult === 'all_spies_found') {
      roundAlert.className = 'round-alert success';
      roundAlert.textContent = `Все шпионы найдены. Последний: ${room.eliminatedPlayerName || 'игрок'}.`;
      gameStatus.textContent = 'Раунд завершен: все шпионы разоблачены.';
      votePanel.classList.add('hidden');
    } else if (room.lastVoteResult === 'spy_found_continue') {
      roundAlert.className = 'round-alert success';
      roundAlert.textContent = `Найден шпион: ${room.eliminatedPlayerName || 'игрок'}. Но есть еще шпион(ы).`;
      gameStatus.textContent = 'Шпион найден, игра продолжается до поиска всех шпионов.';
      renderVotePanel();
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
    const spyModeLabel = roomSpyMode === 'known' ? 'сговор' : 'вслепую';
    const gameVariantLabel = roomGameVariant === 'hide'
      ? 'прятки на виду'
      : roomGameVariant === 'classic_roles'
        ? 'классика с ролью'
        : 'классика';
    lobbyStatus.textContent = activeCount === expected
      ? `Готово к старту. Игроков: ${activeCount}/${expected}. Шпионов: ${roomSpyCount} (${spyModeLabel}). Вариант: ${gameVariantLabel}. Фильтр: ${roomCategory}/${roomDifficulty}.`
      : `Ожидаем игроков: ${activeCount}/${expected}. Шпионов: ${roomSpyCount} (${spyModeLabel}). Вариант: ${gameVariantLabel}. Фильтр: ${roomCategory}/${roomDifficulty}.`;
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

async function recoverRoomToLobby() {
  if (!state.roomData || state.recoveringRoom) return;
  if (state.roomData.state !== 'started' && state.roomData.state !== 'finished') return;

  state.recoveringRoom = true;
  try {
    await updateDoc(roomRef(), {
      state: 'lobby',
      spyIds: [],
      spyUids: [],
      spyActions: {},
      civilianRoles: {},
      spyId: deleteField(),
      spyUid: deleteField(),
      eliminatedPlayerId: deleteField(),
      eliminatedPlayerName: deleteField(),
      lastVoteResult: deleteField(),
      winner: deleteField(),
      foundSpyIds: [],
      voteStage: 1,
      resolvedVoteStage: 0,
      updatedAt: serverTimestamp()
    });
    lobbyStatus.textContent = 'Комната была в старом раунде и автоматически возвращена в лобби.';
  } catch (error) {
    showGlobalStatus(`Не удалось восстановить комнату: ${error.message}`, 'error');
  } finally {
    state.recoveringRoom = false;
  }
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
      const activeCount = state.players.filter(isPlayerActive).length;
      if (
        state.roomData &&
        (state.roomData.state === 'started' || state.roomData.state === 'finished') &&
        activeCount < 2 &&
        isStaleRound(state.roomData)
      ) {
        recoverRoomToLobby();
      }
      renderPlayers();
      if (state.roomData && state.roomData.state !== 'started') {
        const expected = Number(state.roomData.expectedPlayers || state.expectedPlayers || 3);
        const spyCount = Number(state.roomData.spyCount || state.spyCount || 1);
        const spyMode = state.roomData.spyMode || state.spyMode || 'blind';
        const gameVariant = state.roomData.gameVariant || state.gameVariant || 'classic';
        const spyModeLabel = spyMode === 'known' ? 'сговор' : 'вслепую';
        const gameVariantLabel = gameVariant === 'hide'
          ? 'прятки на виду'
          : gameVariant === 'classic_roles'
            ? 'классика с ролью'
            : 'классика';
        const roomCategory = state.roomData.locationCategory || state.locationCategory || 'all';
        const roomDifficulty = state.roomData.locationDifficulty || state.locationDifficulty || 'all';
        lobbyStatus.textContent = activeCount === expected
          ? `Готово к старту. Игроков: ${activeCount}/${expected}. Шпионов: ${spyCount} (${spyModeLabel}). Вариант: ${gameVariantLabel}. Фильтр: ${roomCategory}/${roomDifficulty}.`
          : `Ожидаем игроков: ${activeCount}/${expected}. Шпионов: ${spyCount} (${spyModeLabel}). Вариант: ${gameVariantLabel}. Фильтр: ${roomCategory}/${roomDifficulty}.`;
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
        spyCount: state.spyCount,
        spyMode: state.spyMode,
        gameVariant: state.gameVariant,
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
      const currentSpyCount = Number(data.spyCount || 1);
      const currentSpyMode = data.spyMode || 'blind';
      const currentGameVariant = data.gameVariant || 'classic';
      const currentCategory = data.locationCategory || 'all';
      const currentDifficulty = data.locationDifficulty || 'all';

      if (
        data.ownerId === state.myId &&
        (currentExpected !== state.expectedPlayers ||
          currentSpyCount !== state.spyCount ||
          currentSpyMode !== state.spyMode ||
          currentGameVariant !== state.gameVariant ||
          currentCategory !== state.locationCategory ||
          currentDifficulty !== state.locationDifficulty)
      ) {
        tx.update(room, {
          expectedPlayers: state.expectedPlayers,
          spyCount: state.spyCount,
          spyMode: state.spyMode,
          gameVariant: state.gameVariant,
          locationCategory: state.locationCategory,
          locationDifficulty: state.locationDifficulty,
          updatedAt: serverTimestamp()
        });
      } else {
        state.expectedPlayers = currentExpected;
        state.spyCount = currentSpyCount;
        state.spyMode = currentSpyMode;
        state.gameVariant = currentGameVariant;
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
  const spyCount = Number(spyCountInput.value);
  const spyMode = spyModeInput.value;
  const gameVariant = gameVariantInput.value;
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

  if (!Number.isInteger(spyCount) || ![1, 2].includes(spyCount) || spyCount > Math.max(1, expected - 1)) {
    joinError.textContent = 'Количество шпионов: только 1 или 2 (и не больше игроков-1).';
    return;
  }

  if (!['blind', 'known'].includes(spyMode)) {
    joinError.textContent = 'Неизвестный режим шпионов.';
    return;
  }

  if (!['classic', 'classic_roles', 'hide'].includes(gameVariant)) {
    joinError.textContent = 'Неизвестный вариант игры.';
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
  state.spyCount = spyCount;
  state.spyMode = spyMode;
  state.gameVariant = gameVariant;
  state.locationCategory = category;
  state.locationDifficulty = difficulty;
  localStorage.setItem(LOCAL_NAME_KEY, state.myName);
  localStorage.setItem(LOCAL_AVATAR_KEY, state.myAvatar);
  localStorage.setItem(LOCAL_ROOM_KEY, state.roomCode);
  localStorage.setItem(LOCAL_EXPECTED_KEY, String(state.expectedPlayers));
  localStorage.setItem(LOCAL_SPY_COUNT_KEY, String(state.spyCount));
  localStorage.setItem(LOCAL_SPY_MODE_KEY, state.spyMode);
  localStorage.setItem(LOCAL_GAME_VARIANT_KEY, state.gameVariant);
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
  const spyCount = Number(state.roomData.spyCount || state.spyCount || 1);
  if (eligiblePlayers.length !== expected) {
    lobbyStatus.textContent = `Нужно ровно ${expected} активных игроков. Сейчас: ${eligiblePlayers.length}.`;
    return;
  }

  if (![1, 2].includes(spyCount) || spyCount >= eligiblePlayers.length) {
    lobbyStatus.textContent = `Некорректное число шпионов: ${spyCount}. Разрешено только 1 или 2.`;
    return;
  }

  const spyPlayers = pickDistinct(eligiblePlayers, spyCount);
  const spyIds = spyPlayers.map((p) => p.id);
  const spyUids = spyPlayers.map((p) => p.uid || '').filter(Boolean);
  const gameVariant = state.roomData.gameVariant || state.gameVariant || 'classic';
  const secretActions = gameVariant === 'hide' ? pickSecretActions(spyIds.length) : [];
  const civilianPlayers = eligiblePlayers.filter((player) => !spyIds.includes(player.id));
  const spyActions = {};
  if (gameVariant === 'hide') {
    spyIds.forEach((spyId, index) => {
      spyActions[spyId] = secretActions[index] || randomItem(SPY_SECRET_ACTIONS);
    });
  }

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
      const civilianRoles = gameVariant === 'classic_roles' ? pickCivilianRoles(civilianPlayers, picked.category) : {};

      tx.update(room, {
        state: 'started',
        spyIds,
        spyUids,
        spyCount,
        spyMode: data.spyMode || state.spyMode || 'blind',
        gameVariant: data.gameVariant || state.gameVariant || 'classic',
        spyActions: gameVariant === 'hide' ? spyActions : {},
        civilianRoles,
        spyId: deleteField(),
        spyUid: deleteField(),
        location: picked.name,
        lastLocation: picked.name,
        locationCategory: data.locationCategory || 'all',
        locationDifficulty: data.locationDifficulty || 'all',
        locationHistory: updatedHistory,
        eliminatedPlayerId: deleteField(),
        eliminatedPlayerName: deleteField(),
        lastVoteResult: deleteField(),
        winner: deleteField(),
        foundSpyIds: [],
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
  const spyCount = Number(state.roomData.spyCount || state.spyCount || 1);
  if (eligiblePlayers.length !== expected) {
    gameStatus.textContent = `Невозможно начать сразу: нужно ровно ${expected} активных игроков, сейчас ${eligiblePlayers.length}.`;
    return;
  }

  if (![1, 2].includes(spyCount) || spyCount >= eligiblePlayers.length) {
    gameStatus.textContent = `Некорректное число шпионов: ${spyCount}. Разрешено только 1 или 2.`;
    return;
  }

  const spyPlayers = pickDistinct(eligiblePlayers, spyCount);
  const spyIds = spyPlayers.map((p) => p.id);
  const spyUids = spyPlayers.map((p) => p.uid || '').filter(Boolean);
  const gameVariant = state.roomData.gameVariant || state.gameVariant || 'classic';
  const secretActions = gameVariant === 'hide' ? pickSecretActions(spyIds.length) : [];
  const civilianPlayers = eligiblePlayers.filter((player) => !spyIds.includes(player.id));
  const spyActions = {};
  if (gameVariant === 'hide') {
    spyIds.forEach((spyId, index) => {
      spyActions[spyId] = secretActions[index] || randomItem(SPY_SECRET_ACTIONS);
    });
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
      const { picked, updatedHistory } = pickLocationForRoom(data);
      const civilianRoles = gameVariant === 'classic_roles' ? pickCivilianRoles(civilianPlayers, picked.category) : {};

      tx.update(room, {
        state: 'started',
        roundNumber: nextRound,
        spyIds,
        spyUids,
        spyCount,
        spyMode: data.spyMode || state.spyMode || 'blind',
        gameVariant: data.gameVariant || state.gameVariant || 'classic',
        spyActions: gameVariant === 'hide' ? spyActions : {},
        civilianRoles,
        spyId: deleteField(),
        spyUid: deleteField(),
        location: picked.name,
        locationCategory: data.locationCategory || 'all',
        locationDifficulty: data.locationDifficulty || 'all',
        locationHistory: updatedHistory,
        lastLocation: picked.name,
        eliminatedPlayerId: deleteField(),
        eliminatedPlayerName: deleteField(),
        lastVoteResult: deleteField(),
        winner: deleteField(),
        foundSpyIds: [],
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
  setSpyCountUI(Math.max(1, Math.min(2, state.spyCount || 1)));
  setSpyModeUI(state.spyMode === 'known' ? 'known' : 'blind');
  setGameVariantUI(state.gameVariant);
  setCategoryUI(state.locationCategory);
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
  playFlipSound();
  const me = state.players.find((player) => player.id === state.myId);
  const iAmEliminated = me?.eliminated === true;
  const iAmSpy = getSpyIdsFromRoom(state.roomData).includes(state.myId) || getSpyUidsFromRoom(state.roomData).includes(state.authUid);
  showRoleReveal(state.roomData, iAmSpy, iAmEliminated);
});
nameInput.addEventListener('input', () => {
  if (!state.myAvatar) {
    renderAvatarPreview('', nameInput.value.trim());
  }
});
if (spyCountGrid) {
  spyCountGrid.querySelectorAll('.mode-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      setSpyCountUI(cell.dataset.spyCount || '1');
    });
  });
}
if (spyModeGrid) {
  spyModeGrid.querySelectorAll('.mode-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      setSpyModeUI(cell.dataset.mode || 'blind');
    });
  });
}
if (gameVariantGrid) {
  gameVariantGrid.querySelectorAll('.mode-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      setGameVariantUI(cell.dataset.variant || 'classic');
    });
  });
}
if (categoryGrid) {
  categoryGrid.querySelectorAll('.mode-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      setCategoryUI(cell.dataset.category || 'all');
    });
  });
}
avatarPickerBtn.addEventListener('click', () => {
  avatarFileInput.click();
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
