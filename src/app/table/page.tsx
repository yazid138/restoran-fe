"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  Skeleton,
} from "@mui/material";
import { useTables } from "@/hooks/useTables";
import { TableStats as TableStatsType } from "@/types/table";
import TableCard from "@/components/table/TableCard";
import TableStats from "@/components/table/TableStats";
import TableSearch from "@/components/table/TableSearch";

export default function DashboardPage() {
  const { tables, isLoading, isError } = useTables();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate statistics
  const stats: TableStatsType = useMemo(() => {
    const available = tables.filter((t) => t.status === "available").length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const reserved = tables.filter((t) => t.status === "reserved").length;
    const inactive = tables.filter((t) => t.status === "inactive").length;

    return {
      available,
      occupied,
      reserved,
      inactive,
      total: tables.length,
    };
  }, [tables]);

  // Filter tables based on search
  const filteredTables = useMemo(() => {
    if (!searchQuery) return tables;
    return tables.filter((table) =>
      table.table_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tables, searchQuery]);

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

          {/* Stats Skeleton */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {[...Array(5)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={100}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Search Skeleton */}
          <Box sx={{ mb: 4 }}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Box>

          {/* Table Grid Skeleton */}
          <Grid container spacing={3}>
            {[...Array(8)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={150}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  // Session check removed to allow guest access

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Dashboard - Manajemen Meja
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Gagal memuat data meja. Silakan coba lagi.
          </Alert>
        )}

        {/* Statistics */}
        <Box sx={{ mb: 4 }}>
          <TableStats stats={stats} />
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TableSearch onSearch={setSearchQuery} />
        </Box>

        {/* Table Grid */}
        {filteredTables.length === 0 ? (
          <Alert severity="info">
            {searchQuery
              ? "Tidak ada meja yang cocok dengan pencarian."
              : "Belum ada data meja."}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredTables.map((table) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={table.id}>
                <TableCard table={table} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
