import { spawn } from 'child_process';

import open from 'open';

// 1. Lance drizzle-kit studio en arrière-plan
const child = spawn('drizzle-kit', ['studio'], { stdio: 'inherit' });
process.on('SIGINT', () => child.kill('SIGINT'));

// 2. Attend 2s puis ouvre le navigateur
setTimeout(() => {
  void open('https://local.drizzle.studio');
}, 2000);
