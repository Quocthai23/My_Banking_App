import React from 'react';
import useStore from '../store/useStore.js';

function Notification() {
  const notifications = useStore((state) => state.notifications);
  const removeNotification = useStore((state) => state.removeNotification);

  if (notifications.length === 0) {
    return null;
  }

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed top-20 right-5 z-50 space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${getBackgroundColor(notif.type)} text-white px-4 py-3 rounded-md shadow-lg flex items-center justify-between animate-fade-in-right`}
        >
          <span>{notif.message}</span>
          <button onClick={() => removeNotification(notif.id)} className="ml-4 text-xl font-bold">&times;</button>
        </div>
      ))}
    </div>
  );
}

export default Notification;
