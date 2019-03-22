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

    private config: McsrvConfig;
    
    constructor(config: McsrvConfig)
    {
        this.config = config;
    }
    
    public start()
    {
        throw new Error('Not implemented.');
    }

    public async stop()
    {
        const url = process.env.SRV_URL;
        const options = {
            json: true,
            timeout: 1000
        };

        try
        {
            await requestAsync.deleteAsync(url, options);
        }
        catch (e)
        {
            if (e.code == 'ETIMEDOUT')
            {
                console.error('終了命令の応答がありません。');
            }
        }
    }

    public shutdown()
    {
        throw new Error('Not implemented.');
    }

    public async fetch(): Promise<Mcsrv>
    {
        const url = process.env.SRV_URL;
        const options = {
            json: true,
            timeout: 1000
        };
        
        try
        {
            const result: any = await requestAsync.getAsync(url, options);
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