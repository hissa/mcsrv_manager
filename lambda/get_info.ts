import { APIGatewayProxyHandler } from 'aws-lambda';
import { stringify } from 'querystring';

const request = require('request');

const requestAsync = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (res.statusCode == 200)
            {
                resolve(body);
            }
            else
            {
                reject(err);
            }
        });
    });
};

export const get: APIGatewayProxyHandler = async (event, _context) => {
    
    const url = process.env.SRV_URL;
    console.log(url);
    const options = {
        url: url,
        method: 'GET',
        json: true
    };

    const res = await requestAsync(options);

    // request(options, res => console.log(res));


    console.log(res);
    return {
        statusCode: 200,
        body: stringify(res)
    };
  }
  