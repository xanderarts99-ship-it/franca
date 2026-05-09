import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },
});

// Protect all /admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
