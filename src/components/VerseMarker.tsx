// The three-dot verse marker of West African Qurʾān manuscripts (three gold
// dots outlined in red, in a triangle), used as the section divider. Same mark
// as the book covers and the YouTube channel.
export default function VerseMarker({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-gold/30" />
      <svg width="22" height="20" viewBox="0 0 22 20">
        <g fill="#C9A84C" stroke="#6B2424" strokeWidth="1.4">
          <circle cx="11" cy="5.5" r="4" />
          <circle cx="5.5" cy="14.5" r="4" />
          <circle cx="16.5" cy="14.5" r="4" />
        </g>
      </svg>
      <span className="h-px w-12 bg-gold/30" />
    </div>
  );
}
