import { apiUrl } from "@/constants/ApiConfig";
import { createContext, ReactNode, useContext, useState } from 'react';
import { useAuth } from "./AuthContext";

interface Settlement {
  _id: string;
  fromUser: { displayName: string; email: string };
  toUser: { displayName: string; email: string };
  amount: number;
  status: string;
  settledAt: string;
}

interface SettlementContextType {
  settlements: Settlement[];
  isProcessing: boolean;
  processSettlement: (settlement: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    groupId: string;
  }) => Promise<boolean>;
}

const SettlementContext = createContext<SettlementContextType>({
  settlements: [],
  isProcessing: false,
  processSettlement: async () => false,
});

export function SettlementProvider({ children }: { children: ReactNode }) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { token } = useAuth();

  const processSettlement = async (settlementData: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    groupId: string;
  }): Promise<boolean> => {
    try {
    //   console.log("settlementData", settlementData);
      setIsProcessing(true);
      const response = await fetch(apiUrl("api/auth/settleup"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settlementData)
      });

      if (!response.ok) {
        throw new Error("Settlement failed");
      }

      return true;
    } catch (error) {
      console.error("Error processing settlement:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <SettlementContext.Provider value={{
      settlements,
      isProcessing,
      processSettlement,
    }}>
      {children}
    </SettlementContext.Provider>
  );
}

export const useSettlement = () => useContext(SettlementContext);
