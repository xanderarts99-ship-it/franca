export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function getPaginationParams(
  searchParams: Record<string, string | undefined>,
  defaultLimit = 10
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.limit ?? String(defaultLimit)))
  );
  return { page, limit };
}

export function getPaginationMeta(
  total: number,
  params: PaginationParams
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
}

export function getPrismaSkip(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}
