import Debug from 'debug';
const debug = Debug('jwt:verify');

import { readObject } from '../util/readObject';
import { JWT } from '@muisit/simplejwt';
import { Factory } from '@muisit/cryptokey';

export async function verifyToken(file:string, keyFile:string|object)
{
    const request = readObject(file);
    const keyfile = readObject(keyFile);
    const ckey = await Factory.createFromType(keyfile.type, keyfile.privateKey);

    const jwt = JWT.fromToken(request);
    if (await jwt.verify(ckey)) {
        return {
            status: "ok"
        }
    }
    return {
        status: "nok"
    }
}
