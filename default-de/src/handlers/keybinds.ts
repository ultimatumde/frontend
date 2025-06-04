import { create } from "zustand/react";
import { registerKeybind } from "../stores/keybind";
import { focusedPidStore } from "../stores/window";
import { workspacesStore, workspaceStore } from "../stores/workspace";
import type { LayoutType, LWindow, WorkspaceLeaves } from "../types/Workspace";
import { isGroup, makeWindow } from "../utils/wm";

export const layoutStore = create<{
    layout: LayoutType;
}>(() => ({
    layout: "horizontal",
}));

function findNextFocusablePid(group: WorkspaceLeaves): number {
    for (const leaf of group.leaves) {
        if (!isGroup(leaf)) {
            return (leaf as LWindow).pid;
        } else if (isGroup(leaf)) {
            const pid = findNextFocusablePid(leaf);
            if (pid !== 0) return pid;
        }
    }
    return 0;
}

function containsWindow(group: WorkspaceLeaves, pid: number): boolean {
    for (const leaf of group.leaves) {
        if (!isGroup(leaf) && (leaf as LWindow).pid === pid) {
            return true;
        } else if (isGroup(leaf) && containsWindow(leaf, pid)) {
            return true;
        }
    }
    return false;
}

function cleanupEmptyCollections(group: WorkspaceLeaves, childIndex: number): void {
    const child = group.leaves[childIndex];
    if (isGroup(child) && child.leaves.length === 0) {
        group.leaves.splice(childIndex, 1);
    }
}

function updateWorkspaceState(): void {
    workspacesStore.setState({
        workspaces: [...workspacesStore.getState().workspaces]
    });
}

function getCurrentWorkspaceAndPid(): { currentWorkspace: WorkspaceLeaves; focusedPid: number } {
    const workspaceIndex = workspaceStore.getState().workspace;
    const workspaces = workspacesStore.getState().workspaces;
    
    if (!workspaces[workspaceIndex]) {
        const newWorkspace: WorkspaceLeaves = {
            leaves: [],
            activeLayout: "horizontal"
        };
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = newWorkspace;
        workspacesStore.setState({ workspaces: updatedWorkspaces });
        return {
            currentWorkspace: newWorkspace,
            focusedPid: focusedPidStore.getState().focusedPid
        };
    }
    
    return {
        currentWorkspace: workspaces[workspaceIndex],
        focusedPid: focusedPidStore.getState().focusedPid
    };
}

