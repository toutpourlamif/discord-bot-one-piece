import { spawn } from 'child_process';

import open from 'open';

// 1. Lance drizzle-kit studio en arrière-plan
spawn('drizzle-kit', ['studio'], { stdio: 'inherit' });

// 2. Attend 2s puis ouvre le navigateur
setTimeout(() => {
  void open('https://local.drizzle.studio');
}, 2000);
