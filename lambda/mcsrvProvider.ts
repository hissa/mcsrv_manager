import { IMcsrvProvider } from "./dependencies";
import { Mcsrv, McsrvStatus } from "./mcsrv";

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

    public stop()
    {
        throw new Error('Not implemented.');
    }

    public shutdown()
    {
        throw new Error('Not implemented.');
    }

    public fetch(): Promise<Mcsrv>
    {
        throw new Error('Not implemented.');
    }
}

export class McsrvConfig
{
    public url: string;
    public hostUrl: string;
}