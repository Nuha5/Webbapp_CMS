import type { ShareModalTexts } from "../../cms/projectDashboardCms";
import { useShareModal, type ProjectRole } from "./useShareModal";

export function ShareModal({
  projectId,
  onClose,
  texts,
}: {
  projectId: string;
  onClose: () => void;
  texts: ShareModalTexts;
}) {
  const { email, setEmail, role, setRole, error, busy, done, submit } = useShareModal(
    projectId,
    texts
  );

  return (
    <div className="backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3 style={{ marginTop: 0 }}>{texts.title}</h3>

        {error ? (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        {done ? <div className="pill">{done}</div> : null}

        <div className="row">
          <label htmlFor="share-email">{texts.emailLabel}</label>
          <input
            id="share-email"
            name="share-email"
            className="input"
            placeholder={texts.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="row">
          <label htmlFor="share-role">{texts.roleLabel}</label>
          <select
            id="share-role"
            name="share-role"
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
          >
            <option value="Member">{texts.memberLabel}</option>
            <option value="Owner">{texts.ownerLabel}</option>
          </select>
        </div>

        <div className="actions">
          <span />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="secondary" type="button" onClick={onClose}>
              {texts.closeButtonText}
            </button>
            <button className="primary" type="button" onClick={submit} disabled={busy}>
              {texts.submitButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
