import express from 'express';
import { Minecraft, States } from './mineceraft';
import { ChildProcess } from 'child_process';

const stateTexts = [
    'starting',
    'running',
    'stopping'
];

const app = express();

app.get('/', (req, res) => {
    res.contentType('application/json');
    res.send({ 
        count: mcsrv.playersNumber,
        state: stateTexts[mcsrv.State]
    });
});

app.delete('/', (req, res) => {
    mcsrv.stop();
    res.sendStatus(200);
});

const mcsrv = new Minecraft(() => {
    const cp = require('child_process');
    return cp.spawn(
        'java',
        ['-jar', './server.jar'],
        {cwd: './mc'}
    );
});

mcsrv.onReceivedStdio = msg => process.stdout.write('mc:' + msg);
mcsrv.onReceivedStderr = msg => process.stdout.write('mcerr:' + msg);
mcsrv.onClosed = () => setTimeout(() => process.exit(), 500);

mcsrv.start();
app.listen(3000);