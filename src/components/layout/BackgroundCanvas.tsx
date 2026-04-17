/**
 * Subtle animated gradient mesh that sits behind all content.
 * Uses pure CSS — no JS animation loop — so it's zero-cost at idle.
 */
export function BackgroundCanvas() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-[40%] right-[10%] size-[60vw] max-w-[800px] rounded-full bg-primary/[0.03] blur-[120px]" />
      <div className="absolute -bottom-[30%] left-[5%] size-[50vw] max-w-[700px] rounded-full bg-primary/[0.02] blur-[100px]" />
    </div>
  );
}
