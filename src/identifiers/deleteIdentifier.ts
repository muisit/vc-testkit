import Debug from 'debug';
const debug = Debug('delete:identifier');


export async function deleteIdentifier(url:string, secret:string, id:string)
{
    debug("deleting identifier at ", url);
    const result = await fetch(
        url + '/api/identifiers',
        {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            body: JSON.stringify({
                did: id
            })
        }
    );
    if (result.status != 200 && result.status != 202) {
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