import type { LWindow, WorkspaceLeaves } from "../types/Workspace";
import "./launcher.css";
import { workspaceStore, workspacesStore } from "../stores/workspace";
import { isGroup, makeWindow } from "../utils/wm";
import { focusedPidStore } from "../stores/window";
import { UMJS } from "../lib/umjs";
import launcherIcon from "../assets/launch.png";

function insertNextToPid(
  group: WorkspaceLeaves,
  pid: number,
  newItem: LWindow
): boolean {
  for (let i = 0; i < group.leaves.length; i++) {
    const leaf = group.leaves[i];
    if (!isGroup(leaf) && (leaf as LWindow).pid === pid) {
      group.leaves.splice(i + 1, 0, newItem);
      return true;
    } else if (isGroup(leaf)) {
      if (insertNextToPid(leaf, pid, newItem)) {
        return true;
      }
    }
  }
  return false;
}

function insertWindowInWorkspace(
  workspace: WorkspaceLeaves,
  focusedPid: number,
  newWindow: LWindow
): void {
  if (focusedPid === 0 || workspace.leaves.length === 0) {
    workspace.leaves.push(newWindow);
  } else {
    if (!insertNextToPid(workspace, focusedPid, newWindow)) {
      workspace.leaves.push(newWindow);
    }
  }
}

export type AppletType = "launcher" | "appLaunch" | "custom";

function Applet({
  type,
  func,
  customIcon,
}: {
  type: AppletType;
  func?: () => void;
  customIcon?: string;
}) {
  switch (type) {
    case "launcher":
      return (
        <button
          onClick={async () => {
            await UMJS.execProcess("rofi -show drun", {
              compositorArgs: {
                directRender: true,
              },
            });
          }}
        >
          <img src={launcherIcon} alt="Launcher Icon" />
        </button>
      );
    case "appLaunch":
      return (
        <button
          onClick={() => {
            const w = makeWindow();
            const currentWorkspaceIndex = workspaceStore.getState().workspace;
            const updatedWorkspaces = [...workspacesStore.getState().workspaces];
            const focusedPid = focusedPidStore.getState().focusedPid;

            if (!updatedWorkspaces[currentWorkspaceIndex]) {
              updatedWorkspaces[currentWorkspaceIndex] = {
                leaves: [],
                activeLayout: "horizontal",
              };
            }

            insertWindowInWorkspace(updatedWorkspaces[currentWorkspaceIndex], focusedPid, w);

            workspacesStore.setState({ workspaces: updatedWorkspaces });
            focusedPidStore.setState({ focusedPid: w.pid });
          }}
        >
          <img src="https://picsum.photos/200/200" alt="Launch App" />
        </button>
      );
    case "custom":
      return (
        <button onClick={func}>
          <img src={customIcon} alt="Custom Action" />
        </button>
      );
    default:
      return null;
  }
}

export const Launcher = () => {
  return (
    <div className="launcher">
      <Applet type="launcher" />
      <Applet type="appLaunch" />
    </div>
  );
};
