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