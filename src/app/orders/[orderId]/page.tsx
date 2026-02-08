"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Grid,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Chip,
  Pagination,
  Skeleton,
} from "@mui/material";
import { useFoods } from "@/hooks/useFoods";
import {
  useOrder,
  addOrderItems,
  deleteOrderItem,
  closeOrder,
} from "@/hooks/useOrders";
import { useSession } from "next-auth/react";
import CloseOrderDialog from "@/components/orders/CloseOrderDialog";
import { generateReceipt } from "@/utils/printReceipt";
import { Food } from "@/types/food";
import MenuItemCard from "@/components/orders/MenuItemCard";
import OrderSummary from "@/components/orders/OrderSummary";
import CategoryFilter from "@/components/orders/CategoryFilter";
import MenuSearch from "@/components/orders/MenuSearch";
import { useTables } from "@/hooks/useTables";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orderId = Number(params.orderId);
  const { mutate: mutateTable } = useTables();

  const [page, setPage] = useState(1);
  const {
    foods,
    meta,
    isLoading: isFoodsLoading,
  } = useFoods(undefined, page, 9);
  const {
    order,
    isError,
    isLoading: isOrderLoading,
    mutate: mutateOrder,
  } = useOrder(orderId);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<
    { food: Food; quantity: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  // Filter menu items
  const filteredFoods = useMemo(() => {
    if (!Array.isArray(foods)) return [];
    return foods.filter((food) => {
      const matchesCategory =
        selectedCategory === null || food.category === selectedCategory;
      const matchesSearch = food.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [foods, selectedCategory, searchQuery]);

  const handleAddToCart = (food: Food) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (foodId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.food.id === foodId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.food.id === foodId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
      }
      return prev.filter((item) => item.food.id !== foodId);
    });
  };

  const handleRemoveItemCompletely = (foodId: number) => {
    setCartItems((prev) => prev.filter((item) => item.food.id !== foodId));
  };

  const handleRemoveExistingItem = async (itemId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini dari pesanan?"))
      return;

    try {
      await deleteOrderItem(orderId, itemId);
      setNotification({
        open: true,
        message: "Item berhasil dihapus",
        severity: "success",
      });
      mutateOrder(); // Refresh order data
    } catch (error) {
      console.error("Error deleting item:", error);
      setNotification({
        open: true,
        message: "Gagal menghapus item",
        severity: "error",
      });
    }
  };

  const handleSendToKitchen = async () => {
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    try {
      if (orderId) {
        // Add items to order
        const itemsPayload = {
          items: cartItems.map((item) => ({
            food_id: item.food.id,
            quantity: item.quantity,
          })),
        };

        await addOrderItems(orderId, itemsPayload);

        setNotification({
          open: true,
          message: "Pesanan berhasil dikirim ke dapur",
          severity: "success",
        });

        setCartItems([]);
        mutateOrder();

        // Optional: redirect to dashboard or stay
        // router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setNotification({
        open: true,
        message: "Gagal mengirim pesanan",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCashier =
    session?.user?.role === "kasir" || session?.user?.role === "admin";

  const handleCloseOrderClick = () => {
    setIsCloseDialogOpen(true);
  };

  const handleConfirmCloseOrder = async (values: {
    paymentAmount: number;
    paymentMethod: string;
  }) => {
    setIsSubmitting(true);
    try {
      await closeOrder(orderId);

      setNotification({
        open: true,
        message: "Pesanan berhasil diselesaikan",
        severity: "success",
      });

      if (order) generateReceipt(order, session?.user);

      await Promise.all([mutateTable(), mutateOrder()]);
      setIsCloseDialogOpen(false);
    } catch (error) {
      console.error("Error closing order:", error);
      setNotification({
        open: true,
        message: "Gagal menyelesaikan pesanan",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFoodsLoading || isOrderLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="xl">
          <Paper
            sx={{
              p: 3,
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={24} />
            </Box>
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ borderRadius: 16 }}
            />
          </Paper>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ mb: 4 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={60}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              <Grid container spacing={3}>
                {[...Array(6)].map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={400}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Pesanan tidak ditemukan</Alert>
        <Typography
          sx={{ mt: 2, cursor: "pointer", color: "primary.main" }}
          onClick={() => router.push("/orders")}
        >
          Kembali ke Daftar Pesanan
        </Typography>
      </Container>
    );
  }

  const table = order.table;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Meja {table?.table_name || "-"}
            </Typography>
            <Typography component="div" color="text.secondary">
              Status Order:{" "}
              <Chip
                label={order.status.toUpperCase()}
                color={order.status === "open" ? "success" : "default"}
                size="small"
              />
            </Typography>
          </Box>
          <Box>
            <Chip
              label={`Order #${order.id}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* Left Panel: Menu */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MenuSearch onSearch={setSearchQuery} />
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={3}>
              {filteredFoods.map((food) => {
                const cartItem = cartItems.find(
                  (item) => item.food.id === food.id,
                );
                return (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={food.id}>
                    <MenuItemCard
                      food={food}
                      quantity={cartItem?.quantity || 0}
                      onAdd={
                        !isCashier ? () => handleAddToCart(food) : undefined
                      }
                      onRemove={
                        !isCashier
                          ? () => handleRemoveFromCart(food.id)
                          : undefined
                      }
                    />
                  </Grid>
                );
              })}
            </Grid>

            {meta && meta.last_page > 1 && (
              <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={meta.last_page}
                  page={meta.current_page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Grid>

          {/* Right Panel: Order Summary */}
          <Grid size={{ xs: 12, md: 4 }}>
            <OrderSummary
              items={cartItems.map((item) => ({
                id: item.food.id,
                food_id: item.food.id,
                name: item.food.name,
                quantity: item.quantity,
                price: item.food.price,
              }))}
              existingItems={order.order_items.map((item) => ({
                id: item.id,
                food_id: item.food_id,
                name: item.food ? item.food.name : `Item #${item.food_id}`,
                quantity: item.quantity,
                price: item.price_at_time,
              }))}
              onRemoveItem={handleRemoveItemCompletely}
              onRemoveExistingItem={
                !isCashier ? handleRemoveExistingItem : undefined
              }
              onSubmit={!isCashier ? handleSendToKitchen : undefined}
              isSubmitting={isSubmitting}
              onCloseOrder={
                isCashier && order.status === "open"
                  ? handleCloseOrderClick
                  : undefined
              }
            />
          </Grid>
        </Grid>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        <CloseOrderDialog
          open={isCloseDialogOpen}
          onClose={() => setIsCloseDialogOpen(false)}
          onSubmit={handleConfirmCloseOrder}
          order={order}
          isSubmitting={isSubmitting}
        />
      </Container>
    </Box>
  );
}
