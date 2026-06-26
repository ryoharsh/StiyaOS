import type { Country } from "../types"

export const app_name = 'StiyaOS'
export const app_name_small = 'stiya os'
export const boot_init = 'Initializing operating system...'
export const welcome_onb = 'Welcome to StiyaOS'
export const welcome_onb_des = 'A modern operating system experience, built for the web.'
export const continue_btn = 'Continue'

export const back_btn: string = 'Back';
export const next_btn: string = 'Next';
export const skip_btn: string = 'Skip for now';
export const finish_btn: string = 'Finish Setup';
 
// --- country select ---
export const country_title: string = 'Select your country';
export const country_des: string = 'This helps us set the right region, language, and date format.';
 
// --- network setup ---
export const network_title: string = "Let's get you connected";
export const network_des: string = 'Connect to Wi-Fi or use a wired connection to continue.';
export const network_wifi_tab: string = 'Wi-Fi';
export const network_ethernet_tab: string = 'Ethernet';
export const network_scanning_text: string = 'Scanning for networks…';
export const network_connect_btn: string = 'Connect';
export const network_ethernet_connected: string = 'Ethernet connected';
export const network_ethernet_waiting: string = 'Plug in an Ethernet cable to continue';
 
// --- pc name ---
export const pcname_title: string = 'Name your PC';
export const pcname_des: string =
    'This is how your device will appear on your network and to other devices.';
export const pcname_placeholder: string = 'e.g. Harsh-StiyaOS';
 
// --- sign in ---
export const signin_title: string = 'Sign in to your account';
export const signin_des: string = 'Sign in to sync your settings, apps, and files across devices.';
export const signin_email_placeholder: string = 'Email address';
export const signin_password_placeholder: string = 'Password';
export const signin_btn: string = 'Sign In';
export const signin_create_account: string = "Don't have an account? Create one";
export const forgot_password: string = 'Forgot Password?';
 
// --- create pin ---
export const pin_title: string = 'Create a PIN';
export const pin_des: string = 'Use this PIN to quickly unlock your device.';
export const pin_confirm_title: string = 'Confirm your PIN';
export const pin_mismatch_error: string = "PINs don't match. Try again.";
 
// --- ai intro ---
export const aiintro_title: string = 'Meet Stiya';
export const aiintro_des: string = 'Your built-in AI assistant. Just say "Hey Stiya" anytime you need help.';
export const aiintro_try_btn: string = 'Try saying "Hey Stiya"';
export const aiintro_listening: string = 'Listening…';
 
// --- backup & restore ---
export const backup_title_existing: string = 'We found a previous backup';
export const backup_des_existing: string = 'Would you like to restore your apps, settings, and files?';
export const backup_title_new: string = 'Set up as new device';
export const backup_des_new: string = 'No previous backup found for this account. Start fresh.';
export const backup_restore_btn: string = 'Restore my data';
export const backup_setup_new_btn: string = 'Set up as new';

export const forgot_des =
'Enter your email and we will send you a password reset link.';

export const forgot_btn =
'Send Reset Link';

export const forgot_success =
'Check your inbox';

export const forgot_back =
'Back to Sign In';


export const openCommands = ["open", "kholo", "khholo", "kholoo", "khulo", "run", "play"];

