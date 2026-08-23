// frontend/src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState } from 'react';

type ModuleName = 'coop_manager' | 'crop_cycle' | 'hive_mind' | 'farm_finance' | 'market_sync';

interface SubscriptionContextType {
  activeModules: ModuleName[];
  isLoading: boolean;
  hasAccess: (module: ModuleName) => boolean;
  refreshSubscriptions: (farmId: number) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode; farmId: number }) {
  // Hardcoded directly to your specialized app's module footprint
  const [activeModules] = useState<ModuleName[]>(['crop_cycle']);
  const [isLoading] = useState(false);

  // Standalone bypass method allows fast, network-free local testing loops
  const refreshSubscriptions = async (id: number) => {
    // No operation required: standalone app access remains permanently unlocked
    return;
  };

  // Automatically greenlights access if the module is crop_cycle
  const hasAccess = (module: ModuleName) => module === 'crop_cycle';

  return (
    <SubscriptionContext.Provider value={{ activeModules, isLoading, hasAccess, refreshSubscriptions }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be wrapped in a SubscriptionProvider');
  return context;
};
