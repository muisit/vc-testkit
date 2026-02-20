# Virtual Credential Test Kit

This repository contains test tools for testing virtual credential issuance, mostly within the context of the EduWallet Proeftuin project.

## Setup

The toolset contains a single entry script that allows running key parts of the OpenID4VC Issuance protocol from a standard command line. See the `scripts` folder for examples of invoking the `yarn do` script. Options and commands are available in the `src/index.ts` script file.

The toolset also contains a `vitest` unit test environment for automated testing within the typescript tooling of the OpenID4VC issuance and verification protocols. The tests invoke the same library methods as the `yarn do` script. Testing is configured using the `.env.test` environment file.

## Vitest Suites

The current test environment supports the following suites:

- `proeftuin`: testing an installment of the EduWallet 'Proeftuin'
- `quicktest`: test on all 'Proeftuin' issuers for only the `AcademicBaseCredential`

## Environment Options

- `SUITES`: a comma-separated list of supported suites. If not available, defaults to `proeftuin`
- `ISSUER`: the base domain URL of the remote `proeftuin` issuer agent to be tested
- `ISSUER_XXX_TOKEN`: specific issuer token, with `XXX` being one of `MBOB`, `HBOT`, `UVH`, `TUN`, `EPI`, `NLGOV`, `NBGOV` or `SANDBOX`

You can direct which tests to run by configuring or leaving out specific elements in the `.env.test` file:

- `SUITES` directs which general tests to run. All tests under the `proeftuin` path require `proeftuin` in this comma separated list
- `ISSUER_XXX_TOKEN` if not present for a given `XXX` will skip all tests of that specific issuer

If you need to test only a specific credential of an issuer, you can comment out the other credentials in the actual test.

