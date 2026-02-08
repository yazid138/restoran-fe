import { Tabs, Tab, Box, Skeleton } from "@mui/material";
import { useCategories } from "@/hooks/useCategories";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { categories, isLoading } = useCategories();

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string | null,
  ) => {
    onCategoryChange(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs
        value={selectedCategory}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTab-root": {
            fontWeight: "medium",
            textTransform: "capitalize",
            fontSize: "1rem",
          },
        }}
      >
        <Tab value={null} label="Semua" />
        {categories.map((cat) => (
          <Tab key={cat} value={cat} label={cat} />
        ))}
      </Tabs>
    </Box>
  );
}
