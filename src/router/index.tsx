import { Routes, Route } from "react-router-dom";
import '../index.css'
import SplashPage from "../pages/Boot/BootPage";
import CountryPage from "../pages/Setup/Country/CountryPage";
import NetworkPage from "../pages/Setup/Network/NetworkPage";
import SigninPage from "../pages/Setup/SignIn/SigninPage";
import ForgotPage from "../pages/Setup/ForgotPassword/ForgotPage";
import DevicePage from "../pages/Setup/DeviceName/DevicePage";
import CreatePinPage from "../pages/Setup/CreatePin/CreatePinPage";
import IntroPage from "../pages/Setup/Intro/IntroPage";
import InitPage from "../pages/Initializing/InitPage";
import WelcomePage from "../pages/Welcome/WelcomePage";
import LockscreenPage from "../pages/Lockscreen/LockscreenPage";
import DesktopPage from "../pages/Desktop/DesktopPage";

export default function Router() {
    return(
        <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/country" element={<CountryPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/signIn" element={<SigninPage />} />
            <Route path="/deviceName" element={<DevicePage />} />
            <Route path="/createPin" element={<CreatePinPage />} />
            <Route path="/forgotPassword" element={<ForgotPage />} />
            <Route path="/intro" element={<IntroPage />} />
            <Route path="/init" element={<InitPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/lockScreen" element={<LockscreenPage />} />
            <Route path="/desktop" element={<DesktopPage />} />
        </Routes>
    );
}