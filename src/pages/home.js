const contrib = require('blessed-contrib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


module.exports = function(screen) {

  const root = '/Users/rajasegarchandran/Code/freshsales/frontend';
  const folders = [
    'adapters',
    'components',
    'constants',
    'controllers',
    'helpers',
    'initializers',
    'mixins',
    'models',
    'routes',
    'services',
    'storages',
    'styles',
    'templates',
    'transforms',
    'utils',
    'validators'
  ];

  const bar = contrib.bar(
    { label: 'Size Composition (KB)'
      , barWidth: 4
      , barSpacing: 10
      , xOffset: 0
      , maxHeight: 9});
  screen.append(bar) //must append before setting data

  const data = [];

  const temp = folders.map(f => {

    return exec(`du -s ${root}/app/${f}`);
  });

  Promise.all(temp).then(values => {
    const data = values.map(v => {
      const[size, name] =  v.stdout.split('\t');
      return size;
    });

    const titles = values.map(v => {
      const[size, name] =  v.stdout.split('\t');
      return name.replace(root, '')
        .replace('/app/','')
      .replace('\n','');
    });


    bar.setData( { titles, data})
    screen.render();

  });


}

