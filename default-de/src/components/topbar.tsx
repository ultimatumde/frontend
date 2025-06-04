import { useEffect, useState } from "react";
import "./topbar.css";
import { workspaceStore, workspacesStore } from "../stores/workspace";
import { focusedPidStore } from "../stores/window";
import type { LayoutType, WorkspaceLeaves } from "../types/Workspace";
import { isGroup } from "../utils/wm";

function generateDate(): Date {
  return new Date();
}

const BarAttribute = ["DISK", "CPU", "VOL", "RAM"] as const;

const BarAttr = (attr: (typeof BarAttribute)[number]) => {
  let value = "";
  switch (attr) {
    case "DISK":
      value = "93%";
      break;
    case "CPU":
      value = "11%";
      break;
    case "VOL":
      value = "50%";
      break;
    case "RAM":
      value = "41%";
      break;
  }
  return (
    <span key={attr}>
      {attr} {value}
      <>&nbsp;|&nbsp;</>
    </span>
  );
};

const Title = () => {
  return "topbar.tsx - ultimatum-frontend - Visual Studio Code";
};

function padInt(i: number) {
  return i.toString().length < 2 ? "0" + i : i;
}

function getCurrentLayout(workspace: WorkspaceLeaves, focusedPid: number): LayoutType {
  function findContainerWithPid(group: WorkspaceLeaves, pid: number): LayoutType | null {
    for (const leaf of group.leaves) {
      if (!isGroup(leaf) && leaf.pid === pid) {
        return group.activeLayout;
      } else if (isGroup(leaf)) {
        if (containsWindow(leaf, pid)) {
          return leaf.activeLayout;
        }
      }
    }
    return null;
  }

  function containsWindow(group: WorkspaceLeaves, pid: number): boolean {
    for (const leaf of group.leaves) {
      if (!isGroup(leaf) && leaf.pid === pid) {
        return true;
      } else if (isGroup(leaf) && containsWindow(leaf, pid)) {
        return true;
      }
    }
    return false;
  }

  return findContainerWithPid(workspace, focusedPid) || "horizontal";
}

const TopBar = () => {
  const [time, setTime] = useState<Date>(generateDate());
  const [showSeconds, setShowSeconds] = useState(false);

  const workspace = workspaceStore((state) => state.workspace);
  const workspaces = workspacesStore((state) => state.workspaces);
  const focusedPid = focusedPidStore((state) => state.focusedPid);

  const currentWorkspace = workspaces[workspace];
  const orientation = currentWorkspace ? getCurrentLayout(currentWorkspace, focusedPid) : "horizontal";

  useEffect(() => {
    const ii = setInterval(() => {
      setTime(generateDate());
    }, 1000);

    return () => {
      return clearInterval(ii);
    };
  }, []);

  return (
    <div className="topbar">
      <div>
        <div className="workspaces">
          [
          {workspaces.map((_, i) => (
            <div
              onClick={() => {
                workspaceStore.setState({ workspace: i });
              }}
              style={{
                margin: "0 5px",
              }}
              className={`workspacei ${
                i === workspace ? "active" : ""
              }`}
              key={i}
            >
              {i + 1}
            </div>
          ))}
          ]
        </div>
        <div className="topbarleft">
          <span className="logo">Ultimatum Desktop</span>
          <span>
            [{orientation === "horizontal" ? "H" : "V"}]
          </span>
        </div>
        <div style={{ width: "20px" }}></div>
        <p>{Title()}</p>
      </div>
      <p>
        {BarAttribute.map(BarAttr)}
        <span
          onClick={() => {
            setShowSeconds(!showSeconds);
          }}
          className="time"
        >
          {padInt(time.getHours())}:{padInt(time.getMinutes())}
          {showSeconds ? <>:{padInt(time.getSeconds())}</> : <></>}
        </span>
      </p>
    </div>
  );
};

export default TopBar;