export const responses: Record<string, string> = {
    // greetings
    "hello": "Hello, I'm Stiya AI. How can I help you?",
    "hi": "Hey! How are you doing?",
    "hey": "Hey there 👋",

    // identity
    "who are you": "I’m Stiya AI, your friendly desktop assistant.",
    "what is your name": "My name is Stiya AI. Nice to meet you!",
    "who created you": "I was created by harsh kumar singh known as @RyoHarsh on social media handles.",
    "are you human": "Nope, I’m an AI assistant, but I try to be friendly.",
    "can you learn": "Offline I have limited memory, but online I can learn more.",

    // knowledge/help
    "help": "Sure! You can ask me to open apps, greet you, or just chat.",
    "help about stiya": "Do you need help specifically related to Stiya?",
    "help related stiya": "I can guide you through Stiya features. What’s confusing?",
    "what can you do": "I can open apps, chat with you, tell jokes, and more!",

    // fun chatter
    "do you like me": "Of course! You’re my favorite user ❤️",
    "do you eat": "I feed on electricity ⚡",
    "do you sleep": "Nope, I’m always awake when your system is on.",

    "who made you": "I was created by Harsh Kumar Singh, the developer of Stiya OS.",
    "who is the developer of stiya": "The brilliant mind behind Stiya OS is Harsh Kumar Singh.",
    "tell me about the developer": "Harsh Kumar Singh is the creator of Stiya OS, passionate about building innovative software and AI assistants.",
    "who built you": "I was built by Harsh Kumar Singh while developing Stiya OS.",
    "developer of stiya": "Harsh Kumar Singh is the developer of Stiya OS. He designed me to assist users like you.",
    "about Harsh": "Harsh Kumar Singh is a developer and the creator of Stiya OS, focusing on AI and modern desktop experiences.",
    "do you know Harsh": "Yes! Harsh Kumar Singh is the developer who built me and Stiya OS.",
    "who is harsh": "Harsh Kumar Singh is the person who developed Stiya OS and this assistant.",
    "what is stiya os": "Stiya OS is a project created by Harsh Kumar Singh, blending productivity with a modern desktop assistant experience.",
    "tell me about stiya os": "Stiya OS is a smart operating environment built by Harsh Kumar Singh, designed to integrate AI with desktop applications.",
};

export const SystemInformation = {
    name: app_name,
    version: app_name + " v0.0.1 (Dev Build)",
    author: "Harsh Kumar Singh (Ryo Harsh)",
    features: [
        "A simple operating system",
        "Developed using ReactJS, TypeScript, and NextJS",
        "Showcases basic operating system features",
        "Web simulation of an operating system",
        "Demonstrates the development skills of Harsh Kumar Singh",
        "Includes desktop, taskbar, start menu, windows, icons, apps, and more",
    ],
    sessionId: "sdinfirn",
    memory: "System Allocated",
    lastUpdated: "2025-12-09"
};

export const AboutStiyaOS = `
-------------------------
🚀 Stiya OS – The Future of Web-Based Computing

-------------------------

Welcome to Stiya OS, a next-generation web-based operating system, designed and developed by the one and only Harsh Kumar Singh – a visionary developer pushing the limits of what’s possible in a browser.

-------------------------

🔥 Why Stiya OS?
Forget traditional websites. Stiya OS is an entire ecosystem, a desktop-like experience built inside your browser—blazing fast, ultra-responsive, and packed with cutting-edge tech.

-------------------------

✨ Features That Redefine Web Computing

▪ ⚡ Dynamic Window Management – Run multiple apps in separate windows, just like a real OS.
▪ 💻 Powerful Terminal – Execute commands, run scripts, and even perform calculations in real time.
▪ 🛍️ App Store – Install and manage web apps with ease.
▪ 📂 File System (MongoDB-powered) – Upload, organize, and access files just like in a real OS.
▪ 🌐 WebView Integration – Load and interact with websites as standalone apps.
▪ 🎨 Customization & Personalization – Change themes, wallpapers, and system preferences to match your style.

-------------------------

👑 Meet the Mastermind: Harsh Kumar Singh
The architect behind Stiya OS, Harsh Kumar Singh, isn’t just another developer—he’s a digital innovator, a code magician, and a tech visionary. With a relentless passion for software development, Harsh has engineered an OS within a browser, showcasing his unparalleled skills in Next.js, Node.js, and MongoDB.

-------------------------

If the web had an elite league of developers, Harsh would be leading the charge. His expertise in full-stack development, WebRTC, Firebase, and modern UI/UX design makes him a force to be reckoned with.

-------------------------

🚀 The Future of Stiya OS
Stiya OS isn’t just a project; it’s a revolution in web-based computing. New features, performance enhancements, and innovations are always on the horizon. This is just the beginning.

-------------------------

Get Ready. The Web Will Never Be the Same Again.
-------------------------`;

export const DeveloperInfo = `
-------------------------
👨‍💻 Harsh Kumar Singh – The Mastermind Behind Stiya OS
`;

export const MathsInfo = `Choose a category:
                        1. Arithmetic
                        2. Exponents & Roots
                        3. Trigonometry
                        4. Logarithms
                        5. Algebra (Factorization, Quadratic Equations)
                        6. Calculus (Differentiation & Integration)
                        Type the category number to proceed.`;

