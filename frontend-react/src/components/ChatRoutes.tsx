import {useAuth} from "../context/AuthContext.tsx";
import {AuthContextData} from "../context/interfaces/AuthContextData.ts";
import {Navigate, Outlet} from "react-router-dom";
import {ProfileContextData} from "../context/interfaces/ProfileContextData.ts";
import {useProfile} from "../context/ProfileContext.tsx";
import {ChatProvider} from "../context/ChatContext.tsx";

const ChatRoutes = () => {
    const {user} = useAuth() as AuthContextData;
    const {profile} = useProfile() as ProfileContextData;

    if (!profile) return <Navigate to="/welcome"/>;

    return !user ? <Navigate to="/login"/> : <ChatProvider> <Outlet/> </ChatProvider>;
};

export default ChatRoutes;
