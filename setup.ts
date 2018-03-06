import { prompt, Question } from 'inquirer';
import * as path from 'path';
import * as _ from 'lodash';
import rimraf from 'rimraf';
import replace from 'replace-in-file';
import { exec } from 'shelljs';

const rmFiles = ['setup.ts'];
const modifyFiles = ['LICENSE', 'package.json', 'build.ts'];

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
      to: [libraryName, _.camelCase(name), username, email],
    });
    console.log(modifyFiles.join('\n'));
  } catch (error) {
    console.error('An error occurred modifying the file: ', error);
  }

  console.log('\n');
}


setup().then(() => process.exit(0));
