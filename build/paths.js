const path = require('path');
const pathRoot = path.resolve(__dirname, '..');
module.exports = {
  pathRoot,
  pathSrc: path.resolve(pathRoot, 'src'),
  pathOutput: path.resolve(pathRoot, 'dist')
};
