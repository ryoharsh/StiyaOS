// Country Page

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  time: string;
  timeUTC: string;
}

// Wifi & Network

export type NetworkType = 'wifi' | 'ethernet';

export interface NetworkData {
  type: NetworkType;
  ssid?: string;
}

export interface AuthData {
  email: string;
  name: string;
  username: string;
  avatar: string;
  token: string;
}

export interface WizardData {
  country: Country | null;
  network: NetworkData | null;
  pcName: string;
  auth: AuthData | null;
  pin: string | null;
  restoreChoice: boolean | null;
}

export interface SignalIconProps {
  signal: number;
}

export interface WifiNetwork {
  ssid: string;
  signal: number;
  isKnown: boolean;
  security: string;
}

export interface NetworkStatus {
  ethernetConnected: boolean;
  wifiConnected: boolean;
  activeSsid: string | null;
  signalStrength: number;
}

export interface ConnectionResult {
  success: boolean;
  error?: string;
}

declare global {
  interface Window {
    networkAPI: {
      scanWifi: () => Promise<any>;
      connectWifi: (ssid: string, password: string) => Promise<any>;
      disconnectWifi: () => Promise<any>;
      getStatus: () => Promise<any>;
    };
  }
}

// --- Auth service (MERN backend) ---

export interface ApiResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export interface BackupStatusResponse {
  hasBackup: boolean;
  lastBackupDate?: string;
}

export interface CreatePinResponse {
  success: boolean;
}

// 

export type BatteryStatus = {
  level: number;
  charging: boolean;
}

//

export type WindowState = 'opening' | 'open' | 'minimized' | 'maximized' | 'closing';

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowInstance {
  instanceId: string;          // unique per open window
  appId: string;               // ties back to AppDefinition
  name: string;
  icon: string;
  state: WindowState;
  position: WindowPosition;    // restored position (not maximized position)
  size: WindowSize;            // restored size
  zIndex: number;
  defaultSize: WindowSize;
  component: React.ReactNode;
  windowOptions?: {
    hideTitleBar?: boolean;
    customControls?: boolean;
    minWidth?: number;
    minHeight?: number;
  };
}

export interface AppDefinition {
  id: string;
  name: string;
  defaultSize: WindowSize;
  icon: any;
  component: React.ReactNode;
  windowOptions?: WindowInstance['windowOptions'];
}

export type PanelKey =
  | 'startMenu'
  | 'rightMenu'
  | 'dateTime'
  | 'notifications'
  | 'wifi'
  | 'bot'
  | 'contextMenu'
  | null;

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface TaskbarPreview {
  appId: string;
  anchorX: number;   // center x of the taskbar icon
}


import WomanArtist from "../assets/animEmo/Woman Artist.png";
import WomanAstronaut from "../assets/animEmo/Woman Astronaut.png";
import WomanBiking from "../assets/animEmo/Woman Biking.png";
import WomanBouncingBall from "../assets/animEmo/Woman Bouncing Ball.png";
import WomanCartwheeling from "../assets/animEmo/Woman Cartwheeling.png";
import WomanClimbing from "../assets/animEmo/Woman Climbing.png";
import WomanConstructionWorker from "../assets/animEmo/Woman Construction Worker.png";
import WomanCook from "../assets/animEmo/Woman Cook.png";
import WomanDancing from "../assets/animEmo/Woman Dancing.png";
import WomanDetective from "../assets/animEmo/Woman Detective.png";
import WomanElf from "../assets/animEmo/Woman Elf.png";
import WomanFactoryWorker from "../assets/animEmo/Woman Factory Worker.png";
import WomanFairy from "../assets/animEmo/Woman Fairy.png";
import WomanFarmer from "../assets/animEmo/Woman Farmer.png";
import WomanFirefighter from "../assets/animEmo/Woman Firefighter.png";
import WomanFrowning from "../assets/animEmo/Woman Frowning.png";
import WomanGesturingNo from "../assets/animEmo/Woman Gesturing No.png";
import WomanGesturingOK from "../assets/animEmo/Woman Gesturing OK.png";
import WomanGolfing from "../assets/animEmo/Woman Golfing.png";
import WomanGuard from "../assets/animEmo/Woman Guard.png";
import WomanHealthWorker from "../assets/animEmo/Woman Health Worker.png";
import WomanJudge from "../assets/animEmo/Woman Judge.png";
import WomanJuggling from "../assets/animEmo/Woman Juggling.png";
import WomanLiftingWeights from "../assets/animEmo/Woman Lifting Weights.png";
import WomanMage from "../assets/animEmo/Woman Mage.png";
import WomanMechanic from "../assets/animEmo/Woman Mechanic.png";
import WomanMountainBiking from "../assets/animEmo/Woman Mountain Biking.png";
import WomanOfficeWorker from "../assets/animEmo/Woman Office Worker.png";
import WomanPoliceOfficer from "../assets/animEmo/Woman Police Officer.png";
import WomanScientist from "../assets/animEmo/Woman Scientist.png";
import WomanStudent from "../assets/animEmo/Woman Student.png";
import WomanTeacher from "../assets/animEmo/Woman Teacher.png";
import WomanTechnologist from "../assets/animEmo/Woman Technologist.png";
import WomanVampire from "../assets/animEmo/Woman Vampire.png";

