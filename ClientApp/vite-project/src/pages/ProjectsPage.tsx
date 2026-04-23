import { useState } from "react";
import { HeaderActions } from "../components/HeaderActions";
import { goToProject } from "../ui/navigation";
import { useProjects } from "./useProjects";
import { getProjectsPageCms } from "../cms/projectsPageCms";

export default function ProjectsPage() {
  const { projects, busy, error, create, remove, setResolved } = useProjects();
  const cms = getProjectsPageCms();

  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function onCreate() {
    if (!name.trim()) return;
    await create(name);
    setName("");
  }

  return (
    <>
      <HeaderActions />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCreate();
        }}
        className="toolbar"
        style={{ marginBottom: 16 }}
      >

        <input
          id="create-project-name"
          name="projectName"
          className="input"
          placeholder={cms.createProjectPlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: 260 }}
          autoComplete="off"
        />

        <button className="btn" type="submit" disabled={busy}>
          + {cms.createProjectButtonText}
        </button>
      </form>

      {error ? (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {projects.map((p) => {
          const resolvedId = `resolved-${p.Id}`;

          return (
            <div
              key={p.Id}
              className="card"
              style={{
                cursor: "pointer",
                backgroundColor: p.IsResolved ? "#006400" : undefined,
              }}
              onClick={() => goToProject(p.Id)}
              role="button"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div className="cardTitle">{p.Name}</div>
                  <div className="cardDesc">
                    Created {new Date(p.CreatedAtUtc).toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id={resolvedId}
                      name={resolvedId}
                      type="checkbox"
                      checked={p.IsResolved}
                      onChange={(e) => {
                        e.stopPropagation();
                        setResolved(p.Id, e.target.checked).catch(() => { });
                      }}
                    />
                    <label
                      htmlFor={resolvedId}
                      style={{ color: "var(--muted)", fontSize: 12, cursor: "pointer" }}
                    >
                      {cms.resolvedLabel}
                    </label>
                  </div>

                  <button
                    className="danger"
                    style={{ fontSize: 12, padding: "4px 8px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(p.Id);
                    }}
                  >
                    {cms.deleteButtonText}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 ? <div className="pill">{cms.noProjectsText}</div> : null}
      </div>

      {confirmDelete && (
        <div className="backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{cms.deleteProjectConfirmationText}</h3>
            <div className="actions">
              <button className="secondary" onClick={() => setConfirmDelete(null)}>
                {cms.cancelButtonText}
              </button>
              <button
                className="danger"
                onClick={() =>
                  remove(confirmDelete)
                    .then(() => setConfirmDelete(null))
                    .catch(() => { })
                }
                disabled={busy}
              >
                {cms.confirmDeleteButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
