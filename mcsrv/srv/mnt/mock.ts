import express from 'express';
import bodyParser from 'body-parser';
import {Alert, AlertType} from './alert';

import moment = require('moment');

const app = express();
app.use(bodyParser.json());

const stateTexts = [
    'starting',
    'running',
    'stopping'
];

let count = 0;
let status = stateTexts[0];
let alerts: Alert[] = [];

app.get('/', (req, res) => {
    res.send({
        count: count,
        state: status
    });
});

app.delete('/', (req, res) => {
    res.contentType('application/json');
    res.sendStatus(204);
});


app.get('/alerts', (req, res) => {
    res.contentType('application/json');
    res.send(alerts.map(a => a.toObject()));
    alerts = [];
});

app.put('/', (req, res) => {
    count = req.body.count;
    const targets = stateTexts.filter(i => i == req.body.state);
    
    if (targets.length > 0)
    {
        status = targets[0];
        res.sendStatus(204);
    }
    else
    {
        res.sendStatus(400);
    }
});

app.post('/alerts', (req, res) => {
    const msg = req.body.message;
    let datetime;
    if (req.body.datetime != null)
    {
        datetime = moment(req.body.datetime);
    }
    else
    {
        datetime = null;
    }
    const type = Number(req.body.type);

    alerts.push(new Alert(msg, type, datetime));
    res.sendStatus(204);
});

app.listen(3000, () => {
    console.log('The mock server is running...');
});