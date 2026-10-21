import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: P) => (
  <Base {...p}>
    <path d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z" />
  </Base>
);

export const SearchIcon = (p: P) => (
  <Base {...p}>
    <path d="M20.87 20.17l-5.59-5.59A6.94 6.94 0 0 0 17 10a7 7 0 1 0-7 7 6.94 6.94 0 0 0 4.58-1.72l5.59 5.59.7-.7zM10 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z" />
  </Base>
);

export const MicIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-2-9c0-1.1.9-2 2-2s2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V5zm9 6c0 3.53-2.61 6.43-6 6.92V21h-2v-3.08c-3.39-.49-6-3.39-6-6.92h1c0 3.31 2.69 6 6 6s6-2.69 6-6h1z" />
  </Base>
);

export const PlusIcon = (p: P) => (
  <Base {...p}>
    <path d="M14 13h-3v3H9.5v-3h-3v-1.5h3v-3H11v3h3V13zm3-7H3v12h14v-6.39l4 1.83V8.56l-4 1.83V6m1-1v3.83L22 7v8l-4-1.83V19H2V5h16z" />
  </Base>
);

export const BellIcon = (p: P) => (
  <Base {...p}>
    <path d="M10 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm8-4v-6c0-3.35-2.36-5.65-5.5-5.96V3c0-.83-.67-1.5-1.5-1.5S9.5 2.17 9.5 3v1.04C6.36 4.35 4 6.65 4 10v6l-2 2v1h18v-1l-2-2zm-1 1H5v-7c0-3.03 2.47-5.5 6-5.5s6 2.47 6 5.5v7z" />
  </Base>
);

export const BellOnIcon = (p: P) => (
  <Base {...p}>
    <path d="M10 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm8-4v-6c0-3.35-2.36-5.65-5.5-5.96V3c0-.83-.67-1.5-1.5-1.5S9.5 2.17 9.5 3v1.04C6.36 4.35 4 6.65 4 10v6l-2 2v1h18v-1l-2-2z" />
  </Base>
);

export const HomeIcon = ({ filled, ...p }: P & { filled?: boolean }) =>
  filled ? (
    <Base {...p}>
      <path d="M4 21V9.5L12 3l8 6.5V21h-6v-6h-4v6H4z" />
    </Base>
  ) : (
    <Base {...p}>
      <path d="M12 4.44l7 5.09V20h-4v-6H9v6H5V9.53l7-5.09M12 3L4 8.82V21h6v-6h4v6h6V8.82L12 3z" />
    </Base>
  );

export const ShortsIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Base {...p}>
    <path d="M14.93 2.5c-1.06 0-1.99.36-2.86.86L6 6.94c-1.29.68-2.09 2.03-2.06 3.49.03 1.45.89 2.77 2.2 3.39.38.19.79.31 1.21.36-.31.66-.36 1.42-.13 2.13.36 1.15 1.34 2.01 2.53 2.23.97.18 1.97-.02 2.79-.55l7.11-4.5c1.16-.73 1.72-2.13 1.4-3.48-.33-1.35-1.47-2.35-2.86-2.5.31-.66.36-1.42.13-2.13-.45-1.45-1.87-2.42-3.39-2.38zm-4.93 12.1V9.4L15 12l-5 2.6z" />
  </Base>
);

export const SubsIcon = ({ filled, ...p }: P & { filled?: boolean }) =>
  filled ? (
    <Base {...p}>
      <path d="M18 19H6V7h12v12zM4 21h16V5H4v16zM8 3h8v1H8V3z" />
    </Base>
  ) : (
    <Base {...p}>
      <path d="M20 8v12H4V8h16m1-1H3v14h18V7zM8 3h8v1H8V3zM6 5h12v1H6V5zm4 4v6l5-3-5-3z" />
    </Base>
  );

export const YouIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0-1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm8 16v-1.5c0-2.21-3.58-4-8-4s-8 1.79-8 4V19h16zm-1-1H5v-.5c0-1.2 2.69-3 7-3s7 1.8 7 3V19z" />
  </Base>
);

