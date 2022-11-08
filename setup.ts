import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

import { deleteSync } from 'del';
import inquirer from 'inquirer';
import { kebabCase } from 'lodash-es';
import replace from 'replace-in-file';
import shelljs from 'shelljs';

const modifyFiles = ['LICENSE', 'package.json', 'build.ts', 'circle.yml'];
const setupPkg = [
  '@types/inquirer',
  '@types/lodash-es',
  '@types/shelljs',
  'del',
  'shelljs',
  'inquirer',
  'lodash-es',
  'replace-in-file',
  'ts-node',
];

const dir = process.cwd();
const packageFile = path.resolve(dir, 'package.json');
const dirname = path.dirname(packageFile);
const basename = path.basename(dirname);

async function setup(): Promise<void> {
  const name = await confirmName();
  console.log('Thanks, setting up!');

  // Get the Git username and email before the .git directory is removed
  const username = shelljs.exec('git config user.name').stdout.trim();
  const email = shelljs.exec('git config user.email').stdout.trim();
  modifyContents(name, username, email);
  finalize();
}

async function confirmName(): Promise<string> {
  const res = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'library name',
    default: kebabCase(basename),
  });
  return res.name;
}

/**
 * Updates the contents of the template files with the library name or user details
 */
function modifyContents(libraryName: string, username: string, email: string): void {
  const files = modifyFiles.map(f => path.join(dirname, f));
  try {
    replace.sync({
      files,
      from: [/--libraryname--/g, /--username--/g, /--email--/g, /--main--/g, / --ignore-scripts/g],
      to: [libraryName, username, email, 'main', ''],
    });
  } catch (error: unknown) {
    console.error('An error occurred modifying the file: ', error);
  }
}

/**
 * Calls any external programs to finish setting up the library
 */
function finalize(): void {
  // Recreate Git folder
  console.log('Removing .git folder');
  deleteSync('.git');
  const gitInitOutput = shelljs.exec(`git init "${dirname}"`, {
    silent: true,
  }).stdout;
  console.log(gitInitOutput);

  // Remove post-install command
  const pkg = JSON.parse(readFileSync(packageFile) as any);

  delete pkg.scripts.postinstall;
  for (const dep of setupPkg) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete pkg.devDependencies[dep];
  }

  writeFileSync(packageFile, JSON.stringify(pkg, undefined, 2));
  deleteSync(path.join(dirname, 'setup.ts'));
  console.log('Last step - Reinstalling packages without setup dependencies');
}

if (process.env['TRAVIS'] === undefined) {
  setup()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  process.exit(0);
}
