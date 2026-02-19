import Debug from 'debug';
const debug = Debug('jwt:expand');

import { readObject } from '../util/readObject';
import { JWT } from '@muisit/simplejwt';

export async function expandToken(file:string)
{
    debug("expanding file", file);
    const request = readObject(file);

    const jwt = JWT.fromToken(request);

    return {
        header: jwt.header,
        payload: jwt.payload,
        signature: jwt.signaturePart
    };
}
