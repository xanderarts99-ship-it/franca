import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-charcoal text-white/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-serif text-2xl font-semibold text-white tracking-tight"
            >
              Rammies Vacation
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/55 max-w-xs">
              Handpicked vacation rentals for every kind of escape. Comfort,
              style, and unforgettable memories await.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#properties"
                  className="text-sm hover:text-sand transition-colors duration-200"
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-sm hover:text-sand transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
              Get in touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:hello@rammiesvacation.com"
                  className="hover:text-sand transition-colors duration-200"
                >
                  hello@rammiesvacation.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <p>© {year} Rammies Vacation. All rights reserved.</p>
          <p>Designed for comfort. Built for memories.</p>
        </div>
      </div>
    </footer>
  );
}
