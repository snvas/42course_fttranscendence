import { ChatMessageDto } from "../../../backend/src/chat/dto/chat-message.dto.ts";

const Messages = ({ messages }: { messages: ChatMessageDto[] }) => {

  return (
    <div>
      {messages.map((message, index) =>
        <div key={index}>{JSON.stringify(message)}</div>)
      }
    </div>
  );
};

export default Messages;