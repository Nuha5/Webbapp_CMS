import type { TaskStatus } from "../../../api/tasks";
import { getBoardTexts } from "../../../cms/projectDashboardCms";

const texts = getBoardTexts();

export const COLS: Array<{ title: string; status: TaskStatus }> = [
  { title: texts.colTitleToDo, status: "ToDo" },
  { title: texts.colTitleInProgress, status: "InProgress" },
  { title: texts.colTitleDone, status: "Done" },
];

export const STATUSES: TaskStatus[] = ["ToDo", "InProgress", "Done"];

export function isStatus(x: string): x is TaskStatus {
  return STATUSES.includes(x as TaskStatus);
}
