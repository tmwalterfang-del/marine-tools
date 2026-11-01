import fs from 'node:fs';
import vm from 'node:vm';

/** Load the same ordered catalogue scripts as the preview, without starting its UI. */
export function catalogue() {
  const window = {}, context = vm.createContext({ window });
  for (const match of fs.readFileSync('students/index.html', 'utf8').matchAll(/src="([^"?]+\.js)/g)) {
    if (match[1] === 'app.js') break;
    vm.runInContext(fs.readFileSync('students/' + match[1], 'utf8'), context, { filename: match[1] });
  }
  return window;
}
