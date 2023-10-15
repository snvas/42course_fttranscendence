import {useState} from "react";

const MessageInput = ({send}: { send: (value: string) => void }) => {
    const [value, setValue] = useState("");

    function handleSendMessage() {
        send(value);
        setValue("");
    }

    return <div style={{position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px", background: "white"}}>
        <div style={{display: "flex"}}>
            <input
                onChange={(e) => setValue(e.target.value)}
                placeholder={"Type your message..."}
                value={value}
                style={{flex: 1, marginRight: "10px"}}
            />
            <button className="btn" onClick={handleSendMessage}>Send</button>
        </div>
    </div>;
};

export default MessageInput;