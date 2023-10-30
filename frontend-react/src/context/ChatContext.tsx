import {createContext, FC, ReactNode, useContext, useEffect, useState} from "react";
import {ChatContextData} from "./interfaces/ChatContextData.ts";
import {Socket} from "socket.io-client";
import {NavigateFunction, useNavigate} from "react-router-dom";
import chatService from "../api/ChatService.ts";
import useThrowAsyncError from "../utils/hooks/useThrowAsyncError.ts";
import {PlayerStatusDto} from "../../../backend/src/chat/models/player/player-status.dto.ts";
import {MessageConversationDto} from "../../../backend/src/chat/models/message/message-conversation.dto.ts";
import {AxiosResponse} from "axios";
import {PrivateMessageHistoryDto} from "../../../backend/src/chat/models/private/private-message-history.dto.ts";
import {PrivateMessageDto} from "../../../backend/src/chat/models/private/private-message.dto.ts";
import {GroupMessageDto} from "../../../backend/src/chat/models/group/group-message.dto.ts";
import {GroupChatDto} from "../../../backend/src/chat/models/group/group-chat.dto.ts";
import {GroupMemberDto} from "../../../backend/src/chat/models/group/group-member.dto.ts";
import {GroupChatEventDto} from "../../../backend/src/chat/models/group/group-chat-event.dto.ts";

const ChatContext = createContext({});

ChatContext.displayName = "ChatContext";

interface WebSocketProviderProps {
    children: ReactNode;
}

