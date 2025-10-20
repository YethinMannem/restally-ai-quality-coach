type JSONSchema = any;

function isPrimitiveTypeMatch(value: unknown, type: string): boolean {
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number';
  if (type === 'string') return typeof value === 'string';
  if (type === 'boolean') return typeof value === 'boolean';
  return true; // lenient for unhandled types
}

export function validateAgainstSchema(
  schema: JSONSchema,
  data: any
): { ok: boolean; message?: string } {
  if (!schema) return { ok: true };

  if (schema.type === 'array') {
    if (!Array.isArray(data)) return { ok: false, message: 'Expected array' };
    if (schema.items) {
      for (let i = 0; i < Math.min(3, data.length); i++) {
        const res = validateAgainstSchema(schema.items, data[i]);
        if (!res.ok) return { ok: false, message: `items[${i}]: ${res.message}` };
      }
    }
    return { ok: true };
  }

  if (schema.type === 'object') {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, message: 'Expected object' };
    }
    const required: string[] = schema.required ?? [];
    for (const key of required) {
      if (!(key in data)) return { ok: false, message: `Missing required property "${key}"` };
    }
    const props = schema.properties ?? {};
    for (const key of Object.keys(props)) {
      if (key in data && props[key]?.type) {
        const ok = isPrimitiveTypeMatch((data as any)[key], props[key].type);
        if (!ok) return { ok: false, message: `Property "${key}" has wrong type` };
      }
    }
    return { ok: true };
  }

  if (schema.type && !isPrimitiveTypeMatch(data, schema.type)) {
    return { ok: false, message: `Expected type ${schema.type}` };
  }

  return { ok: true };
}
