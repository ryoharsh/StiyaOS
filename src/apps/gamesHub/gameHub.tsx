import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export default function GamesHubApp() {
    const webviewRef = useRef<Electron.WebviewTag>(null);
    const [games, setGames] = useState<any[]>([]);
    const [playing, setPlaying] = useState('');

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch("https://pub.gamezop.com/v3/games?id=5997&lang=en");
                const data = await response.json();

                if (data.games) {
                    setGames(data.games);
                } else {
                    console.error("Invalid response structure:", data);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };

        fetchGames();
    }, []);

    useEffect(() => {
        const webview = webviewRef.current;
        if (webview) {
            webview.addEventListener("did-finish-load", () => {
                // You can inject scripts if needed
                // webview.executeJavaScript("document.body.style.background = '#222'");
            });
        }
    }, []);

    if (playing.length > 0) {
        return (
            <div className="size-full bg-[#161616]">
                <webview id="foo" src={playing} className="bg-[#161616] size-full" />
                <button onClick={() => setPlaying('')} className="bg-white/10 backdrop-blur-sm rounded-xl p-2 absolute top-12 left-2"><ArrowLeftIcon /></button>
            </div>
        );
    }

    return (
        <div className={`size-full hidesb overflow-hidden flex flex-col`}>

            <div className="p-8">
                <h1 className="text-3xl text-gray-900 font-bold">GamesHub</h1>
                <p className="text-md text-gray-700 mt-3">You can play HTML5 games, access to all types of games upto {games.length - 2}+.</p>
            </div>

            <div className={`size-full scroll-smooth flex overflow-y-scroll hidesb ${games.length > 0 ? 'flex-wrap justify-center gap-4 p-4' : 'items-center justify-center'}`}>
                {games.length > 0 ? (
                    games.map((game) => (
                        <div key={game.code} className="max-w-28 game-item overflow-hidden bg-white shadow-xl p-1 justify-center items-center rounded-3xl text-center">
                            <img src={game.assets.thumb} className="w-full" loading="lazy" alt={game.name.en} width={100} height={100} />
                            <p className="text-gray-900 mt-3 mb-3 text-sm line-clamp-1">{game.name.en}</p>
                            <button
                                onClick={() => setPlaying(game.url)}
                                className="text-white bg-[#161616] rounded-xl mb-2 py-2 px-4 text-xs hover:bg-gray-200 hover:text-gray-900 transition duration-200 ease-in-out">
                                Play Now
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-red-400 text-center self-center font-midfriend text-4xl">GAME ON</p>
                )}
            </div>

        </div>
    );
}