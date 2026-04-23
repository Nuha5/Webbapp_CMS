import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { Task, TaskStatus } from "../../api/tasks";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";
import { TaskCardPreview } from "./TaskCardPreview";

import { COLS } from "./board/config";
import { useBoardTasks } from "./board/useBoardTasks";
import { useBoardDrag } from "./board/useBoardDrag";
import { collisionDetection } from "./board/dnd";
import { getBoardTexts, getTaskModalTexts } from "../../cms/projectDashboardCms";

export function Board({ projectId }: { projectId: string }) {
  if (!projectId) throw new Error("Board requires a projectId");

  const taskModalTexts = getTaskModalTexts();
  const boardTexts = getBoardTexts();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<
    | { open: false }
    | { open: true; mode: "create"; status: TaskStatus }
    | { open: true; mode: "edit"; task: Task }
  >({ open: false });

  const {
    tasks,
    grouped,
    error,
    setError,
    syncing,
    setSyncing,
    persistColumn,
    reload,
    onCreate,
    onUpdate,
    onDelete,
  } = useBoardTasks(projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const onDragEnd = useBoardDrag({
    projectId,
    tasks,
    grouped,
    syncing,
    setSyncing,
    setError,
    persistColumn,
    reload,
  });

  const activeTask = activeId ? tasks.find((t) => t.Id === activeId) ?? null : null;

  return (
    <>
      {error ? (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={async (e) => {
          await onDragEnd(e);
          setActiveId(null);
        }}
      >
        <div className="board">
          {COLS.map((col) => (
            <Column
              key={col.status}
              title={col.title}
              status={col.status}
              tasks={grouped[col.status]}
              onAdd={() => setModal({ open: true, mode: "create", status: col.status })}
              onOpenTask={(task) => setModal({ open: true, mode: "edit", task })}
              addButtonText={boardTexts.addButtonText}
            />
          ))}
        </div>

        <DragOverlay>{activeTask ? <TaskCardPreview task={activeTask} /> : null}</DragOverlay>
      </DndContext>

      {modal.open && modal.mode === "create" ? (
        <TaskModal
          projectId={projectId}
          mode="create"
          defaultStatus={modal.status}
          onClose={() => setModal({ open: false })}
          onCreate={onCreate}
          onUpdate={() => { }}
          onDelete={() => { }}
          texts={taskModalTexts}
        />
      ) : null}

      {modal.open && modal.mode === "edit" ? (
        <TaskModal
          projectId={projectId}
          mode="edit"
          initialTask={modal.task}
          onClose={() => setModal({ open: false })}
          onCreate={() => { }}
          onUpdate={(id, patch) =>
            onUpdate(id, {
              Title: patch.Title,
              Description: patch.Description ?? null,
              Status: patch.Status,
              AssigneeUserIds: patch.AssigneeUserIds,
            })
          }
          onDelete={onDelete}
          texts={taskModalTexts}
        />
      ) : null}
    </>
  );
}
