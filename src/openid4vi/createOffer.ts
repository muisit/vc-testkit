import Debug from 'debug';
const debug = Debug('create:offer');

import fs from 'fs';

export async function createOffer(url:string, secret:string, data:string)
{
    debug("creating credential offer at ", url);
    const content = JSON.stringify(JSON.parse(fs.readFileSync(data, 'utf8').toString().trim()));
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