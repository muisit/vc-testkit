import Debug from 'debug';
const debug = Debug('register:identifier');

import fs from 'fs';

export async function registerIdentifier(url:string, secret:string, data:string)
{
    debug("registering identifier at ", url);
    const content = fs.readFileSync(data, 'utf8').toString().trim();
    debug(content);
    const result = await fetch(
        url + '/api/identifiers',
        {
            method: 'PUT',
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