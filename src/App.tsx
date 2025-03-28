import "./game";
import {
  Header,
  LoadingScreen,
  MainContent,
  GameInitializer,
} from "./components";
import { GameProvider } from "./contexts/GameContext.tsx";

const AppContent = () => {
  return (
    <>
      <GameInitializer />
      <LoadingScreen />

      <main className="grid size-full grid-rows-[auto_1fr] bg-[#2B265A] md:h-screen">
        <Header />
        <MainContent />
      </main>
    </>
  );
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
