import React, { createContext, useCallback, useMemo, useReducer, ReactNode, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ActiveUser {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'inactive' | 'offline';
  lastSeen: Date;
  unreadCount: number;
  hasUnreadMessages?: boolean;
}

export interface Notification {
  id: string;
  userName: string;
  messagePreview: string;
}

export interface ChatContextType {
  activeUsers: ActiveUser[];
  messages: ChatMessage[];
  currentChat: { userId: string; userName: string } | null;
  unreadCount: number;
  isContactsModalOpen: boolean;
  isTyping: boolean;
  notifications: Notification[];
  
  openContactsModal: () => void;
  closeContactsModal: () => void;
  openChat: (userId: string, userName: string) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  markAsRead: (userId: string) => void;
  setActiveUsers: (users: ActiveUser[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsTyping: (typing: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  markUserUnread: (userId: string) => void;
  markUserRead: (userId: string) => void;
}

type ChatAction =
  | { type: 'OPEN_CONTACTS_MODAL' }
  | { type: 'CLOSE_CONTACTS_MODAL' }
  | { type: 'OPEN_CHAT'; payload: { userId: string; userName: string } }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SET_ACTIVE_USERS'; payload: ActiveUser[] }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'SET_IS_TYPING'; payload: boolean }
  | { type: 'INCREMENT_UNREAD' }
  | { type: 'DECREMENT_UNREAD' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_USER_UNREAD'; payload: string }
  | { type: 'MARK_USER_READ'; payload: string };

interface ChatState {
  activeUsers: ActiveUser[];
  messages: ChatMessage[];
  currentChat: { userId: string; userName: string } | null;
  unreadCount: number;
  isContactsModalOpen: boolean;
  isTyping: boolean;
  notifications: Notification[];
}

const initialState: ChatState = {
  activeUsers: [],
  messages: [],
  currentChat: null,
  unreadCount: 0,
  isContactsModalOpen: false,
  isTyping: false,
  notifications: []
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CONTACTS_MODAL':
      return { ...state, isContactsModalOpen: true };
    
    case 'CLOSE_CONTACTS_MODAL':
      return { ...state, isContactsModalOpen: false };
    
    case 'OPEN_CHAT':
      return {
        ...state,
        currentChat: action.payload,
        isContactsModalOpen: false
      };
    
    case 'CLOSE_CHAT':
      return { ...state, currentChat: null };
    
    case 'SET_ACTIVE_USERS':
      return { ...state, activeUsers: action.payload };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.senderId === action.payload ? { ...msg, read: true } : msg
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'SET_IS_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'INCREMENT_UNREAD':
      return { ...state, unreadCount: state.unreadCount + 1 };
    
    case 'DECREMENT_UNREAD':
      return { ...state, unreadCount: Math.max(0, state.unreadCount - 1) };
    
    case 'ADD_NOTIFICATION':
      console.log('➕ ADD_NOTIFICATION action:', action.payload);
      return { ...state, notifications: [...state.notifications, action.payload] };
    
    case 'REMOVE_NOTIFICATION':
      console.log('➖ REMOVE_NOTIFICATION action:', action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'MARK_USER_UNREAD':
      return {
        ...state,
        activeUsers: state.activeUsers.map(u =>
          u.id === action.payload ? { ...u, hasUnreadMessages: true } : u
        )
      };
    
    case 'MARK_USER_READ':
      return {
        ...state,
        activeUsers: state.activeUsers.map(u =>
          u.id === action.payload ? { ...u, hasUnreadMessages: false } : u
        )
      };
    
    default:
      return state;
  }
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const openContactsModal = useCallback(() => {
    dispatch({ type: 'OPEN_CONTACTS_MODAL' });
  }, []);

  const closeContactsModal = useCallback(() => {
    dispatch({ type: 'CLOSE_CONTACTS_MODAL' });
  }, []);

  const openChat = useCallback((userId: string, userName: string) => {
    dispatch({ type: 'OPEN_CHAT', payload: { userId, userName } });
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: 'CLOSE_CHAT' });
  }, []);

  const setActiveUsers = useCallback((users: ActiveUser[]) => {
    dispatch({ type: 'SET_ACTIVE_USERS', payload: users });
  }, []);

  const setMessages = useCallback((messages: ChatMessage[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const markAsRead = useCallback((userId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: userId });
  }, []);

  const setIsTyping = useCallback((typing: boolean) => {
    dispatch({ type: 'SET_IS_TYPING', payload: typing });
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  }, []);

  const incrementUnread = useCallback(() => {
    dispatch({ type: 'INCREMENT_UNREAD' });
  }, []);

  const decrementUnread = useCallback(() => {
    dispatch({ type: 'DECREMENT_UNREAD' });
  }, []);

  const markUserUnread = useCallback((userId: string) => {
    dispatch({ type: 'MARK_USER_UNREAD', payload: userId });
  }, []);

  const markUserRead = useCallback((userId: string) => {
    dispatch({ type: 'MARK_USER_READ', payload: userId });
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!state.currentChat || !content.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: localStorage.getItem('current_user_id') || '',
      senderName: JSON.parse(localStorage.getItem('current_user') || '{}').name || 'Unknown',
      receiverId: state.currentChat.userId,
      content: content.trim(),
      timestamp: new Date(),
      read: false
    };

    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, [state.currentChat]);

  const value = useMemo(
    () => ({
      activeUsers: state.activeUsers,
      messages: state.messages,
      currentChat: state.currentChat,
      unreadCount: state.unreadCount,
      isContactsModalOpen: state.isContactsModalOpen,
      isTyping: state.isTyping,
      notifications: state.notifications,
      openContactsModal,
      closeContactsModal,
      openChat,
      closeChat,
      sendMessage,
      markAsRead,
      setActiveUsers,
      setMessages,
      addMessage,
      setIsTyping,
      addNotification,
      removeNotification,
      incrementUnread,
      decrementUnread,
      markUserUnread,
      markUserRead
    }),
    [
      state.activeUsers,
      state.messages,
      state.currentChat,
      state.unreadCount,
      state.isContactsModalOpen,
      state.isTyping,
      state.notifications,
      openContactsModal,
      closeContactsModal,
      openChat,
      closeChat,
      sendMessage,
      markAsRead,
      setActiveUsers,
      setMessages,
      addMessage,
      setIsTyping,
      addNotification,
      removeNotification,
      incrementUnread,
      decrementUnread,
      markUserUnread,
      markUserRead
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
