const blessed = require('blessed');
const contrib = require('blessed-contrib');
const screen = blessed.screen();

const homePage = require('./src/pages/home');
const fileSizesPage = require('./src/pages/filesizes');
const component = require('./src/pages/component');

/*
screen.key(['tab'], function(ch, key) {
  if(screen.focused === leftCol)
    right.focus();
  else
    leftCol.focus();
});
*/

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

var carousel = new contrib.carousel( [homePage, fileSizesPage, component]
  , { screen: screen
    , interval: 0 //how often to switch views (set 0 to never swicth automatically)
    , controlKeys: true  //should right and left keyboard arrows control view rotation
  })

module.exports = carousel;
