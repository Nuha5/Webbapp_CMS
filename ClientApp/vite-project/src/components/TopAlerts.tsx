import { useEffect, useState } from 'react';
import type { TopAlert } from '../api/content';
import { fetchTopAlerts } from '../api/content';
import './TopAlerts.css';

export function TopAlerts() {
    const [alerts, setAlerts] = useState<TopAlert[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(
        new Set(JSON.parse(localStorage.getItem('dismissedAlerts') ?? '[]'))
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAlerts() {
            try {
                const data = await fetchTopAlerts();
                setAlerts(data);
            } catch (err) {
                console.error('Failed to load top alerts:', err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        loadAlerts();
    }, []);

    const handleDismiss = (alertId: number) => {
        const newDismissed = new Set(dismissedAlerts);
        newDismissed.add(alertId);
        setDismissedAlerts(newDismissed);
        localStorage.setItem('dismissedAlerts', JSON.stringify(Array.from(newDismissed)));
    };

    if (loading || error || alerts.length === 0) {
        return null;
    }

    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

    if (visibleAlerts.length === 0) {
        return null;
    }

    return (
        <div className="top-alerts-container">
            {visibleAlerts.map((alert) => (
                <div key={alert.id} className={`alert alert-${alert.alertType.toLowerCase()}`}>
                    <div className="alert-content">
                        <span className="alert-message">{alert.message}</span>
                    </div>
                    <button
                        className="alert-dismiss"
                        onClick={() => handleDismiss(alert.id)}
                        aria-label="Close alert"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
