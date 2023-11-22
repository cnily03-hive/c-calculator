export function copyJSON(obj) {
    if (typeof obj !== "object" || obj === null) {
        if (Array.isArray(obj)) return Array.from(obj);
        else return obj;
    }
    const copy = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            Object.defineProperty(copy, key, {
                value: copyJSON(obj[key]),
                enumerable: true,
                writable: true,
                configurable: true
            });
        }
    }
    return copy;
}