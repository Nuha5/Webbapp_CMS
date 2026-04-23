/**
 * Top Alert Banner Script
 * Handles dismissible alerts with session storage
 */

document.addEventListener('DOMContentLoaded', function () {
    // Find all alert banners
    const alerts = document.querySelectorAll('.top-alert-banner');

    alerts.forEach(alertElement => {
        const alertId = alertElement.id;
        const closeBtn = alertElement.querySelector('.alert-close-btn');
        const storageKey = 'dismissed-' + alertId;

        // Check if alert was previously dismissed in this session
        if (sessionStorage.getItem(storageKey)) {
            alertElement.classList.add('hidden');
        }

        // Close button click handler
        closeBtn?.addEventListener('click', function (e) {
            e.preventDefault();
            alertElement.classList.add('hidden');
            sessionStorage.setItem(storageKey, 'true');
        });
    });
});
