import { useEffect, useState } from "react";
import type {
  LWindow,
  WorkspaceLeaf,
  WorkspaceLeaves,
} from "../types/Workspace";
import "./windowview.css";
import { workspacesStore, workspaceStore } from "../App";

const Window = (src: LWindow) => {
  useEffect(() => {
    let stop = false;

    function r() {
      if (stop) return;
      requestAnimationFrame(r);
    }

    requestAnimationFrame(r);

    return () => {
      stop = true;
    };
  }, []);

  return (
    <div className="windowframe">
      <div className="windowtitle">{src.title}</div>
      <canvas></canvas>
    </div>
  );
};

export function isGroup(
  w: WorkspaceLeaves | WorkspaceLeaf
): w is WorkspaceLeaves {
  return (w as WorkspaceLeaves).activeLayout !== undefined;
}

export const WindowView = () => {
  const { workspace: workspaceRoot } = workspaceStore();
  const [workspace, setWorkspace] = useState<WorkspaceLeaves>(
    workspacesStore().workspaces[workspaceRoot]
  );

  workspacesStore.subscribe((state) => {
    if (state.workspaces[workspaceRoot]) {
      setWorkspace(state.workspaces[workspaceRoot]);
    }
  });

  function recursiveBuildWindowLayout(work: WorkspaceLeaves) {
    return (
      <div className={"windowlayout " + work.activeLayout}>
        {work.leaves.map((w) =>
          isGroup(w) ? recursiveBuildWindowLayout(w) : Window(w as LWindow)
        )}
      </div>
    );
  }

  return recursiveBuildWindowLayout(workspace);
};
