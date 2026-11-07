const TICKER_TEXT = "🏁 Voting has ended — thank you for voting! We will be in touch with you soon.";
export function VotingTicker() {
  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 25s linear infinite;
        }
        .ticker-wrap:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {/* Fixed scrolling tape (har page par sabse upar) */}
      <div className="ticker-wrap fixed left-0 right-0 top-0 z-[100] h-9 w-full overflow-hidden bg-[#6C1C74] text-white shadow-md">
        <div className="ticker-track h-full items-center">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex} className="flex shrink-0 items-center">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="mx-8 whitespace-nowrap text-sm font-semibold tracking-wide"
                >
                  {TICKER_TEXT}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Spacer taake content tape ke peeche na chhupe */}
      <div className="h-9" />
    </>
  );
}