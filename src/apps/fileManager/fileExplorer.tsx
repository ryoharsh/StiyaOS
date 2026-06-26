import { CenterContent } from "./components/centerContent";
import { RightSidebar } from "./components/rightSiderBar";
import { LeftSidebar } from "./components/sidebar";

export default function FileExplorer() {
  return(
    <div className="bg-gradient-to-br from-[#EFF1F3] to-[#EEF2F5] h-full w-full flex flex-col md:flex-row justify-between md:space-x-2 space-y-2 md:space-y-0 p-2 hidesb overflow-hidden">
      <LeftSidebar />
      <CenterContent />
      <RightSidebar />
    </div>
  );
}
