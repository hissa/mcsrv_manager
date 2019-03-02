import { ChildProcess } from "child_process";

export enum States {
    Starting,
    Running,
    Stopping
};

export class Minecraft
{
    get gettingPlayersInterval()
    {
        return this._gettingPlayersInterval;
    }
    set gettingPlayersInterval(value: number)
    {
        this._gettingPlayersInterval = value;
        if (this.intervalId != null)
        {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(
            this.sendPlayerListRequest,
            this._gettingPlayersInterval,
            this.serverProcess
        );
    }

    get isInitialized()
    {
        return this._isInitialized;
    }

    get playersNumber()
    {
        return this._lastPlayersNumber;
    }

    set onInitialized(func: () => void)
    {
        this._onInitialized = func;
    }

    set onReceivedStdio(func: (msg: string) => void)
    {
        this._onReceivedStdio = func;
    }

    set onReceivedStderr(func: (msg: string) => void)
    {
        this._onReceivedStderr = func;
    }

    set onClosed(func: () => void)
    {
        this._onClosed = func;
    }

    get State()
    {
        return this._serverState;
    }

    private _gettingPlayersInterval = 1000;
    private _isInitialized = false;
    private _lastPlayersNumber = 0;
    private _serverState = States.Stopping;
    
    private intervalId: number | null = null;
    private serverProcess: ChildProcess | null = null;
    private buildProcess: (() => ChildProcess) | null = null;
    
    private REGEX_DONE = /Done.\(.+\)!/;
    private REGEX_LIST = /There are \d+ of a max \d+ players online:/;
    private REGEX_GET_PLAYERS_NUMBER = /(?<=There are )\d+(?= of a max)/;

    private messageChachingRules = 
    [
        new MessageCatchingRule
        (
            msg => this.REGEX_DONE.test(msg),
            msg => {
                this.initialize();
            }
        ),
        new MessageCatchingRule
        (
            msg => this.REGEX_LIST.test(msg),
            msg => {
                const results = this.REGEX_GET_PLAYERS_NUMBER.exec(msg);
                if (results != null)
                {
                    this._lastPlayersNumber = Number(results[0]);
                }
            }
        )
    ]

    private _onInitialized: (() => void) | null = null;
    private _onReceivedStdio: ((msg: string) => void) | null = null;
    private _onReceivedStderr: ((msg: string) => void) | null = null;
    private _onClosed: (() => void) | null = null;

    constructor(buildProcess: () => ChildProcess)
    {
        this.buildProcess = buildProcess;
    }
    
    public start()
    {
        this._serverState = States.Starting;
        if (this.buildProcess != null)
        {
            this.serverProcess = this.buildProcess();
        }

        if (this.serverProcess != null)
        {
            this.serverProcess.stdout.on('data', msg => {
                this.catchMessage(msg);
                if (this._onReceivedStdio != null && !this.REGEX_LIST.test(msg))
                {
                    this._onReceivedStdio(msg);
                }
            });

            this.serverProcess.stderr.on('data', msg => {
                if (this._onReceivedStderr != null)
                {
                    this._onReceivedStderr(msg);
                }
            });

            this.serverProcess.stdout.on('close', () => {
                if (this._onClosed != null)
                {
                    this._onClosed();
                }
            });
        }
    }

    public stop()
    {
        this._serverState = States.Stopping;
        if (this.intervalId != null)
        {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.serverProcess != null)
        {
            this.serverProcess.stdin.write('stop\n');
        }
    }

    private catchMessage(message: string)
    {
        const targets = this.messageChachingRules.filter(mcr => mcr.rule(message));
        targets.forEach(t => t.func(message));
    }

    private initialize()
    {
        this._isInitialized = true;
        this._serverState = States.Running;
        this.intervalId = setInterval(
            this.sendPlayerListRequest,
            this._gettingPlayersInterval,
            this.serverProcess
            );
        if (this._onInitialized != null)
        {
            this._onInitialized();
        }
    }

    private sendPlayerListRequest(process: ChildProcess)
    {
        if (process != null)
        {
            process.stdin.write('list\n');
        }
    }
}

class MessageCatchingRule
{
    private _rule = (msg: string) => false;
    private _func = (msg: string) => {};

    get rule()
    {
        return this._rule;
    }

    get func()
    {
        return this._func;
    }

    constructor(rule: (msg: string) => boolean, func: (msg: string) => void)
    {
        this._rule = rule;
        this._func = func;
    }
}