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

describe('HBOT', () => {
    let metadata: any;
    let openidconfig: any;
    let oauthconfig: any;
  
    if (!suiteContains('proeftuin') || testDisabled('ISSUER_HBOT_TOKEN')) {
        it.skip("disabled");
        return;
    }

    const baseurl = process.env.ISSUER;
    const tenant = 'hbot';
    const token = process.env.ISSUER_HBOT_TOKEN;

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
      { name: tenant + ' AEC', input: { credential: AEC } },
      { name: tenant + ' EEC', input: { credential: EEC } },
      { name: tenant + ' SC', input: { credential: SC } },
      { name: tenant + ' SCC', input: { credential: SCC } },
      { name: tenant + ' SDC', input: { credential: SDC } },
      { name: tenant + ' OBC', input: { credential: OBC } },
    ];
  
    for (const row of cases) {
        credentialTest(row.name, baseurl, tenant, token, () => { return {
            metadata,
            oauthconfig,
            credential: row.input.credential
        }; });
    }
});
