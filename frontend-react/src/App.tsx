import "./App.css";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Header from "./components/Header.js";
import Home from "./pages/Home.js";
import ProfileSettings from "./pages/ProfileSettings.tsx";
import Login from "./pages/Login.js";
import Register2FA from "./pages/Register2FA.tsx";
import PrivateRoutes from "./components/PrivateRoutes.tsx";
import ValidateOTP from "./pages/ValidateOTP.tsx";
import NotFound from "./pages/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import ProfileCustomization from "./pages/Customization.tsx";
import {ProfileProvider} from "./context/ProfileContext.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import Chat from "./pages/Chat.tsx";
import ChatRoutes from "./components/ChatRoutes.tsx";

function App() {
    //Todo:
    // Adicionar as rotas em um arquivo Routes.tsx
    // Fazer página profile/:id para buscar por profiles de outros usuários
    // Fazer página para o game

    return (
        <Router>
            <ErrorBoundary>
                <AuthProvider>
                    <ProfileProvider>
                        <Header/>
                        <Routes>
                            <Route path="/login" element={<Login/>}/>
                            <Route element={<PrivateRoutes/>}>
                                <Route path="/" element={<Home/>}/>
                                <Route
                                    path="/welcome"
                                    element={<ProfileCustomization title={"Welcome to Pong!!"}/>}
                                />
                                <Route
                                    path="/customization"
                                    element={
                                        <ProfileCustomization title={"Update your profile"}/>
                                    }
                                />

                                <Route path="/profile" element={<ProfileSettings/>}/>
                                <Route path="/register-2fa" element={<Register2FA/>}/>
                                <Route path="/validate-otp" element={<ValidateOTP/>}/>

                            </Route>

                            <Route element={<ChatRoutes/>}>
                                <Route path="/chat" element={<Chat/>}/>
                            </Route>
                            <Route path="*" element={<NotFound/>}/>
                        </Routes>
                    </ProfileProvider>
                </AuthProvider>
            </ErrorBoundary>
        </Router>
    );
}

export default App;
