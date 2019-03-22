import * as request from 'request';

export const requestAsync = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (!err) 
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