export const STRAPI_API_URL = 'https://truthful-rhythm-e8bcafa766.strapiapp.com/api';

type StrapiParamValue = string | number | boolean | null | undefined;
type StrapiParams = Record<string, StrapiParamValue>;

type StrapiPagination = {
  page?: number;
  pageSize?: number;
  pageCount?: number;
  total?: number;
};

type StrapiResponse<T> = {
  data?: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

export function buildStrapiUrl(path: string, params: StrapiParams = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${STRAPI_API_URL}${normalizedPath}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  return url;
}

export async function fetchAllPropiedades<T = any>(params: StrapiParams = {}) {
  const pageSize = Number(params['pagination[pageSize]'] ?? 100);
  const baseParams = {
    ...params,
    'pagination[pageSize]': pageSize,
  };

  let page = 1;
  let pageCount = 1;
  let total = 0;
  const propiedades: T[] = [];

  do {
    const url = buildStrapiUrl('/propiedads', {
      ...baseParams,
      'pagination[page]': page,
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`[strapi] Error fetching propiedades: ${response.status} ${response.statusText} (${url.toString()})`);
    }

    const json = (await response.json()) as StrapiResponse<T>;
    const data = Array.isArray(json.data) ? json.data : [];
    propiedades.push(...data);

    const pagination = json.meta?.pagination;
    total = pagination?.total ?? propiedades.length;
    pageCount = pagination?.pageCount ?? 1;
    page = (pagination?.page ?? page) + 1;
  } while (page <= pageCount);

  console.log(`[strapi] fetched ${propiedades.length}/${total || propiedades.length} propiedades`);

  return propiedades;
}
