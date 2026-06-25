import Image from "next/image";

export function ScaletopiaLogoWithBadge() {
  return (
    <div className="flex items-center gap-3 mb-6 animate-in">
      <Image
        src="/scaletopia-logo.svg"
        alt="Scaletopia"
        width={150}
        height={30}
        className="h-8 w-auto filter drop-shadow-sm"
      />
      <div className="px-2 py-1 rounded-full bg-stamp/10 text-xs font-semibold text-stamp animate-pulse">
        Inventory Pro
      </div>
    </div>
  );
}

export function ScaletopiaMarkAnimated() {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-stamp text-white font-bold text-lg animate-in hover:scale-105 transition-transform duration-300">
      S
    </div>
  );
}
