"use client";

import { useState } from "react";
import { Table } from "@/types/table";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateTableStatus } from "@/hooks/useTables";
import { useSWRConfig } from "swr";

interface TableCardProps {
  table: Table;
}

const statusColors = {
  available: "success",
  occupied: "error",
  reserved: "warning",
  inactive: "default",
} as const;

const statusLabels = {
  available: "Tersedia",
  occupied: "Terisi",
  reserved: "Reserved",
  inactive: "Tidak Aktif",
} as const;

export default function TableCard({ table }: TableCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { mutate } = useSWRConfig();
  const userRole = session?.user?.role;
  const isCashier = userRole === "kasir";
  const canManage = userRole === "admin" || userRole === "pelayan";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const activeOrder = table.orders?.find((o) => o.status === "open");

  const handleClick = () => {
    if (activeOrder) {
      router.push(`/orders/${activeOrder.id}`);
    } else {
      // Cashier cannot create new orders
      if (isCashier) return;
      router.push(`/orders/table/${table.id}`);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent card click
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateTableStatus(table.id, status);
      mutate("/tables"); // Refresh tables
      handleClose();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Gagal mengubah status meja");
    }
  };

  const isClickable = !isCashier || !!activeOrder;

  return (
    <Card
      className={`
        transition-all duration-300 hover:shadow-xl
        ${isClickable ? "cursor-pointer hover:scale-105" : "opacity-75 cursor-not-allowed"}
      `}
      onClick={isClickable ? handleClick : undefined}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: !isClickable ? "action.hover" : "background.paper",
        position: "relative",
      }}
    >
      {canManage && (
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            aria-label="settings"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              onClick={() => handleStatusUpdate("reserved")}
              disabled={
                table.status === "reserved" || table.status === "occupied"
              }
            >
              Set Reserved
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusUpdate("inactive")}
              disabled={
                table.status === "inactive" || table.status === "occupied"
              }
            >
              Set Nonaktif
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusUpdate("available")}
              disabled={
                table.status === "available" || table.status === "occupied"
              }
            >
              Set Tersedia
            </MenuItem>
          </Menu>
        </Box>
      )}

      <CardContent
        sx={{ flexGrow: 1, textAlign: "center", mt: canManage ? 2 : 0 }}
      >
        <Typography variant="h5" component="div" fontWeight="bold" gutterBottom>
          Meja {table.table_name}
        </Typography>

        <Box sx={{ my: 2 }}>
          <Chip
            label={statusLabels[table.status]}
            color={statusColors[table.status]}
            size="medium"
            sx={{ fontWeight: "medium" }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Kapasitas: {table.capacity} orang
        </Typography>
      </CardContent>
    </Card>
  );
}
