function Marquee() {
  const text = "SUTIL · PREMIUM · MISSIONÁRIA · FÉ · MISSÃO · COMUNIDADE · ";
  return (
    <div className="overflow-hidden border-y border-line bg-bone py-4">
      <div className="flex whitespace-nowrap">
        <span className="animate-marquee text-sm tracking-brand text-stone">
          {text.repeat(4)}
        </span>
        <span className="animate-marquee text-sm tracking-brand text-stone" aria-hidden>
          {text.repeat(4)}
        </span>
      </div>
    </div>
  );
}

export default Marquee;
