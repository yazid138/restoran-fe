"use client";

import { useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  Skeleton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Food } from "@/types/food";

interface FoodListProps {
  foods: Food[];
  onEdit: (food: Food) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  onPageChange?: (page: number) => void;
  canManage?: boolean;
}

export default function FoodList({
  foods,
  onEdit,
  onDelete,
  isLoading,
  meta,
  onPageChange,
  canManage = false,
}: FoodListProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedFoodId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFoodId) {
      onDelete(selectedFoodId);
      setDeleteConfirmOpen(false);
      setSelectedFoodId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Skeleton variant="rectangular" height={200} animation="wave" />
              <CardContent sx={{ flexGrow: 1 }}>
                <Skeleton
                  variant="text"
                  height={32}
                  width="80%"
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" height={24} width="40%" />
                <Skeleton
                  variant="text"
                  height={32}
                  width="60%"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (foods.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info" variant="outlined">
          Belum ada data makanan. Silakan tambahkan makanan baru.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {foods.map((food) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={food.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={
                  food.image || "https://placehold.co/600x400?text=No+Image"
                }
                alt={food.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography gutterBottom variant="h6" component="div">
                    {food.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      textTransform: "capitalize",
                    }}
                  >
                    {food.category}
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {formatPrice(food.price)}
                </Typography>
              </CardContent>
              {canManage && (
                <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(food)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(food.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {meta && meta.last_page > 1 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={meta.last_page}
            page={meta.current_page}
            onChange={(_, page) => onPageChange?.(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus makanan ini? Tindakan ini tidak
            dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
