import { expect } from "vitest";
import { test } from "../context";
import { createOffer, createProof, getCredential, getOffer, getToken } from "../../src/openid4vi";
import { getJson } from "../../src/util/getJson";
import { JWT } from "@muisit/simplejwt";
import { Factory } from "@muisit/cryptokey";

export function credentialTest(name: string, baseurl:string, tenant:string, token: string, mdcb:Function) {
    test(name, async ({key}) => {
        const { metadata, oauthconfig, credential } = mdcb();

        const agenturl = metadata.credential_issuer;
        const createOfferResponse = await validateCreateOffer(agenturl, token, credential);
        if (!createOfferResponse.uri) {
            return;
        }

        const offerResponse = await validateOffer(createOfferResponse, credential, agenturl);
        const accessCode = await performPreAuthFlow(offerResponse, oauthconfig.token_endpoint);
        const nonce = await retrieveNonceValue(metadata.nonce_endpoint);
        const proof = await createProof((key as unknown) as object, nonce, agenturl);

        const credentialResponse = await validateCredential(credential, accessCode, proof.proof, metadata.credential_endpoint, key);
    });
}

function validateDataContent(credentialData, payload, parentKey?:string)
{
    for(const key of Object.keys(credentialData)) {
        // skip the specific time-of-life elements that can be set in the credential offer call
        if (['_exp','_ttl'].includes(key) && !parentKey) {
            continue;
        }

        // if the original data contains an empty string, but the result is expected to be an integer,
        // the conversion may leave out the entire key
        if (credentialData[key] && (typeof(credentialData[key]) != 'string' || credentialData[key].length)) {
            expect(payload[key]).toBeDefined();
        }

        if (payload[key]) {
            // recursively check the provided data
            if (typeof(credentialData[key]) == 'object') {
                validateDataContent(credentialData[key], payload[key], key);
            }
            else {
                // although issuer.id or credentialSubject.id may be specified, we override the id field
                if ((parentKey !== 'issuer' && parentKey != 'credentialSubject') || key !== 'id') {
                    expect(payload[key]).toBe(credentialData[key]);
                }
            }
        }
    }
}

async function validateVCDM1(token:string, credential:any, key:any)
{
    let jwt:any = null;
    try {
        jwt = JWT.fromToken(token);
    }
    catch {
        expect(jwt !== null).toBeTruthy();
    }
    const ckey = await jwt.findKey();
    expect(ckey).toBeDefined();
    expect(jwt.verify(ckey!)).toBeTruthy();

    expect(jwt.header.alg).toBeDefined();
    expect(jwt.header.alg).toBe(ckey.algorithms()[0]); // we expect the first (only) algorithm
    expect(jwt.header.typ).toBeDefined();
    expect(jwt.header.typ).toBe('JWT');
    if (jwt.header.cty) {
        expect(jwt.header.cty).toBe('vc'); // if defined, must be 'vc'
    }

    expect(jwt.payload.vc).toBeDefined();
    expect(jwt.payload.vc["@context"]).toBeDefined();
    expect(Array.isArray(jwt.payload["@context"]));
    expect(jwt.payload.vc["@context"].length).toBeGreaterThanOrEqual(1);
    expect(jwt.payload.vc["@context"][0]).toBe("https://www.w3.org/2018/credentials/v1"); // first entry must be this

    expect(jwt.payload.vc.type).toBeDefined();
    expect(Array.isArray(jwt.payload.vc.type)).toBeTruthy();
    expect(jwt.payload.vc.type.length).toBeGreaterThanOrEqual(2);
    expect(jwt.payload.vc.type).toContain("VerifiableCredential");
    expect(jwt.payload.vc.type).toContain(credential.credential_type);

    const issHeader = jwt.header.iss;
    const issPayload = jwt.payload.iss;
    const issId = jwt.payload.vc.issuer?.id;
    if (issHeader && issPayload) {
        expect(issHeader).toBe(issPayload);
    }
    if (issHeader && issId) {
        expect(issHeader).toBe(issId);
    }
    if (issPayload && issId) {
        expect(issPayload).toBe(issId);
    }

    const iss = issHeader || issPayload || issId;
    expect(iss).toBeDefined();
    expect(iss.startsWith("did:web:")).toBeTruthy(); // for our credentials, must be a did:web
    const ckey2 = await Factory.resolve(iss);
    expect(ckey2.exportPublicKey()).toBe(ckey.exportPublicKey());

    expect(jwt.header.kid).toBeDefined();
    expect(jwt.header.kid).toContain('#0'); // we only ever use did:web or did:jwk

    if (credential.data) {
        expect(jwt.payload.vc.credentialSubject).toBeDefined();
        validateDataContent(credential.data, jwt.payload.vc.credentialSubject);
    }
    else if (credential.credential) {
        validateDataContent(credential.credential, jwt.payload.vc);
    }

    expect(jwt.payload.vc.credentialSubject.id).toBeDefined();
    const ckey3 = await Factory.resolve(jwt.payload.vc.credentialSubject.id);
    expect(ckey3.exportPublicKey()).toBe(key.publicKey);
}

