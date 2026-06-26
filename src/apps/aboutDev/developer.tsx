import PROFILE from "../../assets/dev_icon.png";

export default function AboutDev() {
    return (
        <div className="flex h-full w-full">
            <div className="flex flex-col items-center w-3/12 h-full bg-white text-black p-10">
                <img src={PROFILE} width={130} height={130} alt="Devloper-Harsh Harsh Kumar Singh" className="rounded-full mt-7"></img>
                <p className="font-bold mt-5 text-black text-lg">Harsh Kumar Singh</p>
                <p className="font-regular text-black/90 text-sm">Developer Harsh</p>
                <p className="font-regular text-center mt-2 text-black/70 text-sm">Welcome, this is harsh passionate and motivated full-stack developer. I'm skilled in Android App Development and Web Development, My Skills - Java, Kotlin, HTML, CSS, JS, Python, C, C++, C#, Dart, etc.</p>

                <div className="w-full justify-start border border-gray-300 rounded-xl mt-4 p-4">
                    <p className="font-thin text-black/50 text-sm">Social Media:</p>
                    <ul className="text-sm mt-2 flex gap-2">
                        <a href="https://linkedin.com/"><li className="text-black hover:text-black/80">🔗 Linkedin</li></a>
                        <a href=""><li className="text-black hover:text-black/80">🔗 YouTube</li></a>
                        <a href=""><li className="text-black hover:text-black/80">🔗 GitHub</li></a>
                    </ul>
                </div>

                <button className="px-6 py-3 bg-[#ff9e68] mt-3 rounded-full text-xs hover:bg-white/60 transition">
                    My Resume
                </button>

                <p className="font-regular text-center mt-11 text-black/40 text-sm">Thank You, for being here.</p>
            </div>

            <div className="size-full">
                <iframe src="https://developerharsh01.vercel.app/" className="flex-grow w-full h-full" title="Developer Harsh - Portfolio Website"></iframe>
            </div>
        </div>
    );
}