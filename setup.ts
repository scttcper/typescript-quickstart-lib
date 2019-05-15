import del from 'del';
import fs from 'fs';
import { prompt, Question } from 'inquirer';
import _ from 'lodash';
import path from 'path';
import replace from 'replace-in-file';
import { exec } from 'shelljs';

const modifyFiles = ['LICENSE', 'package.json', 'build.ts', 'circle.yml'];
const setupPkg = [
  '@types/inquirer',
  '@types/lodash',
  '@types/shelljs',
  'del',
  'shelljs',
  'inquirer',
  'lodash',
  'replace-in-file',
  'ts-node',
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
  const confirm: Question = {
    type: 'input',
    name: 'name',
    message: 'library name',
    default: _.kebabCase(basename),
  };
  const res = await prompt(confirm);
  return res.name;
}

/**
 * Updates the contents of the template files with the library name or user details
 */
function modifyContents(libraryName: string, username: string, email: string) {
  const files = modifyFiles.map(f => path.join(dirname, f));
  try {
    replace.sync({
      files,
      from: [
        /--libraryname--/g,
        /--username--/g,
        /--email--/g,
        /--master--/g,
        / --ignore-scripts/g,
      ],
      to: [libraryName, username, email, 'master', ''],
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
  del.sync('.git');
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

  fs.writeFileSync(packageFile, JSON.stringify(pkg, undefined, 2));
  del.sync(path.join(dirname, 'setup.ts'));
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
