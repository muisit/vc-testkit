import Debug from 'debug';
const debug = Debug('list:identifier');


export async function listIdentifiers(url:string, secret:string)
{
    debug("listing identifier at ", url);
    const result = await fetch(
        url + '/api/identifiers',
        {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            }
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