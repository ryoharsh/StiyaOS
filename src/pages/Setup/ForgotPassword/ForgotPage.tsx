import SIGNIN_CAT from '../../../assets/stiya/cat_forgot.png';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { resetPassword, sendForgotOtp, verifyForgotOtp } from '../../../services/authService';
import SetupLayoutPage from '../SetupLayout';
import { signin_email_placeholder } from '../../../utils/constant';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPage() {

    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSendOtp = async () => {
        if (!isValidEmail || loading) return;

        setLoading(true);
        setError(null);

        const result = await sendForgotOtp(email);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Unable to send OTP.');
            return;
        }

        setStep('otp');
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6 || loading) return;

        setLoading(true);
        setError(null);

        const result = await verifyForgotOtp(email, otp);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Invalid OTP');
            return;
        }

        setStep('password');
    };

    const handleResetPassword = async () => {
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await resetPassword(email, otp, password);
        setLoading(false);

        if (!result.success) {
            setError(result.error || 'Unable to reset password.');
            return;
        }

        setStep('success');
    };

    return (
        <SetupLayoutPage stepIndex={2} hideIndicator={loading} onBack={() => navigate(-1)}>
            <AnimatePresence mode="wait">
                {loading ? (<Loader />) : (
                    <>
                        {/* Left Layout Grid */}
                        <div className="flex-2/5 flex items-center justify-center ps-20">
                            <img
                                src={SIGNIN_CAT}
                                alt="Forgot Illustration"
                                className="rounded-2xl w-sm"
                            />
                        </div>

                        {/* Right Layout Grid */}
                        <div className="flex-3/5 px-25 py-15 items-center justify-center flex flex-col">
                            <h1 className="text-3xl font-semibold text-gray-950">
                                {step === 'email' && 'Forgot Password?'}
                                {step === 'otp' && 'Verify OTP'}
                                {step === 'password' && 'Create New Password'}
                                {step === 'success' && 'Password Changed'}
                            </h1>

                            <p className="text-md text-center mt-3 text-gray-600 max-w-md">
                                {step === 'email' && "Enter your email address and we'll send you an OTP."}
                                {step === 'otp' && `Enter the OTP sent to ${email}`}
                                {step === 'password' && 'Create a new password for your account.'}
                                {step === 'success' && 'Your password has been updated successfully.'}
                            </p>

                            <div className="mt-8 w-full max-w-md flex flex-col gap-3">
                                {/* STEP 1: Email Interface Entry */}
                                {step === 'email' && (
                                    <>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={signin_email_placeholder}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                                        />
                                        <motion.button
                                            onClick={handleSendOtp}
                                            whileTap={{ scale: 0.97 }}
                                            disabled={!isValidEmail || loading}
                                            className={`text-md font-semibold px-10 py-3 mt-2 w-fit self-center rounded-2xl text-white transition duration-200 ease-in-out ${!isValidEmail || loading
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-amber-500 hover:bg-amber-600 hover:shadow-2xl cursor-pointer'
                                                }`}
                                        >
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </motion.button>
                                    </>
                                )}

                                {/* STEP 2: One-Time Token Pin Code Validation */}
                                {step === 'otp' && (
                                    <>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP"
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm text-center tracking-widest font-semibold"
                                        />
                                        <motion.button
                                            onClick={handleVerifyOtp}
                                            whileTap={{ scale: 0.97 }}
                                            disabled={otp.length !== 6 || loading}
                                            className={`text-md font-semibold px-10 py-3 mt-2 w-fit self-center rounded-2xl text-white transition duration-200 ease-in-out ${otp.length !== 6 || loading
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-amber-500 hover:bg-amber-600 hover:shadow-2xl cursor-pointer'
                                                }`}
                                        >
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </motion.button>
                                    </>
                                )}

                                {/* STEP 3: Override Target Fields Entry Form */}
                                {step === 'password' && (
                                    <>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                                        />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password"
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                                        />
                                        <motion.button
                                            onClick={handleResetPassword}
                                            whileTap={{ scale: 0.97 }}
                                            disabled={loading}
                                            className={`text-md font-semibold px-10 py-3 mt-2 w-fit self-center rounded-2xl text-white transition duration-200 ease-in-out ${loading
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-amber-500 hover:bg-amber-600 hover:shadow-2xl cursor-pointer'
                                                }`}
                                        >
                                            {loading ? 'Updating...' : 'Reset Password'}
                                        </motion.button>
                                    </>
                                )}

                                {/* STEP 4: Absolute Success Complete Interception View */}
                                {step === 'success' && (
                                    <motion.button
                                        onClick={() => navigate(-1)}
                                        whileTap={{ scale: 0.97 }}
                                        className="text-md font-semibold px-10 py-3 mt-2 w-fit self-center rounded-2xl text-white bg-amber-500 hover:bg-amber-600 hover:shadow-2xl transition duration-200 ease-in-out cursor-pointer"
                                    >
                                        Back to Sign In
                                    </motion.button>
                                )}

                                {/* Global Error Banner Display Section */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-2">
                                        <p className="text-sm text-red-500 text-center font-medium">
                                            {error}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </SetupLayoutPage>
    );
}