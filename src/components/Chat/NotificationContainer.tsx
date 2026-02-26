import React, { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { ChatNotification } from './ChatNotification';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useContext(ChatContext)!;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ChatNotification
            userName={notification.userName}
            messagePreview={notification.messagePreview}
            onClose={() => removeNotification(notification.id)}
            onClick={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};
