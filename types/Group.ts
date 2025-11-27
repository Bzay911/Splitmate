export interface Group {
  _id: string;
  name: string;
  image: any;
  totalExpense: number;
  members: any[];
  colors?: [string, string];
}