export class AnimatedEmojis {
    static getWomanArtist() {
        return WomanArtist;
    }
    static getWomanAstronaut() {
        return WomanAstronaut;
    }
    static getWomanBiking() {
        return WomanBiking;
    }
    static getWomanBouncingBall() {
        return WomanBouncingBall;
    }
    static getWomanCartwheeling() {
        return WomanCartwheeling;
    }
    static getWomanClimbing() {
        return WomanClimbing;
    }
    static getWomanConstructionWorker() {
        return WomanConstructionWorker;
    }
    static getWomanCook() {
        return WomanCook;
    }
    static getWomanDancing() {
        return WomanDancing;
    }
    static getWomanDetective() {
        return WomanDetective;
    }
    static getWomanElf() {
        return WomanElf;
    }
    static getWomanFactoryWorker() {
        return WomanFactoryWorker;
    }
    static getWomanFairy() {
        return WomanFairy;
    }
    static getWomanFarmer() {
        return WomanFarmer;
    }
    static getWomanFirefighter() {
        return WomanFirefighter;
    }
    static getWomanFrowning() {
        return WomanFrowning;
    }
    static getWomanGesturingNo() {
        return WomanGesturingNo;
    }
    static getWomanGesturingOK() {
        return WomanGesturingOK;
    }
    static getWomanGolfing() {
        return WomanGolfing;
    }
    static getWomanGuard() {
        return WomanGuard;
    }
    static getWomanHealthWorker() {
        return WomanHealthWorker;
    }
    static getWomanJudge() {
        return WomanJudge;
    }
    static getWomanJuggling() {
        return WomanJuggling;
    }
    static getWomanLiftingWeights() {
        return WomanLiftingWeights;
    }
    static getWomanMage() {
        return WomanMage;
    }
    static getWomanMechanic() {
        return WomanMechanic;
    }
    static getWomanMountainBiking() {
        return WomanMountainBiking;
    }
    static getWomanOfficeWorker() {
        return WomanOfficeWorker;
    }
    static getWomanPoliceOfficer() {
        return WomanPoliceOfficer;
    }
    static getWomanScientist() {
        return WomanScientist;
    }
    static getWomanStudent() {
        return WomanStudent;
    }
    static getWomanTeacher() {
        return WomanTeacher;
    }
    static getWomanTechnologist() {
        return WomanTechnologist;
    }
    static getWomanVampire() {
        return WomanVampire;
    }

    static allEmojis = [
        WomanArtist,
        WomanAstronaut,
        WomanBiking,
        WomanBouncingBall,
        WomanCartwheeling,
        WomanClimbing,
        WomanConstructionWorker,
        WomanCook,
        WomanDancing,
        WomanDetective,
        WomanElf,
        WomanFactoryWorker,
        WomanFairy,
        WomanFarmer,
        WomanFirefighter,
        WomanFrowning,
        WomanGesturingNo,
        WomanGesturingOK,
        WomanGolfing,
        WomanGuard,
        WomanHealthWorker,
        WomanJudge,
        WomanJuggling,
        WomanLiftingWeights,
        WomanMage,
        WomanMechanic,
        WomanMountainBiking,
        WomanOfficeWorker,
        WomanPoliceOfficer,
        WomanScientist,
        WomanStudent,
        WomanTeacher,
        WomanTechnologist,
        WomanVampire,
    ];

    static getRandomEmoji() {
        const randomIndex = Math.floor(Math.random() * this.allEmojis.length);
        return this.allEmojis[randomIndex];
    }
}
