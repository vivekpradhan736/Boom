import React, { useEffect, useState } from 'react';
// import { databases, client } from '../../lib/appwrite/config.ts';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Phone, Video, Info, Smile, Mic, ImageIcon, Heart, MessageCircle, Send } from 'lucide-react'
import { useUserContext } from '@/context/AuthContext.tsx';
import { formatDate, getReceiver } from '@/lib/validation/ChatLogics.ts';
import { ChatState } from '@/context/ChatContext.tsx';
import ScrollableChat from './ScrollableChat.tsx';
import { useCreateMessage, useGetAllMessages } from '@/lib/react-query/queries.ts';

interface ReceiverDetails {
    name: string;
    email?: string;
    username?: string
    imageUrl?: string;
    
    // Add other fields as per your `getUserById` response
  }

  interface Props {
    fetchAgain: any;
    setFetchAgain: any;
    triggerChild2Function: any;
  }

const Chatbox = ({fetchAgain, setFetchAgain, triggerChild2Function} : Props) => {
    const { user:currentUser } = useUserContext();
    const { chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [fetchReceiversLoading, setFetchReceiversLoading] = useState(false);
  const {data: allMessage, isLoading: isMessageLoading, isError: isErrorMessages} = useGetAllMessages();
  const { mutateAsync: createMessage} = useCreateMessage();

  const [receivers, setReceivers] = useState<ReceiverDetails>();

  useEffect(() => {
    const fetchReceivers = async () => {
      setFetchReceiversLoading(true);
        const receiverDetails = await getReceiver(currentUser.id, selectedChat?.usersId);

      setReceivers(receiverDetails);
      setFetchReceiversLoading(false);
    };
    
    fetchReceivers();
}, [selectedChat?.usersId]);

  const databaseId = '654142c6131cb14ee46a'; // Replace with your database ID
  const collectionId = '675b2e4a0036f4290f90'; // Replace with your collection ID

  
  // Subscribe to real-time updates
  useEffect(() => {
    if (allMessage && selectedChat) {
      // Filter messages based on the specific chat ID
      const filteredMessages = allMessage?.documents?.filter(
        (doc: any) => doc?.chat?.$id === selectedChat?.$id
      );
  
      // Set the filtered messages in state
      setMessages(filteredMessages);
    }

    // const unsubscribe = client.subscribe(
    //   [`databases.${databaseId}.collections.${collectionId}.documents`],
    //   (response) => {
    //     if (response.events.includes('databases.*.collections.*.documents.*.create')) {
    //       const payload = response.payload as any

    //     if (payload.chat.$id === selectedChat?.$id) {
    //       setMessages((prev) => 
    //         [...prev, payload].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    //       );
    //       console.log("messages2",messages)
    //       }
    //     }
    //   }
    // );

    return () => {
      // unsubscribe(); // Clean up the subscription
    };
  }, [selectedChat?.$id, allMessage]);

  // Function to send a new message
  const sendMessage = async () => {
    try {
      const newCraeteMessage = await createMessage({
        content: newMessage,
        sender: currentUser?.id, // Replace with the logged-in user ID
        chat: selectedChat?.$id,
        timestamp: new Date().toISOString(),
      });
      console.log("newCraeteMessage",newCraeteMessage)
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="w-[100%]">
      {selectedChat === null ? (
        <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full border-2 border-blue-600 p-6">
        <Avatar className="h-12 w-12">
              <AvatarImage src="/assets/images/logo3.png" />
            </Avatar>
            </div>
          <h2 className="text-xl font-medium text-white">Your messages</h2>
          <p className="text-gray-400 text-sm">Send a message to start a chat.</p>
          <Button 
            className="mt-1 bg-[#0095FF] hover:bg-[#0095FF]/90 text-white"
            size="sm"
          >
            Send message
          </Button>
        </div>
      </div>
      ) : (
        <>
        <div className="flex-1 flex flex-col w-[60vw]">
        {/* Chat Messages */}
        <ScrollableChat receivers={receivers} selectedChat={selectedChat} messages={messages} isMessageLoading={isMessageLoading} fetchReceiversLoading={fetchReceiversLoading} />

        {/* Message Input Section */}
        <div className="p-4 bg-gray-800 sticky bottom-0 left-0 right-0 z-10">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                        >
                            <Smile className="h-6 w-6" />
                        </Button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newMessage.trim()) {
                                  sendMessage();
                              }
                          }}
                            placeholder="Type your message..."
                            className="flex-1 p-3 bg-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                        >
                            <Mic className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                        >
                            <ImageIcon className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                        >
                            <Heart className="h-6 w-6" />
                        </Button>
                        <Button
                            onClick={sendMessage}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Chatbox;