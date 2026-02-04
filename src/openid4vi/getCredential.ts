import Debug from 'debug';
const debug = Debug('oid4vci:getcredential');

import fs from 'fs';
import { Factory } from '@muisit/cryptokey';

export async function getCredential(url:string, secret:string, key:string, data:string, nonce:string)
{
    debug("receiving credential from ", url);
    const content = JSON.parse(fs.readFileSync(data, 'utf8').toString().trim());
    debug(content);

    const keyfile = JSON.parse(fs.readFileSync(key, 'utf8').toString().trim());
    const ckey = await Factory.createFromType(keyfile.type, keyfile.privateKey);


    const result = await fetch(
        url,
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            body: content,
        }
    );
    if (result.status != 200) {
        debug(result);
        return {
            status: result.status,
            statusText: result.statusText,
            content: await result.text()
        };
    }
    else {
        const json = await result.json();
        return json;
    }
}