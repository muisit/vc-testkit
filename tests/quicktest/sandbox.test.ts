import {config as dotenvConfig} from "dotenv-flow";
dotenvConfig();

import { beforeAll, describe, it } from "vitest";
import { fetchMetadata, testMetadata } from "../lib/metadata";
import { fetchOIDConfig, testOIDConfig } from "../lib/openidconfiguration";
import { fetchOAuthConfig, testOAuthConfig } from "../lib/oauthconfiguration";
import { ABC_JWT, PID_JWT, GC_JWT, GC_JWT_1 } from "./credentials";
import { credentialTest } from "../lib/credentialtest";
import { suiteContains, testDisabled } from "../lib/suite";

describe('Sandbox Issuer', () => {
    let metadata: any;
    let openidconfig: any;
    let oauthconfig: any;

    if (!suiteContains('quicktest') || testDisabled('ISSUER_SANDBOX_TOKEN')) {
        it.skip("disabled");
        return;
    }
    
    const baseurl = process.env.ISSUER;
    const tenant = 'sandbox';
    const token = process.env.ISSUER_SANDBOX_TOKEN;

    beforeAll(async () => {
        metadata = await fetchMetadata(baseurl, tenant);
        openidconfig = await fetchOIDConfig(baseurl, tenant);
        oauthconfig = await fetchOAuthConfig(baseurl, tenant);
    });
  
    testMetadata(baseurl, tenant, () => metadata);
    testOIDConfig(baseurl, tenant, () => { return { metadata, openidconfig};});
    testOAuthConfig(baseurl, tenant, () => { return { metadata, oauthconfig};});

    const cases = [
      { name: tenant + ' ABC as JWT', input: { credential: ABC_JWT } },
    ];
  
    for (const row of cases) {
        credentialTest(row.name, baseurl, tenant, token, () => { return {
            metadata,
            oauthconfig,
            credential: row.input.credential
        }; });
    }
});
