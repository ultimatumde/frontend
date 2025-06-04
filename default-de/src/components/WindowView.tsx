import { useEffect, useRef } from "react";
import type {
  LWindow,
  WorkspaceLeaves,
} from "../types/Workspace";
import "./windowview.css";
import { workspacesStore, workspaceStore } from "../stores/workspace";
import { isGroup } from "../utils/wm";
import { focusedPidStore } from "../stores/window";

function hsl2hex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  }
  return `#${f(0)}${f(8)}${f(4)}`;
}

function id2ColorOffsetPastel(pid: number): string {
  const hue = (pid * 137.508) % 360;
  const saturation = 70 + (pid % 30);
  const lightness = 70 + (pid % 30);
  return hsl2hex(hue, saturation, lightness);
}

const Window = ({ src, i }: { src: LWindow; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const unsubscribe = focusedPidStore.subscribe(
      (state) => {
        if (ref.current) {
          if (state.focusedPid === src.pid) {
            ref.current.classList.add("focused");
            ref.current.style.setProperty("--window-bg", "rgba(255, 255, 255, 0.3)");
            Object.assign(ref.current.querySelector(".windowtitle")!, {
              textContent: src.title + " *",
              className: "windowtitle focused",
            });
          } else {
            ref.current.classList.remove("focused");
            ref.current.style.setProperty("--window-bg", "rgba(0, 0, 0, 0.3)");
            Object.assign(ref.current.querySelector(".windowtitle")!, {
              textContent: src.title,
              className: "windowtitle",
            });
          }
        }
      }
    );

    if (ref.current) {
      ref.current.style.setProperty("--window-bg", "rgba(0, 0, 0, 0.3)");
      (ref.current.querySelector(".windowcontent")! as HTMLDivElement).style.setProperty(
        "--window-content-bg",
        id2ColorOffsetPastel(src.pid)
      );
    }
    
    return unsubscribe;
  }, [src, ref]);

  return (
    <div className="windowframe" key={i} id={"windowframe-" + src.pid} ref={ref} onClick={() => {
      focusedPidStore.setState({ focusedPid: src.pid });
    }}>
      <div className="windowtitle">{src.title}</div>
      <div className={"windowcontent"}>
        <em>Mock data:</em>
        <p>{src.title} ({src.pid})</p>
      </div>
    </div>
  );
};

export const WindowView = () => {
  const workspaces = workspacesStore((state) => state.workspaces);
  const workspace = workspaceStore((state) => state.workspace);

  function recursiveBuildWindowLayout(work: WorkspaceLeaves, i: number) {
    return (
      isGroup(work) ? (
        <div className={"windowlayout " + work.activeLayout} key={i}>
          {work.leaves.map((w, i) =>
            isGroup(w) ? recursiveBuildWindowLayout(w, i) : <Window src={w as LWindow} i={i} key={i} />
          )}
        </div>
      ) : (
        <Window src={work as LWindow} i={i} key={i} />
      )
    );
  }

  const currentWorkspace = workspaces[workspace];
  

  return currentWorkspace ? recursiveBuildWindowLayout(currentWorkspace, 0) : null;
};
