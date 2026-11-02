export const trackEvent = (action, label) => {
    const eventData = {
        action,
        label,
        timestamp: new Date().toISOString(),
    };
    // Mock tracking: log to console
    console.log('[Analytics Event]', eventData);
    // In a real implementation, this would send to an analytics endpoint
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(eventData) });
};
