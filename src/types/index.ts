export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: Priority;
  status: Status;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  dueToday: number;
}
