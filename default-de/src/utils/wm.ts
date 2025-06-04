import type { WorkspaceLeaves, WorkspaceLeaf, LWindow, Leaves } from "../types/Workspace";

export function isGroup(
  w: WorkspaceLeaves | WorkspaceLeaf
): w is WorkspaceLeaves {
  return (w as WorkspaceLeaves).activeLayout !== undefined;
}

let pid: number = 0;
export function makeWindow(): LWindow {
  const p = pid;
  pid++;
  return {
    title: "Example Window",
    pid: p,
  };
}

export function makeHorizontal(windows: Leaves): WorkspaceLeaves {
  return {
    leaves: windows,
    activeLayout: "horizontal",
  };
}

export function makeVertical(windows: Leaves): WorkspaceLeaves {
  return {
    leaves: windows,
    activeLayout: "vertical",
  };
}