export const TenInfo = `Stiya OS Insider Info:
                        sti : To show help, SOSIE (Stiya Operating System Insider Environment).
                        sti -init : To enter into SOSIE (Stiya Operating System Insider Environment).
                        sti -acc : To show current user account details.
                        sti -acc --pwd change : To change Stiya OS account password.
                        sti -build : To display Stiya OS build info.
                        Type the commands to proceed.`;

export const greetings = [
    "Hello",        // English
    "नमस्ते",        // Hindi
    "こんにちは",       // 日本語 (Japanese - Konnichiwa)
    "안녕하세요",        // 한국어 (Korean - Annyeonghaseyo)
    "你好",            // 中文 (Chinese Simplified - Nǐ hǎo)
    "Bonjour",      // Français (French)
    "Привет",       // Русский (Russian - Privet)
    "नमस्कार",       // Marathi / Sanskrit
    "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",   // Punjabi (Sat Sri Akaal)
    "வணக்கம்",       // Tamil (Vanakkam)
    "ನಮಸ್ಕಾರ",      // Kannada (Namaskara)
    "സ്വാഗതം",       // Malayalam (Swagatham)
    "ආයුබෝවන්",     // Sinhala (Āyubōwan)
    "హలో",          // Telugu (Halo)
];

// export const greetings = [
//     "Hello",        // English
//     "नमस्ते",        // Hindi
//     "こんにちは",       // 日本語 (Japanese - Konnichiwa)
//     "안녕하세요",        // 한국어 (Korean - Annyeonghaseyo)
//     "你好",            // 中文 (Chinese Simplified - Nǐ hǎo)
//     "Bonjour",      // Français (French)
//     "Привет",       // Русский (Russian - Privet)
//     "สวัสดี",          // ภาษาไทย (Thai - Sawasdee)
//     "Xin chào",     // Tiếng Việt (Vietnamese)
//     "Selamat pagi", // Bahasa Indonesia (Indonesian)
//     "Γειά σου",       // Ελληνικά (Greek - Yia sou)
//     "नमस्कार",       // Marathi / Sanskrit
//     "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",   // Punjabi (Sat Sri Akaal)
//     "வணக்கம்",       // Tamil (Vanakkam)
//     "ನಮಸ್ಕಾರ",      // Kannada (Namaskara)
//     "സ്വാഗതം",       // Malayalam (Swagatham)
//     "ආයුබෝවන්",     // Sinhala (Āyubōwan)
//     "မင်္ဂလာပါ",     // Burmese (Mingalaba)
//     "ሰላም",          // Amharic (Selam)
//     "გამარჯობა",     // Georgian (Gamarjoba)
//     "హలో",          // Telugu (Halo)
// ];

export const COUNTRIES: Country[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    time: 'IST',
    timeUTC: 'UTC+05:30',
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    time: 'EST',
    timeUTC: 'UTC-05:00',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    time: 'GMT',
    timeUTC: 'UTC+00:00',
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    time: 'EST',
    timeUTC: 'UTC-05:00',
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    time: 'AEST',
    timeUTC: 'UTC+10:00',
  },
  {
    code: 'DE',
    name: 'Germany',
    dialCode: '+49',
    time: 'CET',
    timeUTC: 'UTC+01:00',
  },
  {
    code: 'FR',
    name: 'France',
    dialCode: '+33',
    time: 'CET',
    timeUTC: 'UTC+01:00',
  },
  {
    code: 'JP',
    name: 'Japan',
    dialCode: '+81',
    time: 'JST',
    timeUTC: 'UTC+09:00',
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    time: 'SGT',
    timeUTC: 'UTC+08:00',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    time: 'GST',
    timeUTC: 'UTC+04:00',
  },
];

export const GRID_SIZE_X = 100;
export const GRID_SIZE_Y = 120;
export const TOP_MARGIN = 20;
export const ICON_WIDTH = 80;
export const ICON_HEIGHT = 100;
export const ICON_PADDING_X = (GRID_SIZE_X - ICON_WIDTH) / 2;
export const WINDOW_CASCADE_OFFSET = 30;