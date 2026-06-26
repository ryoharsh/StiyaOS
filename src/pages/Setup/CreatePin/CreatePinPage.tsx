import PC_IMAGE from '../../../assets/stiya/cat_pin.png';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from "react";
import { useSetupStore } from "../../../store/useSetupStore";
import { useNavigate } from 'react-router-dom';
import SetupLayoutPage from '../SetupLayout';
import Loader from '../../../components/Loader';
import { pin_confirm_title, pin_des, pin_mismatch_error, pin_title } from '../../../utils/constant';

const PIN_LENGTH = 4;

type PinStage = 'create' | 'confirm';

interface PinDotsProps {
    length: number;
    filled: number;
}

function PinDots({ length, filled }: PinDotsProps) {
    return (
        <div className='flex gap-4'>
            {Array.from({ length }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: i < filled ? 1 : 0.9 }}
                    className={`w-4 h-4 rounded-full border-2 transition ${i < filled ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}
                />
            ))}
        </div>
    );
}

export default function CreatePinPage() {
    const navigate = useNavigate();
    const setWizardData = useSetupStore((s) => s.setWizardData);
    const [stage, setStage] = useState<PinStage>('create');
    const [firstPin, setFirstPin] = useState('');
    const [currentInput, setCurrentInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [shake, setShake] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDigit = (digit: string) => {
        if (currentInput.length >= PIN_LENGTH || submitting) return;
        setError(null);
        setCurrentInput((prev) => prev + digit);
    };

    const handleBackspace = () => setCurrentInput((prev) => prev.slice(0, -1));

    useEffect(() => {
        if (currentInput.length !== PIN_LENGTH) return;

        if (stage === 'create') {
            setFirstPin(currentInput);
            setCurrentInput('');
            setStage('confirm');
            return;
        }

        if (currentInput !== firstPin) {
            setError(pin_mismatch_error);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            setCurrentInput('');
            setStage('create');
            setFirstPin('');
            return;
        }

        setSubmitting(true);

        setWizardData({
            pin: firstPin,
        });

        setTimeout(async () => {
            setSubmitting(false);
            setLoading(true);
            await new Promise((resolve) =>
                setTimeout(resolve, 1000)
            );
            navigate('/intro')
        }, 500);

    }, [currentInput]);

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

    return (
        <SetupLayoutPage stepIndex={4} hideIndicator={loading} onBack={() => navigate(-1)}>
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
                        {/* Left */}
                        <div className='flex-2/5 flex items-center justify-center ps-20'>
                            <img src={PC_IMAGE} alt='Create PIN' className='rounded-2xl w-sm' />
                        </div>

                        {/* Right */}
                        <div className='flex-3/5 px-25 py-15 items-center justify-center flex flex-col'>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={stage}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className='flex flex-col items-center'
                                >
                                    <h1 className='text-3xl font-semibold text-gray-950'>
                                        {stage === 'create' ? pin_title : pin_confirm_title}
                                    </h1>

                                    <p className='text-md text-center mt-3 text-gray-600 max-w-md'>
                                        {pin_des}
                                    </p>

                                    <motion.div
                                        animate={shake ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className='mt-10'
                                    >
                                        <PinDots
                                            length={PIN_LENGTH}
                                            filled={currentInput.length}
                                        />
                                    </motion.div>

                                    {error && (
                                        <div className='mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3'>
                                            <p className='text-sm text-red-500'>
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    <div className='grid grid-cols-3 gap-4 mt-10'>
                                        {keys.map((key, i) => (
                                            key === '' ? (
                                                <div key={i} />
                                            ) : (
                                                <button
                                                    key={i}
                                                    onClick={() => key === '⌫' ? handleBackspace() : handleDigit(key)}
                                                    disabled={submitting}
                                                    className='w-16 h-16 rounded-full bg-gray-50 hover:bg-gray-100 active:scale-95 text-xl font-medium text-gray-800 transition cursor-pointer flex items-center justify-center'
                                                >
                                                    {key}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    {submitting && (
                                        <p className='text-sm text-gray-400 mt-6'>
                                            Saving...
                                        </p>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SetupLayoutPage>
    );
}