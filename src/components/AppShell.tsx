"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BellIcon,
  ChevronRight,
  ClockIcon,
  ClapperLogo,
  CloseIcon,
  HistoryIcon,
  HomeIcon,
  LiveIcon,
  MenuIcon,
  MicIcon,
  MoreIcon,
  PlaylistIcon,
  PlusIcon,
  SearchIcon,
  ShortsIcon,
  SubsIcon,
  VideoIcon,
  YouIcon,
} from "@/components/icons";
import { avatarColor, initials } from "@/lib/format";

export type SidebarChannel = {
  id: number;
  name: string;
  slug: string;
  avatarUrl: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string; filled?: boolean }) => ReactNode;
  filledIcon?: (props: { className?: string; filled?: boolean }) => ReactNode;
};

const MAIN_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Shorts", href: "/shorts", icon: ShortsIcon },
  { label: "Subscriptions", href: "/feed/subscriptions", icon: SubsIcon },
];

const YOU_NAV: NavItem[] = [
  { label: "History", href: "/feed/history", icon: HistoryIcon },
  { label: "Playlists", href: "/feed/playlists", icon: PlaylistIcon },
  { label: "Your videos", href: "/feed/you", icon: VideoIcon },
  { label: "Watch later", href: "/playlist?list=WL", icon: ClockIcon },
  { label: "Liked videos", href: "/playlist?list=LL", icon: HomeIcon },
];

const EXPLORE_NAV: NavItem[] = [
  { label: "Trending", href: "/feed/trending", icon: LiveIcon },
  { label: "Music", href: "/?category=Music", icon: PlaylistIcon },
  { label: "Live", href: "/feed/trending", icon: LiveIcon },
  { label: "Gaming", href: "/feed/trending", icon: VideoIcon },
  { label: "News", href: "/feed/trending", icon: LiveIcon },
  { label: "Sport", href: "/feed/trending", icon: LiveIcon },
];

export type ShellUser = { id: number; name: string; handle: string } | null;

