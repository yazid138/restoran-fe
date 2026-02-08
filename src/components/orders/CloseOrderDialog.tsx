import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  MenuItem,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Order } from "@/types/order";
import OrderSummary from "./OrderSummary";

interface CloseOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { paymentAmount: number; paymentMethod: string }) => void;
  order: Order | null;
  isSubmitting: boolean;
}

const validationSchema = Yup.object().shape({
  paymentAmount: Yup.number()
    .min(0, "Jumlah pembayaran tidak valid")
    .required("Jumlah pembayaran wajib diisi")
    .test(
      "is-sufficient",
      "Pembayaran kurang dari total tagihan",
      function (value) {
        const { total_price } = this.parent;
        return value >= total_price;
      },
    ),
  paymentMethod: Yup.string().required("Metode pembayaran wajib dipilih"),
});

export default function CloseOrderDialog({
  open,
  onClose,
  onSubmit,
  order,
  isSubmitting,
}: CloseOrderDialogProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formik = useFormik({
    initialValues: {
      paymentAmount: 0,
      paymentMethod: "cash",
      total_price: order?.total_price || 0,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({
        paymentAmount: values.paymentAmount,
        paymentMethod: values.paymentMethod,
      });
    },
  });

  if (!order) return null;

  const change = Math.max(0, formik.values.paymentAmount - order.total_price);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleQuickAmount = (amount: number) => {
    formik.setFieldValue("paymentAmount", amount);
  };

  const suggestions = [
    { label: "Uang Pas", value: order.total_price },
    { label: "50.000", value: 50000 },
    { label: "100.000", value: 100000 },
    { label: "200.000", value: 200000 },
  ].filter((s) => s.value >= order.total_price || s.label === "Uang Pas");

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: 1, borderColor: "divider" }}>
        Selesaikan Pesanan #{order.id}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ p: 0 }}>
          <Grid container>
            {/* Left Column: Order Summary */}
            <Grid size={{xs: 12, md: 6}} sx={{ bgcolor: "grey.50", p: 3, borderRight: 1, borderColor: "divider" }}>
              <OrderSummary
                items={[]} 
                existingItems={order.order_items.map((item) => ({
                  id: item.id,
                  food_id: item.food_id,
                  name: item.food ? item.food.name : `Item #${item.food_id}`,
                  quantity: item.quantity,
                  price: item.price_at_time,
                }))}
                onRemoveItem={() => {}} 
                isSubmitting={false}
              />
            </Grid>

            {/* Right Column: Payment Form */}
            <Grid size={{xs: 12, md: 6}} sx={{ p: 3, display: "flex", flexDirection: "column" }}>
               <Typography variant="h6" gutterBottom fontWeight="bold">
                  Pembayaran
               </Typography>
               
               {/* <Box sx={{ mb: 4, textAlign: "center", py: 2, bgcolor: "primary.light", borderRadius: 2, color: "primary.contrastText" }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Tagihan</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatPrice(order.total_price)}
                  </Typography>
               </Box> */}

              <TextField
                fullWidth
                select
                id="paymentMethod"
                name="paymentMethod"
                label="Metode Pembayaran"
                value={formik.values.paymentMethod}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
                helperText={formik.touched.paymentMethod && formik.errors.paymentMethod}
                sx={{ mb: 3 }}
              >
                <MenuItem value="cash">Tunai</MenuItem>
                <MenuItem value="qris">QRIS</MenuItem>
                <MenuItem value="debit">Debit Card</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
              </TextField>

              <TextField
                fullWidth
                id="paymentAmount"
                name="paymentAmount"
                label="Jumlah Diterima"
                type="number"
                value={formik.values.paymentAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
                helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rp</Typography>
                }}
              />

              <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }} useFlexGap>
                {suggestions.map((s) => (
                    <Chip 
                        key={s.label} 
                        label={s.label} 
                        onClick={() => handleQuickAmount(s.value)} 
                        clickable 
                        color={formik.values.paymentAmount === s.value ? "primary" : "default"}
                        variant={formik.values.paymentAmount === s.value ? "filled" : "outlined"}
                    />
                ))}
              </Stack>
              
              <Box sx={{ mt: "auto" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    <Typography variant="h6">Kembalian</Typography>
                    <Typography variant="h6" color={change < 0 ? "error" : "success.main"} fontWeight="bold">
                      {formatPrice(Math.max(0, change))}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                       <Button onClick={handleClose} disabled={isSubmitting} fullWidth variant="outlined" size="large">
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        fullWidth
                      >
                        Bayar
                      </Button>
                  </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </form>
    </Dialog>
  );
}
