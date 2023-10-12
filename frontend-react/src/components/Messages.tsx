import {ComponentMessage} from "../interfaces/ComponentMessage.ts";

const Messages = ({messages}: {
    messages: ComponentMessage[]
}) => {

    return (
        <div>
            <div>
                {messages.map((conversation: ComponentMessage) =>

                    <div key={conversation.uuid} style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{marginLeft: "10px"}}>
                            {`${conversation.nickname}: ${conversation.message}`}
                        </div>
                        <div style={{marginRight: "10px"}}>
                            {conversation.createdAt.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Messages;