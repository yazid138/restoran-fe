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
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Order } from "@/types/order";

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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Selesaikan Pesanan #{order.id}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ringkasan Tagihan
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography>Total Pesanan</Typography>
              <Typography fontWeight="bold">
                {formatPrice(order.total_price)}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>

          <TextField
            fullWidth
            select
            id="paymentMethod"
            name="paymentMethod"
            label="Metode Pembayaran"
            value={formik.values.paymentMethod}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.paymentMethod &&
              Boolean(formik.errors.paymentMethod)
            }
            helperText={
              formik.touched.paymentMethod && formik.errors.paymentMethod
            }
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
            error={
              formik.touched.paymentAmount &&
              Boolean(formik.errors.paymentAmount)
            }
            helperText={
              formik.touched.paymentAmount && formik.errors.paymentAmount
            }
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "grey.100",
              borderRadius: 1,
            }}
          >
            <Typography variant="h6">Kembalian</Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatPrice(change)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Bayar & Cetak Struk" : "Bayar & Cetak Struk"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
