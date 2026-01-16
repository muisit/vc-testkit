import Debug from 'debug';
const debug = Debug("register:issuer");

import fs from 'fs';

export async function registerIssuer(url:string, secret:string, data:string)
{
    debug("reading file", data);
    const content = fs.readFileSync(data, 'utf8').toString().trim();
    debug("read ", content);
    debug("fetching");

    const result = await fetch(
        url + '/api/issuers',
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