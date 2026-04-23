import { useId } from "react";
import { displayMember } from "./taskModalMembers";
import { useTaskModal } from "./useTaskModal";
import type { TaskModalProps } from "./taskModalTypes";

export function TaskModal(props: TaskModalProps) {
  const vm = useTaskModal(props);

  const modalTitleId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const assigneeInputId = useId();

  return (
    <div className="backdrop" onClick={props.onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <h3 id={modalTitleId} style={{ marginTop: 0 }}>
          {props.mode === "create" ? props.texts.createTitle : props.texts.editTitle}
        </h3>

        {vm.localError ? (
          <div className="error">
            <strong>Error:</strong> {vm.localError}
          </div>
        ) : null}

        <div className="row">
          <label htmlFor={titleId}>{props.texts.titleLabel}</label>
          <input
            id={titleId}
            className="input"
            value={vm.Title}
            onChange={(e) => {
              vm.setTitle(e.target.value);
              if (vm.localError) vm.setLocalError(null);
            }}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="row">
          <label htmlFor={descriptionId}>{props.texts.descriptionLabel}</label>
          <textarea
            id={descriptionId}
            className="textarea"
            rows={4}
            value={vm.Description}
            onChange={(e) => vm.setDescription(e.target.value)}
          />
        </div>

        {props.mode === "edit" ? (
          <div className="row">
            <label htmlFor={assigneeInputId}>{props.texts.assigneesLabel}</label>

            {vm.membersError ? (
              <div className="error" style={{ marginBottom: 0 }}>
                <strong>Error:</strong> {vm.membersError}
              </div>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {vm.assignees.map((uid) => {
                const member = vm.memberById.get(uid);
                return (
                  <span
                    key={uid}
                    className="pill"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <span>{member ? displayMember(member) : uid}</span>
                    <button
                      type="button"
                      className="secondary"
                      style={{ padding: "2px 8px", fontSize: 12 }}
                      onClick={() => vm.removeAssignee(uid)}
                      title={props.texts.removeAssigneeTitle}
                      aria-label={props.texts.removeAssigneeTitle}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {vm.assignees.length === 0 ? (
                <div className="pill">{props.texts.noAssigneesText}</div>
              ) : null}
            </div>

            <div style={{ position: "relative" }}>
              <input
                id={assigneeInputId}
                ref={vm.inputRef}
                className="input"
                placeholder={props.texts.assigneeSearchPlaceholder}
                value={vm.query}
                onChange={(e) => {
                  vm.setQuery(e.target.value);
                  vm.setOpen(true);
                }}
                onFocus={() => vm.setOpen(true)}
                onBlur={() => setTimeout(() => vm.setOpen(false), 120)}
              />

              {vm.open && vm.filtered.length > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    borderRadius: 10,
                    padding: 6,
                    zIndex: 20,
                    maxHeight: 220,
                    overflow: "auto",
                  }}
                >
                  {vm.filtered.map((member) => (
                    <button
                      key={member.UserId}
                      type="button"
                      className="btn"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        justifyContent: "flex-start",
                        display: "flex",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (member.UserId) vm.addAssignee(member.UserId);
                      }}
                    >
                      {displayMember(member)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="actions">
          {props.mode === "edit" ? (
            <button className="danger" type="button" onClick={vm.remove}>
              {props.texts.deleteButtonText}
            </button>
          ) : (
            <span />
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="secondary" type="button" onClick={props.onClose}>
              {props.texts.cancelButtonText}
            </button>

            <button className="primary" type="button" onClick={vm.save}>
              {props.texts.saveButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
