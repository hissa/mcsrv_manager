import * as mocha from "mocha";
import * as chai from "chai";
import * as moment from "moment";

import { Mcsrv } from './mcsrv';
import { Server, ServerStatus } from './server';
import * as di from "./dependencies";

class MockServerProvider implements di.IServerProvider
{
    public async fetch(): Promise<Server>
    {
        return new Server(this, ServerStatus.Stopped, 0, moment(), moment());
    }

    public async reportError(mcsrv: Mcsrv, srv: Server, msg: string)
    {

    }
}

describe('test', () => {
    it('test', () => {
        chai.assert.isTrue(true);
    });
});