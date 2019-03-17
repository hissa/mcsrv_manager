import { APIGatewayProxyHandler } from 'aws-lambda';
import { stringify } from 'querystring';
import { DynamoDB } from 'aws-sdk';
import * as request from 'request';
import * as moment from 'moment';

enum ServerStatus
{
    Stopped,
    Starting,
    Running,
    Stopping
};

enum McsrvStatus
{
    Starting,
    Running,
    Stopping
};

const textStatusTable = {
    'stopped': ServerStatus.Stopped,
    'starting': ServerStatus.Starting,
    'running': ServerStatus.Running,
    'stopping': ServerStatus.Stopping
};

const textMcsrvStatusTable = {
    'starting': McsrvStatus.Starting,
    'running': McsrvStatus.Running,
    'stopping': McsrvStatus.Stopping
};

const docClient = new DynamoDB.DocumentClient();

const statusTableName = 'mcsrv-mgr-status';

const requestAsync = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (!err) 
            {
                resolve(body);
            }
            else
            {
                reject(err);
            }
        });
    });
};

export const get: APIGatewayProxyHandler = async (event, _context) => {
    
    const res = await getMcsrvStatus();

    return {
        statusCode: 200,
        body: JSON.stringify(res)
    };
};

const getdbPlayersCount = async () => {
    const result = await docClient.query({
        TableName: statusTableName,
        ExpressionAttributeNames: { '#id': 'status_id' },
        ExpressionAttributeValues: { ':idname': 'players_count' },
        KeyConditionExpression: '#id = :idname'
    }).promise();

    return {
        count: Number(result.Items[0].value),
        updatedDateTime: moment(result.Items[0].updated_datetime)
    };
};

const getdbServerStatus = async (): Promise<{status: ServerStatus, updatedDateTime: moment.Moment}> => {
    const result = await docClient.query({
        TableName: statusTableName,
        ExpressionAttributeNames: { '#id': 'status_id' },
        ExpressionAttributeValues: { ':idname': 'server_status' },
        KeyConditionExpression: '#id = :idname'
    }).promise();

    return {
        status: textStatusTable[result.Items[0].value],
        updatedDateTime: moment(result.Items[0].updated_datetime)
    };
};

const setdbServerStatus = async (status: ServerStatus) => {
    let text = null;
    switch (status)
    {
        case ServerStatus.Stopped:
            text = 'stopped';
            break;
        case ServerStatus.Starting:
            text = 'starting';
            break;
        case ServerStatus.Running:
            text = 'running';
            break;
        case ServerStatus.Stopping:
            text = 'stopping';
            break;
    }

    await docClient.update({
        TableName: statusTableName,
        Key: { status_id: 'server_status' },
        ExpressionAttributeNames: {
            '#v': 'value',
            '#dt': 'updated_datetime'
        },
        ExpressionAttributeValues: {
            ':val': text,
            ':upddt': moment().format('YYYY-MM-DD HH:mm:ss')
        },
        UpdateExpression: 'SET #v = :val, #dt = :upddt'
    }).promise();
};

const setdbPlayersCount = async (count: Number) => {
    await docClient.update({
        TableName: statusTableName,
        Key: { status_id: 'players_count' },
        ExpressionAttributeNames: {
            '#v': 'value',
            '#dt': 'updated_datetime'
        },
        ExpressionAttributeValues: {
            ':val': count,
            ':upddt': moment().format('YYYY-MM-DD HH:mm:ss')
        },
        UpdateExpression: 'SET #v = :val, #dt = :upddt'
    }).promise();
};

const getMcsrvStatus = async ():Promise<{isAliving: boolean, count: number | null, status: McsrvStatus | null}> => {
    const url = process.env.SRV_URL;
    const options = {
        url: url,
        method: 'GET',
        json: true,
        timeout: 1000
    };

    let res;
    let isAliving = true;
    try
    {
        res = await requestAsync(options);
    }
    catch (e)
    {
        if (e.code == 'ETIMEDOUT')
        {
            isAliving = false;
        }
        else
        {
            throw e;
        }
    }

    if (isAliving)
    {
        return {
            isAliving: true,
            count: res.count,
            status: textMcsrvStatusTable[res.state]
        };
    }

    return {
        isAliving: false,
        count: null,
        status: null
    };
};
