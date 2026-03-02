function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clearScreen(output) {
  output.write('\x1Bc');
}

module.exports = { randomItem, clearScreen };
