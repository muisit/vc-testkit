import Debug from 'debug';
const debug = Debug('oid4vci:gettoken');

import fs from 'fs';

export async function getToken(url:string, data:string)
{
    debug("receiving token from ", url);
    const content = JSON.parse(fs.readFileSync(data, 'utf8').toString().trim());
    debug(content);
    if (content.authorization_details) {
        content.authorization_details = JSON.stringify(content.authorization_details);
    }
    const result = await fetch(
        url,
        {
            method: 'POST',
            body: new URLSearchParams(content)
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