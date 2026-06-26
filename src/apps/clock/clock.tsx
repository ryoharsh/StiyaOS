import React, { useEffect, useState } from 'react';

export default function ClockApp() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondDeg = (seconds / 60) * 360;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30;

    return (
        <div className="flex bg-white h-full w-full flex-col items-center justify-center">
            <div className="flex justify-center py-10 group -mt-10">
                <div className="relative flex flex-col items-center justify-start w-50 h-50 overflow-hidden bg-gray-900 rounded-full border-10 border-gray-800 shadow-2xl shadow-gray-400">

                    <div
                        className="absolute w-1 origin-bottom bg-gradient-to-t from-brown-400 to-orange-400 rounded-full h-1/2 duration-1000 ease-in-out"
                        style={{
                            transform: `rotate(${secondDeg}deg)`,
                        }}
                    />

                    <div
                        className="absolute w-1 origin-bottom h-1/2 duration-1000 ease-in-out flex flex-col justify-end"
                        style={{
                            transform: `rotate(${minuteDeg}deg)`,
                        }}
                    >
                        <div className="w-full bg-gradient-to-t from-white to-red-400 rounded-full h-3/5" />
                    </div>

                    <div
                        className="absolute h-1/2 w-1 origin-bottom duration-1000 ease-in-out flex flex-col justify-end"
                        style={{
                            transform: `rotate(${hourDeg}deg)`,
                        }}
                    >
                        <div className="w-full rounded-full bg-gradient-to-t from-white to-blue-400 h-2/5" />
                    </div>

                    <div className="absolute flex items-center justify-center flex-1 w-full h-full">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                </div>
            </div>
            <div className="text-3xl font-bold font-midfriend text-gray-600">
                {time.toLocaleTimeString()}
            </div>
        </div>
    );
}