async function validateVCDM2(token:string, credential:any, key:any)
{
    let jwt:any = null;
    try {
        jwt = JWT.fromToken(token);
    }
    catch {
        expect(jwt !== null).toBeTruthy();
    }
    const ckey = await jwt.findKey();
    expect(ckey).toBeDefined();
    expect(jwt.verify(ckey!)).toBeTruthy();

    expect(jwt.payload.vc).toBeUndefined(); // there may not be a vc claim
    expect(jwt.payload.vp).toBeUndefined(); // there may not be a vp claim

    expect(jwt.header.alg).toBeDefined();
    expect(jwt.header.alg).toBe(ckey.algorithms()[0]); // we expect the first (only) algorithm
    expect(jwt.header.typ).toBeDefined();
    expect(jwt.header.typ).toBe('vc+jwt');
    if (jwt.header.cty) {
        expect(jwt.header.cty).toBe('vc'); // if defined, must be 'vc'
    }

    expect(jwt.payload["@context"]).toBeDefined();
    expect(Array.isArray(jwt.payload["@context"]));
    expect(jwt.payload["@context"].length).toBeGreaterThanOrEqual(1);
    expect(jwt.payload["@context"][0]).toBe("https://www.w3.org/ns/credentials/v2"); // first entry must be this

    expect(jwt.payload.type).toBeDefined();
    expect(Array.isArray(jwt.payload.type)).toBeTruthy();
    expect(jwt.payload.type.length).toBeGreaterThanOrEqual(2);
    expect(jwt.payload.type).toContain("VerifiableCredential");
    expect(jwt.payload.type).toContain(credential.credential_type);

    const issHeader = jwt.header.iss;
    const issPayload = jwt.payload.iss;
    const issId = jwt.payload.issuer?.id;
    if (issHeader && issPayload) {
        expect(issHeader).toBe(issPayload);
    }
    if (issHeader && issId) {
        expect(issHeader).toBe(issId);
    }
    if (issPayload && issId) {
        expect(issPayload).toBe(issId);
    }

    const iss = issHeader || issPayload || issId;
    expect(iss).toBeDefined();
    expect(iss.startsWith("did:web:")).toBeTruthy(); // for our credentials, must be a did:web
    const ckey2 = await Factory.resolve(iss);
    expect(ckey2.exportPublicKey()).toBe(ckey.exportPublicKey());

    expect(jwt.header.kid).toBeDefined();
    expect(jwt.header.kid).toContain('#0'); // we only ever use did:web or did:jwk

    if (credential.data) {
        expect(jwt.payload.credentialSubject).toBeDefined();
        validateDataContent(credential.data, jwt.payload.credentialSubject);
    }
    else if (credential.credential) {
        validateDataContent(credential.credential, jwt.payload);
    }

    expect(jwt.payload.credentialSubject.id).toBeDefined();
    const ckey3 = await Factory.resolve(jwt.payload.credentialSubject.id);
    expect(ckey3.exportPublicKey()).toBe(key.publicKey);

}

