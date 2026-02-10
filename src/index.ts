import Debug from 'debug';
const debug = Debug("main:main");

import { registerAS } from "./as/registerAS";
import { createKey } from "./identifiers/createKey";
import { expandToken } from "./jwt/expandToken";
import { parse_request } from "./openid4vp/parse_request";
import { registerIssuer } from './issuer/registerIssuer';
import { registerIdentifier } from "./identifiers/registerIdentifier";
import { deleteIdentifier } from './identifiers/deleteIdentifier';
import { getArgs, getJson, quoteFile, restart, version } from "./util";
import { listIdentifiers } from './identifiers/listIdentifiers';
import { deleteCredential, listCredentials, registerCredential } from './credential';
import { deleteIssuer } from './issuer/deleteIssuer';
import { listIssuers } from './issuer/listIssuers';
import { createOffer, getOffer, getToken, getCredential } from './openid4vi';
import { createProof } from './openid4vi/createProof';
import { resolveKey } from './identifiers/resolveKey';
import { verifyToken } from './jwt/verifyToken';

function printHelp()
{
  console.log('EduWallet Test Toolkit');
  console.log('');
  console.log('Usage: yarn run <command> [<arguments>]');
  console.log('');
  console.log('Commands:');
  console.log('  create:key [-t <type>]                                   - create and output a new key of the indicated type');
  console.log('  create:offer -u <issuer url> -s <secret> -d <data file>  - create a credential offer');
  console.log('  create:proof -k <keyfile> -n <nonce> -u <issuer url> [-c clientid]');
  console.log('                                                           - create a JWT proof used for credential issuance')
  console.log('  delete:credential -i <identifier> -u <url> -s <secret>   - remove the given credential using the Management API');
  console.log('  delete:identifier -i <identifier> -u <url> -s <secret>   - remove the given identifier using the Management API');
  console.log('  delete:issuer -i <identifier> -u <url> -s <secret>       - remove the given issuer using the Management API');
  console.log('  get:json -u <url> [-s <secret>] [-m method]              - retrieve a JSON document at the indicated url, with optional bearer token');
  console.log('  get:credential -u <url> -s <access token> -k <keyfile> -d <data file> -n <nonce>');
  console.log('                                                           - request a credential');
  console.log('  get:offer -u <url>                                       - parse and retrieve an OID4VCI offer URL');
  console.log('  get:token -u <url> -d <data file>                        - perform an OID4VCI token request to the token endpoint with the data');
  console.log('  jwt:expand -d <data file>                                - read a JWT token and expand it to a JSON structure');
  console.log('  jwt:verify -d <data file> -k keyfile                     - verify the signature of a JWT token against the key');
  console.log('  list:credential -u <url> -s <secret>                     - list credentials using the Management API');
  console.log('  list:identifier -u <url> -s <secret>                     - list identifiers using the Management API');
  console.log('  list:issuer -u <url> -s <secret>                         - list issuers using the Management API');
  console.log('  parse:authrequest -d <data file>                         - parse the authorization request using @openid4vc/openid4vp');
  console.log('  quote -d <data file>                                     - minify json input and quote it as a JSON stringified object')
  console.log('  register:as -d <data file> -u <url> -s <secret>          - register an AS on the eduID proxy AS');
  console.log('  register:credential -d <data file> -u <url> -s <secret>  - register a new credential on the Management API');
  console.log('  register:identifier -d <data file> -u <url> -s <secret>  - register a new identifier on the Management API');
  console.log('  register:issuer -d <data file> -u <url> -s <secret>      - register a new issuer on the Management API');
  console.log('  restart -u <url> -s <secret>                             - restart the remote application using the Management API');
}

async function main()
{
    const args = getArgs([{
        name: "client",
        short: "c",
        hasArg: true
      }, {
        name: "data",
        short: "d",
        hasArg: true
      },{
        name: "file",
        short: "f",
        hasArg: true
      },{
        name: "identifier",
        short: "i",
        hasArg: true
      },{
        name: "key",
        short: "k",
        hasArg: true
      },{
        name: "method",
        short: "m",
        hasArg: true
      },{
        name: "nonce",
        short: "n",
        hasArg: true
      },{
        name: "secret",
        short: "s",
        hasArg: true
      },{
        name: "type",
        short: "t",
        hasArg: true
      },{
        name: "url",
        short: "u",
        hasArg: true
      }
    ]);
    if (args.remainder.length == 0) {
        console.error('Missing command');
        return 1;
    }

    let output:any;
    debug("determining command ", args.remainder[0]);
    switch (args.remainder[0] as string) {
        default:
            console.log('Command not understood', args.remainder[0]);
            break;
        case 'help':
            printHelp();
            break;
        case 'create:key':
            output = await createKey('' + (args?.arguments?.type ?? 'secp256r1'));
            break;
        case 'create:offer':
            output = await createOffer('' + (args?.arguments?.url), '' + (args?.arguments?.secret), '' + (args?.arguments?.data ?? ''));
            break;
        case 'create:proof':
            output = await createProof('' + (args?.arguments?.key), '' + (args?.arguments?.nonce), '' + (args?.arguments?.url));
            break;
        case 'delete:credential':
            output = await deleteCredential('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.identifier ?? ''));
            break;
        case 'delete:identifier':
            output = await deleteIdentifier('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.identifier ?? ''));
            break;
        case 'delete:issuer':
            output = await deleteIssuer('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.identifier ?? ''));
            break;
        case 'get:credential':
            output = await getCredential(
                    '' + (args?.arguments?.url ?? ''),
                    '' + (args?.arguments?.secret),
                    '' + (args?.arguments?.data ?? ''),
                );
            break;
        case 'get:json':
            debug(args.arguments);
            output = await getJson('' + (args?.arguments?.url ?? ''), args?.arguments?.secret as string|undefined, (args?.arguments?.method as string) ?? 'GET');
            break;
        case 'get:offer':
            output = await getOffer('' + (args?.arguments?.url ?? ''));
            break;
        case 'get:token':
            output = await getToken('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.data ?? ''));
            break;
        case 'jwt:expand':
            output = await expandToken('' + (args.arguments?.data ?? ''));
            break;
        case 'jwt:verify':
            output = await verifyToken('' + (args.arguments?.data ?? ''), '' + (args?.arguments?.key ?? ''));
            break;
        case 'list:credential':
            output = await listCredentials('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''));
            break;
        case 'list:identifier':
            output = await listIdentifiers('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''));
            break;
        case 'list:issuer':
            output = await listIssuers('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''));
            break;
        case 'parse:authrequest':
            output = await parse_request('' + (args.arguments?.data ?? ''));
            break;
        case 'quote':
            output = quoteFile('' + (args.arguments?.data ?? ''));
            break;
        case 'register:as':
            output = await registerAS('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.data ?? ''));
            break;
        case 'register:credential':
            output = await registerCredential('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.data ?? ''));
            break;
        case 'register:identifier':
            output = await registerIdentifier('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.data ?? ''));
            break;
        case 'register:issuer':
            output = await registerIssuer('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.data ?? ''));
            break;
        case 'resolve':
            output = await resolveKey('' + (args?.arguments?.key ?? ''));
            break;
        case 'restart':
            output = await restart('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''));
            break;
        case 'version':
            output = await version('' + (args?.arguments?.url ?? ''));
            break;
    }
    process.stdout.write(JSON.stringify(output, null, 2));
}

await main();
