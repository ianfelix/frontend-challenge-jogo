export function LoadingScreen() {
  return (
    <div
      id="loading-screen"
      className="absolute top-0 left-0 flex h-screen w-screen flex-col items-center justify-center bg-[#51417F]"
    >
      <img src="./assets/logo.png" alt="A logo with a spinning top" />
      <label htmlFor="progress-bar" className="text-white">
        Loading...
      </label>
      <progress id="progress-bar" max="100" value="0"></progress>
    </div>
  );
}
