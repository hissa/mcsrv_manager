import { IServerProvider } from "./dependencies";
import { Server, ServerStatus } from "./server";
import { DynamoDB } from "aws-sdk";
import * as moment from "moment";
import { Mcsrv } from "./mcsrv";
import * as di from "./dependencies";

export class ServerProvider implements IServerProvider
{
    private static textStatusTable = {
        'stopped': ServerStatus.Stopped,
        'starting': ServerStatus.Starting,
        'running': ServerStatus.Running,
        'stopping': ServerStatus.Stopping
    };

    private tableName = 'mcsrv-mgr-status';
    private client: DynamoDB.DocumentClient
        = new DynamoDB.DocumentClient();

    public async fetch(): Promise<di.ServerInformation>
    {
        const tasks = await Promise.all([
            this.fetchStatus(),
            this.fetchCount()
        ]);

        const status = tasks[0];
        const count = tasks[1];

        return {
            status: status.status,
            count: count.count,
            statusUpdatedDateTime: status.updatedDateTime,
            countUpdatedDateTime: count.updatedDateTime
        };
    }

    public async setStatus(status: ServerStatus)
    {
        const client = new DynamoDB.DocumentClient();
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

        await client.update({
            TableName: this.tableName,
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
    }

    public async setCount(count: number)
    {
        const client = new DynamoDB.DocumentClient();
        await client.update({
            TableName: this.tableName,
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
    }

    public async reportError(mcsrv: Mcsrv, server: Server, msg: string)
    {
        const mcsrvStr = JSON.stringify(mcsrv.toObject());
        const serverStr = JSON.stringify(server.toObject());
        console.log(`mcsrv: ${mcsrvStr}\nserver: ${serverStr}\nmsg: ${msg}`);
    }

    private async fetchCount()
    {
        const result = await this.client.query({
            TableName: this.tableName,
            ExpressionAttributeNames: { '#id': 'status_id' },
            ExpressionAttributeValues: { ':idname': 'players_count' },
            KeyConditionExpression: '#id = :idname'
        }).promise();
    
        return {
            count: Number(result.Items[0].value),
            updatedDateTime: moment(result.Items[0].updated_datetime)
        };
    };
    
    private async fetchStatus(): Promise<{status: ServerStatus, updatedDateTime: moment.Moment}>
    {
        const result = await this.client.query({
            TableName: this.tableName,
            ExpressionAttributeNames: { '#id': 'status_id' },
            ExpressionAttributeValues: { ':idname': 'server_status' },
            KeyConditionExpression: '#id = :idname'
        }).promise();
        
        return {
            status: ServerProvider.textStatusTable[result.Items[0].value],
            updatedDateTime: moment(result.Items[0].updated_datetime)
        };
    };
}