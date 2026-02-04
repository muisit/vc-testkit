import Debug from 'debug';
const debug = Debug('restart:api');

export async function restart(url:string, secret:string)
{
    debug("restarting remote application");
    const result = await fetch(
        url + '/api/exit',
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
        return true;
    }
}