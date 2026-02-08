import useSWR from "swr";
import { Food, CreateFoodPayload, UpdateFoodPayload } from "@/types/food";
import axiosServices from "@/utils/axios";

const fetcher = (url: string) => axiosServices.get(url).then((res) => res.data);

export interface FoodsResponse {
  data: Food[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export function useFoods(category?: string, page = 1, limit = 10) {
  const queryParams = new URLSearchParams();
  if (category && category !== "all") queryParams.append("category", category);
  queryParams.append("page", page.toString());
  queryParams.append("per_page", limit.toString());

  const url = `/foods?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: FoodsResponse }>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    foods: data?.data?.data || [],
    meta: {
      current_page: data?.data?.current_page || 1,
      last_page: data?.data?.last_page || 1,
      total: data?.data?.total || 0,
      per_page: data?.data?.per_page || limit,
    },
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFood(id: number | string) {
  const { data, error, isLoading, mutate } = useSWR<{ data: Food }>(
    id ? `/foods/${id}` : null,
    fetcher,
  );

  return {
    food: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function createFood(payload: CreateFoodPayload) {
  const response = await axiosServices.post("/foods", payload);
  return response.data;
}

export async function updateFood(id: number, payload: UpdateFoodPayload) {
  const response = await axiosServices.put(`/foods/${id}`, payload);
  return response.data;
}

export async function deleteFood(id: number) {
  const response = await axiosServices.delete(`/foods/${id}`);
  return response.data;
}
