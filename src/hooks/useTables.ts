import useSWR from "swr";
import { Table } from "@/types/table";
import axiosServices from "@/utils/axios";

const fetcher = (url: string) => axiosServices.get(url).then((res) => res.data);

export function useTables() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Table[] }>(
    "/tables",
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    tables: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function updateTableStatus(id: number, status: string) {
  const response = await axiosServices.put(`/tables/${id}`, { status });
  return response.data;
}

export function useTable(id: number | string) {
  const { data, error, isLoading, mutate } = useSWR<{ data: Table }>(
    id ? `/tables/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    table: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}
