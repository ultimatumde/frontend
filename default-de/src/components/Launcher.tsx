import type { Dispatch, SetStateAction } from "react";
import {
  makeWindow,
  focusedPidStore,
  workspacesStore,
  workspaceStore,
} from "../App";
import type { LWindow, WorkspaceLeaves } from "../types/Workspace";
import "./launcher.css";
import { isGroup } from "./WindowView";

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

export const Launcher = () => {
  const { setFocusedPid } = focusedPidStore();
  const { workspace, setWorkspace } = workspaceStore();
  return (
    <div className="launcher">
      <button
        onClick={() => {
          const w = makeWindow();
          insertNextToPid(
            workspacesStore.getState().workspaces[
              workspaceStore.getState().workspace
            ],
            focusedPidStore.getState().focusedPid,
            w
          );
          setFocusedPid(w.pid);
          setWorkspace(workspace);
        }}
      >
        APP
      </button>
    </div>
  );
};
