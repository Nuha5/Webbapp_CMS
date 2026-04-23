import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "../../api/tasks";
import { TaskCard } from "./TaskCard";

export function Column({
  title,
  status,
  tasks,
  onAdd,
  onOpenTask,
  addButtonText,
}: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onAdd: () => void;
  onOpenTask: (t: Task) => void;
  addButtonText: string;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="col">
      <div className="colHeader">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="btn" type="button" onClick={onAdd}>
          {addButtonText}
        </button>
      </div>

      <SortableContext
        id={status}
        items={tasks.map((t) => t.Id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="colBody">
          {tasks.map((t) => (
            <TaskCard key={t.Id} task={t} onOpen={onOpenTask} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
