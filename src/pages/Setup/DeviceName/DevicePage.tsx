import PC_IMAGE from '../../../assets/stiya/cat_dev.png';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from "react";
import { useSetupStore } from "../../../store/useSetupStore";
import { useNavigate } from 'react-router-dom';
import SetupLayoutPage from '../SetupLayout';
import Loader from '../../../components/Loader';
import { next_btn, pcname_des, pcname_placeholder, pcname_title } from '../../../utils/constant';
import SetupButton from '../../../components/SetupButton';

const VALID_NAME_REGEX = /^[A-Za-z][A-Za-z0-9-]{1,30}$/;

export default function DevicePage() {

    const navigate = useNavigate();
    const setWizardData = useSetupStore((s) => s.setWizardData);
    const savedName = useSetupStore((s) => s.wizardData.pcName);

    const [name, setName] = useState<string>(savedName || '');
    const [touched, setTouched] = useState(false);

    const isValid = VALID_NAME_REGEX.test(name);
    const showError = touched && name.length > 0 && !isValid;

    const [loading, setLoading] = useState(false);

    const handleContinue = async (): Promise<void> => {
        if (!isValid) {
            setTouched(true);
            return;
        }

        setLoading(true);

        setWizardData({
            pcName: name,
        });

        await new Promise((resolve) =>
            setTimeout(resolve, 1000)
        );

        navigate('/createPin');
    };

    return (
        <SetupLayoutPage stepIndex={3} hideIndicator={loading} onBack={() => navigate(-1)}>
            <AnimatePresence mode='wait'>
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {/* Left */}
                        <div className='flex-2/5 flex items-center justify-center ps-20'>
                            <img
                                src={PC_IMAGE}
                                alt='PC Illustration'
                                className='rounded-2xl w-sm'
                            />
                        </div>

                        {/* Right */}
                        <div className='flex-3/5 px-25 py-15 items-center justify-center flex flex-col'>

                            <h1 className='text-3xl font-semibold text-gray-950'>
                                {pcname_title}
                            </h1>

                            <p className='text-md text-center mt-3 text-gray-600 max-w-md'>
                                {pcname_des}
                            </p>

                            <div className='mt-8 w-full max-w-md'>
                                <input
                                    type='text'
                                    autoFocus
                                    value={name}
                                    maxLength={31}
                                    placeholder={pcname_placeholder}
                                    onBlur={() => setTouched(true)}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleContinue()
                                    }
                                    className={`w-full px-5 py-3 rounded-xl border outline-none transition text-sm ${showError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'}`}
                                />

                                {showError && (
                                    <p className='text-xs text-red-500 mt-2'>
                                        Use letters, numbers and hyphens only.
                                        Must start with a letter.
                                    </p>
                                )}

                                <div className='flex justify-end'>
                                    <p className='text-xs text-gray-400 mt-2'>
                                        {name.length}/31
                                    </p>
                                </div>
                            </div>

                            <SetupButton onClick={handleContinue} disabled={!name} text={next_btn} />
                        </div>
                    </>
                )}
            </AnimatePresence>
        </SetupLayoutPage >
    );
}