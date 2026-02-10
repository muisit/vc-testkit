import Debug from 'debug';
const debug = Debug('get:json');

export async function getJson(url:string, secret?:string, method?:string)
{
    debug("retrieving file at ", url, method);
    const headers = {
        'Content-type': 'application/json',
        ...(secret && {'Authorization': 'Bearer ' + secret})
    }

    const result = await fetch(url, {
        method: method == 'POST' ? 'POST' : 'GET',
        headers
    });
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
