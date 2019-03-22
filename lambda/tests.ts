import * as mocha from "mocha";
import * as chai from "chai";
import * as moment from "moment";

import { Mcsrv, NotAlivingMcsrv, AlivingMcsrv, McsrvStatus } from './mcsrv';
import { Server, ServerStatus } from './server';
import * as di from "./dependencies";

class MockServerProvider implements di.IServerProvider
{
    public reportErrorDelegate = (mcsrv: Mcsrv, srv: Server, msg: string) => {};
    public setStatusDelegate = (status: ServerStatus) => {};
    public setCountDelegate = (count: number) => {};

    public async fetch(): Promise<Server>
    {
        return new Server(this, ServerStatus.Stopped, 0, moment(), moment());
    }

    public async reportError(mcsrv: Mcsrv, srv: Server, msg: string)
    {
        this.reportErrorDelegate(mcsrv, srv, msg);
    }

    public async setStatus(status: ServerStatus)
    {
        this.setStatusDelegate(status);``
    }

    public async setCount(count: number)
    {
        this.setCountDelegate(count);
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

const getFunctionsObject = () => {
    return {
        reportError: false,
        start: false,
        stop: false,
        shutdown: false,
        setStopped: false,
        setStarting: false,
        setRunning: false,
        setStopping: false,
        setCount: false
    };
};

const setFunctionsObjectToDelegate = (mcProvider: MockMcsrvProvider, srvProvider: MockServerProvider, funcObj) => {
    mcProvider.startDelegate = () => funcObj.start = true;
    mcProvider.stopDelegate = () => funcObj.stop = true;
    mcProvider.shutdownDelegate = () => funcObj.shutdown = true;
    srvProvider.reportErrorDelegate = () => funcObj.reportError = true;
    srvProvider.setStatusDelegate = status => {
        switch (status)
        {
            case ServerStatus.Stopped:
                funcObj.setStopped = true;
                break;
            case ServerStatus.Starting:
                funcObj.setStarting = true;
                break;
            case ServerStatus.Running:
                funcObj.setRunning = true;
                break;
            case ServerStatus.Stopping:
                funcObj.setStopping = true;
                break;
        }
    }

    srvProvider.setCountDelegate = count => funcObj.setCount = true;
};

describe('Server action tests', () => {
    describe('Stopped', () => {
        it('Not aliving', () => {
            let actual = getFunctionsObject();
            const expected = getFunctionsObject();

            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopped,
                0,
                moment(),
                moment()
            );

            srv.update(new NotAlivingMcsrv(mcProvider));
            
            chai.assert.deepEqual(actual, expected);
        });

        it('Invalid aliving(Starting)', () => {
            let actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;

            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopped,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            
            chai.assert.deepEqual(actual, expected);
        });

        it('Invalid aliving(Running)', () => {
            let actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;

            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopped,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            
            chai.assert.deepEqual(actual, expected);
        });
        
        it('Invalid aliving(Stopping)', () => {
            let actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;

            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopped,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            
            chai.assert.deepEqual(actual, expected);
        });
    });
    
    describe('Starting', () => {
        it('Not aliving (4min.)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Starting,
                0,
                moment().subtract(4, 'minutes'),
                moment()
            );

            srv.update(new NotAlivingMcsrv(mcProvider));

            chai.assert.deepEqual(actual, expected);
        });

        it('Not aliving (6min.)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Starting,
                0,
                moment().subtract(6, 'minutes'),
                moment()
            );

            srv.update(new NotAlivingMcsrv(mcProvider));
            chai.assert.deepEqual(actual, expected);
        });

        it('Starting (4min.)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Starting,
                0,
                moment().subtract(4, 'minutes'),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            
            chai.assert.deepEqual(actual, expected);
        });

        it('Starting (6min.)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Starting,
                0,
                moment().subtract(6, 'minutes'),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));

            chai.assert.deepEqual(actual, expected);
        });
        
        it('Running', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.setRunning = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Starting,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Running));
            chai.assert.deepEqual(actual, expected);
        });

        it('Stopping', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.setStopping = true;
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Starting,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Stopping));
            chai.assert.deepEqual(actual, expected);
        });
    });
    
    describe('Running', () => {
        it('Not aliving.', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                0,
                moment(),
                moment()
            );

            srv.update(new NotAlivingMcsrv(mcProvider));
            chai.assert.deepEqual(actual, expected);
        });

        it('Starting', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            chai.assert.deepEqual(actual, expected);
        });

        it('Running (Has any players (9min.))', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                1,
                moment(),
                moment().subtract(9, 'minutes')
            );

            srv.update(new AlivingMcsrv(mcProvider, 1, McsrvStatus.Running));
            chai.assert.deepEqual(actual, expected);
        });

        it('Running (Has any players (11min.))', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                1,
                moment(),
                moment().subtract(11, 'minutes')
            );

            srv.update(new AlivingMcsrv(mcProvider, 1, McsrvStatus.Running));
            chai.assert.deepEqual(actual, expected);
        });

        it('Running (0 players (9min.))', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                0,
                moment(),
                moment().subtract(9, 'minutes')
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            chai.assert.deepEqual(actual, expected);
        });

        it('Running (0 players (11min.))', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.stop = true;
            expected.setStopping = true;

            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                0,
                moment(),
                moment().subtract(11, 'minutes')
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            chai.assert.deepEqual(actual, expected);
        });

        it('Running (Update players count)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.setCount = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 1, McsrvStatus.Starting));
            chai.assert.deepEqual(actual, expected);
        });

        it('Stopping', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Running,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Stopping));
            chai.assert.deepEqual(actual, expected);
        });
    });

    describe('Stopping', () => {
        it('Not aliving', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.shutdown = true;
            expected.setStopped = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopping,
                0,
                moment(),
                moment()
            );

            srv.update(new NotAlivingMcsrv(mcProvider));
            chai.assert.deepEqual(actual, expected);
        });

        it('Starting', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopping,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Starting));
            chai.assert.deepEqual(actual, expected);
        });

        it('Running', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopping,
                0,
                moment(),
                moment()
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Running));
            chai.assert.deepEqual(actual, expected);
        });

        it('Stopping (4min.)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopping,
                0,
                moment(),
                moment().subtract(4, 'minutes')
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Stopping));
            chai.assert.deepEqual(actual, expected);
        });

        it('Stopping (6min.)', () => {
            const actual = getFunctionsObject();
            const expected = getFunctionsObject();
            expected.reportError = true;
            
            const mcProvider = new MockMcsrvProvider();
            const srvProvider = new MockServerProvider();
            setFunctionsObjectToDelegate(mcProvider, srvProvider, actual);

            const srv = new Server(
                srvProvider,
                ServerStatus.Stopping,
                0,
                moment(),
                moment().subtract(6, 'minutes')
            );

            srv.update(new AlivingMcsrv(mcProvider, 0, McsrvStatus.Stopping));
            chai.assert.deepEqual(actual, expected);
        });
    });
});