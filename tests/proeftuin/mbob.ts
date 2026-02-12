import {config as dotenvConfig} from "dotenv-flow";
dotenvConfig();

import { createKey } from '../../src/identifiers/createKey';
const key = await createKey('Secp256r1');
