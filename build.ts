import { join } from 'path';

import { copySync } from 'fs-extra';
import * as camelCase from 'lodash.camelcase';
import { rollup, InputOptions, OutputOptions } from 'rollup';
import * as sourceMaps from 'rollup-plugin-sourcemaps';

const libraryName = 'library';

const inputOptions: InputOptions = {
  input: `dist/esm/public_api.js`,
  plugins: [sourceMaps()],
};
const outputOptions: OutputOptions = {
  file: `./dist/bundles/${libraryName}.umd.js`,
  name: libraryName,
  format: 'umd',
  sourcemap: true,
};

async function build() {
  // create a bundle
  const bundle = await rollup(inputOptions);
  // or write the bundle to disk
  await bundle.write(outputOptions);

  // copy files to distribution folder
  copySync('.git', join(process.cwd(), 'dist/.git'));
  copySync('package.json', join(process.cwd(), 'dist/package.json'));
  copySync('README.md', join(process.cwd(), 'dist/README.md'));
  copySync('LICENSE', join(process.cwd(), 'dist/LICENSE'));
}

build()
  .then(() => console.log('build success'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
