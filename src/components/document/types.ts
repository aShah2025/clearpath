export type TimelineEntry = {
  id: string;
  title: string;
  description: string;
  /** ISO timestamp at midnight UTC; always display in UTC. */
  dueDate: string | null;
  consequence: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  isCompleted: boolean;
};
