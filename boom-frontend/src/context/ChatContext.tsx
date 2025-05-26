import { getCurrentUser } from "@/lib/mongodb/api";
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import { useNavigate } from "react-router-dom";
import { useUserContext } from "./AuthContext";
  
  // Define the shape of the context
  interface ChatContextType {
    selectedChat: any;
    setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
    notification: NotificationType[];
    setNotification: React.Dispatch<React.SetStateAction<NotificationType[]>>;
    chats: any;
    setChats: React.Dispatch<React.SetStateAction<any>>;
  }
  
  // Define a User type (modify as per your user data structure)
  interface UserType {
    id: string;
    name: string;
    email: string;
  }
  
  // Define Notification type (modify as per your notification data structure)
  interface NotificationType {
    id: string;
    chatId: string;
    content: string;
  }
  
  // Props type for the provider
  interface ChatProviderProps {
    children: ReactNode;
  }
  
  // Create the context with default value as undefined
  const ChatContext = createContext<ChatContextType | undefined>(undefined);
  
  // ChatProvider Component
  const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const { user } = useUserContext();
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [notification, setNotification] = useState<NotificationType[]>([]);
    const [chats, setChats] = useState<any[]>([]);
  
    const navigate = useNavigate();

    const checkAuthUser = async () => {
        try {
          const currentAccount = await getCurrentUser();
          console.log("currentAccount",currentAccount)
          if (currentAccount) {
            setChats(currentAccount.chats)
          }
        } catch (error) {
          console.error(error);
        }
      };
  
    useEffect(() => {
        checkAuthUser()
  
      const savedUnreadMessages = JSON.parse(
        localStorage.getItem("notificationChat") || "[]"
      );
      setNotification(savedUnreadMessages || []);
    }, [user]);
  
    return (
      <ChatContext.Provider
        value={{
          selectedChat,
          setSelectedChat,
          notification,
          setNotification,
          chats,
          setChats,
        }}
      >
        {children}
      </ChatContext.Provider>
    );
  };
  
  // Custom Hook to access ChatState
  export const ChatState = () => {
    const context = useContext(ChatContext);
    if (!context) {
      throw new Error("ChatState must be used within a ChatProvider");
    }
    return context;
  };
  
  export default ChatProvider;  