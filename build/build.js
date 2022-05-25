const consola = require('consola');
const chalk = require('chalk');
const { rollup } = require('rollup');
const path = require('path');
const { emptyDir } = require('fs-extra');
const { pathOutput, pathSrc } = require('./paths');
const vue = require('unplugin-vue/rollup'); // sfc --> js
const esbuild = require('rollup-plugin-esbuild').default;
console.log(esbuild, '=======>esbuild');
const getBoundle = minify =>
  rollup({
    input: [path.resolve(pathSrc, 'index.ts')],
    external: ['vue'],
    plugins: [
      vue(),
      esbuild({
        target: 'es2018',
        minify // 压缩
      })
    ]
  });
const buildBundled = async minify => {
  const boundle = await getBoundle(minify);
  const tasks = [
    boundle.write({
      format: 'iife',
      file: path.resolve(pathOutput, `index.iife${minify ? '.min' : ''}.js`),
      name: 'ElementPlusIconsVue',
      globals: {
        vue: 'Vue'
      }
    })
  ];
  if (!minify) {
    tasks.push(
      boundle.write({
        format: 'cjs',
        file: path.resolve(pathOutput, `index${minify ? '.min' : ''}.js`),
        globals: {
          vue: 'Vue'
        }
      }),
      boundle.write({
        format: 'esm',
        file: path.resolve(pathOutput, `index${minify ? '.min' : ''}.mjs`),
        globals: {
          vue: 'Vue'
        }
      })
    );
  }
  await Promise.all(tasks);
};
const buildunBundled = async () => {
  const boundle = await getBoundle(false);
  boundle.write({
    format: 'es',
    dir: path.resolve(pathOutput, 'es'),
    preserveModules: true,
    entryFileNames: '[name].mjs'
  });
  boundle.write({
    format: 'cjs',
    dir: path.resolve(pathOutput, 'lib'),
    preserveModules: true,
    exports: 'named'
  });
};
(async () => {
  consola.info(chalk.cyan('删除dist目录------>'));
  await emptyDir(pathOutput);
  consola.info(chalk.cyan('正在打包 请稍后...'));
  await Promise.all([buildunBundled(), buildBundled(true), buildBundled(false)]);
  consola.success(chalk.green('打包完成'));
})();
