const blessed = require('blessed');
const contrib = require('blessed-contrib');
const screen = blessed.screen();

const homePage = require('./src/pages/home');
const fileSizesPage = require('./src/pages/filesizes');
const component = require('./src/pages/component');
const helpPage = require('./src/pages/help');

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


var carousel = new contrib.carousel( [
  homePage, 
  fileSizesPage, 
    component,
  helpPage]
  , { screen: screen
    , interval: 0 //how often to switch views (set 0 to never swicth automatically)
    , controlKeys: true  //should right and left keyboard arrows control view rotation
  })

// Show help page when ? is pressed
screen.key(['?'], function(ch, key) {
 carousel.end(); 
});

// Goto home when h key is pressed
screen.key(['h'], function(ch, key) {
  carousel.home();
});

module.exports = carousel;
