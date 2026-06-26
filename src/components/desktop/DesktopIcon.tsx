import { ICON_HEIGHT, ICON_WIDTH } from "../../utils/constant";

export type MyApp = {
    id: string;
    name: string;
    icon: any;
    x: number;
    y: number;
}

type DesktopIconProps = {
  icon: MyApp;
  isSelected: boolean;
  onMouseDown: React.MouseEventHandler<HTMLElement>;
  onDoubleClick: () => void;
};

export function DesktopIcon({ icon, isSelected, onMouseDown, onDoubleClick }: DesktopIconProps) {
    return (
        <div
            key={`desktopApp-${icon.id}`}
            id={`desktop-icon-${icon.id}`}
            data-desktop-icon
            className={`desktop-icon absolute flex flex-col items-center gap-3 p-2 rounded-lg transition-colors duration-100 ${
                isSelected ? 'bg-white/30' : 'hover:bg-white/20'
            } z-20`}
            style={{
                left: `${icon.x}px`,
                top: `${icon.y}px`,
                width: `${ICON_WIDTH}px`,
                height: `${ICON_HEIGHT}px`,
                position: 'absolute'
            }}
            onDoubleClick={onDoubleClick}
            onMouseDown={onMouseDown}
        >
            <img src={icon.icon} alt={icon.name} className="w-14 h-14 object-center pointer-events-none" draggable={false} />
            <p className="text-white text-sm text-center pointer-events-none truncate w-full px-1">{icon.name}</p>
        </div>
    );
};