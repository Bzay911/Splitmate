import { apiUrl } from "@/constants/ApiConfig";
import { auth } from "@/src/firebaseConfig";
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

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

export function FinancialProvider({ children }:{ children: ReactNode }) {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalExpenses: 0,
    creditAmount: 0,
    debtAmount: 0,
    netBalance: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshFinancialSummary = useCallback(async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }
      
      setIsLoading(true);
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(apiUrl("api/auth/summary"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFinancialSummary(data.summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <FinancialContext.Provider value={{ financialSummary, refreshFinancialSummary }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => useContext(FinancialContext);
