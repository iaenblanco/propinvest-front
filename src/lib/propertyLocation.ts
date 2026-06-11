type MapLocationFields = {
  Direccion?: string | null;
  Ubicacion?: string | null;
  Comuna?: string | null;
  Region?: string | null;
};

/**
 * Builds a Google Maps search query from Strapi location fields synced from KiteProp:
 * - Dirección  → kp.address (form field detail[address])
 * - Comuna     → kp.city (resolved from location_city_id)
 * - Region     → kp.state (resolved from location_city_id)
 */
export function buildMapSearchQuery(fields: MapLocationFields): string | null {
  const direccion = fields.Direccion?.trim() || fields.Ubicacion?.trim() || '';
  const comuna = fields.Comuna?.trim() || '';
  const region = fields.Region?.trim() || '';
  const localityParts = comuna && region && comuna.toLowerCase() === region.toLowerCase()
    ? [comuna]
    : [comuna, region].filter(Boolean);
  const locality = localityParts.join(', ');

  if (direccion && locality) return `${direccion}, ${locality}`;
  if (direccion) return direccion;
  if (locality) return locality;
  return null;
}
