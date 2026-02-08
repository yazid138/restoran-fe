import { Food } from "@/types/food";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface MenuItemCardProps {
  food: Food;
  quantity: number;
  onAdd?: () => void;
  onRemove?: () => void;
}

export default function MenuItemCard({
  food,
  quantity,
  onAdd,
  onRemove,
}: MenuItemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className="transition-all duration-300 hover:shadow-xl"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={
          food.image || "https://via.placeholder.com/400x300?text=No+Image"
        }
        alt={food.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h6"
          component="div"
          fontWeight="bold"
          gutterBottom
          sx={{ minHeight: "3rem" }}
        >
          {food.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, textTransform: "capitalize" }}
        >
          {food.category}
        </Typography>

        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          sx={{ mb: 2 }}
        >
          {formatPrice(food.price)}
        </Typography>

        {onAdd && quantity === 0 ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<Add />}
            onClick={onAdd}
            sx={{ mt: "auto" }}
          >
            Tambah
          </Button>
        ) : (
          onRemove &&
          onAdd && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: "auto",
              }}
            >
              <IconButton
                color="error"
                onClick={onRemove}
                sx={{
                  border: 1,
                  borderColor: "error.main",
                }}
              >
                <Remove />
              </IconButton>
              <Typography variant="h6" fontWeight="bold">
                {quantity}
              </Typography>
              <IconButton
                color="primary"
                onClick={onAdd}
                sx={{
                  border: 1,
                  borderColor: "primary.main",
                }}
              >
                <Add />
              </IconButton>
            </Box>
          )
        )}
      </CardContent>
    </Card>
  );
}
