import { useEffect, useMemo, useRef, useState } from "react";
import { CaretLeft, CaretRight, CaretDown } from "@phosphor-icons/react";

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarApp() {
    const today = new Date();
    const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const monthOptions = monthNames.map((month, index) => ({ name: month, value: `${index}` }));

    const scrollToDay = (monthIndex: number, dayIndex: number) => {
        const targetDayIndex = dayRefs.current.findIndex(
            (ref) => ref && ref.getAttribute('data-month') === `${monthIndex}` && ref.getAttribute('data-day') === `${dayIndex}`,
        );

        const targetElement = dayRefs.current[targetDayIndex];

        if (targetDayIndex !== -1 && targetElement) {
            const container = document.querySelector('.calendar-container');
            const elementRect = targetElement.getBoundingClientRect();
            const is2xl = window.matchMedia('(min-width: 1536px)').matches;
            const offsetFactor = is2xl ? 3 : 2.5;

            if (container) {
                const containerRect = container.getBoundingClientRect();
                const offset = elementRect.top - containerRect.top - (containerRect.height / offsetFactor) + (elementRect.height / 2);

                container.scrollTo({
                    top: container.scrollTop + offset,
                    behavior: 'smooth',
                });
            } else {
                const offset = window.scrollY + elementRect.top - (window.innerHeight / offsetFactor) + (elementRect.height / 2);

                window.scrollTo({
                    top: offset,
                    behavior: 'smooth',
                });
            }
        }
    };

    const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
    const handleNextYear = () => setYear((prevYear) => prevYear + 1);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = parseInt(event.target.value, 10);
        setSelectedMonth(monthIndex);
        scrollToDay(monthIndex, 1);
    };

    const handleTodayClick = () => {
        setYear(today.getFullYear());
        scrollToDay(today.getMonth(), today.getDate());
    };

    const generateCalendar = useMemo(() => {
        const today = new Date();

        const daysInYear = (): { month: number; day: number }[] => {
            const daysInYear = [];
            const startDayOfWeek = new Date(year, 0, 1).getDay();

            if (startDayOfWeek < 6) {
                for (let i = 0; i < startDayOfWeek; i++) {
                    daysInYear.push({ month: -1, day: 32 - startDayOfWeek + i });
                }
            }

            for (let month = 0; month < 12; month++) {
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                for (let day = 1; day <= daysInMonth; day++) {
                    daysInYear.push({ month, day });
                }
            }

            const lastWeekDayCount = daysInYear.length % 7;
            if (lastWeekDayCount > 0) {
                const extraDaysNeeded = 7 - lastWeekDayCount;
                for (let day = 1; day <= extraDaysNeeded; day++) {
                    daysInYear.push({ month: 0, day });
                }
            }

            return daysInYear;
        };

        const calendarDays = daysInYear();

        const calendarWeeks = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            calendarWeeks.push(calendarDays.slice(i, i + 7));
        }

        const calendar = calendarWeeks.map((week, weekIndex) => (
            <div className="flex w-full" key={`week-${weekIndex}`}>
                {week.map(({ month, day }, dayIndex) => {
                    const index = weekIndex * 7 + dayIndex;
                    const isNewMonth = index === 0 || calendarDays[index - 1].month !== month;
                    const isToday = today.getMonth() === month && today.getDate() === day && today.getFullYear() === year;

                    return (
                        <div
                            key={`${month}-${day}`}
                            ref={(el) => { dayRefs.current[index] = el; }}
                            data-month={month}
                            data-day={day}
                            // onClick={() => handleDayClick(day, month, year)}
                            className={`relative group m-1 aspect-square w-full grow rounded-xl border font-medium transition-all hover:z-20 hover:scale-85 sm:size-20 sm:rounded-2xl sm:border-2 lg:size-30 lg:rounded-3xl 2xl:size-30 ${isToday ? 'bg-orange-400 border-none' : ''}`}
                        >
                            <span className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${isToday ? 'bg-orange-400 font-semibold text-white' : ''} ${month < 0 ? 'text-slate-400' : 'text-slate-800'}`}>
                                {day}
                            </span>
                            {isNewMonth && (
                                <span className="absolute bottom-0.5 left-0 w-full truncate px-1.5 text-sm font-regular text-slate-700 sm:bottom-0 sm:text-lg lg:bottom-2.5 lg:left-3.5 lg:-mb-1 lg:w-fit lg:px-0 lg:text-xl 2xl:mb-[-4px] 2xl:text-sm">
                                    {monthNames[month]}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        ));

        return calendar;
    }, [year]);

    useEffect(() => {
        const calendarContainer = document.querySelector('.calendar-container');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const month = parseInt(entry.target.getAttribute('data-month')!, 10);
                        setSelectedMonth(month);
                    }
                });
            },
            {
                root: calendarContainer,
                rootMargin: '-75% 0px -25% 0px',
                threshold: 0,
            },
        );

        dayRefs.current.forEach((ref) => {
            if (ref && ref.getAttribute('data-day') === '15') {
                observer.observe(ref);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        handleTodayClick();
    }, []);

    return (
        <div className="flex h-full w-full items-center justify-center overflow-auto">
            <div className="scrollbar-hide calendar-container h-full w-full overflow-y-scroll bg-white pb-10 text-slate-200">
                <div className="sticky -top-px z-50 w-full bg-white px-5 pt-7 sm:px-8 sm:pt-8">
                    <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Select name="month" value={`${selectedMonth}`} options={monthOptions} onChange={handleMonthChange} />
                            <button onClick={handleTodayClick} type="button" className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 lg:px-5 lg:py-2.5">
                                Today
                            </button>
                        </div>
                        <div className="flex w-fit items-center justify-between">
                            <button
                                onClick={handlePrevYear}
                                className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
                            >
                                <CaretLeft className="size-5 text-slate-800" weight="bold" />
                            </button>
                            <h1 className="min-w-16 text-center text-lg font-bold text-black sm:min-w-20 sm:text-xl">{year}</h1>
                            <button
                                onClick={handleNextYear}
                                className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
                            >
                                <CaretRight className="size-5 text-slate-800" weight="bold" />
                            </button>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-7 justify-between text-slate-900 border-b border-slate-200">
                        {daysOfWeek.map((day, index) => (
                            <div key={index} className="w-full py-2 text-center">
                                {day}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full px-5 pt-4 pb-4 sm:px-8 sm:pt-6">
                    {generateCalendar}
                </div>
            </div>
        </div>
    );
}

export interface SelectProps {
    name: string;
    value: string;
    label?: string;
    options: { 'name': string, 'value': string }[];
    onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
}

export const Select = ({ name, value, label, options = [], onChange, className }: SelectProps) => (
    <div className={`relative ${className}`}>
        {label && (
            <label htmlFor={name} className="mb-2 block font-medium text-slate-800">
                {label}
            </label>
        )}
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="appearance-none rounded-full border border-gray-300 outline-none bg-white py-1.5 pl-2 pr-6 text-sm font-medium text-gray-900 hover:bg-gray-100 sm:rounded-full sm:py-2.5 sm:pl-3 sm:pr-8"
            required
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.name}
                </option>
            ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-1 sm:pr-2">
            <CaretDown className="size-5 text-slate-600" weight="bold" />
        </span>
    </div>
);