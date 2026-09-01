import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Spinner className="size-6 text-[var(--color-accent-amber)]" />
    </div>
  );
}
