import APPS from "../assets/appIcons/AppStore.png";
import BROWSER from "../assets/appIcons/browser.png";
import CALCULATOR from "../assets/appIcons/calculator.png";
import CALENDAR from "../assets/appIcons/calendar.png";
import CAMERA from "../assets/appIcons/camera.png";
import CHAT from "../assets/appIcons/Interacts.png";
import CLOCK from "../assets/appIcons/clock.png";
import DOCS from "../assets/appIcons/docs.png";
import DRIVE from "../assets/appIcons/drive.png";
import EXPLORER from "../assets/appIcons/FileExplorer.png";
import FACEBOOK from "../assets/appIcons/facebook.png";
import FIREBASE from "../assets/appIcons/firebase.png";
import FORMS from "../assets/appIcons/forms.png";
import GALLERY from "../assets/appIcons/gallery.png";
import GAMES from "../assets/appIcons/GameHub.png";
import GITHUB from "../assets/appIcons/github.png";
import INSTAGRAM from "../assets/appIcons/instagram.png";
import REDDIT from "../assets/appIcons/reddit.png";
import LINKEDIN from "../assets/appIcons/linkedin.png";
import MAIL from "../assets/appIcons/mail.png";
import MAP from "../assets/appIcons/map.png";
import MEET from "../assets/appIcons/meet.png";
import MUSIC from "../assets/appIcons/MusicPlayer.png";
import NOTEPAD from "../assets/appIcons/notepad.png";
import SETTINGS from "../assets/appIcons/settings.png";
import SHEETS from "../assets/appIcons/sheets.png";
import SLIDES from "../assets/appIcons/slides.png";
import TERMINAL from "../assets/appIcons/terminal.png";
import VIDEO from "../assets/appIcons/VideoPlayer.png";
import VSCODE from "../assets/appIcons/vscode.png";
import WHATSAPP from "../assets/appIcons/whatsapp.png";
import YOUTUBE from "../assets/appIcons/youtube.png";
import PROFILE from "../assets/dev_icon.png";
import FileExplorer from "./fileManager/fileExplorer.tsx";
import AboutDev from "./aboutDev/developer.tsx";
import ChromeBrowser from "./chrome/chrome.tsx";
import TerminalBox from "./terminal/terminal.tsx";
import Settings from "./settings/settings.tsx";
import AppStore from "./appstore/appstore.tsx";
import WebViewApps from "./webView/webViewApps.tsx";
import NotepadApp from "./notepad/notepad.tsx";
import Calculator from "./calculator/calculator.tsx";
import CalendarApp from "./calendar/calendar.tsx";
import ClockApp from "./clock/clock.tsx";
import CameraApp from "./camera/camera.tsx";
import PhotosCloneApp from "./photos/gallery.tsx";
import VideoPlayer from "./videoPlayer/videoPlayer.tsx";
import MusicPlayerApp from "./musicPlayer/musicPlayer.tsx";
import GamesHubApp from "./gamesHub/gameHub.tsx";

