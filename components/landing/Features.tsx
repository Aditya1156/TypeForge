import React from 'react';

const Feature = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="flex flex-col items-center text-center p-6 bg-secondary rounded-lg border border-border-primary transform transition-transform duration-300 hover:-translate-y-2">
    <div className="mb-4 text-accent">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-text-primary">{title}</h3>
    <p className="text-text-secondary">{children}</p>
  </div>
);

const Features = () => (
  <section className="py-20 bg-primary text-text-primary">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold">Why TypeForge?</h2>
        <p className="text-text-secondary mt-2">More than just a speed test. A complete training suite.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Feature
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>}
          title="Aether AI™ Coach"
        >
          Our AI analyzes your mistakes and generates personalized drills to target your specific weaknesses.
        </Feature>
        <Feature
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
          title="Structured Curriculum"
        >
          Progress through a comprehensive lesson plan from home row basics to complex code snippets.
        </Feature>
        <Feature
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
          title="Advanced Analytics"
        >
          Track your WPM, accuracy, and consistency over time with detailed charts and progress markers.
        </Feature>
      </div>
    </div>
  </section>
);

export default Features;
