import GLOBE from '../../../assets/stiya/cat_globe.png';
import { useState, useMemo } from "react";
import type { Country } from "../../../types";
import SetupLayoutPage from "../SetupLayout";
import { COUNTRIES, country_des, country_title, next_btn } from "../../../utils/constant";
import { useSetupStore } from "../../../store/useSetupStore";
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import SetupButton from '../../../components/SetupButton';

export default function CountryPage() {

    const navigate = useNavigate();
    const setWizardData = useSetupStore((state) => state.setWizardData);
    const country = useSetupStore((state) => state.wizardData.country);
    const [search, setSearch] = useState<string>('');
    const [selected, setSelected] = useState<Country | null>(country);

    const [loading, setLoading] = useState(false);

    const filtered = useMemo<Country[]>(() => {
        if (!search.trim()) return COUNTRIES;
        const q = search.toLowerCase();
        return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
    }, [search]);

    const handleNext = async (): Promise<void> => {
        if (!selected) return;

        setLoading(true);

        setWizardData({
            country: selected,
        });

        await new Promise((resolve) =>
            setTimeout(resolve, 1000)
        );

        navigate('/network');
    }

    return (
        <SetupLayoutPage stepIndex={0} hideIndicator={loading}>
            <AnimatePresence mode='wait'>
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <div className='flex-2/5 flex items-center justify-center ps-20'>
                            <img src={GLOBE} className='rounded-2xl w-sm' alt="Globe Image" />
                        </div>

                        <div className='flex-3/5 px-25 py-15 items-center justify-center flex flex-col'>
                            <h1 className="text-3xl font-semibold text-gray-950">{country_title}</h1>
                            <p className="text-md text-center mt-3 text-gray-600 max-w-md">{country_des}</p>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country…"
                                className="mt-8 w-full max-w-md px-5 py-3 rounded-xl border border-1.5 border-gray-200 outline-none focus:border-amber-500 transition text-sm"
                            />

                            <div className="mt-4 w-full max-w-md h-56 overflow-y-auto hidesb">
                                {filtered.length === 0 && (
                                    <div className="p-4 text-sm text-gray-400 text-center">No countries found.</div>
                                )}
                                {filtered.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => setSelected(c)}
                                        className={`w-full flex items-center justify-between rounded-2xl px-8 py-5 mb-2 text-left text-md transition cursor-pointer ${selected?.code === c.code
                                            ? 'bg-gray-100 text-gray-950 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <span>{c.name}</span>
                                        <span className={`${selected?.code === c.code ? 'text-gray-950' : 'text-gray-700'}`}>{c.dialCode}</span>
                                    </button>
                                ))}
                            </div>

                            <SetupButton onClick={handleNext} disabled={!selected} text={next_btn} />
                        </div>
                    </>
                )}
            </AnimatePresence>
        </SetupLayoutPage>
    );
}