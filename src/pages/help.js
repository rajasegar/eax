'use strict';

const contrib = require('blessed-contrib');

module.exports = function (screen) {
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const helpWidget = grid.set(0, 0, 12, 12, contrib.table, {
    label: 'Help: Keyboard Navigation',
    keys: true,
    vi: true,
    style: { fg: 'yellow', bg: 'black' },
    columnWidth: [40, 40],
  });

  const helpKeys = [
    ['Next Page', 'Right Arrow'],
    ['Prev Page', 'Left Arrow'],
    ['Up', 'Up Arrow / k'],
    ['Down', 'Down Arrow / j'],
    ['Select', 'Enter / l'],
    ['Quit', 'q / Esc / Ctrl-c'],
    ['Help', '?'],
    ['Go to Home', '0'],
    ['Go to Build Stats', 'b'],
    ['Go to Components', 'c'],
    ['Go to Adapters', 'a'],
    ['Go to Controllers', 'o'],
    ['Go to File Sizes', 'f'],
    ['Go to Helpers', 'h'],
    ['Go to Mixins', 'x'],
    ['Go to Models', 'm'],
    ['Go to Routes', 'r'],
    ['Go to Services', 's'],
    ['Go to Utils', 'u'],
    ['Search', '/'],
    ['Go to the beginning of any list', 'gg'],
    ['Go to the end of any list', 'G'],
  ];

  helpWidget.setData({ headers: ['Function', 'Key'], data: helpKeys });
  helpWidget.focus();

  screen.render();
};
