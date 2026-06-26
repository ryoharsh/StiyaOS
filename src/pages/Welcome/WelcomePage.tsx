import { AnimatePresence, motion } from 'framer-motion';
import HANGING_HAPPY from '../../assets/stiya/cat.png';
import { continue_btn, welcome_onb, welcome_onb_des } from '../../utils/constant';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setLoading(false);
            setShowContent(true);
        }, 2000);
        return () => clearTimeout(loadingTimer);
    }, []);

    const handleContinueFinish = () => {
        navigate('/lockScreen');
    };

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="w-screen h-screen flex justify-center items-center bg-[#fff7f5]"
        >
            <div className="bg-white w-5/7 h-6/7 z-1 rounded-2xl shadow-2xl shadow-gray-200 flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            key="loader" className="flex justify-center items-center"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        >
                            <motion.svg 
                                width="70" height="70" viewBox="0 0 70 70" 
                                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <circle cx="35" cy="35" r="25" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="5" />
                                <circle cx="35" cy="35" r="25" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeDasharray="45 160" />
                            </motion.svg>
                        </motion.div>
                    )}

                    {showContent && (
                        <motion.div key="content" className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <motion.img
                                key="greeting" className="h-80 -mt-20 select-none pointer-events-none" src={HANGING_HAPPY}
                                initial={{ opacity: 0, scale: 0.7, y: -40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -50 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />

                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl -mt-7 font-semibold text-gray-950">
                                {welcome_onb}
                            </motion.h1>

                            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-md mt-4 text-gray-600 text-center max-w-sm">
                                {welcome_onb_des}
                            </motion.p>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
                                onClick={handleContinueFinish}
                                className="text-md font-semibold bg-amber-500 cursor-pointer hover:bg-amber-600 transition duration-200 ease-in-out hover:shadow-2xl px-10 py-3 mt-14 rounded-2xl text-white"
                            >
                                {continue_btn}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}