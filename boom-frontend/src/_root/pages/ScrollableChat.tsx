import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, Info, Mic, ImageIcon, Smile, Heart, Send } from 'lucide-react'
import { formatDate, isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '@/lib/validation/ChatLogics'
import { useUserContext } from "@/context/AuthContext"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader } from "@/components/shared"

const ScrollableChat = ({ receivers, selectedChat, messages, isMessageLoading, fetchReceiversLoading }: any) => {
    const { user } = useUserContext();
    return (
        <>
            <div className="flex flex-col h-[87vh]">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={receivers?.imageUrl} />
                            <AvatarFallback>{receivers?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-white">{receivers?.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon">
                            <Phone className="h-5 w-5 text-gray-400 hover:text-white" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Video className="h-5 w-5 text-gray-400 hover:text-white" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Info className="h-5 w-5 text-gray-400 hover:text-white" />
                        </Button>
                    </div>
                </div>
                {isMessageLoading === true || fetchReceiversLoading === true ? (
                    <div className="flex justify-center items-center h-[100%]">
                        <Loader />
                    </div>) : (
                    <>
                {/* Scrollable Chat Section */}
                <ScrollArea className="flex-grow px-4 py-6 overflow-y-auto bg-gray-900">
                    
                <div className="flex flex-col items-center space-y-4 mb-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={receivers?.imageUrl} />
                        <AvatarFallback>{receivers?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{receivers?.name}</h2>
                    <p className="text-gray-400">{receivers?.username} • Instagram</p>
                    <Button variant="secondary" className="mt-1 bg-[#0095FF] hover:bg-[#0095FF]/90 text-white cursor-pointer" size="sm" >
                    <Link to={`/profile/${receivers?.$id}`}>
                        View profile
                    </Link>
                    </Button>
                    <p className="text-gray-400 text-sm mt-4">{formatDate(selectedChat?.$createdAt)}</p>
                </div>

                    <div className="space-y-4">
                        {messages?.map((m: any, i: number) => {
                            const isFirstMessage =
                                i === 0 ||
                                new Date(messages[i - 1].$createdAt).toDateString() !==
                                    new Date(m.$createdAt).toDateString()

                            return (
                                <div key={m._id} className="flex flex-col">
                                    {isFirstMessage && (
                                        <div className="flex justify-center mb-4">
                                            <p className="text-center text-gray-400 text-sm w-auto px-3 py-1 rounded-full bg-gray-700">
                                                {new Date(m.$createdAt).toDateString()}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-end mb-2">
                                        {(isSameSender(messages, m, i, user.id) ||
                                            isLastMessage(messages, i, user.id)) && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={m.sender.imageUrl}
                                                                alt={m.sender.name}
                                                            />
                                                            <AvatarFallback>
                                                                {m.sender.name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{m.sender.name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}

                                        <div
                                            className={`px-4 py-2 rounded-2xl max-w-[75%] text-white ${
                                                m.isDeletedMessage
                                                    ? "bg-gray-500"
                                                    : m.sender.$id === user.id
                                                    ? "bg-blue-500 ml-auto"
                                                    : "bg-gray-700"
                                            }`}
                                            style={{
                                                marginLeft: isSameSenderMargin(
                                                    messages,
                                                    m,
                                                    i,
                                                    user.id
                                                ),
                                                marginTop: isSameUser(messages, m, i) ? 2 : 10,
                                            }}
                                        >
                                            <p
                                                className={`${
                                                    m?.isDeletedMessage ? "italic" : ""
                                                } text-sm sm:text-base`}
                                            >
                                                {m?.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
                </>
                )}
            </div>
        </>
    )
}

export default ScrollableChat
