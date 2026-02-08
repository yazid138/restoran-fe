import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";
import { Food, FoodCategory } from "@/types/food";

interface FoodFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Food;
  isSubmitting: boolean;
  categories: string[];
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Nama minimal 3 karakter")
    .required("Nama wajib diisi"),
  category: Yup.string().required("Kategori wajib dipilih"),
  price: Yup.number()
    .min(0, "Harga harus lebih dari 0")
    .required("Harga wajib diisi"),
  image: Yup.string().url("Format URL tidak valid").optional(),
});

export default function FoodForm({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting,
  categories,
}: FoodFormProps) {
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || "",
      category: initialValues?.category || ("" as FoodCategory),
      price: initialValues?.price || 0,
      image: initialValues?.image || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues ? "Edit Makanan" : "Tambah Makanan Baru"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nama Makanan"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isSubmitting}
            />

            <TextField
              fullWidth
              select
              id="category"
              name="category"
              label="Kategori"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
              disabled={isSubmitting}
            >
              {(categories || []).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="price"
              name="price"
              label="Harga"
              type="number"
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
              disabled={isSubmitting}
            />

            <TextField
              fullWidth
              id="image"
              name="image"
              label="URL Gambar (Opsional)"
              value={formik.values.image}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.image && Boolean(formik.errors.image)}
              helperText={formik.touched.image && formik.errors.image}
              disabled={isSubmitting}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
