import { Suspense, type ReactElement } from "react";
import { JoinForm } from "@/app/join-form";
import { PhotoFan } from "@/app/photo-fan";
import { SignupAvatars } from "@/app/signup-avatars";

function StepIcon({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </span>
  );
}

// Icon paths from Lucide (ISC licence).
const steps = [
  {
    title: "Record the purchase at the farm",
    body: "Log the farmer, the crop, the weight and what you paid, right where you buy.",
    icon: [<rect key="clip" x="8" y="2" width="8" height="4" rx="1" />, <path key="board" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />, <path key="tick" d="m9 14 2 2 4-4" />],
  },
  {
    title: "Track it through your hub",
    body: "Each batch keeps its record as it is sorted, stored and moved, so you always know what you hold.",
    icon: [<path key="box" d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />, <path key="seam" d="M12 22V12" />, <path key="lid" d="m3.3 7 8.7 5 8.7-5" />, <path key="tape" d="m7.5 4.27 9 5.15" />],
  },
  {
    title: "Show buyers where it came from",
    body: "Hand every buyer a clear record of the farm that grew it and each handoff since.",
    icon: [<path key="pin" d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />, <circle key="dot" cx="12" cy="10" r="3" />],
  },
];

export default function Home() {
  return (
    <main id="top" className="bg-white text-ink">
      <p className="px-6 pt-6 text-xl font-bold tracking-tight text-forest sm:px-10">kinja<span className="text-gold">.</span></p>
      <div className="mx-auto max-w-3xl px-6 pt-16 text-center sm:pt-24">
        <h1 className="text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
          <span className="block">Every handoff,</span>
          <span className="block">from the farm to the sale.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-muted">The operating system for Africa&apos;s agricultural value chains.</p>
        <div className="mt-8">
          <JoinForm />
        </div>
        <Suspense fallback={<div className="mt-5 h-8" />}>
          <SignupAvatars />
        </Suspense>
      </div>
      <PhotoFan />
      <section className="px-6 pt-20 pb-24 sm:px-10" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-moss">How it works</p>
          <h2 id="how-it-works" className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">One record, from the farm gate to the buyer.</h2>
          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li className="rounded-[1.4rem] bg-cream p-6" key={step.title}>
                <div className="flex items-center justify-between">
                  <StepIcon>{step.icon}</StepIcon>
                  <span className="text-sm font-medium text-moss">Step {index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight text-forest">{step.title}</h3>
                <p className="mt-2 text-base leading-7 text-moss">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <footer className="overflow-hidden bg-forest-deep px-6 pt-16 pb-6 text-cream sm:px-10 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block">Start with</span>
                <span className="block">your next harvest.</span>
              </p>
              <div className="mt-8">
                <JoinForm variant="outline" />
              </div>
            </div>
            <ul className="space-y-1 text-xl whitespace-nowrap md:pb-2 md:text-2xl">
              <li><a className="hover:text-gold" href="#how-it-works">How it works</a></li>
              <li><a className="hover:text-gold" href="#top">Back to top</a></li>
            </ul>
          </div>
          <p className="mt-16 pb-[0.2em] text-[min(36vw,30rem)] font-bold leading-[0.8] tracking-tight sm:mt-24" aria-hidden="true">kinja<span className="text-gold">.</span></p>
          <div className="flex flex-col gap-2 border-t border-cream/15 pt-5 text-sm text-cream/70 lg:flex-row lg:items-center lg:justify-between">
            <p>© 2026 Kinja</p>
            <p>The operating system for Africa&apos;s agricultural value chains.</p>
            <p>Photos from Pexels and Unsplash</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
