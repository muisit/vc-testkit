import Debug from 'debug';
const debug = Debug('oid4vci:createproof');

import fs from 'fs';
import { Factory } from '@muisit/cryptokey';
import { JWT } from '@muisit/simplejwt';

export async function createProof(key:string, nonce:string, issuer:string)
{
    debug("creating proof for nonce", nonce);

    const keyfile = JSON.parse(fs.readFileSync(key, 'utf8').toString().trim());
    const ckey = await Factory.createFromType(keyfile.type, keyfile.privateKey);
    const did = await Factory.toDIDJWK(ckey);
    const now = Date.now();

    const jwt = new JWT();
    jwt.header = {
        alg: ckey.algorithms()[0],
        typ: 'openid4vci-proof+jwt',
        kid: did + '#0'
    };
    jwt.payload = {
        aud: issuer,
        iat: Math.round((now / 1000) - 60), // Let's ensure we subtract 60 seconds for potential time offsets
        exp: Math.round((now / 1000) + 10 * 60), // 10 minutes
        nonce
    }

    await jwt.sign(ckey);
    return {
        proof: jwt.token
    }
}
