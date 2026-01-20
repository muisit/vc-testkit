import Debug from 'debug';
const debug = Debug('quote:json');

import fs from 'fs';

export function quoteFile(data:string)
{
    debug("quoting json content");
    const content = JSON.stringify(JSON.parse(fs.readFileSync(data, 'utf8').toString().trim()));
    const retval = {
        'content': content
    };
    return retval;
}