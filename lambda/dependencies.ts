import { Mcsrv } from "./mcsrv";
import { Server, ServerStatus } from "./server";
import * as moment from "moment";

export interface IMcsrvProvider
{
    start(): void;
    stop(): void;
    shutdown(): void;
    fetch(): Promise<Mcsrv>;
}

export interface IServerProvider
{
    fetch(): Promise<ServerInformation>;
    reportError(mcsrv: Mcsrv, server: Server, msg: string): void;
    setStatus(status: ServerStatus): void;
    setCount(count: number): void;
}

export interface ServerInformation {
    status: ServerStatus,
    count: number,
    statusUpdatedDateTime: moment.Moment,
    countUpdatedDateTime: moment.Moment
}