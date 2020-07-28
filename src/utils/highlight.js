const { highlight } = require('cli-highlight');

module.exports = function (value, lang, theme = 'dracula') {
  return highlight(value, { language: lang, theme });
};
