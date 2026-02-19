import Debug from 'debug';
const debug = Debug('oid4vci:getcredential');

import { readObject } from '../util/readObject';

export async function getCredential(url:string, secret:string, data:string|object)
{
    debug("receiving credential from ", url);
    const content = readObject(data);
    debug(content);
    const result = await fetch(
        url,
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            body: JSON.stringify(content),
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