import { useEffect, useState, forwardRef } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { UserPlus, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast";
import useDebounce from "../../hooks/useDebounce";
import { useCreateChat, useGetSearchUsers } from '@/lib/react-query/queries'
import { Skeleton } from "@/components/ui/skeleton"
import { useUserContext } from '@/context/AuthContext'
import { ChatState } from '@/context/ChatContext'
import { getReceiver } from '@/lib/validation/ChatLogics'

// interface Props {
//   fetchAgain: any;
//   ref: React.RefObject<HTMLDivElement>;
// }

interface Props {
  fetchAgain: boolean; // Changed to boolean for clarity
}

// Define ref interface
interface MyChatsRef {
  fetchChats: () => Promise<void>;
}

const MyChats = forwardRef<MyChatsRef, Props>(({ fetchAgain }, ref) => {
  const { toast } = useToast();
  const { user: currentUser } = useUserContext();
  const { chats, setChats, selectedChat, setSelectedChat } = ChatState();

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedUsers, isFetching: isSearchFetching, isLoading } = useGetSearchUsers(debouncedSearch, currentUser.id);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  //   getReceiver(currentUser, usersId)

  // Query
  const { mutateAsync: createChat} = useCreateChat();

  // Handler
  const handleCreateChat = async (userID: string) => {

    // ACTION = CREATE
    const newChat = await createChat({
      chatName: "Sender",
      isGroupChat: false,
      users: [userID],
      currentUserId: currentUser.id,
      usersId: [currentUser.id, userID]
    });
    if (!chats.find((c: any) => c.$id === newChat.$id)) {
      setChats([newChat, ...chats])
    }
    setSelectedChat(newChat);
    setOpen(false);

    if (!newChat) {
      toast({
        title: `create chat failed. Please try again.`,
      });
    }
  };

  const [receivers, setReceivers] = useState<{ [key: string]: any }>({});
  console.log("currentUser",currentUser)
  console.log("chats",chats)

  useEffect(() => {
    const fetchReceivers = async () => {
      const receiverDetailsMap: { [key: string]: any } = {};

      // Loop through chats and fetch full details
      for (const chat of chats) {
        const receiverDetails = await getReceiver(currentUser.id, chat.usersId);
        receiverDetailsMap[chat.$id] = receiverDetails; // Store full details
      }

      setReceivers(receiverDetailsMap);
    };

    fetchReceivers();
  }, [currentUser, chats]);
  console.log("receivers",receivers)
  
  const onSelectedChat = localStorage.getItem("selectedChat");
const selectUser = onSelectedChat ? JSON.parse(onSelectedChat) : null;

  const UserSkeleton = () => (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full bg-[#706f6fab]" />
        <div className="flex flex-col items-start gap-3">
          <Skeleton className="h-3 w-60 bg-[#706f6fab]" />
          <Skeleton className="h-3 w-32 bg-[#706f6fab]" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-[95vh] bg-black text-white">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-lg font-semibold">
              {currentUser?.username}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><UserPlus /></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[#2D2D2D] border-gray-800">
                <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
                  <DialogTitle className="text-white">New message</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                  </Button>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">To:</span>
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => {
                          const { value } = e.target;
                          setSearchValue(value);
                        }}
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="h-px bg-gray-800" />
                  </div>
                  <ScrollArea className="h-[300px] pr-4">
                    {isLoading ? (
                      <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, index) => (
                          <UserSkeleton key={index} />
                        ))}
                      </div>
                    ) : searchedUsers && searchedUsers?.total > 0 ? (
                      <div className="flex flex-col gap-2">
                        {searchedUsers.documents.map((user: any) => (
                          <button
                            key={user.$id}
                            onClick={() => handleCreateChat(user.$id)}
                            className="flex items-center justify-between p-2 rounded hover:bg-[#444] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11">
                                <AvatarImage src={user.imageUrl} alt={user.name} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-white text-sm">{user.name}</span>
                                <span className="text-gray-400 text-sm">{user.username}</span>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border ${selectedUsers.includes(user.$id)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-400'
                                } flex items-center justify-center`}
                            >
                              {selectedUsers.includes(user.$id) && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No account found.
                      </div>
                    )}
                  </ScrollArea>
                  <Button
                    className="w-full bg-[#0095F6] hover:bg-[#1877F2] text-white"
                    disabled={!search}
                  >
                    Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

          <ScrollArea className="h-[calc(100vh-120px)]">
              {/* Chat List */}
              <div className="space-y-2">
                {currentUser && chats &&
                  chats?.map((chat: any) => {
                    const receiver = receivers[chat.$id]; // Fetch full details for the chat

                    return (
                      <>
                      {!receiver ? (<UserSkeleton />) : (
                      <Button key={chat.$id} variant="ghost" className={`w-full px-4 py-8 flex items-center space-x-3 ${selectedChat?.$id === chat?.$id ? 'bg-[#877EFF]' : 'bg-[#000000]'}`}
                        onClick={() => {
                          setSelectedChat(chat)
                          localStorage.setItem('selectedChat', JSON.stringify(chat));
                        }}>
                        <Avatar>
                          <AvatarImage src={receiver?.imageUrl} />
                          <AvatarFallback>{receiver?.name || "Loading..."}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{receiver?.name || "Loading..."}</p>
                          <p className="text-sm text-gray-400">Vikram sent an attachment • 10w</p>
                        </div>
                      </Button>
                      )}
                      </>
                    );
                  })}
              </div>
          </ScrollArea>
      </div>
    </div>
  )
});

export default MyChats;