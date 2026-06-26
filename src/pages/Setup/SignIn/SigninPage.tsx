import SIGNIN_CAT from '../../../assets/stiya/cat_signin.png';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSetupStore } from '../../../store/useSetupStore';
import { loginUser, signupUser } from '../../../services/authService';
import SetupLayoutPage from '../SetupLayout';

import {
    signin_title,
    signin_des,
    signin_email_placeholder,
    signin_password_placeholder,
    signin_btn,
    forgot_password,
} from '../../../utils/constant';

import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';

type AuthMode = 'login' | 'signup';

export default function SigninPage() {

    const navigate = useNavigate();

    const setWizardData = useSetupStore((s) => s.setWizardData);

    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid =
        email.includes('@') &&
        password.length >= 6 &&
        (mode === 'login' || name.trim().length > 0);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!isValid || loading) return;

        setLoading(true);
        setError(null);

        const result = mode === 'login'
            ? await loginUser({ email, password })
            : await signupUser({ email, password, name });

        setLoading(false);

        if (!result.success || !result.data) {
            setError(result.error || 'Something went wrong. Please try again.');
            return;
        }

        const token = (result.data as any).accessToken || (result.data as any).token;
        const user = (result.data as any).user;

        setWizardData({
            auth: {
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                token: token,
            },
        });

        navigate('/deviceName');
    };

    const handleSkip = () => navigate('/forgotPassword');

    return (
        <SetupLayoutPage stepIndex={2} hideIndicator={loading} onBack={() => navigate(-1)}>
            <AnimatePresence mode="wait">
                {loading ? (<Loader />) : (
                    <>
                        {/* Left Layout Grid */}
                        <div className="flex-2/5 flex items-center justify-center ps-20">
                            <img
                                src={SIGNIN_CAT}
                                alt="Sign In Illustration"
                                className="rounded-2xl w-sm"
                            />
                        </div>

                        {/* Right Layout Grid */}
                        <div className="flex-3/5 px-25 py-15 items-center justify-center flex flex-col">
                            <h1 className="text-3xl font-semibold text-gray-950">
                                {signin_title}
                            </h1>

                            <p className="text-md text-center mt-3 text-gray-600 max-w-md">
                                {signin_des}
                            </p>

                            {/* Mode Switch Toggle */}
                            <div className="mt-8 bg-gray-100 rounded-2xl p-1 flex">
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className={`px-6 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${mode === 'login'
                                        ? 'bg-white shadow text-gray-900'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    Sign In
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode('signup')}
                                    className={`px-6 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${mode === 'signup'
                                        ? 'bg-white shadow text-gray-900'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    Create Account
                                </button>
                            </div>

                            {/* Authentication Input Form */}
                            <form
                                onSubmit={handleSubmit}
                                className="mt-6 w-full max-w-md flex flex-col gap-3"
                            >
                                {mode === 'signup' && (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                                    />
                                )}

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={signin_email_placeholder}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                                />

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={signin_password_placeholder}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                                />

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                        <p className="text-sm text-red-500">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {mode === "login" && (
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="text-sm text-gray-400 mt-2 self-end hover:text-gray-600 transition cursor-pointer"
                                    >
                                        {forgot_password}
                                    </button>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={!isValid || loading}
                                    whileTap={{ scale: 0.97 }}
                                    className={`text-md font-semibold px-10 py-3 mt-2 w-fit self-center rounded-2xl text-white transition duration-200 ease-in-out ${isValid && !loading ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-2xl cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}>
                                    {loading ? 'Please wait...' : mode === 'login' ? signin_btn : 'Create Account'}
                                </motion.button>
                            </form>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </SetupLayoutPage>
    );
}