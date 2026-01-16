import Debug from 'debug';
const debug = Debug("main:main");

import { registerAS } from "./as/registerAS";
import { createKey } from "./identifiers/createKey";
import { expandToken } from "./jwt/expandToken";
import { parse_request } from "./openid4vp/parse_request";
import { registerIssuer } from './issuer/registerIssuer';
import { registerIdentifier } from "./identifiers/registerIdentifier";
import { deleteIdentifier } from './identifiers/deleteIdentifier';
import { getArgs } from "./util/args";
import { listIdentifiers } from './identifiers/listIdentifiers';
import { deleteCredential } from './credential/deleteCredential';
import { listCredentials } from './credential/listCredential';
import { registerCredential } from './credential/registerCredential';
import { deleteIssuer } from './issuer/deleteIssuer';
import { listIssuers } from './issuer/listIssuers';

function printHelp()
{
  console.log('EduWallet Test Toolkit');
  console.log('');
  console.log('Usage: yarn run <command> [<arguments>]');
  console.log('');
  console.log('Commands:');
  console.log('  create:key [-t <type>]                                   - create and output a new key of the indicated type');
  console.log('  delete:credential -i <identifier> -u <url> -s <secret>   - remove the given credential using the Management API');
  console.log('  delete:identifier -i <identifier> -u <url> -s <secret>   - remove the given identifier using the Management API');
  console.log('  delete:issuer -i <identifier> -u <url> -s <secret>       - remove the given issuer using the Management API');
  console.log('  expand -d <data file>                                    - read a JWT token and expand it to a JSON structure');
  console.log('  list:credential -u <url> -s <secret>                     - list credentials using the Management API');
  console.log('  list:identifier -u <url> -s <secret>                     - list identifiers using the Management API');
  console.log('  list:issuer -u <url> -s <secret>                         - list issuers using the Management API');
  console.log('  parse:authrequest -d <data file>                         - parse the authorization request using @openid4vc/openid4vp');
  console.log('  register:as -d <data file> -u <url> -s <secret>          - register an AS on the eduID proxy AS');
  console.log('  register:credential -d <data file> -u <url> -s <secret>  - register a new credential on the Management API');
  console.log('  register:identifier -d <data file> -u <url> -s <secret>  - register a new identifier on the Management API');
  console.log('  register:issuer -d <data file> -u <url> -s <secret>      - register a new issuer on the Management API');
}

async function main()
{
    const args = getArgs([{
        name: "data",
        short: "d",
        hasArg: true
      },{
        name: "type",
        short: "t",
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
        name: "url",
        short: "u",
        hasArg: true
      },{
        name: "secret",
        short: "s",
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
        case 'delete:credential':
            output = await deleteCredential('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.identifier ?? ''));
            break;
        case 'delete:identifier':
            output = await deleteIdentifier('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.identifier ?? ''));
            break;
        case 'delete:issuer':
            output = await deleteIssuer('' + (args?.arguments?.url ?? ''), '' + (args?.arguments?.secret ?? ''), '' + (args?.arguments?.identifier ?? ''));
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
        case 'expand':
            output = await expandToken('' + (args.arguments?.data ?? ''));
            break;
        case 'parse:authrequest':
            output = await parse_request('' + (args.arguments?.data ?? ''));
            break;
    }
    process.stdout.write(JSON.stringify(output, null, 2));
}

await main();
