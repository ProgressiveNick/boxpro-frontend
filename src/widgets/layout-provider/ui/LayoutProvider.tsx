import { HeaderWrapper } from "@/widgets/header-wrapper";
import { Footer, MobileBottomMenu } from "@/widgets/client-widgets";

type LayoutProviderProps = {
  children: React.ReactNode;
};

export async function LayoutProvider({ children }: LayoutProviderProps) {
  return (
    <>
      <HeaderWrapper />
      {children}
      <Footer />
      <MobileBottomMenu />
    </>
  );
}
