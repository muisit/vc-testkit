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
        url,
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            body: content
        }
    ).then((r) => r.json()).catch((e) => {console.error(e);});
    debug("returning ", result);
    return result;
}