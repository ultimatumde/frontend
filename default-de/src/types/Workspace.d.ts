type WorkspaceLeaf = WorkspaceLeaves | LWindow;

export type LayoutType = "horizontal" | "vertical";

export type Leaves = (WorkspaceLeaf | WorkspaceLeaves)[];

export interface WorkspaceLeaves {
  leaves: Leaves;
  activeLayout: LayoutType;
}

export interface LWindow {
  title: string;
  pid: number;
}
