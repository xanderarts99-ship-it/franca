import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Globe } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" style={{ backgroundColor: "#1B4332" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" aria-label="Rammies Vacation Rentals — Home">
              <Image
                src="/logo-transparent.png"
                alt="Rammies Vacation Rentals"
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
            </Link>
            <p className="mt-3 text-sm font-semibold" style={{ color: "#C9A84C" }}>
              Home Away From Home
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60 max-w-xs">
              Premium vacation rentals in Katy and Fulshear, Texas. Fully
              equipped homes perfect for families, corporate travelers, and
              groups.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#C9A84C" }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-white/65 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#properties"
                  className="text-sm text-white/65 hover:text-white transition-colors duration-200"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/#properties"
                  className="text-sm text-white/65 hover:text-white transition-colors duration-200"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#C9A84C" }}
            >
              Get In Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:3464252248"
                  className="flex items-center gap-2.5 text-white/65 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <Phone size={14} className="shrink-0" style={{ color: "#C9A84C" }} />
                  346-425-2248
                </a>
              </li>
              <li>
                <a
                  href="mailto:rammiesvacation@gmail.com"
                  className="flex items-center gap-2.5 text-white/65 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <Mail size={14} className="shrink-0" style={{ color: "#C9A84C" }} />
                  rammiesvacation@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.rammiesvacation.com"
                  className="flex items-center gap-2.5 text-white/65 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <Globe size={14} className="shrink-0" style={{ color: "#C9A84C" }} />
                  www.rammiesvacation.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <p>© {year} Rammies Vacation Rentals. All rights reserved.</p>
          <p>Powered by Rammies Vacation Rentals</p>
        </div>
      </div>
    </footer>
  );
}
