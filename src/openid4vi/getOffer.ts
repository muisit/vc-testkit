import Debug from 'debug';
const debug = Debug('oid4vci:getoffer');

import { getJson } from '../util/getJson';

export async function getOffer(url:string)
{
    debug("retrieving offer at ", url);

    if (!url.startsWith('openid-credential-offer://?')) {
        debug("url does not start with the openid-credential-offer:// prefix");
        return {
            status: 0,
            statusText: "Invalid offer URL",
            content: url
        };
    }
    const uri = url.substring('openid-credential-offer://?'.length);
    if (uri && uri.startsWith('credential_offer_uri=')) {
        debug("offer is a remote URI");
        const remoteOffer = decodeURIComponent(uri.substring('credential_offer_uri='.length).trim());
        return await getJson(remoteOffer);
    }
    else if(uri && uri.startsWith('credential_offer=')) {
        const offer = uri.substring('credential_offer='.length).trim();
        try {
            const obj = JSON.parse(offer);
            return obj;
        }
        catch (e) {
            debug(e);
            return {
                status: 0,
                statusText: 'Encoded offer is not json',
                content: offer
            }
        }
    }
}