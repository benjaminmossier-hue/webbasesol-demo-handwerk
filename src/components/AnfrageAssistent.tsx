"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Check,
  Flame,
  RotateCcw,
  Send,
  Wrench,
  CalendarCheck,
  LoaderCircle,
} from "lucide-react";
import {
  ANLIEGEN,
  KONTAKTWEGE,
  auswertenMitKi,
  type AnliegenId,
  type Quelle,
  type Auswertung,
  type Eingaben,
} from "@/lib/anfrage";

const ICONS: Record<AnliegenId, typeof Flame> = {
  heizung: Flame,
  bad: Bath,
  reparatur: Wrench,
  wartung: CalendarCheck,
};

const STUFE_FARBE: Record<Auswertung["stufe"], string> = {
  dringend: "bg-urgent text-white",
  hoch: "bg-copper text-white",
  normal: "bg-water text-white",
  planbar: "bg-ok text-white",
};

export function AnfrageAssistent() {
  const [anliegen, setAnliegen] = useState<AnliegenId | null>(null);
  const [schritt, setSchritt] = useState(0); // 0 = Anliegen wählen, 1..n = Fragen, n+1 = Kontakt
  const [antworten, setAntworten] = useState<Record<string, string>>({});
  const [vorname, setVorname] = useState("");
  const [plz, setPlz] = useState("");
  const [kontaktweg, setKontaktweg] = useState<Eingaben["kontaktweg"]>("Rückruf");
  const [notiz, setNotiz] = useState("");
  const [website, setWebsite] = useState(""); // Falle für Bots, für Menschen unsichtbar
  const [laedt, setLaedt] = useState(false);
  const [ergebnis, setErgebnis] = useState<{
    eingaben: Eingaben;
    auswertung: Auswertung;
    quelle: Quelle;
  } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const aktuell = ANLIEGEN.find((a) => a.id === anliegen);
  const fragen = aktuell?.fragen ?? [];
  const kontaktSchritt = fragen.length + 1;
  const gesamt = fragen.length + 2;

  function starten(id: AnliegenId) {
    setAnliegen(id);
    setAntworten({});
    setSchritt(1);
  }

  // Kacheln oben auf der Seite springen per #anfrage-heizung usw. direkt in den Assistenten
  useEffect(() => {
    function vonHash() {
      const id = window.location.hash.replace("#anfrage-", "") as AnliegenId;
      if (ANLIEGEN.some((a) => a.id === id)) {
        setErgebnis(null);
        starten(id);
        document.getElementById("anfrage")?.scrollIntoView();
      }
    }
    vonHash();
    window.addEventListener("hashchange", vonHash);
    return () => window.removeEventListener("hashchange", vonHash);
  }, []);

  function antworten_(frageId: string, wert: string) {
    setAntworten((alt) => ({ ...alt, [frageId]: wert }));
    setSchritt((s) => s + 1);
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!anliegen || laedt) return;
    const eingaben: Eingaben = {
      anliegen,
      antworten,
      vorname: vorname.trim(),
      plz,
      kontaktweg,
      notiz: notiz.trim(),
    };
    setLaedt(true);
    const { auswertung, quelle } = await auswertenMitKi(eingaben, website);
    setLaedt(false);
    setErgebnis({ eingaben, auswertung, quelle });
    boxRef.current?.scrollIntoView({ block: "start" });
  }

  function neu() {
    setErgebnis(null);
    setAnliegen(null);
    setSchritt(0);
    setAntworten({});
    setVorname("");
    setPlz("");
    setNotiz("");
    history.replaceState(null, "", "#anfrage");
  }

  if (ergebnis) {
    return (
      <div ref={boxRef} className="scroll-mt-24">
        <Ergebnis {...ergebnis} onNeu={neu} />
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-[0_1px_0_rgba(20,32,43,0.04),0_12px_32px_-12px_rgba(20,32,43,0.18)] sm:p-8"
    >
      {/* Fortschritt */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-copper transition-[width] duration-300 ease-out"
            style={{ width: `${anliegen ? ((schritt + 1) / gesamt) * 100 : 8}%` }}
          />
        </div>
        <span className="text-sm tabular-nums text-ink-soft">
          {anliegen ? `Schritt ${schritt + 1} von ${gesamt}` : "ca. 2 Minuten"}
        </span>
      </div>

      {schritt === 0 && (
        <div>
          <h3 className="text-2xl font-bold [font-stretch:112%]">Worum geht es?</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ANLIEGEN.map((a) => {
              const Icon = ICONS[a.id];
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => starten(a.id)}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-paper/60 p-4 text-left transition hover:border-copper hover:bg-card active:scale-[0.99]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-water-soft text-water transition group-hover:bg-copper group-hover:text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{a.titel}</span>
                    <span className="block text-sm text-ink-soft">{a.kurz}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {aktuell && schritt >= 1 && schritt < kontaktSchritt && (
        <FrageAnzeige
          key={fragen[schritt - 1].id}
          text={fragen[schritt - 1].text}
          optionen={fragen[schritt - 1].optionen}
          gewaehlt={antworten[fragen[schritt - 1].id]}
          onWahl={(w) => antworten_(fragen[schritt - 1].id, w)}
        />
      )}

      {aktuell && schritt === kontaktSchritt && (
        <form onSubmit={absenden} className="space-y-5">
          <div>
            <h3 className="text-2xl font-bold [font-stretch:112%]">Fast geschafft</h3>
            <p className="mt-1 text-ink-soft">Wohin sollen wir kommen, und wie erreichen wir Sie?</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Postleitzahl</span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                value={plz}
                onChange={(e) => setPlz(e.target.value.replace(/\D/g, ""))}
                placeholder="z. B. 63739"
                className="mt-1 w-full rounded-lg border border-line bg-paper/60 px-3 py-3 text-base outline-none focus:border-water focus:ring-2 focus:ring-water/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Vorname (optional)</span>
              <input
                value={vorname}
                onChange={(e) => setVorname(e.target.value)}
                placeholder="z. B. Petra"
                className="mt-1 w-full rounded-lg border border-line bg-paper/60 px-3 py-3 text-base outline-none focus:border-water focus:ring-2 focus:ring-water/20"
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Wie sollen wir uns melden?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {KONTAKTWEGE.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKontaktweg(k)}
                  aria-pressed={kontaktweg === k}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    kontaktweg === k
                      ? "border-water bg-water text-white"
                      : "border-line bg-paper/60 hover:border-water"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-semibold">Möchten Sie noch etwas ergänzen? (optional)</span>
            <textarea
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="z. B. Heizung verliert seit einer Woche Druck"
              className="mt-1 w-full rounded-lg border border-line bg-paper/60 px-3 py-3 text-base outline-none focus:border-water focus:ring-2 focus:ring-water/20"
            />
          </label>

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />

          <p className="rounded-lg bg-water-soft px-4 py-3 text-sm text-ink-soft">
            <strong className="text-ink">Demo:</strong> Bitte keine echten Daten eingeben. In der
            fertigen Version stünde hier ein Feld für Telefon oder E-Mail.
          </p>

          <div className="flex items-center justify-between gap-3 pt-1">
            <ZurueckKnopf onClick={() => setSchritt((s) => s - 1)} />
            <button
              type="submit"
              disabled={laedt}
              className="inline-flex items-center gap-2 rounded-lg bg-copper px-5 py-3 font-semibold text-white transition hover:bg-copper-dark active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
            >
              {laedt ? (
                <>
                  Wird ausgewertet <LoaderCircle className="size-4 animate-spin" aria-hidden />
                </>
              ) : (
                <>
                  Anfrage senden <Send className="size-4" aria-hidden />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {aktuell && schritt >= 1 && schritt < kontaktSchritt && (
        <div className="mt-6">
          <ZurueckKnopf onClick={() => setSchritt((s) => s - 1)} />
        </div>
      )}
    </div>
  );
}

function FrageAnzeige(props: {
  text: string;
  optionen: string[];
  gewaehlt?: string;
  onWahl: (wert: string) => void;
}) {
  return (
    <div>
      <h3 className="text-2xl font-bold [font-stretch:112%]">{props.text}</h3>
      <div className="mt-5 grid gap-2">
        {props.optionen.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => props.onWahl(o)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left font-medium transition active:scale-[0.99] ${
              props.gewaehlt === o
                ? "border-copper bg-copper/5"
                : "border-line bg-paper/60 hover:border-copper hover:bg-card"
            }`}
          >
            {o}
            {props.gewaehlt === o ? (
              <Check className="size-5 text-copper" aria-hidden />
            ) : (
              <ArrowRight className="size-4 text-ink-soft/50" aria-hidden />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ZurueckKnopf({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
    >
      <ArrowLeft className="size-4" aria-hidden /> Zurück
    </button>
  );
}

function Ergebnis({
  eingaben,
  auswertung,
  quelle,
  onNeu,
}: {
  eingaben: Eingaben;
  auswertung: Auswertung;
  quelle: Quelle;
  onNeu: () => void;
}) {
  const anliegen = ANLIEGEN.find((a) => a.id === eingaben.anliegen)!;
  const uhrzeit = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start">
      {/* Was der Kunde sieht */}
      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-ok/10 text-ok">
          <Check className="size-6" aria-hidden />
        </span>
        <h3 className="mt-4 text-2xl font-bold [font-stretch:112%]">
          Danke{eingaben.vorname ? `, ${eingaben.vorname}` : ""}! Ihre Anfrage ist da.
        </h3>
        <p className="mt-2 text-ink-soft">
          Wir melden uns per {eingaben.kontaktweg} –{" "}
          {auswertung.stufe === "dringend" ? "heute noch." : "spätestens am nächsten Werktag."}
        </p>

        <div className="mt-6 border-t border-line pt-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-copper">
            So funktioniert die Demo
          </p>
          <p className="mt-2 text-ink-soft">
            Rechts sehen Sie, wie die Anfrage beim Betrieb ankommt: sortiert, zusammengefasst und
            mit Dringlichkeit. Der Betrieb muss nicht mehr nachfragen, was eigentlich los ist.
          </p>
          {quelle === "ki" ? (
            <p className="mt-3 text-ink-soft">
              Diese Auswertung kam gerade live von einem n8n-Workflow: Er hat Ihre Angaben an eine
              KI (Google Gemini) gegeben und das Ergebnis zurückgeschickt. Beim echten Betrieb
              ginge die Nachricht zusätzlich per Telegram oder E-Mail raus.
            </p>
          ) : (
            <p className="mt-3 text-ink-soft">
              Die KI-Auswertung war gerade nicht erreichbar, deshalb hat die Seite die Nachricht
              selbst erstellt. Normalerweise übernimmt das ein n8n-Workflow mit KI.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onNeu}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 font-medium transition hover:border-ink"
        >
          <RotateCcw className="size-4" aria-hidden /> Andere Anfrage testen
        </button>
      </div>

      {/* Was der Betrieb bekommt */}
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Beim Betrieb auf dem Handy
        </p>
        <div className="rounded-[2rem] bg-ink p-3 shadow-xl">
          <div className="overflow-hidden rounded-[1.5rem] bg-[#dfe7ec]">
            <div className="flex items-center gap-3 bg-water px-4 py-3 text-white">
              <span className="grid size-9 place-items-center rounded-full bg-white/20 text-sm font-bold">
                KA
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight">Kessler Anfragen</span>
                <span className="block text-xs text-white/75">
                  {quelle === "ki" ? "Bot · ausgewertet mit KI" : "Bot"}
                </span>
              </span>
            </div>
            <div className="p-3">
              <div className="rounded-xl rounded-tl-sm bg-white p-3.5 text-[0.9rem] leading-snug shadow-sm">
                <p className="font-bold">Neue Anfrage: {anliegen.titel}</p>
                <span
                  className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-semibold ${STUFE_FARBE[auswertung.stufe]}`}
                >
                  {auswertung.stufeText}
                </span>
                <ul className="mt-2.5 space-y-1">
                  {auswertung.zusammenfassung.map((z) => (
                    <li key={z}>• {z}</li>
                  ))}
                  {/* Die KI nennt die PLZ oft schon selbst, dann nicht doppelt anzeigen */}
                  {!auswertung.zusammenfassung.some((z) => z.includes(eingaben.plz)) && (
                    <li>• PLZ: {eingaben.plz}</li>
                  )}
                  <li>
                    • Kontakt: {eingaben.kontaktweg}
                    {eingaben.vorname ? ` (${eingaben.vorname})` : ""}
                  </li>
                </ul>
                {eingaben.notiz && (
                  <p className="mt-2.5 border-l-2 border-line pl-2 italic text-ink-soft">
                    „{eingaben.notiz}“
                  </p>
                )}
                <p className="mt-2.5">
                  <span className="font-semibold">Nächster Schritt:</span>{" "}
                  {auswertung.naechsterSchritt}
                </p>
                <p className="mt-1.5 text-right text-xs text-ink-soft">{uhrzeit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
