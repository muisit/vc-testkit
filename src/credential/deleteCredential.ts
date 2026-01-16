import Debug from 'debug';
const debug = Debug('delete:credential');


export async function deleteCredential(url:string, secret:string, id:string)
{
    debug("deleting credential at ", url);
    const result = await fetch(
        url + '/api/credentials',
        {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + secret
            },
            body: JSON.stringify({
                id
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