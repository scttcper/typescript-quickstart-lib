import { prompt, Question } from 'inquirer';
import * as path from 'path';
import * as _ from 'lodash';
import * as rimraf from 'rimraf';
import * as replace from 'replace-in-file';
import { exec } from 'shelljs';
import * as fs from 'fs';

const modifyFiles = ['LICENSE', 'package.json', 'build.ts'];
const setupPkg = [
  '@types/inquirer',
  '@types/lodash',
  '@types/rimraf',
  '@types/shelljs',
  'shelljs',
  'inquirer',
  'lodash',
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
  const files = modifyFiles.map(f => path.join(dirname, f));
  try {
    const changes = replace.sync({
      files,
      from: [
        /--libraryname--/g,
        /--username--/g,
        /--email--/g,
        /--master--/g,
      ],
      to: [libraryName, username, email, 'master'],
    });
  } catch (error) {
    console.error('An error occurred modifying the file: ', error);
  }
}

/**
 * Calls any external programs to finish setting up the library
 */
function finalize() {
  // Recreate Git folder
  console.log('Removing .git folder');
  rimraf.sync('.git');
  const gitInitOutput = exec(`git init "${dirname}"`, {
    silent: true,
  }).stdout;
  console.log(gitInitOutput);

  // Remove post-install command
  const pkg = JSON.parse(fs.readFileSync(packageFile) as any);

  delete pkg.scripts.postinstall;
  for (const dep of setupPkg) {
    delete pkg.devDependencies[dep];
  }

  fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2));
  rimraf.sync(path.join(dirname, 'setup.ts'));
  console.log('Last step - Reinstalling packages without setup dependencies');
}

if (process.env.TRAVIS) {
  process.exit(0);
} else {
  setup()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
