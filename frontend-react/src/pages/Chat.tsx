// import { useProfile } from "../context/ProfileContext.tsx";
// import { ProfileContextData } from "../context/interfaces/ProfileContextData.ts";

import {GroupChat} from "../components/GroupChat.tsx";
import {useState} from "react";
import {DirectChat} from "../components/DirectChat.tsx";

const Chat = () => {
    const [chatMode, setChatMode] = useState<string>("Direct");

    const toggleChatMode = (mode: string) => () => {
        console.log("Chat mode: ", mode);
        setChatMode(mode);
    }

    return (
        <div>
            <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <button
                    className="btn-chan"
                    style={{flex: "1"}}
                    onClick={toggleChatMode("Direct")}
                >
                    Direct
                </button>
                <button
                    className="btn-chan"
                    style={{flex: "1"}}
                    onClick={toggleChatMode("Group")}
                >
                    Group
                </button>
            </div>
            <hr></hr>
            {chatMode === "Direct" ? <DirectChat/> : <GroupChat/>}

        </div>
    );

};

export default Chat;