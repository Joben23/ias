import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type HRModule = 'hr1' | 'hr2' | 'hr3' | 'hr4';

export interface HRModuleInfo {
  id: HRModule;
  name: string;
  description: string;
  subtitle: string;
  version: string;
  available: boolean;
}

export const HR_MODULES: Record<HRModule, HRModuleInfo> = {
  hr1: {
    id: 'hr1',
    name: 'HR1 – Talent Acquisition',
    description: 'Recruitment & Onboarding',
    subtitle: 'Manage job postings, applicants, interviews & new hires',
    version: 'v1.0',
    available: true,
  },
  hr2: {
    id: 'hr2',
    name: 'HR2 – Talent Development',
    description: 'Learning & Development',
    subtitle: 'Training, competencies & career development for employees',
    version: 'v1.0',
    available: true,
  },
  hr3: {
    id: 'hr3',
    name: 'HR3 – Workforce Operations',
    description: 'Daily Operations',
    subtitle: 'Attendance, leave requests, scheduling & timesheets',
    version: 'v1.0',
    available: true,
  },
  hr4: {
    id: 'hr4',
    name: 'HR4 – Compensation',
    description: 'Payroll & Benefits',
    subtitle: 'Salary management, benefits & compensation planning',
    version: 'v1.0',
    available: true,
  },
};

interface HRModuleContextType {
  selectedModule: HRModule;
  setSelectedModule: (module: HRModule) => void;
  currentModuleInfo: HRModuleInfo;
}

const HRModuleContext = createContext<HRModuleContextType | undefined>(undefined);

export function HRModuleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Initialize module from URL or localStorage
  const getInitialModule = (): HRModule => {
    const pathParts = location.pathname.split('/');
    const urlModule = pathParts[1];

    // First check URL
    if (urlModule && Object.keys(HR_MODULES).includes(urlModule)) {
      return urlModule as HRModule;
    }

    // Then check localStorage
    const saved = localStorage.getItem('selectedHRModule');
    if (saved && Object.keys(HR_MODULES).includes(saved)) {
      return saved as HRModule;
    }

    // Default to hr1
    return 'hr1';
  };

  const [selectedModule, setSelectedModule] = useState<HRModule>(getInitialModule);

  // Detect module from URL and update state
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const urlModule = pathParts[1]; // e.g., 'hr1', 'hr2' from '/hr1/dashboard'

    if (urlModule && Object.keys(HR_MODULES).includes(urlModule)) {
      const detectedModule = urlModule as HRModule;
      if (detectedModule !== selectedModule) {
        setSelectedModule(detectedModule);
        // Also save to localStorage when detected from URL
        localStorage.setItem('selectedHRModule', detectedModule);
      }
    }
  }, [location.pathname]); // Removed selectedModule from dependencies to prevent loops

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('selectedHRModule', selectedModule);
  }, [selectedModule]);

  const currentModuleInfo = HR_MODULES[selectedModule];

  return (
    <HRModuleContext.Provider value={{
      selectedModule,
      setSelectedModule,
      currentModuleInfo,
    }}>
      {children}
    </HRModuleContext.Provider>
  );
}

export function useHRModule() {
  const context = useContext(HRModuleContext);
  if (context === undefined) {
    throw new Error('useHRModule must be used within a HRModuleProvider');
  }
  return context;
}
