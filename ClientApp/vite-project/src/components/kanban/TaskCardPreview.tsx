// drag overlay preview

import type { Task } from "../../api/tasks";

export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="card" style={{ cursor: "grabbing" }}>
      <div className="cardTitle">{task.Title}</div>
      {task.Description ? <div className="cardDesc">{task.Description}</div> : null}
    </div>
  );
}

