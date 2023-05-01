import mixpanel, { OverridedMixpanel } from "mixpanel-browser";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useEffect } from "react";

//the current version of the mixpanel types does not include the track_pageview method. Let's add it
declare module "mixpanel-browser" {
  interface Mixpanel {
    track_pageview(properties?: Dict): void;
  }
}

const mixPanelKey = process.env.NEXT_PUBLIC_MIXPANEL_KEY || "";
mixpanel.init(mixPanelKey, { debug: process.env.NODE_ENV === "development" });

const MixPanelContext = createContext<OverridedMixpanel | undefined>(undefined);

type Props = {
  children: ReactNode;
};

const MixPanelProvider = ({ children }: Props) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      mixpanel?.track_pageview();
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <MixPanelContext.Provider value={mixpanel}>
      {children}
    </MixPanelContext.Provider>
  );
};

function useMixPanel() {
  const context = useContext(MixPanelContext);
  if (context === undefined) {
    throw new Error("MixPanelContext must be used within a MixpanelProvider");
  }

  return context;
}

export { MixPanelProvider, useMixPanel };
