import { auth } from "@/src/firebaseConfig";
import { createContext, useCallback, useContext, useState } from 'react';

interface FinancialSummary {
  totalExpenses: number;
  creditAmount: number;
  debtAmount: number;
  netBalance: number;
}

interface FinancialContextType {
  financialSummary: FinancialSummary;
  refreshFinancialSummary: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType>({
  financialSummary: {
    totalExpenses: 0,
    creditAmount: 0,
    debtAmount: 0,
    netBalance: 0
  },
  refreshFinancialSummary: async () => {}
});

export function FinancialProvider({ children }) {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalExpenses: 0,
    creditAmount: 0,
    debtAmount: 0,
    netBalance: 0
  });

  const refreshFinancialSummary = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch("http://192.168.1.12:3000/api/user/summary", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFinancialSummary(data.summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
    }
  }, []);

  return (
    <FinancialContext.Provider value={{ financialSummary, refreshFinancialSummary }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => useContext(FinancialContext);
