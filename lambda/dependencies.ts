import { Mcsrv } from "./mcsrv";
import { Server, ServerStatus } from "./server";

export interface IMcsrvProvider
{
    start(): void;
    stop(): void;
    shutdown(): void;
    fetch(): Promise<Mcsrv>;
}

export interface IServerProvider
{
    fetch(): Promise<Server>;
    reportError(mcsrv: Mcsrv, server: Server, msg: string): void;
    setStatus(status: ServerStatus): void;
    setCount(count: number): void;
}
