import Debug from 'debug';
const debug = Debug('jwt:verify');

import fs from 'fs';
import { JWT } from '@muisit/simplejwt';
import { Factory } from '@muisit/cryptokey';

export async function verifyToken(file:string, keyFile:string)
{
    const request = fs.readFileSync(file, 'utf8').toString().trim();
    const keyfile = JSON.parse(fs.readFileSync(keyFile, 'utf8').toString().trim());
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
