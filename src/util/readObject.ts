import fs from 'fs';

export function readObject(content:any) {
    if (typeof(content) != 'string') {
        return content;
    }
    if (fs.existsSync(content)) {
        try {
            return JSON.parse(fs.readFileSync(content, 'utf8').toString().trim());
        }
        catch {
            // fallback: content IS a file, but its content is not a JSON
            return fs.readFileSync(content, 'utf8').toString().trim();
        }
    }
    try {
        return JSON.parse(content);
    }
    catch {}

    return content;
}