import { Mcsrv } from "./mcsrv";
import { Server } from "./server";

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
}
