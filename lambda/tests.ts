import * as mocha from "mocha";
import * as chai from "chai";
import * as moment from "moment";

import { Mcsrv, NotAlivingMcsrv, AlivingMcsrv, McsrvStatus } from './mcsrv';
import { Server, ServerStatus } from './server';
import * as di from "./dependencies";

class MockServerProvider implements di.IServerProvider
{
    public reportErrorDelegate = (mcsrv: Mcsrv, srv: Server, msg: string) => {};

    public async fetch(): Promise<Server>
    {
        return new Server(this, ServerStatus.Stopped, 0, moment(), moment());
    }

    public async reportError(mcsrv: Mcsrv, srv: Server, msg: string)
    {
        this.reportErrorDelegate(mcsrv, srv, msg);
    }
}

class MockMcsrvProvider implements di.IMcsrvProvider
{
    public startDelegate = () => {};
    public stopDelegate = () => {};
    public shutdownDelegate = () => {};

    public start()
    {
        this.startDelegate();
    }

    public stop()
    {
        this.stopDelegate();
    }

    public shutdown()
    {
        this.shutdownDelegate();
    }

    public async fetch()
    {
        return new Mcsrv(this);
    }
}

describe('Server action tests', () => {
    describe('Stopped', () => {
        it('Stopped', () => {
            let actual = {
                reportError: false,
                start: false,
                stop: false,
                shutdown: false
            };

            const srvProvider = new MockServerProvider();
            srvProvider.reportErrorDelegate = (mcsrv, srv, msg) => {
                actual.reportError = true;
            };

            const mcProvider = new MockMcsrvProvider();
            mcProvider.startDelegate = () => actual.start = true;
            mcProvider.stopDelegate = () => actual.stop = true;
            mcProvider.shutdownDelegate = () => actual.shutdown = true;

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopped,
                0,
                moment(),
                moment()
            );

            srv.action(new NotAlivingMcsrv(mcProvider));
            
            const expected = {
                reportError: false,
                start: false,
                stop: false,
                shutdown: false
            };

            chai.assert.deepEqual(actual, expected);
        });

        it('Invalid aliving', () => {
            let actual = {
                reportError: false,
                start: false,
                stop: false,
                shutdown: false
            };

            const srvProvider = new MockServerProvider();
            srvProvider.reportErrorDelegate = (mcsrv, srv, msg) => {
                actual.reportError = true;
            };

            const mcProvider = new MockMcsrvProvider();
            mcProvider.startDelegate = () => actual.start = true;
            mcProvider.stopDelegate = () => actual.stop = true;
            mcProvider.shutdownDelegate = () => actual.shutdown = true;

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopped,
                0,
                moment(),
                moment()
            );

            srv.action(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Running));
            
            const expected = {
                reportError: true,
                start: false,
                stop: false,
                shutdown: false
            };

            chai.assert.deepEqual(actual, expected);
        });
    });
});