export const HistoryIcon = (p: P) => (
  <Base {...p}>
    <path d="M11 7h1.5v5.2l4 2.4-.8 1.3-4.7-2.8V7zM12 3a9 9 0 1 0 8.94 10h-1.51A7.5 7.5 0 1 1 12 4.5c2.07 0 3.94.84 5.3 2.2L14.5 9.5H21V3l-2.64 2.64A8.97 8.97 0 0 0 12 3z" />
  </Base>
);

export const PlaylistIcon = (p: P) => (
  <Base {...p}>
    <path d="M22 7H2v1h20V7zm-9 5H2v1h11v-1zM2 17h11v1H2v-1zm14-1.5v6l5-3-5-3z" />
  </Base>
);

export const VideoIcon = (p: P) => (
  <Base {...p}>
    <path d="M10 9.35 15 12l-5 2.65v-5.3zm7-4.35H3v14h14v-6.39l4 1.83V7.56l-4 1.83V5m1-1v3.83L22 7v8l-4-1.83V19H2V5h16z" />
  </Base>
);

export const ClockIcon = (p: P) => (
  <Base {...p}>
    <path d="M14.97 16.95 10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9m0-1c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
  </Base>
);

export const ThumbUpIcon = ({ filled, ...p }: P & { filled?: boolean }) =>
  filled ? (
    <Base {...p}>
      <path d="M18.77 11h-4.23l1.52-4.94A1.54 1.54 0 0 0 14.6 4c-.41 0-.81.17-1.09.48L7 11H3v10h14.23c.87 0 1.63-.58 1.87-1.42l2.16-7.54c.31-1.07-.5-2.04-1.49-2.04z" />
    </Base>
  ) : (
    <Base {...p}>
      <path d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H3v10h4h10.23c.87 0 1.63-.58 1.87-1.42l2.16-7.54C21.57 10.97 20.76 10 18.77 11zM7 20H4v-8h3V20zM19.98 12.32l-2.16 7.54c-.12.42-.51.71-.95.71H8v-8.61l5.6-6.06c.19-.21.48-.33.78-.33.53 0 .96.43.96.96 0 .1-.02.21-.05.31L13.87 12h4.9c.34 0 .59.32.51.63l.7-.31z" />
    </Base>
  );

export const ThumbDownIcon = ({ filled, ...p }: P & { filled?: boolean }) =>
  filled ? (
    <Base {...p}>
      <path d="M5.23 13h4.23l-1.52 4.94A1.54 1.54 0 0 0 9.4 20c.41 0 .81-.17 1.09-.48L17 13h4V3H6.77c-.87 0-1.63.58-1.87 1.42L2.74 11.96C2.43 13.03 3.24 14 5.23 13z" />
    </Base>
  ) : (
    <Base {...p}>
      <path d="M18 4h3v8h-3V4zM5.23 12h4.23l-1.52 4.94C7.62 18.97 8.46 20 9.62 20c.58 0 1.14-.24 1.52-.65L17 13h4V3H10.77c-.87 0-1.63.58-1.87 1.42L2.02 11.68C1.43 13.03 3.24 14 5.23 12zM4.02 11.68l2.16-7.54C6.3 3.72 6.69 3.43 7.13 3.43H16V12l-5.6 6.06c-.19.21-.48.33-.78.33-.53 0-.96-.43-.96-.96 0-.1.02-.21.05-.31L10.13 12h-4.9c-.34 0-.59-.32-.51-.63l.7.31z" />
    </Base>
  );

export const ShareIcon = (p: P) => (
  <Base {...p}>
    <path d="M15 5.63 20.66 12 15 18.37V15h-3c-2.51 0-4.51.61-6.16 1.94C7.44 13.9 9.44 12 13 12h2V5.63M14 3v7.5H13c-5.4 0-8.03 4.6-8.65 9.63 1.54-3.44 4.46-5.13 8.65-5.13h1V21l8-9-8-9z" />
  </Base>
);

