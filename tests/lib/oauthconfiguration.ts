import { expect } from "vitest";
import { test } from "../context";

export async function fetchOAuthConfig(baseurl:string, tenant:string) {
    const url = `https://${baseurl}/${tenant}/.well-known/oauth-authorization-server`;
    const data = await fetch(url).then((r) => r.json()).catch(() => undefined);
    return data;
}

export function testOAuthConfig(baseurl:string, tenant:string, mdcb:Function) {
    test(tenant + " oauth-authorization-server", () => {
        const { metadata, oauthconfig } = mdcb();
        if (!metadata.authorization_servers) {
            expect(oauthconfig).toBeDefined();
            expect(oauthconfig.issuer).toBeDefined();
            expect(oauthconfig.token_endpoint).toBeDefined();
        }
    });

    test(tenant + " oauth-authorization-server on base domain", async () => {
        const { metadata, oauthconfig } = mdcb();
        if (!metadata.authorization_servers) {
            const url = `https://${baseurl}/.well-known/oauth-authorization-server/${tenant}`;
            const data = await fetch(url).then((r) => r.json()).catch(() => undefined);
            expect(data).toBeDefined();
            expect(JSON.stringify(data)).toBe(JSON.stringify(oauthconfig));
        }
    });

    test(tenant + " oauth-authorization-server on tenant domain", async () => {
        const { metadata, oauthconfig } = mdcb();
        if (!metadata.authorization_servers) {
            const url = `https://${tenant}.${baseurl}/.well-known/oauth-authorization-server`;
            const data = await fetch(url).then((r) => r.json()).catch(() => undefined);

            // if we use tenant-domain configurations
            if (data) {
                expect(JSON.stringify(data)).toBe(JSON.stringify(oauthconfig));
                // then the issuer should be the tenant version
                expect(oauthconfig.issuer).toBe(`https://${tenant}.${baseurl}`);
                expect(oauthconfig.token_endpoint).toBe(`https://${tenant}.${baseurl}/token`);
            }
            else {
                // not using tenant domains
                expect(oauthconfig.issuer).toBe(`https://${baseurl}/${tenant}`);
                expect(oauthconfig.token_endpoint).toBe(`https://${baseurl}/${tenant}/token`);
            }
        }
    });
}