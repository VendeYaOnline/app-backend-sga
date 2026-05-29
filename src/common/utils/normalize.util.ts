export function normalizeString(
  value: string | null | undefined,
): string | null | undefined {
  if (value == null) return value;
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function normalizeDto<T extends Record<string, any>>(dto: T): T {
  const normalized: any = {};
  for (const [key, val] of Object.entries(dto)) {
    if (typeof val === 'string') {
      normalized[key] = normalizeString(val);
    } else if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      normalized[key] = normalizeDto(val);
    } else if (Array.isArray(val)) {
      normalized[key] = val.map((item: any) =>
        typeof item === 'string' ? normalizeString(item) : item,
      );
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
}
