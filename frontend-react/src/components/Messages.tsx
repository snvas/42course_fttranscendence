import {ComponentMessage} from "../interfaces/ComponentMessage.ts";
import {useEffect, useState} from "react";
import {formatDistanceToNow, parseISO} from 'date-fns';


const Messages = ({messages}: {
    messages: ComponentMessage[]
}) => {
    const [conversations, setConversations] = useState(messages);

    useEffect(() => {
        setConversations(messages);
    }, [messages]);

    const parseDate = (date: string) => {
        const newDate: Date = parseISO(date);
        const timeZoneOffsetMinutes: number = newDate.getTimezoneOffset();

        const adjustedDate: Date = new Date(newDate.getTime() - timeZoneOffsetMinutes * 60 * 1000);

        return formatDistanceToNow(adjustedDate, {
            addSuffix: true,
        });
    }

    return (
        <div style={{overflow: "auto", maxHeight: "500px"}}>
            {conversations.map((conversation: ComponentMessage) =>

                <div key={conversation.uuid} style={{display: "flex", justifyContent: "space-between"}}>
                    <div style={{marginLeft: "10px"}}>
                        {`${conversation.nickname}: ${conversation.message}`}
                    </div>
                    <div style={{marginRight: "10px"}}>
                        <span style={{fontWeight: 100, color: "gray"}}>
                            {parseDate(conversation.createdAt)}
                        </span>
                        {conversation.sync ? " ✅" : " 🔄"}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;