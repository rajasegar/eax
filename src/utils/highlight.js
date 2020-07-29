const { highlight } = require('cli-highlight');

module.exports = function (value, lang = 'javascript', theme = 'dracula') {
  return highlight(value, { language: lang, theme });
};
