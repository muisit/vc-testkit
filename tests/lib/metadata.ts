import { expect } from "vitest";
import { test } from "../context";

export async function fetchMetadata(baseurl:string, tenant:string) {
    const metadataurl1 = `https://${baseurl}/${tenant}/.well-known/openid-credential-issuer`;
    const metadata1 = await fetch(metadataurl1).then((r) => r.json()).catch(() => undefined);
    return metadata1;
}

export function testMetadata(baseurl:string, tenant:string, mdcb:Function) {
    test(tenant + " metadata", () => {
        const metadata1 = mdcb();
        expect(metadata1).toBeDefined();
        expect(metadata1.credential_issuer).toBeDefined();
        expect(metadata1.credential_endpoint).toBeDefined();
        expect(metadata1.nonce_endpoint).toBeDefined();    
    });

    test(tenant + " metadata on base domain", async () => {
        const metadata1 = mdcb();
        const metadataurl2 = `https://${baseurl}/.well-known/openid-credential-issuer/${tenant}`;
        const metadata2 = await fetch(metadataurl2).then((r) => r.json()).catch(() => undefined);
        expect(metadata2).toBeDefined();
        expect(JSON.stringify(metadata2)).toBe(JSON.stringify(metadata1));
    });

    test(tenant + " metadata on tenant domain", async () => {
        const metadata1 = mdcb();
        const metadataurl3 = `https://${tenant}.${baseurl}/.well-known/openid-credential-issuer`;
        const metadata3 = await fetch(metadataurl3).then((r) => r.json()).catch(() => undefined);

        // if we use tenant-domain configurations
        if (metadata3) {
            expect(JSON.stringify(metadata3)).toBe(JSON.stringify(metadata1));
            // then the issuer should be the tenant version
            expect(metadata1.credential_issuer).toBe(`https://${tenant}.${baseurl}`);
            expect(metadata1.credential_endpoint).toBe(`https://${tenant}.${baseurl}/credentials`);
            expect(metadata1.nonce_endpoint).toBe(`https://${tenant}.${baseurl}/nonce`);
        }
        else {
            // not using tenant domains
            expect(metadata1.credential_issuer).toBe(`https://${baseurl}/${tenant}`);
            expect(metadata1.credential_endpoint).toBe(`https://${baseurl}/${tenant}/credentials`);
            expect(metadata1.nonce_endpoint).toBe(`https://${baseurl}/${tenant}/nonce`);
        }
    });
}