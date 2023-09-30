import { useState } from "react";

const MessageInput = ({ send }: { send: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return <>
    <input onChange={(e) => setValue(e.target.value)}
           placeholder={"Type your message..."}
           value={value} />
    <button className="btn" onClick={() => send(value)}>Send</button>
  </>;
};

export default MessageInput;