const consola = require('consola');
const chalk = require('chalk');
const { build } = require('esbuild');
const path = require('path');
const { emptyDir } = require('fs-extra');
const { pathOutput, pathSrc } = require('./paths');
const vue = require('unplugin-vue/esbuild'); // sfc --> js
const GlobalsPlugin = require('esbuild-plugin-globals');
const buildBundle = async () => {
  const getBuildOptions = format => {
    const options = {
      entryPoints: [path.resolve(pathSrc, 'index.ts')],
      target: 'es2018',
      platform: 'neutral',
      plugins: [vue()],
      bundle: true,
      format
    };
    if (format === 'iife') {
      options.plugins.push(
        GlobalsPlugin({
          vue: 'Vue'
        })
      );
    } else {
      options.external = ['vue'];
    }
    return options;
  };
  const doBuild = async minify => {
    await Promise.all([
      build({
        ...getBuildOptions('esm'),
        outfile: path.resolve(pathOutput, `index${minify ? '.min' : ''}.mjs`),
        minify,
        sourcemap: minify
      }),
      build({
        ...getBuildOptions('iife'),
        outfile: path.resolve(pathOutput, `index.iife${minify ? '.min' : ''}.js`),
        minify,
        sourcemap: minify
      }),
      build({
        ...getBuildOptions('cjs'),
        outfile: path.resolve(pathOutput, `index${minify ? '.min' : ''}.js`),
        minify,
        sourcemap: minify
      })
    ]);
  };
  return Promise.all([doBuild(true), doBuild(false)]);
};
(async () => {
  consola.info(chalk.cyan('删除dist目录------>'));
  await emptyDir(pathOutput);
  consola.info(chalk.cyan('正在打包 请稍后...'));
  await buildBundle();
  consola.success(chalk.green('打包完成'));
})();
