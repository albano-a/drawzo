// src/pages/Home.tsx

const Home = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#1e293b]">
      {/* Blurred color blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-purple-600 opacity-30 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-500 opacity-20 rounded-full filter blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-pink-500 opacity-25 rounded-full filter blur-2xl pointer-events-none"></div>
      {/* Glass card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-12 flex flex-col items-center max-w-lg w-full border border-white/20">
        <span className="material-symbols-outlined text-7xl text-white drop-shadow-lg mb-6">
          brush
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
          Welcome to <span className="text-indigo-300">Drawzo</span>
        </h1>
        <p className="text-xl text-white/90 text-center mb-8">
          Unleash your creativity. Draw, share, and collaborate in real-time on
          a stunning canvas.
        </p>
        <a
          href="/draw"
          className="mt-2 px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg transition-all duration-200"
        >
          Start Drawing
        </a>
      </div>
      {/* Subtle noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        style={{
          background:
            "url('https://www.transparenttextures.com/patterns/noise.png')",
          opacity: 0.15,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
};

export default Home;
