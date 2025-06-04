import { create } from "zustand/react";
import type { WorkspaceLeaves } from "../types/Workspace";

export const workspaceStore = create<{
  workspace: number;
}>(() => ({
  workspace: 0
}));

export const workspacesStore = create<{
  workspaces: WorkspaceLeaves[];
}>(() => ({
  workspaces: []
}));

