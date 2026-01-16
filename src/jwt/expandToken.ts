import Debug from 'debug';
const debug = Debug('jwt:expand');

import fs from 'fs';
import { JWT } from '@muisit/simplejwt';

export async function expandToken(file:string)
{
    debug("expanding file", file);
    const request = fs.readFileSync(file, 'utf8').toString().trim();

    const jwt = JWT.fromToken(request);

    return {
        header: jwt.header,
        payload: jwt.payload,
        signature: jwt.signaturePart
    };
}
