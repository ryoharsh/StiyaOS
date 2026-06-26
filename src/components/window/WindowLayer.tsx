import { Window } from './Window';
import type { WindowManager } from '../../hooks/useWindowManager';
 
interface WindowLayerProps {
  manager: WindowManager;
  constraintEl: HTMLElement | null;
}
 
export function WindowLayer({ manager, constraintEl }: WindowLayerProps) {
  return (
    <>
      {manager.windows.map(instance => (
        <Window
          key={instance.instanceId}
          instance={instance}
          manager={manager}
          constraintEl={constraintEl}
        />
      ))}
    </>
  );
}