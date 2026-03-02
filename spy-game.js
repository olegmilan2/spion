const { runSpyGame } = require('./spy/game');

runSpyGame().catch((error) => {
  console.error('Ошибка:', error.message);
  process.exit(1);
});
