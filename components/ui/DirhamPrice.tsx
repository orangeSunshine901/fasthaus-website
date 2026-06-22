import Image from "next/image";

type Props = {
  amount: number;
  size?: "sm" | "base" | "lg";
  className?: string;
  compareAmount?: number;
};

const sizeMap = {
  sm: { text: "text-sm", iconH: 12 },
  base: { text: "text-base", iconH: 14 },
  lg: { text: "text-[20px] font-semibold", iconH: 18 },
};

export default function DirhamPrice({ amount, compareAmount, size = "base", className = "" }: Props) {
  const { text, iconH } = sizeMap[size];
  return (
    <span className={`inline-flex items-center gap-0.5 ${text} ${className}`}>
      <Image src="/dirham-icon.svg" alt="AED" width={iconH} height={iconH} className="inline-block" />
      <span>{amount.toFixed(2)}</span>
      {compareAmount && (
        <span className="line-through ml-1 text-[var(--color-text-disabled)] text-sm">
          {compareAmount.toFixed(2)}
        </span>
      )}
    </span>
  );
}
