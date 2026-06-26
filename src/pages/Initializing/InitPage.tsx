import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { greetings } from "../../utils/constant";
import { useSetupStore } from "../../store/useSetupStore";

export default function InitPage() {

    const setSetupDone = useSetupStore((s) => s.setSetupDone);
    const [index, setIndex] = useState(0);
    const navigate = useNavigate();

    const backgrounds = [
        "#F9FAFB",
        "#F59E0B", // Standard Amber
        "#140408", // Dark context
    ];

    const textColors = [
        "#F59E0B", // Text Amber
        "#FFFFFF", // White text
        "#F59E0B", // Text Amber
    ];

    useEffect(() => {
        setSetupDone(true);
        
        const interval = setInterval(() => {
            setIndex((prev) => {
                // Agar index aakhri greeting par hai, toh navigate karo aur interval clear kar do
                if (prev === greetings.length - 1) {
                    clearInterval(interval);
                    navigate('/welcome');
                    return prev;
                }
                return prev + 1;
            });
        }, 2100);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <motion.div
            className="w-screen h-screen font-bold flex items-center justify-center text-8xl"
            initial={{ 
                backgroundColor: backgrounds[0], 
                color: textColors[0] 
            }}
            animate={{ 
                backgroundColor: backgrounds[index % backgrounds.length], 
                color: textColors[index % textColors.length] 
            }}
            transition={{ duration: 0.8 }}
        >
            <AnimatePresence mode="wait">
                <motion.h1
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                >
                    {greetings[index]}
                </motion.h1>
            </AnimatePresence>
        </motion.div>
    );
}