import { create } from "zustand";

export const focusedPidStore = create<{
  focusedPid: number;
}>(() => ({
  focusedPid: 0
}));

export const windowStore = create<{
    windows: number[];
}>(() => ({
    windows: []
}));