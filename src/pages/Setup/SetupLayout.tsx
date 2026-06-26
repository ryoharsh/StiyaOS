import { ArrowLeftIcon } from "@phosphor-icons/react";

interface SetupLayoutProps {
  children?: React.ReactNode;
  stepIndex?: number;
  hideIndicator?: boolean;
  onBack?: () => void;
}

export default function SetupLayoutPage({
  children,
  stepIndex = 0,
  hideIndicator = false,
  onBack,
}: SetupLayoutProps) {
  return (
    <div className="w-screen h-screen bg-linear-45 from-[#fff7f5] to-[#fffcfb] flex justify-center items-center">
      <div className="relative bg-white w-5/7 h-6/7 rounded-3xl shadow-xl flex flex-col overflow-hidden">

        {onBack && (
          <div className="h-24 px-6 absolute flex items-center">
            <ArrowLeftIcon
              size={48}
              className="cursor-pointer hover:bg-gray-100 rounded-2xl p-3"
              onClick={onBack}
            />
          </div>
        )}

        {/* Step progress dots */}
        {!hideIndicator && <div className="absolute top-7 right-8 flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((step, i) => (
            <span
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex
                ? "w-6 bg-amber-500"
                : i < stepIndex
                  ? "w-1.5 bg-amber-300"
                  : "w-1.5 bg-gray-200"
                }`}
            />
          ))}
        </div>}

        {/* Content */}
        <div className="flex-1 flex px-12">
          {children}
        </div>
      </div>
    </div>
  );
}