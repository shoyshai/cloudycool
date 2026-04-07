import { ExternalLink, Github } from "lucide-react";

const links = [
  {
    label: "GitHub Repo",
    href: "https://github.com/shoyshai/cloudycool",
    icon: Github,
  },
  {
    label: "Live App",
    href: "https://shoyshai.github.io/cloudycool/",
    icon: ExternalLink,
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto rounded-t-[1.75rem] border border-white/20 border-b-0 bg-slate-900/30 px-4 pb-[calc(env(safe-area-inset-bottom)+0.875rem)] pt-4 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(2,8,23,0.35)]"
      aria-label="CloudyCool footer"
    >
      <div className="mx-auto w-full max-w-[420px] text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-white/75">CloudyCool</p>
        <p className="mt-1 text-sm font-semibold text-white">Premium Weather App</p>

        <div className="mt-3 flex items-center justify-center gap-2.5">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </a>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-white/75">Built by Shoyeb Shaikh</p>
        <p className="mt-1 text-[10px] text-white/60">(c) {currentYear} CloudyCool. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

