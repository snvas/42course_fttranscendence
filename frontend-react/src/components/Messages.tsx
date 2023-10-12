import {ComponentMessage} from "../interfaces/ComponentMessage.ts";

const Messages = ({messages}: {
    messages: ComponentMessage[]
}) => {

    return (
        <div>
            <div>
                {messages.map((conversation: ComponentMessage, index: number) =>

                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div key={conversation.uuid} style={{marginLeft: "10px"}}>
                            {`${conversation.nickname}: ${conversation.message}`}
                        </div>
                        <div style={{marginRight: "10px"}} key={index}>
                            {conversation.createdAt.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Messages;