import {GroupMessageDto} from "../../../backend/src/chat/dto/group-message.dto.ts";

const Messages = ({messages}: { messages: GroupMessageDto[] }) => {

    return (
        <div>
            {messages.map((message, index) =>
                <div key={index}>{JSON.stringify(message)}</div>)
            }
        </div>
    );
};

export default Messages;