export const DownloadIcon = (p: P) => (
  <Base {...p}>
    <path d="M17 18v1H6v-1h11zm-.5-6.15-.7-.71-3.3 3.29V4h-1v10.43l-3.3-3.29-.7.71 4.5 4.5 4.5-4.5z" />
  </Base>
);

export const SaveIcon = (p: P) => (
  <Base {...p}>
    <path d="M22 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2zM14 7H2v1h12V7zM2 12h8v1H2v-1zm0 5h8v1H2v-1z" />
  </Base>
);

export const MoreIcon = (p: P) => (
  <Base {...p}>
    <path d="M7.5 12c0 .83-.67 1.5-1.5 1.5S4.5 12.83 4.5 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm6 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm4.5 1.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z" />
  </Base>
);

export const CloseIcon = (p: P) => (
  <Base {...p}>
    <path d="M12.71 12l8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z" />
  </Base>
);

export const PlayIcon = (p: P) => (
  <Base {...p}>
    <path d="M8 5v14l11-7L8 5z" />
  </Base>
);

export const PauseIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
  </Base>
);

export const NextIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 5l9 7-9 7V5zm10 0h2v14h-2V5z" />
  </Base>
);

export const PrevIcon = (p: P) => (
  <Base {...p}>
    <path d="M18 5l-9 7 9 7V5zM8 5H6v14h2V5z" />
  </Base>
);

export const VolumeIcon = (p: P) => (
  <Base {...p}>
    <path d="M8 8H4v8h4l5 4V4L8 8zm8.5 4a3.5 3.5 0 0 0-2-3.16v6.32A3.5 3.5 0 0 0 16.5 12zm-2-7.5v1.6a6 6 0 0 1 0 11.8v1.6a7.5 7.5 0 0 0 0-15z" />
  </Base>
);

export const MuteIcon = (p: P) => (
  <Base {...p}>
    <path d="M8 8H4v8h4l5 4V4L8 8zm12.5 4-2.5-2.5-.7.7L19.29 12 17.3 13.98l.7.71L20.5 12.4l2 2 .7-.71-2-1.99 2-1.99-.7-.71-2 2z" />
  </Base>
);

export const SettingsIcon = (p: P) => (
  <Base {...p}>
    <path d="M12 8.67a3.33 3.33 0 1 0 0 6.66 3.33 3.33 0 0 0 0-6.66zm0 5.66a2.33 2.33 0 1 1 0-4.66 2.33 2.33 0 0 1 0 4.66zm7.6-2.33c0-.5-.05-.99-.13-1.46l1.7-1.32-1.86-3.22-2.02.81a7.6 7.6 0 0 0-2.52-1.46L14.4 3.2h-3.6l-.37 2.15c-.92.33-1.77.82-2.52 1.46l-2.02-.81-1.86 3.22 1.7 1.32c-.08.47-.13.96-.13 1.46s.05.99.13 1.46l-1.7 1.32 1.86 3.22 2.02-.81c.75.64 1.6 1.13 2.52 1.46l.37 2.15h3.6l.37-2.15a7.6 7.6 0 0 0 2.52-1.46l2.02.81 1.86-3.22-1.7-1.32c.08-.47.13-.96.13-1.46z" />
  </Base>
);

export const MiniplayerIcon = (p: P) => (
  <Base {...p}>
    <path d="M21 7v10H3V7h18m1-1H2v12h20V6zM11 15h8v-4h-8v4z" />
  </Base>
);

export const TheaterIcon = (p: P) => (
  <Base {...p}>
    <path d="M22 7H2v10h20V7zm-1 9H3V8h18v8z" />
  </Base>
);

export const FullscreenIcon = (p: P) => (
  <Base {...p}>
    <path d="M10 4H4v6h1V5h5V4zm4 0h6v6h-1V5h-5V4zm6 10v6h-6v-1h5v-5h1zM4 14h1v5h5v1H4v-6z" />
  </Base>
);

