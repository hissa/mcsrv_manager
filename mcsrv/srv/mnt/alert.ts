import {Moment} from 'moment';
import moment = require('moment');

export enum AlertType
{
    Info,
    Warning,
    Error
}

export class Alert
{
    private _message: string = '';
    private _datetime: Moment = moment();
    private _type: AlertType = AlertType.Info;

    constructor(message: string, type: AlertType, datetime: (Moment | null) = null)
    {
        this._message = message;
        if (datetime == null)
        {
            this._datetime = moment();
        }
        else
        {
            this._datetime = datetime;
        }
        this._type = type;
    }

    get message()
    {
        return this._message;
    }

    get datetime()
    {
        return this._datetime;
    }

    get type()
    {
        return this._type;
    }

    public toObject()
    {
        return {
            datetime: this._datetime.format('YYYY-MM-DD HH:mm:ss'),
            type: this._type.toString(),
            message: this._message
        };
    }

    public toString()
    {
        const obj = this.toObject();
        return `${obj.datetime} ${obj.type} ${obj.message}`;
    }

}