import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import { Delete, Print, CheckCircle } from "@mui/icons-material";
import { useTables } from "@/hooks/useTables";

interface OrderItem {
  id: number;
  food_id: number;
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  onRemoveItem: (foodId: number) => void;
  onSubmit?: () => void;
  isSubmitting: boolean;
  onCloseOrder?: () => void;
  onPrintReceipt?: () => void;
}

export default function OrderSummary({
  items,
  existingItems = [],
  onRemoveItem,
  onRemoveExistingItem,
  onSubmit,
  isSubmitting,
  onCloseOrder,
  onPrintReceipt,
}: OrderSummaryProps & {
  existingItems?: OrderItem[];
  onRemoveExistingItem?: (itemId: number) => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const newItemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const existingItemsTotal = existingItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = newItemsTotal + existingItemsTotal;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        position: "sticky",
        top: 20,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Ringkasan Pesanan
      </Typography>

      <Divider sx={{ my: 2 }} />

      <List sx={{ maxHeight: 400, overflow: "auto" }}>
        {/* Existing Items Section */}
        {existingItems.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1, px: 2 }}
            >
              Sudah Dipesan
            </Typography>
            {existingItems.map((item) => (
              <ListItem
                key={`existing-${item.id}-${item.price}`} // Unique key fix
                sx={{
                  px: 0,
                  bgcolor: "action.selected",
                  borderRadius: 1,
                  mb: 1,
                }}
                secondaryAction={
                  onRemoveExistingItem && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => onRemoveExistingItem(item.id)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                  secondaryTypographyProps={{ component: "div" }}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} x {formatPrice(item.price)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* New Items Section */}
        {items.length > 0 && (
          <>
            {existingItems.length > 0 && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, px: 2 }}
              >
                Baru Ditambah
              </Typography>
            )}
            {items.map((item) => (
              <ListItem
                key={item.food_id}
                sx={{
                  px: 0,
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onRemoveItem(item.food_id)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                  secondaryTypographyProps={{ component: "div" }}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} x {formatPrice(item.price)}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </>
        )}

        {items.length === 0 && existingItems.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>
            Belum ada item dalam pesanan
          </Typography>
        )}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Total:
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            {formatPrice(total)}
          </Typography>
        </Box>
      </Box>

      {onSubmit && (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={onSubmit}
          disabled={isSubmitting || items.length === 0}
          sx={{ borderRadius: 2 }}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSubmitting ? "Memproses..." : "Kirim ke Dapur"}
        </Button>
      )}

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        {onPrintReceipt && (
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={onPrintReceipt}
            startIcon={<Print />}
            sx={{ borderRadius: 2 }}
          >
            Cetak
          </Button>
        )}

        {onCloseOrder && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            size="large"
            onClick={onCloseOrder}
            disabled={isSubmitting}
            startIcon={<CheckCircle />}
            sx={{ borderRadius: 2 }}
          >
            Selesai
          </Button>
        )}
      </Box>
    </Paper>
  );
}
