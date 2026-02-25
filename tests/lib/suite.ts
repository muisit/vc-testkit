export function suiteContains(key:string)
{
    const suites = (process.env.SUITES ?? "proeftuin").split(',').map((i) => i.trim());
    return suites.includes(key);
}

export function testDisabled(key:string)
{
    if (process.env[key] && typeof(process.env[key]) == 'string') {
        return false;
    }
    return true;
}

export function featureEnabled(key:string)
{
    const features = (process.env.FEATURES ?? "").split(',').map((i) => i.trim());
    return features.includes(key);
}