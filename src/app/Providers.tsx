"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <SessionProvider>{children}</SessionProvider>
    </AppRouterCacheProvider>
  );
}
