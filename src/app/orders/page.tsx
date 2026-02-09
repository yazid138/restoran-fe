"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Alert,
  Pagination,
  Skeleton,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOrders, closeOrder } from "@/hooks/useOrders";
import { Order } from "@/types/order";
import CloseOrderDialog from "@/components/orders/CloseOrderDialog";
import { generateReceipt } from "@/utils/printReceipt";

export default function OrdersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { orders, meta, isLoading, isError, mutate } = useOrders(
    selectedStatus,
    page,
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consider all logged in users as having role, but check specifically for 'kasir'
  // Note: Adjust role check based on actual session structure
  const isCashier =
    session?.user?.role === "kasir" || session?.user?.role === "admin";

  const statusColors = {
    pending: "warning",
    completed: "success",
    cancelled: "error",
  } as const;

  const handleStatusChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setSelectedStatus(newValue);
    setPage(1); // Reset to first page on status change
  };

  const handleViewOrder = (tableId: number) => {
    router.push(`/orders/${tableId}`);
  };

  const handleCloseOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsCloseDialogOpen(true);
  };

  const handleConfirmCloseOrder = async (values: {
    paymentAmount: number;
    paymentMethod: string;
  }) => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      await closeOrder(selectedOrder.id);
      await mutate();
      generateReceipt(selectedOrder, session?.user);
      setIsCloseDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error closing order:", error);
      alert("Gagal menyelesaikan pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 4 }}
          >
            <Skeleton width={300} />
          </Typography>

          <Paper sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
              <Skeleton height={48} width={300} />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {[...Array(6)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Daftar Pesanan
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Gagal memuat data pesanan.
          </Alert>
        )}

        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={selectedStatus}
            onChange={handleStatusChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          >
            <Tab label="Semua" value="all" />
            <Tab label="Aktif" value="open" />
            <Tab label="Selesai" value="closed" />
          </Tabs>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Pesanan</TableCell>
                  <TableCell>Meja</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Tidak ada pesanan ditemukan
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.table.table_name}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {formatPrice(order.total_price)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.toUpperCase()}
                          color={
                            statusColors[
                              order.status as keyof typeof statusColors
                            ] || "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          {/* Waiter/Cashier can view active orders */}
                          {!isCashier && (
                            <IconButton
                              color="primary"
                              onClick={() => handleViewOrder(order.id)}
                              title="Lihat Pesanan"
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          )}

                          {/* Only Cashier can close orders */}
                          {isCashier && order.status === "open" && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleCloseOrderClick(order)}
                            >
                              Selesai
                            </Button>
                          )}

                          {order.status === "closed" && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ReceiptIcon />}
                              onClick={() => generateReceipt(order)}
                            >
                              Cetak
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {meta && meta.last_page > 1 && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={meta.last_page}
                page={meta.current_page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>

        <CloseOrderDialog
          open={isCloseDialogOpen}
          onClose={() => setIsCloseDialogOpen(false)}
          onSubmit={handleConfirmCloseOrder}
          order={selectedOrder}
          isSubmitting={isSubmitting}
        />
      </Container>
    </Box>
  );
}
