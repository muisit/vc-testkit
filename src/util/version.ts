import Debug from 'debug';
const debug = Debug('version:api');

export async function version(url:string)
{
    debug("retrieving version of remote application");
    const result = await fetch(url + '/api/version');
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