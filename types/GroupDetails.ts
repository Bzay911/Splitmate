export interface GroupMember {
  _id: string;
  displayName: string;
  email: string;
}

export interface GroupDetails {
  _id: string;
  name: string;
  image: string;
  totalExpense: number;
  members: GroupMember[];
  createdBy: GroupMember;
  colors: [string, string];
}