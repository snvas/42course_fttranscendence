import {GroupRoom} from "./GroupRoom.tsx";
import {useState} from "react";
import {GroupList} from "./GroupList.tsx";

export const GroupChat = () => {
    const [selectedGroup, /*setSelectedGroup*/] = useState<string>("")


    return (
        selectedGroup ? <GroupRoom/> : <GroupList/>
    )
}