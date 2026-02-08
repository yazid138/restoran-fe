"use client";

import { useMemo, useState } from "react";
import {
  AppBar as MuiAppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const pages = [
  {
    name: "Meja",
    path: "/table",
    roles: ["admin", "pelayan", "kasir", "tamu"],
  },
  { name: "Makanan", path: "/foods", roles: ["admin", "pelayan", "tamu"] }, // Kasir cannot manage foods
  { name: "Pesanan", path: "/orders", roles: ["admin", "pelayan", "kasir"] }, // Pelayan views status, Kasir processes payment
];

export default function AppBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const listMenu = useMemo(() => {
    const userRole = session?.user?.role || "tamu";
    return pages.filter((page) => page.roles.includes(userRole));
  }, [session]);

  // If on login page, don't show navbar
  if (pathname === "/login") return null;

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    handleCloseNavMenu();
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    handleCloseUserMenu();
  };

  const handleProfile = () => {
    router.push("/profile");
    handleCloseUserMenu();
  };

  return (
    <MuiAppBar
      position="static"
      sx={{ bgcolor: "white", color: "text.primary", boxShadow: 1 }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <RestaurantMenuIcon
            sx={{
              display: { xs: "none", md: "flex" },
              mr: 1,
              color: "primary.main",
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            onClick={() => router.push("/")}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "primary.main",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            RESTORAN
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {listMenu.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={() => handleNavigate(page.path)}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <RestaurantMenuIcon
            sx={{
              display: { xs: "flex", md: "none" },
              mr: 1,
              color: "primary.main",
            }}
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "primary.main",
              textDecoration: "none",
            }}
          >
            RESTO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {listMenu.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleNavigate(page.path)}
                sx={{
                  my: 2,
                  color: pathname.startsWith(page.path)
                    ? "primary.main"
                    : "text.secondary",
                  display: "block",
                  fontWeight: pathname.startsWith(page.path)
                    ? "bold"
                    : "normal",
                  borderBottom: pathname.startsWith(page.path)
                    ? "2px solid"
                    : "none",
                  borderColor: "primary.main",
                  borderRadius: 0,
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {session ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={session.user?.name || "User"}
                      src="/static/images/avatar/2.jpg"
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleProfile}>
                    <Typography textAlign="center">
                      Profile ({session.user?.name})
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => router.push("/login")}
                sx={{ ml: 2 }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
}
