import { auth } from "@/src/firebaseConfig";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface Group {
  _id: string;
  name: string;
  image: string;
  totalExpense: number;
  members: any[];
}

interface GroupsContextType {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType>({
  groups: [],
  isLoading: false,
  error: null,
  refreshGroups: async () => {},
});

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user logged in");
      }

      const token = await user.getIdToken();
      const response = await fetch("http://192.168.1.12:3000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch groups (${response.status})`);
      }

      const data = await response.json();
      setGroups(data.groups);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <GroupsContext.Provider value={{ groups, isLoading, error, refreshGroups }}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => useContext(GroupsContext);
export default GroupsContext;

