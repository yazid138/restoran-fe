import useSWR from "swr";
import { Order, CreateOrderPayload, AddItemsPayload } from "@/types/order";
import axiosServices from "@/utils/axios";

const fetcher = (url: string) => axiosServices.get(url).then((res) => res.data);

export interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export function useOrders(status?: string, page = 1, limit = 10) {
  const queryParams = new URLSearchParams();
  if (status && status !== "all") queryParams.append("status", status);
  queryParams.append("page", page.toString());
  queryParams.append("per_page", limit.toString());

  const url = `/orders?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: OrdersResponse }>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    orders: data?.data?.data || [],
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

export function useOrder(id: number | string) {
  const { data, error, isLoading, mutate } = useSWR<{ data: Order }>(
    id ? `/orders/${id}` : null,
    fetcher,
  );

  return {
    order: data?.data,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await axiosServices.post("/orders", payload);
  return response.data;
}

export async function addOrderItems(orderId: number, payload: AddItemsPayload) {
  const response = await axiosServices.post(
    `/orders/${orderId}/items`,
    payload,
  );
  return response.data;
}

export async function closeOrder(orderId: number) {
  const response = await axiosServices.post(`/orders/${orderId}/close`);
  return response.data;
}

export async function deleteOrderItem(orderId: number, itemId: number) {
  const response = await axiosServices.delete(
    `/orders/${orderId}/items/${itemId}`,
  );
  return response.data;
}