export function keybindsInit() {
    registerKeybind("Q", () => {
        const { currentWorkspace, focusedPid } = getCurrentWorkspaceAndPid();
        
        function recursiveRemovePid(group: WorkspaceLeaves, pid: number): boolean {
            for (let i = 0; i < group.leaves.length; i++) {
                const leaf = group.leaves[i];
                if (!isGroup(leaf) && (leaf as LWindow).pid === pid) {
                    group.leaves.splice(i, 1);
                    return true;
                } else if (isGroup(leaf)) {
                    if (recursiveRemovePid(leaf, pid)) {
                        cleanupEmptyCollections(group, i);
                        return true;
                    }
                }
            }
            return false;
        }
        
        recursiveRemovePid(currentWorkspace, focusedPid);
        focusedPidStore.setState({ focusedPid: findNextFocusablePid(currentWorkspace) });
        updateWorkspaceState();
    }, "Close focused window");
    
    registerKeybind("D", () => {
        const { currentWorkspace, focusedPid } = getCurrentWorkspaceAndPid();
        
        function findDeleteLeavesCollection(group: WorkspaceLeaves, pid: number): boolean {
            for (let i = 0; i < group.leaves.length; i++) {
                const leaf = group.leaves[i];
                if (isGroup(leaf)) {
                    if (containsWindow(leaf, pid)) {
                        group.leaves.splice(i, 1);
                        return true;
                    } else if (findDeleteLeavesCollection(leaf, pid)) {
                        cleanupEmptyCollections(group, i);
                        return true;
                    }
                } else if ((leaf as LWindow).pid === pid) {
                    group.leaves.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
        
        if (focusedPid !== 0) {
            findDeleteLeavesCollection(currentWorkspace, focusedPid);
            focusedPidStore.setState({ focusedPid: findNextFocusablePid(currentWorkspace) });
            updateWorkspaceState();
        }
    }, "Delete current leaves collection");
    
    registerKeybind("H", () => {
        const { currentWorkspace, focusedPid } = getCurrentWorkspaceAndPid();
        
        function findParentSetOrientation(group: WorkspaceLeaves, pid: number, orientation: LayoutType): boolean {
            for (let i = 0; i < group.leaves.length; i++) {
                const leaf = group.leaves[i];
                if (!isGroup(leaf) && (leaf as LWindow).pid === pid) {
                    group.activeLayout = orientation;
                    return true;
                } else if (isGroup(leaf)) {
                    if (containsWindow(leaf, pid)) {
                        leaf.activeLayout = orientation;
                        return true;
                    }
                }
            }
            return false;
        }
        
        findParentSetOrientation(currentWorkspace, focusedPid, "horizontal");
        updateWorkspaceState();
    }, "Switch to horizontal layout");
    
    registerKeybind("V", () => {
        const { currentWorkspace, focusedPid } = getCurrentWorkspaceAndPid();
        
        function findParentAndSetOrientation(group: WorkspaceLeaves, pid: number, orientation: LayoutType): boolean {
            for (let i = 0; i < group.leaves.length; i++) {
                const leaf = group.leaves[i];
                if (!isGroup(leaf) && (leaf as LWindow).pid === pid) {
                    group.activeLayout = orientation;
                    return true;
                } else if (isGroup(leaf)) {
                    if (containsWindow(leaf, pid)) {
                        leaf.activeLayout = orientation;
                        return true;
                    }
                }
            }
            return false;
        }
        
        findParentAndSetOrientation(currentWorkspace, focusedPid, "vertical");
        updateWorkspaceState();
    }, "Switch to vertical layout");
    
    registerKeybind("N", () => {
        const { currentWorkspace, focusedPid } = getCurrentWorkspaceAndPid();
        
        function insertWindowInParent(group: WorkspaceLeaves, pid: number): boolean {
            for (let i = 0; i < group.leaves.length; i++) {
                const leaf = group.leaves[i];
                if (!isGroup(leaf) && (leaf as LWindow).pid === pid) {
                    const newWindow = makeWindow();
                    group.leaves.splice(i + 1, 0, newWindow);
                    focusedPidStore.setState({ focusedPid: newWindow.pid });
                    return true;
                } else if (isGroup(leaf)) {
                    if (insertWindowInParent(leaf, pid)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        if (focusedPid === 0 || currentWorkspace.leaves.length === 0) {
            const newWindow = makeWindow();
            currentWorkspace.leaves.push(newWindow);
            focusedPidStore.setState({ focusedPid: newWindow.pid });
        } else {
            if (!insertWindowInParent(currentWorkspace, focusedPid)) {
                const newWindow = makeWindow();
                currentWorkspace.leaves.push(newWindow);
                focusedPidStore.setState({ focusedPid: newWindow.pid });
            }
        }
        
        updateWorkspaceState();
    }, "Insert new window");
    
    registerKeybind("L", () => {
        const { currentWorkspace, focusedPid } = getCurrentWorkspaceAndPid();
        
        function insertLeavesCollection(group: WorkspaceLeaves, pid: number): boolean {
            for (let i = 0; i < group.leaves.length; i++) {
                const leaf = group.leaves[i];
                if (isGroup(leaf)) {
                    if (containsWindow(leaf, pid)) {
                        const newLeaves: WorkspaceLeaves = {
                            leaves: [makeWindow()],
                            activeLayout: "horizontal"
                        };
                        group.leaves.splice(i + 1, 0, newLeaves);
                        return true;
                    } else if (insertLeavesCollection(leaf, pid)) {
                        return true;
                    }
                } else if ((leaf as LWindow).pid === pid) {
                    const newLeaves: WorkspaceLeaves = {
                        leaves: [makeWindow()],
                        activeLayout: "horizontal"
                    };
                    group.leaves.splice(i + 1, 0, newLeaves);
                    return true;
                }
            }
            return false;
        }
        
        if (focusedPid === 0 || currentWorkspace.leaves.length === 0) {
            const newLeaves: WorkspaceLeaves = {
                leaves: [makeWindow()],
                activeLayout: "horizontal"
            };
            currentWorkspace.leaves.push(newLeaves);
            const newWindow = newLeaves.leaves[0] as LWindow;
            focusedPidStore.setState({ focusedPid: newWindow.pid });
        } else {
            if (!insertLeavesCollection(currentWorkspace, focusedPid)) {
                const newLeaves: WorkspaceLeaves = {
                    leaves: [makeWindow()],
                    activeLayout: "horizontal"
                };
                currentWorkspace.leaves.push(newLeaves);
                const newWindow = newLeaves.leaves[0] as LWindow;
                focusedPidStore.setState({ focusedPid: newWindow.pid });
            }
        }
        
        updateWorkspaceState();
    }, "Insert new leaves collection");
}