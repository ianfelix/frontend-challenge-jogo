import "./game";
import { LoadingScreen } from "./components/LoadingScreen";
import { Menu, Wifi } from "lucide-react";

function App() {
  return (
    <>
      {/* <LoadingScreen />
      <div id="game-container">
        <div id="gameView"></div>
      </div> */}

      <header>
        <div className="flex items-center gap-2">
          <span>00</span>
          <span>03:58:00</span>
        </div>
        <div className="flex items-center gap-2">
          <span>14:30</span>
          <Wifi />
          <Menu />
        </div>
      </header>
    </>
  );
}

export default App;
