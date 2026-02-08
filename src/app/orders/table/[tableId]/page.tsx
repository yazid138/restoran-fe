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
import { useTable } from "@/hooks/useTables";
import { addOrderItems, deleteOrderItem, createOrder } from "@/hooks/useOrders";
import { Food } from "@/types/food";
import MenuItemCard from "@/components/orders/MenuItemCard";
import OrderSummary from "@/components/orders/OrderSummary";
import CategoryFilter from "@/components/orders/CategoryFilter";
import MenuSearch from "@/components/orders/MenuSearch";

export default function TableOrderPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = Number(params.tableId);

  const [page, setPage] = useState(1);
  const {
    foods,
    meta,
    isLoading: isFoodsLoading,
  } = useFoods(undefined, page, 9);
  const {
    table,
    isError,
    isLoading: isTableLoading,
    mutate: mutateTable,
  } = useTable(tableId);

  // Derive active order from table
  const activeOrder = table?.orders?.find((o) => o.status === "open") || null;

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

    if (!activeOrder) return;

    try {
      await deleteOrderItem(activeOrder.id, itemId);
      setNotification({
        open: true,
        message: "Item berhasil dihapus",
        severity: "success",
      });
      mutateTable(); // Refresh table data to update order items
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
      const itemsPayload = cartItems.map((item) => ({
        food_id: item.food.id,
        quantity: item.quantity,
      }));

      if (activeOrder) {
        // Add items to existing order
        await addOrderItems(activeOrder.id, { items: itemsPayload });
        setNotification({
          open: true,
          message: "Pesanan berhasil dikirim ke dapur",
          severity: "success",
        });
        setCartItems([]);
        mutateTable();
      } else {
        // Create new order with items
        const response = await createOrder({
          table_id: tableId,
          items: itemsPayload,
        });

        if (response?.data?.order?.id) {
          router.push(`/orders/${response.data.order.id}`);
          return;
        }
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

  if (isFoodsLoading || isTableLoading) {
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

  if (isError || !table) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Meja tidak ditemukan</Alert>
        <Typography
          sx={{ mt: 2, cursor: "pointer", color: "primary.main" }}
          onClick={() => router.push("/dashboard")}
        >
          Kembali ke Dashboard
        </Typography>
      </Container>
    );
  }

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
              Meja {table.table_name || "-"}
            </Typography>
            <Typography component="div" color="text.secondary">
              Status Order:{" "}
              <Chip
                label={
                  activeOrder ? activeOrder.status.toUpperCase() : "AVAILABLE"
                }
                color={activeOrder ? "success" : "default"}
                size="small"
              />
            </Typography>
          </Box>
          <Box>
            {activeOrder && (
              <Chip
                label={`Order #${activeOrder.id}`}
                color="primary"
                variant="outlined"
              />
            )}
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
                      onAdd={() => handleAddToCart(food)}
                      onRemove={() => handleRemoveFromCart(food.id)}
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
              existingItems={(activeOrder?.order_items || []).map((item) => ({
                id: item.id,
                food_id: item.food_id,
                name: item.food ? item.food.name : `Item #${item.food_id}`,
                quantity: item.quantity,
                price: item.price_at_time,
              }))}
              onRemoveItem={handleRemoveItemCompletely}
              onRemoveExistingItem={handleRemoveExistingItem}
              onSubmit={handleSendToKitchen}
              isSubmitting={isSubmitting}
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
      </Container>
    </Box>
  );
}
