import Image from "next/image";

type Props = {
  amount: number;
  size?: "sm" | "base" | "lg" | "xl";
  variant?: "black" | "white";
  className?: string;
  compareAmount?: number;
};

const sizeMap = {
  sm: { text: "text-sm", iconH: 12 },
  base: { text: "text-base", iconH: 14 },
  lg: { text: "text-[20px] font-semibold", iconH: 18 },
  xl: { text: "text-[28px] font-extrabold tracking-[-0.02em]", iconH: 20 },
};

export default function DirhamPrice({
  amount,
  compareAmount,
  size = "base",
  variant = "black",
  className = "",
}: Props) {
  const { text, iconH } = sizeMap[size];
  return (
    <span className={`inline-flex items-center gap-0.5 ${text} ${className}`}>
      <Image
        src={variant === "white" ? "/dirham-icon.svg" : "/dirham-icon-black.svg"}
        alt="AED"
        width={iconH}
        height={iconH}
        className="inline-block"
      />
      <span>{amount.toFixed(2)}</span>
      {compareAmount && (
        <span className="line-through ml-1 text-[var(--color-text-disabled)] text-[16px]">
          {compareAmount.toFixed(2)}
        </span>
      )}
    </span>
  );
}