export default function AppShell({
  children,
  channels,
  user,
}: {
  children: ReactNode;
  channels: SidebarChannel[];
  user: ShellUser;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const isImmersive = pathname.startsWith("/watch") || pathname.startsWith("/shorts");
  const [expanded, setExpanded] = useState(!isImmersive);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState<"none" | "account" | "create" | "notifications">("none");

  useEffect(() => {
    setExpanded(!isImmersive);
    setDrawer(false);
    setMenu("none");
  }, [pathname, isImmersive]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawer(false);
        setMenu("none");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleGuide = useCallback(() => {
    if (isImmersive) setDrawer((d) => !d);
    else setExpanded((e) => !e);
  }, [isImmersive]);

  const rail = isImmersive ? false : expanded;

  return (
    <div className="min-h-screen bg-yt text-primary">
      {/* ---------------- Header ---------------- */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-2 bg-yt px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-1 sm:gap-4">
          <IconButton label="Guide" onClick={toggleGuide}>
            <MenuIcon className="h-6 w-6" />
          </IconButton>
          <Link href="/" className="flex shrink-0 items-center" aria-label="Home">
            <ClapperLogo className="h-[38px] w-[38px]" />
          </Link>
        </div>

        <SearchBox
          initial={params.get("search_query") ?? ""}
          onSubmit={(q) => {
            if (q.trim()) router.push(`/results?search_query=${encodeURIComponent(q.trim())}`);
          }}
        />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <IconButton
              label="Create"
              onClick={() => setMenu(menu === "create" ? "none" : "create")}
              pill
            >
              <span className="flex items-center gap-1.5 px-1">
                <PlusIcon className="h-6 w-6" />
                <span className="hidden text-sm md:inline">Create</span>
              </span>
            </IconButton>
            {menu === "create" && (
              <Dropdown onClose={() => setMenu("none")}>
                <Link href="/upload" className="dropdown-row">
                  <VideoIcon className="h-5 w-5" /> Upload video
                </Link>
                <Link href="/shorts" className="dropdown-row">
                  <ShortsIcon className="h-5 w-5" /> Create a Short
                </Link>
                <Link href="/" className="dropdown-row">
                  <LiveIcon className="h-5 w-5" /> Go live
                </Link>
              </Dropdown>
            )}
          </div>

          <div className="relative">
            <IconButton
              label="Notifications"
              onClick={() => setMenu(menu === "notifications" ? "none" : "notifications")}
            >
              <span className="relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -right-1 -top-0.5 rounded-full bg-yt-red px-1 text-[10px] font-medium leading-4 text-white">
                  9+
                </span>
              </span>
            </IconButton>
            {menu === "notifications" && (
              <Dropdown onClose={() => setMenu("none")} wide>
                <p className="border-b border-yt px-4 py-3 text-base">Notifications</p>
                <p className="px-4 py-8 text-center text-sm text-secondary">
                  Your notifications are up to date.
                </p>
              </Dropdown>
            )}
          </div>

          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setMenu(menu === "account" ? "none" : "account")}
                  aria-label="Account"
                  className="grid h-8 w-8 place-items-center rounded-full text-sm font-medium text-white"
                  style={{ background: avatarColor(user.name) }}
                >
                  {initials(user.name)}
                </button>
                {menu === "account" && (
                  <Dropdown onClose={() => setMenu("none")} wide>
                    <div className="flex gap-3 border-b border-yt px-4 py-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white"
                        style={{ background: avatarColor(user.name) }}
                      >
                        {initials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base">{user.name}</p>
                        <p className="truncate text-sm text-secondary">{user.handle}</p>
                        <Link href="/feed/you" className="mt-1 inline-block text-sm text-yt-blue">
                          View your channel
                        </Link>
                      </div>
                    </div>
                    <AppearanceRow />
                    <button
                      className="dropdown-row w-full text-left"
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        setMenu("none");
                        router.push("/");
                        router.refresh();
                      }}
                    >
                      <MoreIcon className="h-5 w-5" /> Sign out
                    </button>
                    <div className="dropdown-row">
                      <PlusIcon className="h-5 w-5" /> Purchases and memberships
                    </div>
                    <div className="dropdown-row">
                      <ClockIcon className="h-5 w-5" /> Your data in YouTube
                    </div>
                  </Dropdown>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-yt px-3 py-1.5 text-sm font-medium text-yt-blue hover:bg-surface-2"
              >
                <YouIcon className="h-5 w-5" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- Mini rail ---------------- */}
      {!rail && !isImmersive ? (
        <nav className="fixed bottom-0 left-0 top-14 z-40 hidden w-[72px] flex-col items-center gap-1 overflow-y-auto bg-yt pt-1 no-scrollbar sm:flex">
          {[
            { label: "Home", href: "/", Icon: HomeIcon },
            { label: "Shorts", href: "/shorts", Icon: ShortsIcon },
            { label: "Subscriptions", href: "/feed/subscriptions", Icon: SubsIcon },
            { label: "You", href: "/feed/you", Icon: YouIcon },
          ].map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex w-16 flex-col items-center gap-1 rounded-lg py-4 text-[10px] hover:bg-surface-2 ${
                  active ? "bg-surface-2" : ""
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {/* ---------------- Full sidebar ---------------- */}
      {rail ? (
        <nav className="fixed bottom-0 left-0 top-14 z-40 hidden w-60 overflow-y-auto bg-yt px-3 pb-8 pt-2 lg:block">
          <SidebarBody pathname={pathname} channels={channels} />
        </nav>
      ) : null}

      {/* ---------------- Drawer ---------------- */}
      {drawer ? (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 animate-fade-in"
            onClick={() => setDrawer(false)}
          />
          <nav className="fixed bottom-0 left-0 top-0 z-[70] w-60 overflow-y-auto bg-yt px-3 pb-8 pt-2 shadow-2xl animate-rise">
            <div className="mb-2 flex items-center gap-4 px-1 pb-2">
              <IconButton label="Close" onClick={() => setDrawer(false)}>
                <MenuIcon className="h-6 w-6" />
              </IconButton>
              <Link href="/" aria-label="Home" onClick={() => setDrawer(false)}>
                <ClapperLogo className="h-8 w-8" />
              </Link>
            </div>
            <SidebarBody pathname={pathname} channels={channels} />
          </nav>
        </>
      ) : null}

      <main
        className={`pt-14 transition-[margin] duration-200 ${
          isImmersive ? "" : rail ? "lg:ml-60" : "sm:ml-[72px]"
        } ${isImmersive ? "" : "pb-14 sm:pb-0"}`}
      >
        {children}
      </main>

      {/* ---------------- Mobile bottom tabs ---------------- */}
      {isImmersive ? null : (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-between border-t border-yt bg-yt px-2 py-1 sm:hidden">
          {[
            { label: "Home", href: "/", Icon: HomeIcon },
            { label: "Shorts", href: "/shorts", Icon: ShortsIcon },
            { label: "Create", href: "/upload", Icon: PlusIcon },
            { label: "Subscriptions", href: "/feed/subscriptions", Icon: SubsIcon },
            { label: "You", href: "/feed/you", Icon: YouIcon },
          ].map(({ label, href, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] ${
                  active ? "bg-surface-2" : ""
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function SidebarBody({
  pathname,
  channels,
}: {
  pathname: string;
  channels: SidebarChannel[];
}) {
  return (
    <div className="text-sm">
      <SidebarSection>
        {MAIN_NAV.map((item) => (
          <SidebarLink key={item.label} item={item} pathname={pathname} />
        ))}
      </SidebarSection>

      <SidebarSection
        title="You"
        titleHref="/feed/you"
        titleIcon={<ChevronRight className="h-4 w-4" />}
      >
        {YOU_NAV.map((item) => (
          <SidebarLink key={item.label} item={item} pathname={pathname} />
        ))}
      </SidebarSection>

      <SidebarSection title="Subscriptions">
        {channels.map((c) => (
          <Link
            key={c.id}
            href={`/channel/${c.slug}`}
            className={`flex items-center gap-6 rounded-[10px] px-3 py-2 hover:bg-surface-2 ${
              pathname === `/channel/${c.slug}` ? "bg-surface-2" : ""
            }`}
          >
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-medium text-white"
              style={{ background: avatarColor(c.name) }}
            >
              {initials(c.name)}
            </span>
            <span className="truncate">{c.name}</span>
          </Link>
        ))}
        <Link
          href="/feed/subscriptions"
          className="flex items-center gap-6 rounded-[10px] px-3 py-2 hover:bg-surface-2"
        >
          <ChevronRight className="h-6 w-6" />
          <span>All subscriptions</span>
        </Link>
      </SidebarSection>

      <SidebarSection title="Explore">
        {EXPLORE_NAV.map((item) => (
          <SidebarLink key={item.label} item={item} pathname={pathname} />
        ))}
      </SidebarSection>

      <div className="border-t border-yt px-3 py-4 text-xs text-secondary">
        <p className="mb-3 font-medium text-secondary">
          About Press Copyright Contact us Creators Advertise Developers
        </p>
        <p className="mb-3 font-medium text-secondary">
          Terms Privacy Policy &amp; Safety How YouTube works Test new features
        </p>
        <p className="text-secondary/70">© 2026 Google LLC</p>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  titleHref,
  titleIcon,
  children,
}: {
  title?: string;
  titleHref?: string;
  titleIcon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-yt py-3">
      {title ? (
        titleHref ? (
          <Link
            href={titleHref}
            className="flex items-center gap-1 rounded-[10px] px-3 pb-1 pt-1 text-base font-medium hover:bg-surface-2"
          >
            {title} {titleIcon}
          </Link>
        ) : (
          <p className="px-3 pb-1 pt-1 text-base font-medium">{title}</p>
        )
      ) : null}
      {children}
    </div>
  );
}

function SidebarLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = pathname === item.href;
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-6 rounded-[10px] px-3 py-2 hover:bg-surface-2 ${
        active ? "bg-surface-2 font-medium" : ""
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SearchBox({
  initial,
  onSubmit,
}: {
  initial: string;
  onSubmit: (q: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setValue(initial), [initial]);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(value)}`);
        const data = (await res.json()) as { suggestions?: string[] };
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = () => {
    if (value.trim()) {
      setOpen(false);
      onSubmit(value);
    }
  };

  return (
    <div ref={boxRef} className="relative flex flex-1 items-center justify-center gap-2">
      <div
        className={`${mobile ? "flex" : "hidden sm:flex"} w-full max-w-[600px] items-center gap-2`}
      >
        <div className="relative flex h-10 flex-1 items-center rounded-l-full border border-yt bg-[#121212] pl-4 focus-within:border-yt-blue">
          {open && suggestions.length > 0 ? (
            <SearchIcon className="absolute right-4 h-5 w-5 text-secondary" />
          ) : null}
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Search"
            className="h-full w-full bg-transparent text-base text-primary outline-none placeholder:text-secondary"
          />
          {value ? (
            <button
              onClick={() => setValue("")}
              aria-label="Clear"
              className="grid h-8 w-8 place-items-center rounded-full bg-transparent hover:bg-hover"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <button
          onClick={submit}
          aria-label="Search"
          className="grid h-10 w-16 place-items-center rounded-r-full border border-l-0 border-yt bg-surface-2 hover:bg-hover"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <button
          aria-label="Search with your voice"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 hover:bg-hover"
        >
          <MicIcon className="h-5 w-5" />
        </button>
      </div>
      <button
        aria-label="Search"
        onClick={() => setMobile((m) => !m)}
        className={`grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2 sm:hidden ${
          mobile ? "hidden" : ""
        }`}
      >
        <SearchIcon className="h-6 w-6" />
      </button>

      {open && suggestions.length > 0 && !mobile ? (
        <div className="absolute top-12 z-50 w-full max-w-[560px] overflow-hidden rounded-xl bg-[#212121] py-2 shadow-2xl">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setValue(s);
                setOpen(false);
                onSubmit(s);
              }}
              className="flex w-full items-center gap-4 px-4 py-2 text-left text-base hover:bg-hover"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-secondary" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  pill,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  pill?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      title={label}
      className={`grid h-10 place-items-center hover:bg-surface-2 ${
        pill ? "rounded-full border border-yt px-3" : "w-10 rounded-full"
      }`}
    >
      {children}
    </button>
  );
}

function Dropdown({
  children,
  onClose,
  wide,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`absolute right-0 top-11 z-50 max-h-[70vh] overflow-y-auto rounded-xl bg-[#282828] py-2 shadow-2xl animate-rise ${
          wide ? "w-[300px]" : "w-[230px]"
        }`}
      >
        {children}
      </div>
    </>
  );
}

function AppearanceRow() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
  return (
    <button
      className="dropdown-row w-full"
      onClick={() => {
        const next = !light;
        setLight(next);
        document.documentElement.classList.toggle("light", next);
        try {
          localStorage.setItem("yt-theme", next ? "light" : "dark");
        } catch {
          /* ignore */
        }
      }}
    >
      <HalfMoon /> Appearance: {light ? "Light" : "Dark"}
    </button>
  );
}

function HalfMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 3a9 9 0 1 0 9 9c0-.34-.02-.67-.06-1a7 7 0 0 1-8-8c-.31-.04-.63-.06-.94-.06z" />
    </svg>
  );
}
