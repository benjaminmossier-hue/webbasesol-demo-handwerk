import {
  ArrowRight,
  Bath,
  CalendarCheck,
  ClipboardList,
  Flame,
  Info,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Ruler,
  Wrench,
} from "lucide-react";
import { AnfrageAssistent } from "@/components/AnfrageAssistent";

const PORTFOLIO = "https://webbasesol.pages.dev";

const LEISTUNGEN = [
  {
    id: "heizung",
    icon: Flame,
    titel: "Wärmepumpe & Heizungstausch",
    text: "Wir prüfen, ob Ihr Haus für eine Wärmepumpe passt, planen den Tausch und kümmern uns um die Unterlagen für die Förderung.",
  },
  {
    id: "bad",
    icon: Bath,
    titel: "Badsanierung",
    text: "Vom Aufmaß bis zur letzten Fuge aus einer Hand. Auf Wunsch barrierearm, mit bodengleicher Dusche.",
  },
  {
    id: "reparatur",
    icon: Wrench,
    titel: "Reparatur & Notdienst",
    text: "Heizung aus, Wasser läuft, Fehlercode im Display: Wir sind schnell da und sagen vorher, was es kostet.",
  },
  {
    id: "wartung",
    icon: CalendarCheck,
    titel: "Wartung",
    text: "Der jährliche Check hält die Anlage sparsam und sicher. Wir erinnern Sie rechtzeitig an den nächsten Termin.",
  },
] as const;

const ABLAUF = [
  {
    icon: MessageSquareText,
    titel: "Anfrage in 2 Minuten",
    text: "Sie beantworten ein paar kurze Fragen. Kein Anruf nötig, kein Formular-Marathon.",
  },
  {
    icon: PhoneCall,
    titel: "Rückmeldung am nächsten Werktag",
    text: "Wir wissen schon, worum es geht, und melden uns mit einer ersten Einschätzung.",
  },
  {
    icon: Ruler,
    titel: "Termin vor Ort",
    text: "Wir schauen uns alles an, messen auf und beantworten Ihre Fragen.",
  },
  {
    icon: ClipboardList,
    titel: "Festes Angebot",
    text: "Sie bekommen ein schriftliches Angebot mit klarem Preis. Ohne Überraschungen.",
  },
];

export default function Home() {
  return (
    <>
      {/* Demo-Hinweis */}
      <div className="bg-ink px-4 py-2.5 text-center text-sm text-white/90">
        <Info className="mr-1.5 inline size-4 -translate-y-px" aria-hidden />
        Demo-Seite von{" "}
        <a href={PORTFOLIO} className="font-semibold text-white underline underline-offset-2">
          Web Base Solution
        </a>
        . Kessler Haustechnik ist ein erfundener Betrieb.
      </div>

      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-copper text-white">
              <Flame className="size-5" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block font-extrabold [font-stretch:115%]">Kessler</span>
              <span className="block text-xs text-ink-soft">Haustechnik</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#leistungen" className="hover:text-copper">Leistungen</a>
            <a href="#ablauf" className="hover:text-copper">Ablauf</a>
            <a href="#gebiet" className="hover:text-copper">Einsatzgebiet</a>
          </nav>
          <a
            href="#anfrage"
            className="rounded-lg bg-copper px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-copper-dark"
          >
            Anfrage starten
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-copper">
              Heizung · Sanitär · Wärmepumpe
            </p>
            <h1 className="mt-4 text-[2.5rem] font-extrabold leading-[1.02] tracking-tight [font-stretch:118%] sm:text-6xl">
              Neue Heizung, neues Bad oder schnelle Hilfe.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Ihr Meisterbetrieb im Raum Aschaffenburg. Sagen Sie uns in zwei Minuten, worum es
              geht. Wir melden uns am nächsten Werktag und wissen dann schon Bescheid.
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-xs text-ink-soft">Meisterbetrieb seit</dt>
                <dd className="text-2xl font-bold tabular-nums">1994</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Mitarbeitende</dt>
                <dd className="text-2xl font-bold tabular-nums">14</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft">Rückmeldung</dt>
                <dd className="text-2xl font-bold">1 Tag</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-white sm:p-7">
            <p className="text-lg font-bold [font-stretch:112%]">Womit können wir helfen?</p>
            <p className="mt-1 text-sm text-white/70">Tippen Sie an, der Assistent fragt den Rest.</p>
            <div className="mt-5 grid gap-2.5">
              {LEISTUNGEN.map((l) => (
                <a
                  key={l.id}
                  href={`#anfrage-${l.id}`}
                  className="group flex items-center gap-3 rounded-xl bg-white/[0.07] px-4 py-3.5 transition hover:bg-white/[0.14]"
                >
                  <l.icon className="size-5 text-[#f0a57f]" aria-hidden />
                  <span className="flex-1 font-medium">{l.titel}</span>
                  <ArrowRight
                    className="size-4 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white"
                    aria-hidden
                  />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Leistungen */}
        <section id="leistungen" className="scroll-mt-20 border-y border-line bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-extrabold [font-stretch:115%] sm:text-4xl">Leistungen</h2>
            <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {LEISTUNGEN.map((l) => (
                <div key={l.id} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-water-soft text-water">
                    <l.icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">{l.titel}</h3>
                    <p className="mt-1.5 text-ink-soft">{l.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Anfrage-Assistent */}
        <section id="anfrage" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-copper">
                Anfrage-Assistent
              </p>
              <h2 className="mt-3 text-3xl font-extrabold [font-stretch:115%] sm:text-4xl">
                Zwei Minuten statt Telefon-Pingpong
              </h2>
              <p className="mt-4 text-lg text-ink-soft">
                Ein paar Fragen, dann wissen wir, was Sie brauchen, und können gleich mit einer
                Einschätzung zurückrufen.
              </p>
            </div>
            <div className="mt-10">
              <AnfrageAssistent />
            </div>
          </div>
        </section>

        {/* Ablauf */}
        <section id="ablauf" className="scroll-mt-20 bg-ink text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="text-3xl font-extrabold [font-stretch:115%] sm:text-4xl">So läuft es ab</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {ABLAUF.map((s, i) => (
                <li key={s.titel}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold tabular-nums text-[#f0a57f]">0{i + 1}</span>
                    <span className="h-px flex-1 bg-white/15" />
                    <s.icon className="size-5 text-white/60" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{s.titel}</h3>
                  <p className="mt-1.5 text-white/70">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Einsatzgebiet */}
        <section id="gebiet" className="scroll-mt-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-water-soft text-water">
                <MapPin className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="text-2xl font-bold">Einsatzgebiet</h2>
                <p className="mt-1 max-w-xl text-ink-soft">
                  Aschaffenburg, Spessart und Umgebung, bis etwa 30 km. Liegt Ihr Ort knapp
                  außerhalb? Fragen Sie trotzdem.
                </p>
              </div>
            </div>
            <a
              href="#anfrage"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-copper px-5 py-3 font-semibold text-white transition hover:bg-copper-dark"
            >
              Anfrage starten <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            Kessler Haustechnik ist ein erfundener Betrieb. Diese Seite zeigt, was{" "}
            <a href={PORTFOLIO} className="font-semibold text-ink underline underline-offset-2">
              Web Base Solution
            </a>{" "}
            für Handwerksbetriebe baut.
          </p>
          <div className="flex gap-5">
            <a href={`${PORTFOLIO}/impressum`} className="hover:text-ink">Impressum</a>
            <a href={`${PORTFOLIO}/datenschutz`} className="hover:text-ink">Datenschutz</a>
          </div>
        </div>
      </footer>
    </>
  );
}
