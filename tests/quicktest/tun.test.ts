import {config as dotenvConfig} from "dotenv-flow";
dotenvConfig();

import { test } from '../context';
import { beforeAll, describe, expect, it } from "vitest";
import { fetchMetadata, testMetadata } from "../lib/metadata";
import { fetchOIDConfig, testOIDConfig } from "../lib/openidconfiguration";
import { fetchOAuthConfig, testOAuthConfig } from "../lib/oauthconfiguration";
import { ABC, AEC, EEC, SC, SCC, SDC, OBC } from "./credentials";
import { credentialTest } from "../lib/credentialtest";
import { suiteContains, testDisabled } from "../lib/suite";

describe('TUN', () => {
    let metadata: any;
    let openidconfig: any;
    let oauthconfig: any;

    if (!suiteContains('quicktest') || testDisabled('ISSUER_TUN_TOKEN')) {
        it.skip("disabled");
        return;
    }
    
    const baseurl = process.env.ISSUER;
    const tenant = 'tun';
    const token = process.env.ISSUER_TUN_TOKEN;

    beforeAll(async () => {
        metadata = await fetchMetadata(baseurl, tenant);
        openidconfig = await fetchOIDConfig(baseurl, tenant);
        oauthconfig = await fetchOAuthConfig(baseurl, tenant);
    });
  
    testMetadata(baseurl, tenant, () => metadata);
    testOIDConfig(baseurl, tenant, () => { return { metadata, openidconfig};});
    testOAuthConfig(baseurl, tenant, () => { return { metadata, oauthconfig};});

    const cases = [
      { name: tenant + ' ABC', input: { credential: ABC } },
    ];
  
    for (const row of cases) {
        credentialTest(row.name, baseurl, tenant, token, () => { return {
            metadata,
            oauthconfig,
            credential: row.input.credential
        }; });
    }
});
