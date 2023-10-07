export interface GroupMessage {
  id: number;
  sender_id: number;
  group_id: number;
  sender_name: string;
  message: string;
  createdAt: Date;
}
