import * as moment from "moment";
import { Mcsrv, McsrvStatus } from "./mcsrv";
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
    private _isInitialized = false;

    private _status: ServerStatus;
    private _count: number;

    private _statusLastUpdate: moment.Moment;
    private _countLastUpdate: moment.Moment;

    private state: ServerState;
    private provider: IServerProvider;

    constructor(provider: IServerProvider)
    {
        this.provider = provider;
    }

    get isInitialized()
    {
        return this._isInitialized;
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

    public async initialize()
    {
        const info = await this.provider.fetch();
        this._status = info.status;
        this._count = info.count;
        this._statusLastUpdate = info.statusUpdatedDateTime;
        this._countLastUpdate = info.countUpdatedDateTime;
        this._isInitialized = true;
        this.setState();
    }

    public customInitialize(status: ServerStatus, count: number, statusLastUpdate: moment.Moment, countLastUpdate: moment.Moment)
    {
        this._status = status;
        this._count = count;
        this._statusLastUpdate = statusLastUpdate;
        this._countLastUpdate = countLastUpdate;
        this._isInitialized = true;
        this.setState();
    }

    public async update(mcsrv: Mcsrv)
    {
        await this.state.update(mcsrv);
    }

    private setState()
    {
        switch (this._status)
        {
            case ServerStatus.Stopped:
                this.state = new ServerStopped(this, this.provider);
                break;
            case ServerStatus.Starting:
                this.state = new ServerStarting(this, this.provider);
                break;
            case ServerStatus.Running:
                this.state = new ServerRunning(this, this.provider);
                break;
            case ServerStatus.Stopping:
                this.state = new ServerStopping(this, this.provider);
                break;
        }
    }

    public toObject()
    {
        return {
            status: this._status,
            count: this._count,
            statusLastUpdate: this._statusLastUpdate,
            countLastUpdate: this._countLastUpdate
        };
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

    public abstract async update(mcsrv: Mcsrv): Promise<void>;
}

class ServerStopped extends ServerState
{
    public async update(mcsrv: Mcsrv)
    {
        if (Mcsrv.isAliving(mcsrv))
        {
            this.provider.reportError(mcsrv, this.server, 'サーバーが止まっているはずなのに起動しています。');
        }
    }
}

class ServerStarting extends ServerState
{
    public async update(mcsrv: Mcsrv)
    {
        if (Mcsrv.isAliving(mcsrv))
        {
            if (mcsrv.status == McsrvStatus.Running)
            {
                await this.provider.setStatus(ServerStatus.Running);
                return;
            }

            if (mcsrv.status == McsrvStatus.Stopping)
            {
                await Promise.all([
                    this.provider.setStatus(ServerStatus.Stopping),
                    this.provider.reportError(mcsrv, this.server, 'なぜか終了しようとしています。')
                ]);
            }
        }

        if (this.server.statusDurationMinutes >= 5)
        {
            await this.provider.reportError(mcsrv, this.server, '起動に要している時間が長すぎます。');
            return;
        }
    }
}

class ServerRunning extends ServerState
{
    public async update(mcsrv: Mcsrv)
    {
        if (Mcsrv.isAliving(mcsrv) && mcsrv.status == McsrvStatus.Running)
        {
            if (this.server.count != mcsrv.count)
            {
                this.provider.setCount(mcsrv.count);
            }

            if (mcsrv.count > 0)
            {
                return;
            }

            if (this.server.countDurationMinutes >= 10)
            {
                await Promise.all([
                    mcsrv.stop(),
                    this.provider.setStatus(ServerStatus.Stopping)
                ]);
                return;
            }
        }
        else
        {
            this.provider.reportError(mcsrv, this.server, '急死しました。')
            return;
        }
    }
}

class ServerStopping extends ServerState
{
    public async update(mcsrv: Mcsrv)
    {
        if (Mcsrv.isNotAliving(mcsrv))
        {
            await Promise.all([
                mcsrv.shutdown(),
                this.provider.setStatus(ServerStatus.Stopped)
            ]);
            return;
        }

        if (Mcsrv.isAliving(mcsrv) && mcsrv.status == McsrvStatus.Stopping)
        {
            if (this.server.statusDurationMinutes >= 5)
            {
                await this.provider.reportError(mcsrv, this.server, 'なかなかサーバーが停止しません。');
                return;
            }
            return;
        }

        await this.provider.reportError(mcsrv, this.server, 'わけがわかりません。');
    }
}
