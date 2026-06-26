import { motion } from "framer-motion";
import { next_btn } from "../utils/constant";

interface SetupButtonProps {
    onClick: () => void;
    disabled?: boolean;
    text?: string;
}

export default function SetupButton({
    onClick,
    disabled = false,
    text = next_btn,
}: SetupButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileTap={{ scale: 0.97 }}
            className={`text-md font-semibold px-10 py-3 mt-8 rounded-2xl text-white transition duration-200 ease-in-out ${
                !disabled
                    ? "bg-amber-500 hover:bg-amber-600 hover:shadow-2xl cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
            }`}
        >
            {text}
        </motion.button>
    );
}