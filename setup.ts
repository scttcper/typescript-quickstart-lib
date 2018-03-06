import { prompt, Question } from 'inquirer';
import * as path from 'path';
import * as _ from 'lodash';
import * as rimraf from 'rimraf';
import * as replace from 'replace-in-file';
import { exec } from 'shelljs';
import * as fs from 'fs';

const rmFiles = ['setup.ts'];
const modifyFiles = ['LICENSE', 'package.json', 'build.ts'];
const setupPkg = [
  '@types/inquirer',
  '@types/lodash',
  'lodash',
  '@types/shelljs',
  '@types/rimraf',
  'inquirer',
  'replace-in-file',
];

const dir = process.cwd();
const packageFile = path.resolve(dir, 'package.json');
const dirname = path.dirname(packageFile);
const basename = path.basename(dirname);

async function setup() {
  const name = await confirmName();
  console.log('Thanks, setting up!');

  // Get the Git username and email before the .git directory is removed
  const username = exec('git config user.name').stdout.trim();
  const email = exec('git config user.email').stdout.trim();
  rimraf.sync('.git');
  modifyContents(name, username, email);
  finalize();
}

async function confirmName() {
  const confirmName: Question = {
    type: 'input',
    name: 'name',
    message: 'library name',
    default: _.kebabCase(basename),
  };
  const res = await prompt(confirmName);
  return res.name;
}

/**
 * Updates the contents of the template files with the library name or user details
 */
function modifyContents(libraryName: string, username: string, email: string) {
  console.log('Modified');

  let files = modifyFiles.map(f => path.resolve(__dirname, '..', f));
  try {
    const changes = replace.sync({
      files,
      from: [/--libraryname--/g, /--camellibraryname--/g, /--username--/g, /--email--/g],
      to: [libraryName, _.camelCase(libraryName), username, email],
    });
    console.log(modifyFiles.join('\n'));
  } catch (error) {
    console.error('An error occurred modifying the file: ', error);
  }

  console.log('\n');
}

/**
 * Calls any external programs to finish setting up the library
 */
function finalize() {
  console.log('Finalizing');

  // Recreate Git folder
  let gitInitOutput = exec(`git init "${dirname}"`, {
    silent: true,
  }).stdout;
  console.log(gitInitOutput);

  // Remove post-install command
  let jsonPackage = path.resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(jsonPackage) as any);

  // Note: Add items to remove from the package file here
  delete pkg.scripts.postinstall;
  for (const dep of setupPkg) {
    delete pkg.devDependencies[dep];
  }

  fs.writeFileSync(jsonPackage, JSON.stringify(pkg, null, 2));
  // console.log(Postinstall script has been removed'));

  console.log('\n');
}

setup().then(() => process.exit(0));
