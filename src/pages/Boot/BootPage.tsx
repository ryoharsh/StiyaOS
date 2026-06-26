import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { app_name_small, boot_init } from "../../utils/constant";
import { useSetupStore } from "../../store/useSetupStore";

export default function BootPage() {

    const wizardData = useSetupStore((s) => s.wizardData);
    const isSetupDone = useSetupStore((s) => s.isSetupDone);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }

                return oldProgress + 2;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            const timer = setTimeout(() => {
                // const isStored = !!wizardData.pin && !!wizardData.pcName && !!wizardData.auth?.token;
                
                if (isSetupDone) {
                    navigate('/lockScreen');
                } else {
                    navigate("/country");
                }
            }, 800);

            return () => clearTimeout(timer);
        }

    }, [progress, navigate]);

    return (
        <div className="w-screen h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
            <h1 className='text-gray-950 text-5xl font-semibold fade-text'>{app_name_small}</h1>
            <p className='text-gray-700 text-md mt-5 fade-text'>{boot_init}</p>

            <div className="w-80 h-2 bg-slate-100 rounded-full overflow-hidden mt-10 fade-img">
                <div
                    className="h-full bg-slate-900 transition-all rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}