import { IServerProvider } from "./dependencies";
import { Server, ServerStatus } from "./server";
import { DynamoDB } from "aws-sdk";
import * as moment from "moment";
import { Mcsrv } from "./mcsrv";

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

    public async fetch(): Promise<Server>
    {
        const tasks = await Promise.all([
            this.fetchStatus(),
            this.fetchCount()
        ]);

        const status = tasks[0];
        const count = tasks[1];

        return new Server(this, status.status, count.count, status.updatedDateTime, count.updatedDateTime);
    }

    public async setStatus(status: ServerStatus)
    {
        throw new Error('Not implemented.');
    }

    public async setCount(count: number)
    {
        throw new Error('Not implemented.');
    }

    public async reportError(mcsrv: Mcsrv, server: Server, msg: string)
    {
        const mcsrvStr = JSON.stringify(mcsrv);
        const serverStr = JSON.stringify(server);
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