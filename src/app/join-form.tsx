"use client";

import { useActionState, useEffect, useId, useRef, useState, type RefObject } from "react";
import { joinAction } from "@/app/actions";
import { sourcingChoices } from "@/waitlist/sourcing";
import type { JoinState } from "@/waitlist/state";

const initialState: JoinState = { status: "idle" };
const fieldClass = "mt-2 w-full max-w-full border border-sand bg-white px-5 text-base text-forest outline-none transition-shadow focus:border-forest-deep focus:ring-4 focus:ring-forest/10";
const lineClass = `${fieldClass} h-12 rounded-full`;

const triggerClass = {
  solid: "bg-forest text-white hover:bg-forest-deep",
  outline: "border border-cream/40 text-cream hover:bg-cream hover:text-forest-deep",
} as const;

export function JoinForm({ variant = "solid" }: { variant?: keyof typeof triggerClass }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const pressedBackdrop = useRef(false);
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(joinAction, initialState);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [sourcing, setSourcing] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (state.status === "joined") successRef.current?.focus();
  }, [state]);

  function show(): void {
    dialogRef.current?.showModal();
    (nameRef.current ?? successRef.current)?.focus();
    setOpen(true);
  }

  function close(): void {
    dialogRef.current?.close();
  }

  return (
    <>
      <button ref={triggerRef} className={`inline-flex h-12 items-center gap-2 rounded-full px-7 text-base font-medium ${triggerClass[variant]}`} type="button" onClick={show}>Get early access<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      {/* showModal() traps focus and closes on Escape. Safari doesn't focus a clicked button, so focus goes back by hand. */}
      <dialog
        ref={dialogRef}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md flex-col overflow-hidden rounded-[1.4rem] bg-cream p-0 text-left text-forest shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop:bg-night/70 open:flex sm:max-h-[calc(100dvh-3rem)]"
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onMouseDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (pressedBackdrop.current && event.target === event.currentTarget) close();
        }}
      >
        {state.status === "joined" ? (
          <Joined firstName={state.firstName} email={state.email} titleId={titleId} successRef={successRef} onDone={close} />
        ) : (
          <>
            <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-7">
              <div className="min-w-0">
                <h2 id={titleId} className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">Join the waitlist</h2>
                <p className="mt-1 text-sm leading-6 text-moss">Leave your details. We will write when a place opens.</p>
              </div>
              <CloseButton onClick={close} />
            </div>
          <form action={action} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-5 pt-4 sm:px-8 sm:pb-8">
            <label className="block text-sm font-medium">
              Your name
              <input className={lineClass} ref={nameRef} name="name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input className={lineClass} name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Business name
              <input className={lineClass} name="business" autoComplete="organization" required value={business} onChange={(event) => setBusiness(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              How you source
              <span className="relative block">
                <select className={`${lineClass} appearance-none pr-11`} name="sourcing" required value={sourcing} onChange={(event) => setSourcing(event.target.value)}>
                  <option value="" disabled>Choose one</option>
                  {sourcingChoices.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-5 top-[calc(50%+0.25rem)] -translate-y-1/2 text-forest" aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </label>
            <label className="block text-sm font-medium">
              Anything else we should know? <span className="font-normal text-sage">(optional)</span>
              <textarea className={`${fieldClass} min-h-24 rounded-3xl py-3`} name="note" rows={3} placeholder="e.g. crops you buy, number of farmers, county" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <div className="sr-only" aria-hidden="true">
              <label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            {state.status === "error" && <p className="text-sm text-danger" role="alert">{state.message}</p>}
            <button className="h-12 w-full rounded-full bg-forest-deep text-base font-medium text-cream-soft disabled:opacity-60" type="submit" disabled={pending}>
              {pending ? "Joining…" : "Join waitlist"}
            </button>
            <p className="text-xs leading-5 text-sage">We&apos;ll only use this to contact you about Kinja. We never sell or share your details.</p>
          </form>
          </>
        )}
      </dialog>
    </>
  );
}

function CloseButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return <button className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-moss hover:bg-line ${className}`} type="button" aria-label="Close" onClick={onClick}>×</button>;
}

const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function shareMessage(): string {
  return `Just got on the Kinja waitlist. Looks really useful for buyers like us. Worth getting your name down early: 👇\n${window.location.origin}`;
}

type JoinedProps = {
  firstName: string;
  email: string;
  titleId: string;
  successRef: RefObject<HTMLDivElement | null>;
  onDone: () => void;
};

function Joined({ firstName, email, titleId, successRef, onDone }: JoinedProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div ref={successRef} tabIndex={-1} className="relative min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-6 text-center outline-none sm:px-8 sm:pb-8" role="status">
      <CloseButton className="absolute top-3 right-3 z-10" onClick={onDone} />
      <div className="relative mx-auto mt-6 flex h-36 w-full max-w-xs items-center justify-center" aria-hidden="true">
        <Doodles />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-forest text-cream shadow-[0_10px_30px_rgba(52,78,65,0.35)] ring-8 ring-gold/25 motion-safe:animate-[pop_520ms_cubic-bezier(0.34,1.56,0.64,1)_both]">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path className="motion-safe:animate-[draw_420ms_ease-out_300ms_both] [stroke-dasharray:24]" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
      </div>
      <h2 id={titleId} className="mt-4 text-3xl font-bold leading-tight tracking-tight text-forest-deep sm:text-4xl">You&apos;re on the list, {firstName}!</h2>
      <p className="mx-auto mt-3 max-w-xs text-base leading-7 text-moss">We&apos;ll email <span className="block font-medium [overflow-wrap:anywhere] text-forest">{email}</span> when your spot opens.</p>
      <div className="mt-7 rounded-2xl bg-white p-4 text-left shadow-[0_1px_0_rgba(23,36,28,0.06)] sm:p-5">
        <p className="text-sm font-bold text-forest">Know another buyer who should try Kinja?</p>
        <p className="mt-1 text-sm leading-6 text-moss">Send them this page.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep" type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage())}`, "_blank", "noopener,noreferrer")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
            WhatsApp
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-sand px-4 text-sm font-medium text-forest hover:bg-cream" type="button" onClick={copyLink}>
            {copied ? (
              <svg {...iconProps}><path d="M20 6 9 17l-5-5" /></svg>
            ) : (
              <svg {...iconProps}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            )}
            <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
          </button>
        </div>
      </div>
      <button className="mt-5 text-sm font-medium text-moss underline decoration-sand underline-offset-4 hover:text-forest" type="button" onClick={onDone}>Done</button>
    </div>
  );
}

