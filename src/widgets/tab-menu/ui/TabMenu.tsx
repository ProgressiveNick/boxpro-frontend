"use client";

import dynamic from "next/dynamic";

const TabMenuContent = dynamic(
  () =>
    import("./TabMenuContent").then((mod) => ({ default: mod.TabMenuContent })),
  {
    ssr: false,
    loading: () => <section style={{ minHeight: "40px" }} aria-hidden="true" />,
  },
);

export function TabMenu() {
  return <TabMenuContent />;
}
