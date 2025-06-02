import "./App.css";
import Taskbar from "./components/Taskbar";
import Wallpaper from "./components/Wallpaper";

function App() {
  return (
    <>
      <Wallpaper />
      <div className="maincontainer">
        <div className="taskbarcontainer">
          <Taskbar />
        </div>
      </div>
    </>
  );
}

export default App;
