import { useState } from "react";

export default function Calculator() {
    const [expression, setExpression] = useState<string>("");
    const [result, setResult] = useState<string>("");

    const handleClick = (value: string) => {
        if (value === "=") {
            try {
                setResult(eval(expression).toString()); // ⚠️ Be careful with `eval`
            } catch {
                setResult("Error");
            }
        } else if (value === "C") {
            setExpression("");
            setResult("");
        } else if (value === "CE") {
            setExpression("");
            setResult("");
        } else if (value === "⌫") {
            setExpression(expression.slice(0, -1));
        } else if (value === "+/-") {
            setExpression((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
        } else if (value === "x²") {
            try {
                setResult((Math.pow(eval(expression), 2)).toString());
            } catch {
                setResult("Error");
            }
        } else if (value === "²√x") {
            try {
                setResult((Math.sqrt(eval(expression))).toString());
            } catch {
                setResult("Error");
            }
        } else if (value === "1/x") {
            try {
                setResult((1 / eval(expression)).toString());
            } catch {
                setResult("Error");
            }
        } else {
            setExpression((prev) => prev + value);
        }
    };

    return (
        <div className="scroll-smooth">
            <div className="flex flex-col items-end gap-3 py-5 px-4">
                <div className="text-gray-500 text-right text-2xl line-clamp-1 h-10">{expression}</div>
                <div className="text-gray-800 font-bold text-right text-7xl line-clamp-1">{result || 0}</div>
            </div>

            <div className="grid grid-cols-4 gap-4 border-t border-gray-300 p-4">
                {["%", "CE", "C", "⌫", "1/x", "x²", "²√x", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "+/-", "0", ".", "="].map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleClick(btn)}
                        className={`bg-gray-100 font-bold text-lg text-gray-800 p-5 rounded-full hover:bg-gray-300 flex items-center justify-center transition duration-200 ease-in-out ${btn === '=' && 'bg-green-600 hover:bg-green-700 text-white'} ${btn === '⌫' && 'bg-red-400 hover:bg-red-500 text-white'}  ${(btn === '%' || btn === 'CE' || btn === 'C') && 'bg-white hover:bg-gray-300 border border-gray-300'}`}
                    >
                        {btn}
                    </button>
                ))}
            </div>
        </div>
    );
}