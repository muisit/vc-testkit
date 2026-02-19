import { expect } from "vitest";
import { test } from "../context";

export async function fetchOIDConfig(baseurl:string, tenant:string) {
    const url = `https://${baseurl}/${tenant}/.well-known/openid-configuration`;
    const data = await fetch(url).then((r) => r.json()).catch(() => undefined);
    return data;
}

export function testOIDConfig(baseurl:string, tenant:string, mdcb:Function) {
    test(tenant + " openid-configuration", () => {
        const { metadata, openidconfig } = mdcb();
        if (!metadata.authorization_servers) {
            expect(openidconfig).toBeDefined();
            expect(openidconfig.issuer).toBeDefined();
            expect(openidconfig.token_endpoint).toBeDefined();
        }
    });

    test(tenant + " openid-configuration on base domain", async () => {
        const { metadata, openidconfig } = mdcb();
        if (!metadata.authorization_servers) {
            const url = `https://${baseurl}/.well-known/openid-configuration/${tenant}`;
            const data = await fetch(url).then((r) => r.json()).catch(() => undefined);
            expect(data).toBeDefined();
            expect(JSON.stringify(data)).toBe(JSON.stringify(openidconfig));
        }
    });

    test(tenant + " openid-configuration on tenant domain", async () => {
        const { metadata, openidconfig } = mdcb();
        if (!metadata.authorization_servers) {
            const url = `https://${tenant}.${baseurl}/.well-known/openid-configuration`;
            const data = await fetch(url).then((r) => r.json()).catch(() => undefined);

            // if we use tenant-domain configurations
            if (data) {
                expect(JSON.stringify(data)).toBe(JSON.stringify(openidconfig));
                // then the issuer should be the tenant version
                expect(openidconfig.issuer).toBe(`https://${tenant}.${baseurl}`);
                expect(openidconfig.token_endpoint).toBe(`https://${tenant}.${baseurl}/token`);
            }
            else {
                // not using tenant domains
                expect(openidconfig.issuer).toBe(`https://${baseurl}/${tenant}`);
                expect(openidconfig.token_endpoint).toBe(`https://${baseurl}/${tenant}/token`);
            }
        }
    });
}