"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useFoods, createFood, updateFood, deleteFood } from "@/hooks/useFoods";
import { Food, CreateFoodPayload, UpdateFoodPayload } from "@/types/food";
import { useCategories } from "@/hooks/useCategories";
import FoodList from "@/components/foods/FoodList";
import FoodForm from "@/components/foods/FoodForm";
import { useSession } from "next-auth/react";

export default function FoodsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "tamu";
  const canManage = userRole === "admin" || userRole === "pelayan";

  const [pageState, setPageState] = useState<Record<string, number>>({});
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const currentPage = pageState[selectedCategory] || 1;
  const { foods, meta, isLoading, isError, mutate } = useFoods(
    selectedCategory,
    currentPage,
    12,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | undefined>(undefined);
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

  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setSelectedCategory(newValue);
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesCategory =
        selectedCategory === "all" ||
        food.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = food.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [foods, selectedCategory, searchQuery]);

  const handleAddClick = () => {
    setEditingFood(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (food: Food) => {
    setEditingFood(food);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFood(undefined);
  };

  const handleFormSubmit = async (
    values: CreateFoodPayload | UpdateFoodPayload,
  ) => {
    setIsSubmitting(true);
    try {
      if (editingFood) {
        await updateFood(editingFood.id, values as UpdateFoodPayload);
        setNotification({
          open: true,
          message: "Makanan berhasil diperbarui",
          severity: "success",
        });
      } else {
        await createFood(values as CreateFoodPayload);
        setNotification({
          open: true,
          message: "Makanan berhasil ditambahkan",
          severity: "success",
        });
      }
      mutate(); // Refresh validation
      handleFormClose();
    } catch (error) {
      console.error("Error saving food:", error);
      setNotification({
        open: true,
        message: "Gagal menyimpan data makanan",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFood(id);
      setNotification({
        open: true,
        message: "Makanan berhasil dihapus",
        severity: "success",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting food:", error);
      setNotification({
        open: true,
        message: "Gagal menghapus data makanan",
        severity: "error",
      });
    }
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Master Makanan
          </Typography>
          {canManage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Tambah Makanan
            </Button>
          )}
        </Box>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Gagal memuat data makanan. Silakan coba lagi.
          </Alert>
        )}

        <Paper sx={{ mb: 4, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ flexGrow: 1 }}
            >
              <Tab label="Semua" value="all" />
              {categories.map((cat) => (
                <Tab
                  key={cat}
                  label={cat}
                  value={cat}
                  sx={{ textTransform: "capitalize" }}
                />
              ))}
            </Tabs>

            <TextField
              size="small"
              placeholder="Cari makanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>
        </Paper>

        <FoodList
          foods={filteredFoods}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          isLoading={isLoading}
          meta={meta}
          onPageChange={(newPage) =>
            setPageState((prev) => ({ ...prev, [selectedCategory]: newPage }))
          }
          canManage={canManage}
        />

        <FoodForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialValues={editingFood}
          isSubmitting={isSubmitting}
          categories={categories || []}
        />

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleNotificationClose}
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
