const Messages = ({messages}: { messages: string[] }) => {

    return (
        <div>
            {messages.map((message: string, index) =>
                <div key={index} style={{marginLeft: "10px"}}>
                    {message}
                </div>)
            }
        </div>
    );
};

export default Messages;