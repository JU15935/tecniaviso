export interface Repair {
  id: string;
  clientName: string;
  phone: string;
  deviceModel: string;
  problem: string;
  status: "in-progress" | "done";
  createdAt: string;
}
