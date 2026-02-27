'use client';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col overflow-auto">{children}</div>;
}