export const ExitFullscreenIcon = (p: P) => (
  <Base {...p}>
    <path d="M10 10H4v1h5v5h1v-6zm4 0v6h1v-5h5v-1h-6zm-3 4H6v1h4v4h1v-5H11v0zm0-8V4h-1v5h6V6h-5z" />
  </Base>
);

export const ChevronLeft = (p: P) => (
  <Base {...p}>
    <path d="M14.96 18.96 8 12l6.96-6.96.71.71L9.41 12l6.25 6.25-.7.71z" />
  </Base>
);

export const ChevronRight = (p: P) => (
  <Base {...p}>
    <path d="M9.04 5.04 16 12l-6.96 6.96-.71-.71L14.59 12 8.33 5.75l.71-.71z" />
  </Base>
);

export const ChevronDown = (p: P) => (
  <Base {...p}>
    <path d="M18 9.28l-6.35 6.35-6.37-6.35.72-.71 5.65 5.65 5.65-5.65.7.71z" />
  </Base>
);

export const CheckIcon = (p: P) => (
  <Base {...p}>
    <path d="M9.55 18.2 3.8 12.45l1.06-1.06 4.69 4.69L19.14 6.4l1.06 1.06L9.55 18.2z" />
  </Base>
);

export const TrashIcon = (p: P) => (
  <Base {...p}>
    <path d="M11 17h-1V8h1v9zm3-9h-1v9h1V8zm4-4v1h-1v16H7V5H6V4h4V3h4v1h4zm-2 1H8v15h8V5z" />
  </Base>
);

export const FlagIcon = (p: P) => (
  <Base {...p}>
    <path d="M6 4h9l-.5 2H20v8h-6l.5-2H7v8H6V4zm2 1v6h7.25l.5-2H18V5h-5.25l-.5 2H8z" />
  </Base>
);

export const LiveIcon = (p: P) => (
  <Base {...p}>
    <path d="M16.94 6.91l-.7.71a6.02 6.02 0 0 1 0 8.52l.7.71a7.03 7.03 0 0 0 0-9.94zM7.06 6.91l.7.71a6.02 6.02 0 0 0 0 8.52l-.7.71a7.03 7.03 0 0 1 0-9.94zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
  </Base>
);

export const SortIcon = (p: P) => (
  <Base {...p}>
    <path d="M21 6H3V5h18v1zm-3 5H6v1h12v-1zm-3 6H9v1h6v-1z" />
  </Base>
);

export const YouTubeLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 90 20" className={className} aria-label="YouTube">
    <path
      d="M27.97 3.12A3.58 3.58 0 0 0 25.44.58C23.22 0 14.2 0 14.2 0S5.18 0 2.96.58A3.58 3.58 0 0 0 .43 3.12C0 5.34 0 10 0 10s0 4.66.43 6.88a3.58 3.58 0 0 0 2.53 2.54C5.18 20 14.2 20 14.2 20s9.02 0 11.24-.58a3.58 3.58 0 0 0 2.53-2.54C28.4 14.66 28.4 10 28.4 10s0-4.66-.43-6.88z"
      fill="#FF0033"
    />
    <path d="M11.35 14.29 18.84 10l-7.49-4.29v8.58z" fill="#fff" />
    <text
      x="34"
      y="15.5"
      fill="currentColor"
      style={{
        fontSize: "15.5px",
        fontWeight: 600,
        letterSpacing: "-0.8px",
        fontFamily: "Roboto, Arial, sans-serif",
      }}
    >
      YouTube
    </text>
  </svg>
);

export const ClapperLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-label="Home" role="img">
    <rect x="2" y="2" width="44" height="44" rx="10" fill="#E7000C" />
    <g
      transform="translate(13.5 13.5) scale(0.875)"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 3.9" />
      <path d="m12.4 3.4 3.1 4" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </g>
  </svg>
);
