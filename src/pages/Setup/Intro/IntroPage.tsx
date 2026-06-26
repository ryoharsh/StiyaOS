import PC_IMAGE from '../../../assets/stiya/cat_hi.png';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import SetupLayoutPage from '../SetupLayout';
import Loader from '../../../components/Loader';
import SetupButton from '../../../components/SetupButton';

type SetupStep = 'terms' | 'about' | 'voice';

export default function IntroPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<SetupStep>('terms');
    const [agreed, setAgreed] = useState(false);

    const handleNext = async () => {
        if (currentStep === 'terms') {
            if (!agreed) return;
            setCurrentStep('about');
        } else if (currentStep === 'about') {
            setCurrentStep('voice');
        } else if (currentStep === 'voice') {
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1200));
            navigate('/init');
        }
    };

    const handleBack = () => {
        if (currentStep === 'voice') {
            setCurrentStep('about');
        } else if (currentStep === 'about') {
            setCurrentStep('terms');
        } else {
            navigate(-1);
        }
    };

    return (
        <SetupLayoutPage stepIndex={5} hideIndicator={loading} onBack={handleBack}>
            <AnimatePresence mode='wait'>
                {loading ? (
                    <Loader key="loader-view" />
                ) : (
                    <motion.div
                        key="content-view"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex w-full h-full"
                    >
                        {/* Left Side */}
                        <div className='flex-2/5 flex items-center justify-center ps-20'>
                            <img src={PC_IMAGE} alt='StiyaOS Setup' className='rounded-2xl w-sm' />
                        </div>

                        {/* Right Side */}
                        <div className='flex-3/5 px-25 py-15 flex flex-col justify-between h-[85vh]'>
                            
                            {/* Paginated Content Wrapper */}
                            <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
                                <AnimatePresence mode='wait'>
                                    {currentStep === 'terms' && (
                                        <motion.div
                                            key="terms-step"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col items-center text-center"
                                        >
                                            <h1 className='text-3xl font-semibold text-gray-950 mb-3'>
                                                Privacy & Terms
                                            </h1>
                                            <p className='text-sm text-gray-600 mb-4'>
                                                Please read and accept our user data and environment security terms.
                                            </p>

                                            {/* Scrollable Policy Box */}
                                            <div className="w-full h-32 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50/50 p-3 text-left text-xs text-gray-500 leading-relaxed mb-5 custom-scrollbar">
                                                <p className="font-semibold text-gray-700 mb-1">1. Local Processing Data Protection</p>
                                                <p className="mb-3">StiyaOS respects your system space. All voice models, system automation context, and configuration states are managed directly on your hardware layer.</p>
                                                <p className="font-semibold text-gray-700 mb-1">2. Assistant Context Integration</p>
                                                <p className="mb-3">Integrated companion tools monitor only explicit command cues ("Hey Stiya") to optimize workflow executions without continuous data transmission logs.</p>
                                                <p className="font-semibold text-gray-700 mb-1">3. System Modifications</p>
                                                <p>By continuing, you authorize the workspace context layers to create local state management keys for proper system operation.</p>
                                            </div>
                                            
                                            <label className="flex items-start gap-3 cursor-pointer group text-left bg-gray-50 p-4 rounded-xl border border-gray-100 transition hover:bg-gray-100/75 w-full">
                                                <input 
                                                    type="checkbox" 
                                                    checked={agreed}
                                                    onChange={(e) => setAgreed(e.target.checked)}
                                                    className="mt-1 w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-600 select-none group-hover:text-gray-900 transition">
                                                    I read and agree to the StiyaOS Privacy Policy and User License Agreement.
                                                </span>
                                            </label>
                                        </motion.div>
                                    )}

                                    {currentStep === 'about' && (
                                        <motion.div
                                            key="about-step"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col items-center text-center"
                                        >
                                            <h1 className='text-3xl font-semibold text-gray-950 mb-2'>
                                                About StiyaOS
                                            </h1>
                                            <p className='text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 mb-4 inline-block'>
                                                Developed by Harsh Kumar Singh
                                            </p>
                                            <p className='text-md text-gray-600 leading-relaxed mb-4'>
                                                StiyaOS was developed as a modern, lightweight, and fluid companion interface designed to seamlessly bridge user intent with automated device actions.
                                            </p>
                                            <p className='text-sm text-gray-500 leading-relaxed'>
                                                Crafted for performance by <span className="font-semibold text-gray-800">Harsh Kumar Singh</span> (available on social media as <span className="font-semibold text-amber-600">@ryoharsh</span>), it manages workspace environments natively and introduces clean automated shortcuts to speed up daily digital workflows.
                                            </p>
                                        </motion.div>
                                    )}

                                    {currentStep === 'voice' && (
                                        <motion.div
                                            key="voice-step"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex flex-col items-center text-center"
                                        >
                                            <div className="text-4xl mb-3">🎙️</div>
                                            <h1 className='text-3xl font-semibold text-gray-950 mb-4'>
                                                Hands-Free Wake
                                            </h1>
                                            <p className='text-md text-gray-600 leading-relaxed mb-6'>
                                                You can wake up your device assistant instantly from anywhere by simply calling out:
                                            </p>
                                            <div className="inline-block font-semibold text-xl text-amber-600 bg-amber-50 px-6 py-3 rounded-2xl border border-amber-200 shadow-xs tracking-wide">
                                                "Hey Stiya"
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Dynamic Action Button */}
                            <div className="-translate-y-30 max-w-md w-full mx-auto flex justify-center items-center">
                                <SetupButton 
                                    onClick={handleNext} 
                                    disabled={currentStep === 'terms' && !agreed} 
                                    text={currentStep === 'voice' ? 'Finish Setup' : 'Next'} 
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SetupLayoutPage>
    );
}