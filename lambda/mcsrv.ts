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

    public toObject()
    {
        return {
            isAliving: this._isAliving
        };
    }
}

export class AlivingMcsrv extends Mcsrv
{
    private _count: number;
    private _status: McsrvStatus;

    constructor(provider: IMcsrvProvider, count: number, status: McsrvStatus)
    {
        super(provider);
        this._count = count;
        this._status = status;
    }

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

    public toObject()
    {
        return {
            isAliving: this._isAliving,
            count: this._count,
            status: this._status
        };
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

    public shutdown()
    {
        this.mcsrvProvider.shutdown();
    }

    public toObject()
    {
        return {
            isAliving: this._isAliving
        };
    }
}