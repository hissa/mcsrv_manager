const express = require('express');
const app = express();
const childProcess = require('child_process');

// Regexes
const regexDone = /Done.\(.+\)!/;
const regexList = /There are \d+ of a max \d+ players online:/;
const regexGetPlayersNumber = /(?<=There are )\d+(?= of a max)/;

// OutputFunctions
const stdout = text => process.stdout.write(`mc:${text}`);
const stderr = text => process.stdout.write(`mcerr:${text}`);

// Variables
let isInitialized = false;
let mc = null;
let listInterval = null;
let lastPlayerNumber = 0;

// Events
const onInitialized = () => {
    isInitialized = true;
    listInterval = setInterval(() => {
        mc.stdin.write('list\n');
    }, 1000);
};

const onReceivedPlayerList = text => {
    const results = regexGetPlayersNumber.exec(text);
    lastPlayerNumber = results[0];
};

//
// main
//
const main = () => {
    mc = childProcess.spawn('java', ['-jar', './server.jar'], {cwd: './mc'});

    mc.stdout.on('data', data => {
        if (regexDone.test(data))
        {
            onInitialized();
        }

        if (regexList.test(data)) {
            onReceivedPlayerList(data);
        }

        stdout(data);
    });

    mc.stderr.on('data', data => {
        stderr(data);
    });


};

main();

// app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(3000, () => console.log('Example app listening on port 3000!'))

