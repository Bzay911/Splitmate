import { createContext, ReactNode, useState } from "react";

interface Group {
  id: string;
  name: string;
  image: any;
  totalExpense: number;
  members: any[];
}

interface GroupsContextType {
  groups: Group[];
  addGroup: (item: Group) => void;
  removeGroup: (index: number) => void;
}

const GroupsContext = createContext<GroupsContextType>({
  groups: [],
  addGroup: () => {},
  removeGroup: () => {},
});

export const GroupsProvider = ({children}: {children: ReactNode}) => {
    const [groups, setGroups] = useState<Group[]>([
        {
            id: "1",
            name: "Friends Trip",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 250,
            members: [],
          },
          {
            id: "2",
            name: "Office Lunch",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 150,
            members: [],
          },
          {
            id: "3",
            name: "Family Dinner",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 300,
            members: [],
          },
          {
            id: "4",
            name: "Birthday Bash",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 500,
            members: [],
          },
          {
            id: "5",
            name: "Weekend Getaway",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 420,
            members: [],
          },
          {
            id: "6",
            name: "Team Outing",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 380,
            members: [],
          },
          {
            id: "7",
            name: "Roommates Rent",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 1200,
            members: [],
          },
          {
            id: "8",
            name: "Festival Shopping",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 700,
            members: [],
          },
          {
            id: "9",
            name: "Road Trip",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 950,
            members: [],
          },
          {
            id: "10",
            name: "College Reunion",
            image: require("../assets/images/dummyProfile.png"),
            totalExpense: 1100,
            members: [],
          },
    ]);

    const addGroup = (item: Group) => {
        setGroups((prev) => [...prev, item]);
    }

    const removeGroup = (index: number) => {
        setGroups((prev) => prev.filter((_, i) => i !== index));
    }

    return(
        <GroupsContext.Provider value={{groups, addGroup, removeGroup}}>
            {children}
        </GroupsContext.Provider> 
    )
}

export default GroupsContext;

