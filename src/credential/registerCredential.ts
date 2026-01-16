import Debug from 'debug';
const debug = Debug('register:credential');

import fs from 'fs';

export async function registerCredential(url:string, secret:string, data:string)
{
    debug("registering credential at ", url);
    const content = JSON.stringify(JSON.parse(fs.readFileSync(data, 'utf8').toString().trim()));
    debug(content);
    const result = await fetch(
        url + '/api/credentials',
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