import type { ReactNode, HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...rest }: Props) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-5 transition-colors hover:border-border-strong ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
