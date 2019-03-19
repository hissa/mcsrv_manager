import { IMcsrvProvider } from "./dependencies";

export enum McsrvStatus
{
    Starting,
    Running,
    Stopping
};

export class Mcsrv
{
    protected mcsrvProvider: IMcsrvProvider;

    protected _isAliving: boolean;
    get isAliving()
    {
        return this._isAliving;
    }

    constructor(mcsrvProvider: IMcsrvProvider)
    {
        this.mcsrvProvider = mcsrvProvider;
    }

    static isAliving(mcsrv: Mcsrv): mcsrv is AlivingMcsrv
    {
        return mcsrv.isAliving;
    }

    static isNotAliving(mcsrv: Mcsrv): mcsrv is NotAlivingMcsrv
    {
        return !mcsrv.isAliving;
    }
}

export class AlivingMcsrv extends Mcsrv
{
    private _count: number;
    private _status: McsrvStatus;

    get isAliving()
    {
        return true;
    }

    get count(): number
    {
        return this._count;
    }

    get status(): McsrvStatus
    {
        return this._status;
    }

    public stop()
    {
        this.mcsrvProvider.stop();
    }

    public shutdown()
    {
        this.mcsrvProvider.shutdown();
    }
}

export class NotAlivingMcsrv extends Mcsrv
{
    get isAliving(): boolean
    {
        return false;
    }

    public start()
    {
        this.mcsrvProvider.start();
    }
}