export const ChatProvider: FC<WebSocketProviderProps> = ({children}) => {
    // const { user } = useContext(AuthContext) as AuthContextData;
    // const { profile } = useProfile() as ProfileContextData;
    const [playersStatus, setPlayersStatus] = useState<PlayerStatusDto[]>([]);
    const [privateMessageHistory, setPrivateMessageHistory] = useState<PrivateMessageHistoryDto[]>([]);
    const navigate: NavigateFunction = useNavigate();
    const throwAsyncError = useThrowAsyncError();


    useEffect(() => {
        const getPrivateMessageHistory = async (): Promise<PrivateMessageHistoryDto[] | undefined> => {
            try {
                const response: AxiosResponse<PrivateMessageHistoryDto[]> = await chatService.getPrivateMessageHistory();

                return response.data;
            } catch (error) {
                throwAsyncError(error);
            }
        }

        getPrivateMessageHistory().then((history: PrivateMessageHistoryDto[] | undefined): void => {
            if (history) {
                setPrivateMessageHistory(history);
            }
        });

        const socket: Socket = chatService.getSocket();
        socket.connect();

        const onConnect = (): void => {
            console.log("### connected to server via websocket");
        };

        const onException = (message: string): void => {
            console.log(`### received error message ${JSON.stringify(message)}`);
            throwAsyncError(message);
        };

        const onUnauthorized = (message: string): void => {
            console.log(`### received unauthorized message ${JSON.stringify(message)}`);
            socket.disconnect();
            navigate("/login");
        };


        const onPlayersStatus = (onlineUsers: PlayerStatusDto[]): void => {
            console.log(`### received online users ${JSON.stringify(onlineUsers)}`);

            setPlayersStatus(onlineUsers);
        };

        const onPrivateMessage = (message: PrivateMessageDto): void => {
            setPrivateMessageHistory((prevHistory: PrivateMessageHistoryDto[]): PrivateMessageHistoryDto[] => {
                console.log(`### received private ${message.message} message id: ${message.sender.id} | history ids: ${JSON.stringify(prevHistory.map((h: PrivateMessageHistoryDto) => h.id))}`);

                if (!prevHistory.find((history: PrivateMessageHistoryDto): boolean => history.id === message.sender.id)) {
                    const newHistory: PrivateMessageHistoryDto[] = prevHistory;

                    console.log(`### prev history: ${JSON.stringify(prevHistory)}`);
                    newHistory.push({
                        id: message.sender.id,
                        nickname: message.sender.nickname,
                        messages: [
                            {
                                id: message.id,
                                message: message.message,
                                sender: {
                                    id: message.sender.id,
                                    nickname: message.sender.nickname
                                },
                                createdAt: message.createdAt,
                            }
                        ]
                    })

                    console.log(`### new history: ${JSON.stringify(newHistory)}`);

                    return newHistory;
                }

                return prevHistory.map((history: PrivateMessageHistoryDto): PrivateMessageHistoryDto => {
                    if (history.id === message.sender.id) {

                        if (history.messages.find((m: MessageConversationDto): boolean => m.id === message.id)) {
                            return history;
                        }

                        history.messages.push({
                            id: message.id,
                            message: message.message,
                            sender: {
                                id: message.sender.id,
                                nickname: message.sender.nickname
                            },
                            createdAt: message.createdAt
                        });
                    }
                    return history;
                });
            });
        }

        const onGroupMessage = (groupMessage: GroupMessageDto): void => {
            console.log(`### received group message ${JSON.stringify(groupMessage.message)}`);
        }

        const onGroupChatCreated = (groupChatDto: GroupChatDto): void => {
            console.log(`### received group chat created ${JSON.stringify(groupChatDto)}`);
        }

        //When the group chat password is deleted, the group chat visibility is set to public
        const onGroupChatPasswordDeleted = (groupChatDto: GroupChatDto): void => {
            console.log(`### received group chat password deleted ${JSON.stringify(groupChatDto)}`);
        }

        const onGroupChatDeleted = (groupChatEvent: GroupChatEventDto): void => {
            console.log(`### received group chat deleted ${JSON.stringify(groupChatEvent)}`);
        }

        const onGroupChatPasswordUpdated = (groupChatEvent: GroupChatEventDto): void => {
            console.log(`### received group chat password updated ${JSON.stringify(groupChatEvent)}`);
        }

        const onJoinedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received joined group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onLeaveGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received leave group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onAddedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received added group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onKickedGroupChatMember = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received kicked group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onUpdatedGroupChatMemberRole = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received updated group chat member role ${JSON.stringify(groupMemberDto)}`);
        }

        const onGroupChatMemberMuted = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received muted group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onGroupChatMemberUnmuted = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received unmuted group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onGroupChatMemberBanned = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received banned group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        const onGroupChatMemberUnBanned = (groupMemberDto: GroupMemberDto): void => {
            console.log(`### received unbanned group chat member ${JSON.stringify(groupMemberDto)}`);
        }

        socket.on("connect", onConnect);
        socket.on("exception", onException);
        socket.on("unauthorized", onUnauthorized);
        socket.on("playersStatus", onPlayersStatus);
        socket.on("receivePrivateMessage", onPrivateMessage);
        socket.on("receiveGroupMessage", onGroupMessage);
        socket.on("groupChatCreated", onGroupChatCreated);
        socket.on("groupChatDeleted", onGroupChatDeleted);
        socket.on("groupChatPasswordUpdated", onGroupChatPasswordUpdated);
        socket.on("groupChatPasswordDeleted", onGroupChatPasswordDeleted);
        socket.on("joinedGroupChatMember", onJoinedGroupChatMember);
        socket.on("leaveGroupChatMember", onLeaveGroupChatMember);
        socket.on("addedGroupChatMember", onAddedGroupChatMember);
        socket.on("kickedGroupChatMember", onKickedGroupChatMember);
        socket.on("groupChatMemberRoleUpdated", onUpdatedGroupChatMemberRole);
        socket.on("groupChatMemberMuted", onGroupChatMemberMuted);
        socket.on("groupChatMemberUnmuted", onGroupChatMemberUnmuted);
        socket.on("groupChatMemberBanned", onGroupChatMemberBanned);
        socket.on("groupChatMemberUnbanned", onGroupChatMemberUnBanned);


        return (): void => {
            socket.off("connect");
            socket.off("error");
            socket.off("playersStatus");
            socket.off("receivePrivateMessage");
            socket.off("receiveGroupMessage");
            socket.off("groupChatCreated");
            socket.off("groupChatDeleted");
            socket.off("groupChatPasswordUpdated");
            socket.off("groupChatPasswordDeleted");
            socket.off("joinedGroupChatMember");
            socket.off("leaveGroupChatMember");
            socket.off("addedGroupChatMember");
            socket.off("kickedGroupChatMember");
            socket.off("groupChatMemberRoleUpdated");
            socket.off("groupChatMemberMuted");
            socket.off("groupChatMemberUnmuted");
            socket.off("groupChatMemberBanned")
            socket.off("groupChatMemberUnbanned")
            socket.disconnect();
        };
    }, []);


    const sendMessage = (message: string): void => {
        chatService.emitMessage(message);
    };

    const sendPrivateMessage = async (message: PrivateMessageDto): Promise<PrivateMessageDto> => {
        return await chatService.emitPrivateMessage(message);
    }

    const disconnect = () => {
        chatService.disconnect();
    }


    const updatePrivateMessageHistory = (history: PrivateMessageHistoryDto): void => {
        if (privateMessageHistory.find((h: PrivateMessageHistoryDto): boolean => h.id == history.id)) {
            return;
        }

        privateMessageHistory.push({
            id: history.id,
            nickname: history.nickname,
            messages: history.messages
        })
        setPrivateMessageHistory(privateMessageHistory);
    }

    const updatePrivateMessageHistoryFromMessageDto = (privateMessageDto: PrivateMessageDto): void => {
        console.log(`Received private message id: ${privateMessageDto.id} from ${privateMessageDto.sender.nickname}`)
        const newHistory: PrivateMessageHistoryDto[] = privateMessageHistory.map((history: PrivateMessageHistoryDto): PrivateMessageHistoryDto => {
            if (history.id != privateMessageDto.receiver.id) {
                return history;
            }

            if (history.messages.find((m: MessageConversationDto): boolean => m.id === privateMessageDto.id)) {
                return history;
            }

            history.messages.push({
                id: privateMessageDto.id,
                message: privateMessageDto.message,
                sender: privateMessageDto.sender,
                createdAt: privateMessageDto.createdAt,
            })

            return history;
        })
        setPrivateMessageHistory(newHistory);
    }

    const contextData: ChatContextData = {
        sendMessage,
        sendPrivateMessage,
        disconnect,
        updatePrivateMessageHistory,
        updatePrivateMessageHistoryFromMessageDto,
        privateMessageHistory,
        playersStatus
    };

    return <ChatContext.Provider value={contextData}>{children}</ChatContext.Provider>;
};

export const useChat = (): unknown => useContext(ChatContext);