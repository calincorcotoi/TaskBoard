export function filterEmptyValues(params: Record<string, unknown>) {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            filtered[key] = value;
        }
    }
    return filtered;
}
