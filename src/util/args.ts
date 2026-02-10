
export interface Option {
    short ?: string;
    name ?: string;
    hasArg ?: boolean;
    nonOption ?: boolean;
}

export interface Arguments {
    [key:string]: boolean|string|string[];
}

interface ReturnValue {
    arguments:Arguments;
    remainder:string[];
}

export const getArgs = (opts:Option[]) => {
    var currentOpt:Option|null = null;
    var retval:ReturnValue = {remainder:[], arguments: {}};

    process.argv.forEach((v,i) => {
        if (i > 1) {
            //console.log('processing', v, i);
            const argKey = currentOpt?.name ?? i.toString();
            if (currentOpt && currentOpt.hasArg === true) {
                if (retval.arguments[argKey]) {
                    if (Array.isArray(retval.arguments[argKey])) {
                        retval.arguments[argKey].push(v);
                    }
                    else {
                        // convert the argument into a list
                        retval.arguments[argKey] = [retval.arguments[argKey], v];
                    }
                }
                else {
                    retval.arguments[argKey] = v;
                }
                currentOpt = null;
            }
            else {
                if (v[0] != '-') {
                    retval.remainder.push(v);
                }
                else {
                    var wasFound = false;
                    for (const opt of opts) {
                        if (v == ('-' + opt.short) || v == ('--' + opt.name)) {
                            if (opt?.hasArg === true) {
                                currentOpt = opt;
                            }
                            else {
                                retval.arguments['' + opt.name] = true;
                                currentOpt = null;
                            }
                            wasFound = true;
                        }
                    }

                    if (!wasFound) {
                        console.error("Unrecognised option", v);
                    }
                }
            }
        }
    });
    return retval;
}