async function askForPlayers(rl) {
  while (true) {
    const raw = await rl.question('Введите имена игроков через запятую: ');
    const players = raw
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    if (players.length < 3) {
      console.log('Нужно минимум 3 игрока.\n');
      continue;
    }

    return players;
  }
}

async function revealRoles({ rl, players, spy, location, clearScreen }) {
  for (const player of players) {
    await rl.question(`\n${player}, нажми Enter, чтобы увидеть свою роль...`);
    clearScreen();

    if (player === spy) {
      console.log('Твоя роль: ШПИОН');
      console.log('Твоя задача: понять локацию по вопросам других игроков.');
    } else {
      console.log('Ты НЕ шпион.');
      console.log(`Локация: ${location}`);
    }

    await rl.question('\nНажми Enter и передай устройство следующему игроку...');
    clearScreen();
  }
}

module.exports = { askForPlayers, revealRoles };
