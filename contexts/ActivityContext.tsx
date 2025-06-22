import { apiUrl } from "@/constants/ApiConfig";
import { useAuth } from "@/contexts/AuthContext";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

// Define types
    interface Activity {
        _id: string;
        type: 'expense_added' | 'expense_updated' | 'expense_deleted' | 'payment_made' | 'settlement_done';
        actor: {
          _id: string;
          displayName: string;
        };
        group?: {
          _id: string;
          name: string;
        };
        expense?: {
          _id: string;
          amount: number;
          description: string;
        };
        message: string;
        timestamp: string;
    }

interface ActivityContextType {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
}

// Create context with proper typing
const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  isLoading: false,
  error: null,
  refreshActivities: async () => {},
});

// Create provider component
export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {user, token} = useAuth();

  const refreshActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setActivities([]);
        return;
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const response = await fetch(apiUrl("api/auth/activity"), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities (${response.status})`);
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch activities");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshActivities();
    } else {
      setActivities([]);
    }
  }, [user, refreshActivities]);

  return (
    <ActivityContext.Provider 
      value={{ 
        activities, 
        isLoading, 
        error,
        refreshActivities
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

// Create and export custom hook
export const useActivity = () => useContext(ActivityContext);
