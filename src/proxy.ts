import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      // Allow access to dashboard, foods, and static assets
      if (
        path.startsWith("/table") ||
        path.startsWith("/foods") ||
        path.startsWith("/api") || // Allow API calls? BE protects them usually
        path.startsWith("/static") ||
        path.startsWith("/_next") ||
        path === "/"
      ) {
        return true;
      }
      // Require token for other routes
      return !!token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
});
