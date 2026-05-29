import { useLocation } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "AI Agent Network",
    desc: "A coordinated team of specialized AI agents — Hook, Emotion, Visual, Retention — that analyze and optimize every frame of your content.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Viral Score Engine",
    desc: "Real-time probability scoring that tells you exactly how likely your content is to go viral — before you publish.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: "Trend Radar",
    desc: "Live tracking of emerging trends across TikTok, YouTube Shorts, and Reels — with momentum scores and predicted peak windows.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Personality Clone",
    desc: "Train VIRALOS on your unique voice, style, and audience DNA to generate content that sounds exactly like you — at scale.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "Revenue Intelligence",
    desc: "Connect your monetization across sponsors, merch, and platforms. VIRALOS surfaces your highest-value opportunities automatically.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Cinematic Engine",
    desc: "Generate broadcast-quality video content with AI-driven scripts, voiceover, and visual direction — all in one automated pipeline.",
  },
];

const stats = [
  { value: "94%", label: "Average viral probability improvement" },
  { value: "12×", label: "Faster content production" },
  { value: "3.2M", label: "Videos analyzed and optimized" },
  { value: "89%", label: "Creator retention rate" },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#060c14] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060c14]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M5 17 L12 10 L19 17 L16 17 L16 22 L8 22 L8 17 Z" fill="white" opacity="0.9"/>
                <path d="M12 10 L19 17 L16 17 L16 13 Z" fill="white" opacity="0.4"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">VIRALOS <span className="text-blue-500 font-medium text-sm">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/sign-in")}
              className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </button>
            <button
              onClick={() => setLocation("/sign-up")}
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] rounded-full bg-purple-600/6 blur-[80px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Autonomous Creator Operating System
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
            Create content that{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              actually goes viral
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            VIRALOS is an AI-powered creator OS that analyzes, generates, and optimizes your video content — with a real-time viral probability engine and autonomous agent network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setLocation("/sign-up")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              Start for free
            </button>
            <button
              onClick={() => setLocation("/sign-in")}
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-base font-medium px-8 py-3.5 rounded-xl transition-all"
            >
              Sign in to dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to dominate your niche</h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">A complete intelligence layer for creators who want to grow faster and work smarter.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-b from-blue-600/10 to-purple-600/5 border border-blue-500/15 rounded-3xl px-8 py-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to go viral?</h2>
            <p className="text-white/40 mb-8">Join thousands of creators using VIRALOS to build audiences faster than ever.</p>
            <button
              onClick={() => setLocation("/sign-up")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]"
            >
              Create your free account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M5 17 L12 10 L19 17 L16 17 L16 22 L8 22 L8 17 Z" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/60">VIRALOS AI</span>
          </div>
          <p className="text-sm text-white/25">© {new Date().getFullYear()} VIRALOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
