import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },
});

// Protect all /admin routes except the login page
export const config = {
  matcher: ["/admin/((?!login).*)"],
};
