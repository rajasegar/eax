const blessed = require('blessed');
const contrib = require('blessed-contrib');
const screen = blessed.screen();

const log = require('./src/utils/log');
const pages = require('./src/utils/pages');

log('Starting eax');

screen.key(['escape', 'q', 'C-c'], function (/*ch, key*/) {
  return process.exit(0); // eslint-disable-line
});

const _pages = pages.map((p) => p.page);
var carousel = new contrib.carousel(_pages, {
  screen: screen,
  interval: 0, //how often to switch views (set 0 to never swicth automatically)
  controlKeys: true, //should right and left keyboard arrows control view rotation
});

// Define keyboard navigations
pages.forEach((p, index) => {
  screen.key(p.keyCodes, function (/*ch, key*/) {
    carousel.currPage = index;
    carousel.move();
  });
});

module.exports = carousel;
