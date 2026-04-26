"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/shared/Pagination";
import type { PaginationMeta } from "@/lib/pagination";

interface Props {
  pagination: PaginationMeta;
  showingFrom: number;
  showingTo: number;
}

export default function PaginationNav({ pagination, showingFrom, showingTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  }

  return (
    <Pagination
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      hasNextPage={pagination.hasNextPage}
      hasPrevPage={pagination.hasPrevPage}
      onPageChange={handlePageChange}
      showingFrom={showingFrom}
      showingTo={showingTo}
      total={pagination.total}
    />
  );
}
