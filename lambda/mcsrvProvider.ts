import { IMcsrvProvider } from "./dependencies";
import { Mcsrv, McsrvStatus, NotAlivingMcsrv, AlivingMcsrv } from "./mcsrv";
import * as requestAsync from "./requestAsync";

export class McsrvProvider implements IMcsrvProvider
{
    private static textMcsrvStatusTable = {
        'starting': McsrvStatus.Starting,
        'running': McsrvStatus.Running,
        'stopping': McsrvStatus.Stopping
    };
    
    public async start()
    {
        const srvId = process.env.SAKURA_SERVER_ID;
        const url = process.env.HOST_URL + `/server/${srvId}/power`;
        const user = process.env.SAKURA_TOKEN;
        const secret = process.env.SAKURA_SECRET;

        await requestAsync.putAsync(url, {
            json: true,
            timeout: 1000,
            auth: {
                user: user,
                pass: secret,
                sendImmediately: false
            }
        });
    }

    public async stop()
    {
        const url = process.env.SRV_URL;

        try
        {
            await requestAsync.deleteAsync(url, {
                json: true,
                timeout: 1000
            });
        }
        catch (e)
        {
            if (e.code == 'ETIMEDOUT')
            {
                console.error('終了命令の応答がありません。');
            }
        }
    }

    public async shutdown()
    {
        const srvId = process.env.SAKURA_SERVER_ID;
        const url = process.env.HOST_URL + `/server/${srvId}/power`;
        const user = process.env.SAKURA_TOKEN;
        const secret = process.env.SAKURA_SECRET;

        await requestAsync.deleteAsync(url, {
            json: true,
            timeout: 1000,
            auth: {
                user: user,
                pass: secret,
                sendImmediately: false
            }
        });
    }

    public async fetch(): Promise<Mcsrv>
    {
        const url = process.env.SRV_URL;
        
        try
        {
            const result: any = await requestAsync.getAsync(url, {
                json: true,
                timeout: 1000
            });
            return new AlivingMcsrv(this, result.count, McsrvProvider.textMcsrvStatusTable[result.state]);
        }
        catch (e)
        {
            if (e.code == 'ETIMEDOUT')
            {
                return new NotAlivingMcsrv(this);
            }

            throw e;
        }
        
    }
}

export class McsrvConfig
{
    public url: string;
    public hostUrl: string;
}