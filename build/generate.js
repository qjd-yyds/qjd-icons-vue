const consola = require('consola');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs/promises');
const { format } = require('prettier');
const camelcase = require('camelcase');
const { emptyDir } = require('fs-extra');
const fg = require('fast-glob');
const { getPackageInfo } = require('local-pkg');
const { pathRoot, pathSrc } = require('./paths');

// 获取@element-plus/icons-svg下属所有svg文件
const getSvgFiles = async () => {
  // 获取模块的绝对路径
  const { rootPath } = await getPackageInfo('@element-plus/icons-svg');
  return fg('*.svg', { cwd: rootPath, absolute: true }); // 目标当前根目录，输出绝对路径
};
const getName = file => {
  const fileName = path.basename(file).replace('.svg', '');
  const componentName = camelcase(fileName, {
    pascalCase: true
  });
  return {
    componentName,
    fileName
  };
};

// 使用prettier格式化代码
const formatCode = (code, parser = 'typescript') =>
  format(code, {
    parser,
    semi: false,
    singleQuote: true
  });

// 转换vue文件并且写入src文件中
const transformToVueComponent = async file => {
  const content = await fs.readFile(file, 'utf-8');
  const { fileName, componentName } = getName(file);
  const vue = formatCode(
    `<template>
  ${content}
  </template>
  <script lang='ts'>
    import { defineComponent } from 'vue'
    export default defineComponent({
    name: "${componentName}",
    })
  </script>
  `,
    'vue'
  );
  await fs.writeFile(path.resolve(pathSrc, `${fileName}.vue`), vue, 'utf-8');
  consola.success(`${fileName}写入成功,------->${pathSrc + fileName}.vue`);
};
// 生成一个入口文件
const generateEntry = async files => {
  const code = formatCode(
    files
      .map(file => {
        const { fileName, componentName } = getName(file);
        return `export { default as ${componentName} } from './${fileName}.vue'`;
      })
      .join('\n')
  );
  await fs.writeFile(path.resolve(pathSrc, 'index.ts'), code, 'utf-8');
};
(async () => {
  consola.info(chalk.greenBright('正在生成vue文件 ------->'));
  await emptyDir(pathSrc); // 清空目录
  const files = await getSvgFiles();
  await Promise.all(files.map(file => transformToVueComponent(file)));
  consola.success(chalk.blueBright('生成vue文件完成 ------->'));
  await generateEntry(files);
})();