export const appRegistry = {
    // --- Core System Apps ---
    explorer: {
        id: "explorer",
        name: "File Explorer",
        defaultSize: { width: 1600, height: 850 },
        icon: EXPLORER,
        component: <FileExplorer />
    },
    developer: {
        id: "developer",
        name: "Developer",
        defaultSize: { width: 1200, height: 700 },
        icon: PROFILE,
        component: <AboutDev />
    },
    chrome: {
        id: "chrome",
        name: "Browser",
        defaultSize: { width: 1200, height: 700 },
        icon: BROWSER,
        component: <ChromeBrowser />,
    },
    terminal: {
        id: "terminal",
        name: "Terminal",
        defaultSize: { width: 1000, height: 700 },
        icon: TERMINAL,
        component: <TerminalBox />
    },
    settings: {
        id: "settings",
        name: "Settings",
        defaultSize: { width: 1000, height: 700 },
        icon: SETTINGS,
        component: <Settings />
    },
    appstore: {
        id: "appstore",
        name: "App Store",
        defaultSize: { width: 1200, height: 700 },
        icon: APPS,
        component: <AppStore />
    },

    // --- Productivity & Tools ---
    vscode: {
        id: "vscode",
        name: "VS Code",
        defaultSize: { width: 1200, height: 700 },
        icon: VSCODE,
        component: <WebViewApps url="https://vscode.dev/" />
    },
    notepad: {
        id: "notepad",
        name: "Notepad",
        defaultSize: { width: 800, height: 600 },
        icon: NOTEPAD,
        component: <NotepadApp />
    },
    calculator: {
        id: "calculator",
        name: "Calculator",
        defaultSize: { width: 400, height: 720 },
        icon: CALCULATOR,
        component: <Calculator />
    },
    calendar: {
        id: "calendar",
        name: "Calendar",
        defaultSize: { width: 1000, height: 700 },
        icon: CALENDAR,
        component: <CalendarApp />
    },
    clock: {
        id: "clock",
        name: "Clock",
        defaultSize: { width: 400, height: 400 },
        icon: CLOCK,
        component: <ClockApp />
    },

    // --- Media Apps ---
    camera: {
        id: "camera",
        name: "Camera",
        defaultSize: { width: 1200, height: 800 },
        icon: CAMERA,
        component: <CameraApp />
    },
    gallery: {
        id: "gallery",
        name: "Gallery",
        defaultSize: { width: 1200, height: 700 },
        icon: GALLERY,
        component: <PhotosCloneApp />
    },
    video: {
        id: "video",
        name: "Video Player",
        defaultSize: { width: 1200, height: 700 },
        icon: VIDEO,
        component: <VideoPlayer />
    },
    music: {
        id: "music",
        name: "Music Player",
        defaultSize: { width: 1000, height: 600 },
        icon: MUSIC,
        component: <MusicPlayerApp />
    },
    youtube: {
        id: "youtube",
        name: "YouTube",
        defaultSize: { width: 1200, height: 700 },
        icon: YOUTUBE,
        component: <WebViewApps url="https://youtube.com/" />
    },
    games: {
        id: "games",
        name: "Game Center",
        defaultSize: { width: 1200, height: 700 },
        icon: GAMES,
        component: <GamesHubApp />
    },

    // --- Social & Communication ---
    mail: {
        id: "mail",
        name: "Mail",
        defaultSize: { width: 1000, height: 700 },
        icon: MAIL,
        component: <WebViewApps url="https://mail.google.com/" />
    },
    meet: {
        id: "meet",
        name: "Meet",
        defaultSize: { width: 1200, height: 700 },
        icon: MEET,
        component: <WebViewApps url="https://meet.google.com/" />
    },
    chat: {
        id: "chat",
        name: "Chat",
        defaultSize: { width: 450, height: 700 },
        icon: CHAT,
        component: "ChatApp"
    },
    whatsapp: {
        id: "whatsapp",
        name: "WhatsApp",
        defaultSize: { width: 1000, height: 700 },
        icon: WHATSAPP,
        component: <WebViewApps url="https://web.whatsapp.com/" />
    },
    facebook: {
        id: "facebook",
        name: "Facebook",
        defaultSize: { width: 1200, height: 800 },
        icon: FACEBOOK,
        component: <WebViewApps url="https://facebook.com/" />
    },
    instagram: {
        id: "instagram",
        name: "Instagram",
        defaultSize: { width: 1200, height: 800 },
        icon: INSTAGRAM,
        component: <WebViewApps url="https://instagram.com/" />
    },
    reddit: {
        id: "reddit",
        name: "Reddit",
        defaultSize: { width: 1200, height: 800 },
        icon: REDDIT,
        component: <WebViewApps url="https://reddit.com/" />
    },
    linkedin: {
        id: "linkedin",
        name: "LinkedIn",
        defaultSize: { width: 1200, height: 700 },
        icon: LINKEDIN,
        component: <WebViewApps url="https://www.linkedin.com/" />
    },

    // --- Google Suite & Developer ---
    docs: {
        id: "docs",
        name: "Docs",
        defaultSize: { width: 1200, height: 700 },
        icon: DOCS,
        component: <WebViewApps url="https://docs.google.com/" />
    },
    sheets: {
        id: "sheets",
        name: "Sheets",
        defaultSize: { width: 1200, height: 700 },
        icon: SHEETS,
        component: <WebViewApps url="https://docs.google.com/spreadsheets/" />
    },
    slides: {
        id: "slides",
        name: "Slides",
        defaultSize: { width: 1200, height: 700 },
        icon: SLIDES,
        component: <WebViewApps url="https://docs.google.com/presentation/" />
    },
    forms: {
        id: "forms",
        name: "Forms",
        defaultSize: { width: 1200, height: 700 },
        icon: FORMS,
        component: <WebViewApps url="https://docs.google.com/forms/" />
    },
    drive: {
        id: "drive",
        name: "Drive",
        defaultSize: { width: 1200, height: 700 },
        icon: DRIVE,
        component: <WebViewApps url="https://drive.google.com/" />
    },
    map: {
        id: "map",
        name: "Maps",
        defaultSize: { width: 1000, height: 700 },
        icon: MAP,
        component: <WebViewApps url="https://maps.google.com/" />
    },
    github: {
        id: "github",
        name: "GitHub",
        defaultSize: { width: 1200, height: 700 },
        icon: GITHUB,
        component: <WebViewApps url="https://github.com/" />
    },
    firebase: {
        id: "firebase",
        name: "Firebase",
        defaultSize: { width: 1200, height: 700 },
        icon: FIREBASE,
        component: <WebViewApps url="https://studio.firebase.google.com/" />
    },
};

export const allApps: Record<string, any> = {
    ...appRegistry
};

export const taskBarAppsRegistry = {
    explorer: appRegistry.explorer,
    camera: appRegistry.camera,
    chrome: appRegistry.chrome,
    chat: appRegistry.chat,
    notepad: appRegistry.notepad,
};

export const desktopAppRegistry = {
    appstore: appRegistry.appstore,
    games: appRegistry.games,
    chrome: appRegistry.chrome,
    vscode: appRegistry.vscode,
    facebook: appRegistry.facebook,
    linkedin: appRegistry.linkedin,
    youtube: appRegistry.youtube,
    developer: appRegistry.developer,
    reddit: appRegistry.reddit,
    instagram: appRegistry.instagram,
    calendar: appRegistry.calendar,
    calculator: appRegistry.calculator,
};