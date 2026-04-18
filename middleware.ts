import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },
});

// Protect all /admin routes except /admin/login
export const config = {
  matcher: [
    "/admin",
    "/admin/bookings/:path*",
    "/admin/properties/:path*",
  ],
};
