export function LoadingScreen() {
  return (
    <div
      id="loading-screen"
      className="absolute top-0 left-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-[#51417F]"
    >
      <img
        src="./assets/logo.png"
        alt="A logo with a spinning top"
        className="mb-4 h-32 w-32 md:h-48 md:w-48"
      />
      <label htmlFor="progress-bar" className="mb-2 font-bold text-white">
        Loading...
      </label>
      <progress
        id="progress-bar"
        max="100"
        value="0"
        className="h-3 w-64 md:h-4 md:w-80"
      ></progress>
    </div>
  );
}
