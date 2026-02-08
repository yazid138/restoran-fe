import useSWR from "swr";
import axiosServices from "@/utils/axios";

const fetcher = (url: string) => axiosServices.get(url).then((res) => res.data);

export function useCategories() {
  const { data, error, isLoading } = useSWR<{ data: string[] }>(
    "/categories",
    fetcher,
    {
      revalidateOnFocus: false, // Categories don't change often
      revalidateOnReconnect: false,
    },
  );

  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
  };
}
