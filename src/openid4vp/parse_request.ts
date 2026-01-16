import fs from 'fs';
import { parseAuthorizationRequestVersion } from '@openid4vc/openid4vp';

export async function parse_request(file:string)
{
    const json = fs.readFileSync(file, 'utf8').toString();
    const request = await JSON.parse(json);

    return parseAuthorizationRequestVersion(request.payload);
}
