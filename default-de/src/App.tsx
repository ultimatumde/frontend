import { useEffect, useState } from "react";
import "./App.css";
import TopBar from "./components/topbar";
import Wallpaper from "./components/Wallpaper";
import { WindowView } from "./components/WindowView";
import { Launcher } from "./components/Launcher";
import { workspaceStore, workspacesStore } from "./stores/workspace";
import { makeHorizontal, makeVertical, makeWindow } from "./utils/wm";
import { focusedPidStore } from "./stores/window";
import { keybindsInit } from "./handlers/keybinds";

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    keybindsInit();
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
    ]});
    setLoaded(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Wallpaper />
      <TopBar />
      <div className="workspacecontainer">
        <WindowView />
      </div>
      <Launcher />
    </>
  );
}

export default App;
