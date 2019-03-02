import express from 'express';
import { Minecraft } from './mineceraft';
import { ChildProcess } from 'child_process';

const app = express();

const mcsrv = new Minecraft(() => {
    const cp = require('child_process');
    return cp.spawn(
        'java',
        ['-jar', './server.jar'],
        {cwd: './mc'}
    );
});

const main = () => {
    mcsrv.onReceivedStdio = msg => process.stdout.write('mc:' + msg);
    mcsrv.start();
};

main();