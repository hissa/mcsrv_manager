import { APIGatewayProxyHandler, CloudWatchLogsHandler } from 'aws-lambda';
import { McsrvProvider } from './mcsrvProvider';
import { Server } from './server';
import { ServerProvider } from './serverProvider';

export const hello: APIGatewayProxyHandler = async (event, _context) => {
    console.log(process.env);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
            input: event,
        }),
    };
}

export const update: CloudWatchLogsHandler = async (event, _context) => {
    const mcsrvProvider = new McsrvProvider();
    const serverProvider = new ServerProvider();
    const server = new Server(serverProvider);
    const tasks = await Promise.all([
        server.initialize(),
        mcsrvProvider.fetch()
    ]);
    const mcsrv = tasks[1];
    await server.update(mcsrv);
};
