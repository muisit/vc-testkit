import Debug from 'debug';
const debug = Debug('oid4vci:createoffer');

import { readObject } from '../util/readObject';

export async function createOffer(url:string, secret:string, data:string|object)
{
    debug("creating credential offer at ", url);
    let content = JSON.stringify(readObject(data));
    debug(content);
    const result = await fetch(
        url + '/api/create-offer',
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            body: content
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