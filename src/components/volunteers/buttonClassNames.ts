export const addCircleButtonBaseClassName = [
  "flex h-5 w-5 items-center justify-center rounded-full",
  "bg-green-600 text-xl font-semibold leading-none text-white shadow-sm",
  "transition hover:bg-green-500",
  "focus:outline-none focus:ring-2 focus:ring-green-400",
  "focus:ring-offset-2 focus:ring-offset-neutral-900",
//   "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

export function getInteractiveStateClassName(options?: {
  usePointerCursor?: boolean;
}) {
  return [
    options?.usePointerCursor === false ? "" : "cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-60",
  ].join(" ");
}

export function getAddCircleButtonClassName(options?: {
  usePointerCursor?: boolean;
}) {
  return [
    addCircleButtonBaseClassName,
    getInteractiveStateClassName(options),
  ].join(" ");
}