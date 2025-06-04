import { useEffect, useState } from "react";
import "./topbar.css";
import type { WorkspaceLeaves } from "../types/Workspace";
import { workspacesStore, workspaceStore } from "../App";

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

const TopBar = () => {
  const [time, setTime] = useState<Date>(generateDate());
  const [showSeconds, setShowSeconds] = useState(false);

  const { workspace: workspaceRoot, setWorkspace } = workspaceStore();
  const { workspaces: workspacesRoot } = workspacesStore();

  const [workspace] = useState<number>(workspaceRoot as number);

  const [workspaces, setWorkspaces] = useState<typeof workspacesRoot>(
    workspacesRoot as WorkspaceLeaves[]
  );

  workspaceStore.subscribe((state) => {
    setWorkspace(state.workspace as number);
  });

  workspacesStore.subscribe((state) => {
    setWorkspaces(state.workspaces as WorkspaceLeaves[]);
  });


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
        <div>
          {workspaces.map((_, i) => (
            <div
              onClick={() => {
                setWorkspace(i);
              }}
              style={{
                margin: "0 5px",
              }}
              className={`workspace ${
                i === workspace ? "active" : ""
              }`}
              key={i}
            >
              {i + 1}
            </div>
          ))}
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
