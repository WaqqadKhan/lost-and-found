/** Scattered micro-icons of lost items — wallpaper-style, irregular placement (not a rigid grid). */
export function SideDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute left-0 top-0 hidden h-full w-[min(18vw,200px)] opacity-[0.2] xl:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="lost-wallpaper-left" x="0" y="0" width="200" height="280" patternUnits="userSpaceOnUse">
            {/* Key — top-left */}
            <g transform="translate(22,18) rotate(-18)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="4.5" />
              <circle cx="6" cy="6" r="1.6" fill="var(--brand-500)" fillOpacity="0.25" stroke="none" />
              <path d="M10.5 6 H24 V8.5 H21 V11 H17.5 V8.5 H14" />
            </g>
            {/* Phone — upper mid, tilted */}
            <g transform="translate(118,8) rotate(12)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="0" width="14" height="24" rx="2.2" />
              <path d="M4 2.5 H10" />
              <circle cx="7" cy="19.5" r="1.3" fill="var(--brand-500)" fillOpacity="0.3" stroke="none" />
            </g>
            {/* Glasses — mid-left, slight tilt */}
            <g transform="translate(8,78) rotate(8)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="5.5" />
              <circle cx="25" cy="7" r="5.5" />
              <path d="M12.5 7 H19.5" />
              <path d="M1.5 7 H0" />
              <path d="M30.5 7 H32" />
            </g>
            {/* Wallet — mid-right */}
            <g transform="translate(130,72) rotate(-10)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="3" width="26" height="16" rx="2.2" />
              <path d="M0 8.5 H26" />
              <rect x="16" y="10.5" width="6.5" height="4.5" rx="0.8" fill="var(--brand-500)" fillOpacity="0.2" />
            </g>
            {/* Earphones / buds */}
            <g transform="translate(55,48) rotate(22)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="5" r="4.5" />
              <circle cx="22" cy="14" r="4.5" />
              <path d="M5 9.5 Q8 22 17.5 14" />
            </g>
            {/* USB drive */}
            <g transform="translate(155,118) rotate(28)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="4" width="10" height="12" rx="1.2" />
              <rect x="10" y="6.5" width="12" height="7" rx="1" fill="var(--brand-500)" fillOpacity="0.15" />
              <path d="M3 7.5 H7 M3 12.5 H7" />
            </g>
            {/* Watch */}
            <g transform="translate(28,140) rotate(-6)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="0" width="10" height="6" rx="1" />
              <circle cx="10" cy="16" r="8" />
              <path d="M10 16 L10 11 M10 16 L14 18" />
              <rect x="5" y="24" width="10" height="6" rx="1" />
            </g>
            {/* ID / card */}
            <g transform="translate(110,155) rotate(15)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="0" width="30" height="20" rx="2" />
              <circle cx="8" cy="9" r="3.5" fill="var(--brand-500)" fillOpacity="0.15" />
              <path d="M14 7 H26 M14 12 H22" />
            </g>
            {/* Bag / backpack mini */}
            <g transform="translate(12,210) rotate(5)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10 H24 V26 H4 Z" />
              <path d="M8 10 V6 Q14 2 20 6 V10" />
              <path d="M4 16 H24" />
            </g>
            {/* Ring */}
            <g transform="translate(160,210) rotate(-20)" fill="none" stroke="var(--brand-500)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="10" r="6" />
              <path d="M5 4 L8 0 L11 4" />
            </g>
            {/* Umbrella folded / stick */}
            <g transform="translate(85,230) rotate(-25)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 0 Q0 8 10 14 Q20 8 10 0" fill="var(--brand-500)" fillOpacity="0.12" />
              <path d="M10 14 V26" />
              <path d="M10 26 Q7 28 7 26" />
            </g>
            {/* Laptop-ish notebook */}
            <g transform="translate(145,40) rotate(-8)" fill="none" stroke="var(--brand-500)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="2" width="22" height="16" rx="1.5" />
              <path d="M0 18 H22 L24 22 H-2 Z" fill="var(--brand-500)" fillOpacity="0.1" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lost-wallpaper-left)" />
      </svg>

      <svg
        className="absolute right-0 top-0 hidden h-full w-[min(18vw,200px)] opacity-[0.2] xl:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Different seed layout so left/right don't mirror in lockstep */}
          <pattern id="lost-wallpaper-right" x="0" y="0" width="200" height="280" patternUnits="userSpaceOnUse">
            <g transform="translate(140,22) rotate(20)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="4.5" />
              <circle cx="6" cy="6" r="1.6" fill="var(--brand-500)" fillOpacity="0.25" stroke="none" />
              <path d="M10.5 6 H24 V8.5 H21 V11 H17.5 V8.5 H14" />
            </g>
            <g transform="translate(18,40) rotate(-14)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="0" width="14" height="24" rx="2.2" />
              <path d="M4 2.5 H10" />
              <circle cx="7" cy="19.5" r="1.3" fill="var(--brand-500)" fillOpacity="0.3" stroke="none" />
            </g>
            <g transform="translate(95,55) rotate(-18)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="3" width="26" height="16" rx="2.2" />
              <path d="M0 8.5 H26" />
              <rect x="16" y="10.5" width="6.5" height="4.5" rx="0.8" fill="var(--brand-500)" fillOpacity="0.2" />
            </g>
            <g transform="translate(40,100) rotate(16)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="5.5" />
              <circle cx="25" cy="7" r="5.5" />
              <path d="M12.5 7 H19.5" />
              <path d="M1.5 7 H0" />
              <path d="M30.5 7 H32" />
            </g>
            <g transform="translate(150,105) rotate(-22)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="5" r="4.5" />
              <circle cx="22" cy="14" r="4.5" />
              <path d="M5 9.5 Q8 22 17.5 14" />
            </g>
            <g transform="translate(8,155) rotate(10)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="4" width="10" height="12" rx="1.2" />
              <rect x="10" y="6.5" width="12" height="7" rx="1" fill="var(--brand-500)" fillOpacity="0.15" />
              <path d="M3 7.5 H7 M3 12.5 H7" />
            </g>
            <g transform="translate(100,145) rotate(8)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="0" width="10" height="6" rx="1" />
              <circle cx="10" cy="16" r="8" />
              <path d="M10 16 L10 11 M10 16 L14 18" />
              <rect x="5" y="24" width="10" height="6" rx="1" />
            </g>
            <g transform="translate(55,195) rotate(-12)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="0" width="30" height="20" rx="2" />
              <circle cx="8" cy="9" r="3.5" fill="var(--brand-500)" fillOpacity="0.15" />
              <path d="M14 7 H26 M14 12 H22" />
            </g>
            <g transform="translate(145,185) rotate(18)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10 H24 V26 H4 Z" />
              <path d="M8 10 V6 Q14 2 20 6 V10" />
              <path d="M4 16 H24" />
            </g>
            <g transform="translate(25,235) rotate(30)" fill="none" stroke="var(--brand-500)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="10" r="6" />
              <path d="M5 4 L8 0 L11 4" />
            </g>
            <g transform="translate(120,240) rotate(12)" fill="none" stroke="var(--brand-500)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 0 Q0 8 10 14 Q20 8 10 0" fill="var(--brand-500)" fillOpacity="0.12" />
              <path d="M10 14 V26" />
              <path d="M10 26 Q7 28 7 26" />
            </g>
            <g transform="translate(70,12) rotate(6)" fill="none" stroke="var(--brand-500)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="2" width="22" height="16" rx="1.5" />
              <path d="M0 18 H22 L24 22 H-2 Z" fill="var(--brand-500)" fillOpacity="0.1" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lost-wallpaper-right)" />
      </svg>
    </div>
  );
}
