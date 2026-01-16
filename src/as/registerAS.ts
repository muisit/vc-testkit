import fs from 'fs';

export async function registerAS(url:string, secret:string, data:string)
{
    const content = fs.readFileSync(data, 'utf8').toString().trim();
    const result = await fetch(
        url,
        {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-API-KEY': secret
            },
            body: JSON.stringify(content)
        }
    ).then((r) => r.json());
    return result;
}