import { HeaderWrapper } from "@/widgets/header-wrapper";
import { Footer, MobileBottomMenu } from "@/widgets/client-widgets";
import { ScrollSentinel } from "@/shared/components/ScrollSentinel/ScrollSentinel";

type LayoutProviderProps = {
  children: React.ReactNode;
};

export async function LayoutProvider({ children }: LayoutProviderProps) {
  return (
    <>
      <HeaderWrapper />
      <ScrollSentinel />
      {children}
      <Footer />
      <MobileBottomMenu />
    </>
  );
}
