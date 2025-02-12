export interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_status: string;
  task_priority: number;
  task_file?: string;
  file_url?: string; // Add this lines
  // id: number;
  // task_name: string;
  // task_description: string;
  // task_status: string;
  // task_priority: number;
  // task_file: string;
}
