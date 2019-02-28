const express = require('express');
const app = express();
const childProcess = require('child_process');

var p = childProcess.spawn('java', ['-jar', './server.jar'],{cwd: './mc'});
p.stdout.on('data', data => console.log(`stdout: ${data}`));
p.stderr.on('data', data => console.error(`stderr: ${data}`));

// app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(3000, () => console.log('Example app listening on port 3000!'))

