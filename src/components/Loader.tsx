import { motion } from "framer-motion";

export default function Loader() {
    return (
        <motion.div
            key="loader"
            className="absolute inset-0 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <motion.svg
                width="70" height="70" viewBox="0 0 70 70"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <circle cx="35" cy="35" r="25" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="5" />
                <circle cx="35" cy="35" r="25" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeDasharray="45 160" />
            </motion.svg>
        </motion.div>
    );
}