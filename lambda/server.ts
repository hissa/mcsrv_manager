import * as moment from "moment";
import { Mcsrv } from "./mcsrv";
import { timingSafeEqual } from "crypto";
import { ServerProvider } from "./serverProvider";
import { IServerProvider } from "./dependencies";

export enum ServerStatus
{
    Stopped,
    Starting,
    Running,
    Stopping
};

export class Server
{
    private _status: ServerStatus;
    private _count: number;

    private _statusLastUpdate: moment.Moment;
    private _countLastUpdate: moment.Moment;

    private state: ServerState;
    private provider: ServerProvider;

    constructor(provider: IServerProvider, status: ServerStatus, count: number, statusLastUpdate: moment.Moment, countLastUpdate: moment.Moment)
    {
        this._status = status;
        this._count = count;
        this._statusLastUpdate = statusLastUpdate;
        this._countLastUpdate = countLastUpdate;

        switch (this._status)
        {
            case ServerStatus.Stopped:
                this.state = new ServerStopped(this, provider);
                break;
            case ServerStatus.Starting:
                this.state = new ServerStarting(this, provider);
                break;
            case ServerStatus.Running:
                this.state = new ServerRunning(this, provider);
                break;
            case ServerStatus.Stopping:
                this.state = new ServerStopping(this, provider);
                break;
        }
    }

    get status()
    {
        return this._status;
    }

    get count()
    {
        return this._count;
    }

    get statusLastUpdate()
    {
        return this._statusLastUpdate;
    }

    get countLastUpdate()
    {
        return this._countLastUpdate;
    }

    get statusDurationMinutes()
    {
        return Math.abs(this._statusLastUpdate.diff(moment(), 'minutes'));
    }

    get countDurationMinutes()
    {
        return Math.abs(this._countLastUpdate.diff(moment(), 'minutes'));
    }

    public async action(mcsrv: Mcsrv)
    {
        this.state.action(mcsrv);
    }
}

abstract class ServerState
{
    protected server: Server;
    protected provider: IServerProvider;

    constructor(server: Server, provider: IServerProvider)
    {
        this.server = server;
        this.provider = provider;
    }

    public abstract action(mcsrv: Mcsrv): void;
}

class ServerStopped extends ServerState
{
    public async action(mcsrv: Mcsrv)
    {
        
    }
}

class ServerStarting extends ServerState
{
    public async action(mcsrv: Mcsrv)
    {

    }
}

class ServerRunning extends ServerState
{
    public async action(mcsrv: Mcsrv)
    {

    }
}

class ServerStopping extends ServerState
{
    public async action(mcsrv: Mcsrv)
    {

    }
}