// Hand-drawn marks around the check. Decorative only.
function Doodles() {
  return (
    <svg className="absolute inset-0 h-full w-full motion-safe:animate-[fade-up_600ms_ease-out_200ms_both]" viewBox="0 0 320 144" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 98c10-14 22 8 32-6s20 6 30-8" stroke="var(--color-gold)" strokeWidth="4" />
      <path d="M232 40c8-10 18 4 26-6s16 4 24-6" stroke="var(--color-forest)" strokeWidth="3.5" opacity="0.5" />
      <path d="M62 30l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="var(--color-gold)" />
      <path d="M262 92l2.4 7 7 2.4-7 2.4-2.4 7-2.4-7-7-2.4 7-2.4z" fill="var(--color-gold)" />
      <path d="M274 120c-8-4-10-14-4-20 8 2 10 12 4 20Zm0 0c-2-6-1-12 4-18" stroke="var(--color-forest)" strokeWidth="3" />
      <path d="M44 128c-6-8-2-18 8-20 4 10-1 18-8 20Zm0 0c1-7 4-12 10-16" stroke="var(--color-forest)" strokeWidth="3" opacity="0.6" />
      <circle cx="104" cy="18" r="4" fill="var(--color-forest)" opacity="0.35" />
      <circle cx="222" cy="122" r="5" fill="var(--color-gold)" opacity="0.7" />
      <circle cx="292" cy="22" r="3" fill="var(--color-gold)" />
      <path d="M16 54l10 4M18 66l10-2" stroke="var(--color-forest)" strokeWidth="3" opacity="0.4" />
      <path d="M302 62l-10 4M300 74l-10-2" stroke="var(--color-forest)" strokeWidth="3" opacity="0.4" />
    </svg>
  );
}
