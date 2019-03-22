import * as request from 'request';

export const getAsync = (url: string, options: request.CoreOptions) => {
    return new Promise((resolve, reject) => {
        request.get(url, options, (err, res, body) => {
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

export const deleteAsync = (url: string, options: request.CoreOptions) => {
    return new Promise((resolve, reject) => {
        request.delete(url, options, (err, res, body) => {
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

export const putAsync = (url: string, options: request.CoreOptions) => {
    return new Promise((resolve, reject) => {
        request.put(url, options, (err, res, body) => {
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