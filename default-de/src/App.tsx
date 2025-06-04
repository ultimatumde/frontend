import { useState } from "react";
import "./App.css";
import TopBar from "./components/topbar";
import Wallpaper from "./components/Wallpaper";
import type { Leaves, LWindow, WorkspaceLeaves } from "./types/Workspace";
import { WindowView } from "./components/WindowView";
import { Launcher } from "./components/Launcher";
import { create } from "zustand";

let pid: number = 0;
export function makeWindow(): LWindow {
  const p = pid;
  pid++;
  return {
    src: "https://picsum.photos/500/300",
    title: "Example Window",
    pid: p,
  };
}

function makeHorizontal(windows: Leaves): WorkspaceLeaves {
  return {
    leaves: windows,
    activeLayout: "horizontal",
  };
}

function makeVertical(windows: Leaves): WorkspaceLeaves {
  return {
    leaves: windows,
    activeLayout: "vertical",
  };
}

export const workspaceStore = create<{
  workspace: number;
  setWorkspace: (workspace: number) => void;
}>((set) => ({
  workspace: 0,
  setWorkspace: (workspace: number) => set({ workspace }),
}));

export const workspacesStore = create<{
  workspaces: WorkspaceLeaves[];
  setWorkspaces: (workspaces: WorkspaceLeaves[]) => void;
}>((set) => ({
  workspaces: [],
  setWorkspaces: (workspaces: WorkspaceLeaves[]) => set({ workspaces }),
}));

export const focusedPidStore = create<{
  focusedPid: number;
  setFocusedPid: (pid: number) => void;
}>((set) => ({
  focusedPid: 0,
  setFocusedPid: (pid: number) => set({ focusedPid: pid }),
}));

function App() {
  focusedPidStore.setState({ focusedPid: 0 });
  workspaceStore.setState({ workspace: 0 });
  workspacesStore.setState({
    workspaces: [
      makeHorizontal([
        makeVertical([makeWindow(), makeWindow()]),
        makeWindow(),
      ]),
      makeHorizontal([makeWindow()]),
      makeVertical([makeWindow(), makeWindow()]),
    ],
  });

  return (
    <>
      <Wallpaper />
      <TopBar />
      <div className="workspace">
        <WindowView />
      </div>
      <Launcher />
    </>
  );
}

export default App;
