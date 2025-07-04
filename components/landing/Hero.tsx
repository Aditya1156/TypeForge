import React from 'react';

interface HeroProps {
  onStartTyping: () => void;
}

const Hero = ({ onStartTyping }: HeroProps) => (
  <section className="relative h-screen flex items-center justify-center text-center text-text-primary bg-primary overflow-hidden">
    <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
     <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/50 to-primary"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-accent/10 blur-[150px]"></div>
    </div>
    <div className="relative z-10 p-4">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
        Master the Keyboard.
        <br />
        <span className="text-accent">Unlock Your True Typing Speed.</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary mb-8">
        Stop pecking, start flying. TypeForge uses AI-driven lessons and advanced analytics to transform your typing from a chore into a skill.
      </p>
      <button
        onClick={onStartTyping}
        className="px-10 py-4 text-lg font-bold text-primary bg-accent rounded-lg shadow-lg shadow-accent/30 hover:bg-accent/80 transition-all duration-300 transform hover:scale-105"
      >
        Start Typing for Free
      </button>
    </div>
  </section>
);

export default Hero;
