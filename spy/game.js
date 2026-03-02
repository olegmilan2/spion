const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const { LOCATIONS } = require('./constants');
const { randomItem, clearScreen } = require('./utils');
const { askForPlayers, revealRoles } = require('./io');

async function runSpyGame() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('Игра "Шпион"\n');
    const players = await askForPlayers(rl);
    const spy = randomItem(players);
    const location = randomItem(LOCATIONS);
    const clear = () => clearScreen(output);

    clear();
    await revealRoles({ rl, players, spy, location, clearScreen: clear });

    console.log('Все роли выданы.');
    console.log('Начинайте раунд вопросов.');
    console.log('Через 6-10 минут голосуйте: кто шпион.');
    console.log(`\n(Для ведущего) Шпион: ${spy}. Локация: ${location}`);
  } finally {
    rl.close();
  }
}

module.exports = { runSpyGame };