async function validateCredential(credential:any, accessCode:any, proof:string, url:string, key:any)
{
    const data = {
        "credential_identifier": accessCode.credentials[0],
        "proofs": {
            "jwt": [proof]
        }
    }
    const credentialResponse = await getCredential(url,accessCode.code, data);
    expect(credentialResponse.credentials).toBeDefined();
    expect(Array.isArray(credentialResponse.credentials)).toBeTruthy();
    expect(credentialResponse.credentials).toHaveLength(1);
    expect(credentialResponse.credentials[0].credential).toBeDefined();
    expect(typeof(credentialResponse.credentials[0].credential)).toBe('string');

    switch (credential.type) {
        case 'vc2':
            return validateVCDM2(credentialResponse.credentials[0].credential, credential, key)
        case 'vc1':
            return validateVCDM1(credentialResponse.credentials[0].credential, credential, key)
        default:
            expect(credential.type).toBe('vc2');
            break;
    }
}

async function retrieveNonceValue(url)
{
    const nonceResponse = await getJson(url, undefined, 'POST');
    expect(nonceResponse).toBeDefined();
    expect(nonceResponse.c_nonce).toBeDefined();
    expect(typeof(nonceResponse.c_nonce)).toBe('string');
    return nonceResponse.c_nonce;
}

async function performPreAuthFlow(offer:any, url:string)
{
    const data = {
        grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
        "pre-authorized_code": offer.state,
        authorization_details: [{
            type: "openid_credential",
            credential_configuration_id: offer.credential
        }]
    };

    const tokenResponse = await getToken(url, data);
    expect(tokenResponse.access_token).toBeDefined();
    expect(tokenResponse.token_type).toBe('bearer');
    expect(tokenResponse.expires_in).toBeDefined();
    expect(typeof(tokenResponse.expires_in)).toBe('number');
    expect(tokenResponse.authorization_details).toBeDefined();
    expect(typeof(tokenResponse.authorization_details)).toBe("object");
    expect(Array.isArray(tokenResponse.authorization_details)).toBeTruthy();
    const oidc = tokenResponse.authorization_details.filter((i) => i.type === 'openid_credential');
    expect(oidc).toBeDefined();
    expect(oidc).toHaveLength(1);
    expect(oidc[0].credential_identifiers).toBeDefined();
    expect(oidc[0].credential_identifiers).toContain(offer.credential);

    return {
        code: tokenResponse.access_token,
        credentials: oidc[0].credential_identifiers
    }
}

async function validateOffer(offer:any, credential:any, agenturl:string)
{
    const offerResponse = await getOffer(offer.uri);
    expect(offerResponse.grants).toBeDefined();
    expect(offerResponse.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']).toBeDefined();
    expect(offerResponse.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['pre-authorized_code']).toBeDefined();
    // we do not expect a transaction code
    expect(offerResponse.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['tx_code']).toBeUndefined();
    expect(offerResponse.credential_configuration_ids).toBeDefined();
    expect(offerResponse.credential_configuration_ids).toHaveLength(1);
    expect(offerResponse.credential_configuration_ids[0]).toBe(credential.credential_id);
    expect(offerResponse.credential_issuer).toBeDefined();
    expect(offerResponse.credential_issuer).toBe(agenturl);
    expect(Object.keys(offerResponse)).toHaveLength(3);

    return {
        state: offerResponse.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['pre-authorized_code'],
        credential: offerResponse.credential_configuration_ids[0]
    }
}

async function validateCreateOffer(url, token, credential)
{
    const data:any = {
        grants: {
            "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
                "pre-authorized_code": "generate"
            }
        },
        "credentials": [credential.credential_id]
    };
    if (credential.credential) {
        data.credential = credential.credential;
    }
    else {
        expect(credential.data).toBeDefined();
        data.credentialDataSupplierInput = credential.data;
    }
    const offerResponse = await createOffer(url, token, data);
    console.log(url, data, offerResponse);
    expect(offerResponse.uri).toBeDefined();
    expect(offerResponse.uri.startsWith('openid-credential-offer')).toBeTruthy();
    expect(offerResponse.uri).toContain('credential_offer_uri='); // we always use offer-by-reference
    expect(offerResponse.uri).toContain(url); // the offer refers to an endpoint on the agent
    expect(offerResponse.id).toBeDefined();
    expect(offerResponse.uri).toContain(offerResponse.id);
    return offerResponse;
}