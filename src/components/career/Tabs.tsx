'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ defaultValue, children, className = "" }: { defaultValue: string, children: React.ReactNode, className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = "" }: any) => (
  <div className={`flex w-full ${className}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, className = "", style, ...props }: any) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      data-state={isActive ? 'active' : 'inactive'}
      className={`transition-all whitespace-nowrap ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = "" }: any) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  
  if (context.activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};
