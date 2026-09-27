// Fragen des Anfrage-Assistenten und die Auswertung, die der Betrieb bekommt.
// Session 2: Die Auswertung übernimmt n8n + KI. Bis dahin rechnet diese Datei sie im Browser aus.

export type AnliegenId = "heizung" | "bad" | "reparatur" | "wartung";

export type Frage = {
  id: string;
  text: string;
  optionen: string[];
};

export type Anliegen = {
  id: AnliegenId;
  titel: string;
  kurz: string;
  fragen: Frage[];
};

const zeitraum: Frage = {
  id: "zeitraum",
  text: "Wann soll es losgehen?",
  optionen: ["So schnell wie möglich", "In 3–6 Monaten", "Ich informiere mich erst"],
};

export const ANLIEGEN: Anliegen[] = [
  {
    id: "heizung",
    titel: "Heizung tauschen",
    kurz: "Wärmepumpe, Hybrid oder neue Gasheizung",
    fragen: [
      {
        id: "art",
        text: "Womit heizen Sie heute?",
        optionen: ["Gas", "Öl", "Strom / Nachtspeicher", "Weiß ich nicht"],
      },
      {
        id: "alter",
        text: "Wie alt ist die Heizung ungefähr?",
        optionen: ["Unter 15 Jahre", "15–30 Jahre", "Über 30 Jahre", "Weiß ich nicht"],
      },
      {
        id: "flaeche",
        text: "Wie groß ist die beheizte Wohnfläche?",
        optionen: ["Bis 120 m²", "120–200 m²", "Über 200 m²"],
      },
      zeitraum,
    ],
  },
  {
    id: "bad",
    titel: "Bad sanieren",
    kurz: "Komplett neu oder Dusche statt Wanne",
    fragen: [
      {
        id: "umfang",
        text: "Was soll gemacht werden?",
        optionen: ["Komplettsanierung", "Dusche statt Wanne", "Einzelne Teile erneuern"],
      },
      {
        id: "groesse",
        text: "Wie groß ist das Bad?",
        optionen: ["Unter 5 m²", "5–8 m²", "Über 8 m²"],
      },
      {
        id: "barrierearm",
        text: "Soll das Bad barrierearm werden?",
        optionen: ["Ja", "Nein", "Weiß ich noch nicht"],
      },
      zeitraum,
    ],
  },
  {
    id: "reparatur",
    titel: "Reparatur",
    kurz: "Heizung aus, Wasser läuft, Fehlercode",
    fragen: [
      {
        id: "problem",
        text: "Was ist passiert?",
        optionen: [
          "Heizung aus / kein Warmwasser",
          "Wasser tritt aus",
          "Geräusche oder Fehlercode",
          "Abfluss verstopft",
        ],
      },
      {
        id: "seit",
        text: "Seit wann besteht das Problem?",
        optionen: ["Seit heute", "Seit ein paar Tagen", "Schon länger"],
      },
      {
        id: "geraet",
        text: "Welches Gerät ist betroffen?",
        optionen: ["Gasheizung", "Ölheizung", "Wärmepumpe", "Weiß ich nicht"],
      },
    ],
  },
  {
    id: "wartung",
    titel: "Wartung",
    kurz: "Jährlicher Check für Heizung und Wärmepumpe",
    fragen: [
      {
        id: "geraet",
        text: "Welches Gerät soll gewartet werden?",
        optionen: ["Gasheizung", "Ölheizung", "Wärmepumpe", "Anderes"],
      },
      {
        id: "letzte",
        text: "Wann war die letzte Wartung?",
        optionen: ["Vor weniger als 1 Jahr", "Vor 1–2 Jahren", "Länger her / weiß nicht"],
      },
      {
        id: "wunsch",
        text: "Wann passt es Ihnen?",
        optionen: ["In den nächsten 4 Wochen", "Ich bin flexibel"],
      },
    ],
  },
];

export const KONTAKTWEGE = ["Rückruf", "E-Mail", "WhatsApp"] as const;

export type Eingaben = {
  anliegen: AnliegenId;
  antworten: Record<string, string>;
  vorname: string;
  plz: string;
  kontaktweg: (typeof KONTAKTWEGE)[number];
  notiz: string;
};

export type Stufe = "dringend" | "hoch" | "normal" | "planbar";

export type Auswertung = {
  stufe: Stufe;
  stufeText: string;
  zusammenfassung: string[];
  naechsterSchritt: string;
};

// n8n-Workflow "03 Demo - Kessler Anfrage-Assistent" (Vorlage in n8n/kessler-anfrage-workflow.json)
const WEBHOOK = "https://benjaminmossier.app.n8n.cloud/webhook/kessler-anfrage";

export type Quelle = "ki" | "lokal";

// Fragt n8n + KI. Klappt das nicht (Limit erreicht, Fehler, zu langsam), rechnet die Seite selbst.
export async function auswertenMitKi(
  e: Eingaben,
  website: string,
): Promise<{ auswertung: Auswertung; quelle: Quelle }> {
  const anliegen = ANLIEGEN.find((x) => x.id === e.anliegen)!;
  const antworten = Object.fromEntries(anliegen.fragen.map((f) => [f.text, e.antworten[f.id]]));
  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...e, antworten, website }),
      signal: AbortSignal.timeout(15000),
    });
    const d = await res.json();
    if (res.ok && d.ki && d.stufe in STUFEN_TEXT) {
      return {
        quelle: "ki",
        auswertung: {
          stufe: d.stufe,
          stufeText: d.stufeText || STUFEN_TEXT[d.stufe as Stufe],
          zusammenfassung: d.zusammenfassung,
          naechsterSchritt: d.naechsterSchritt,
        },
      };
    }
  } catch {
    // Netzwerkfehler oder Zeitüberschreitung: unten lokal auswerten
  }
  return { quelle: "lokal", auswertung: auswerten(e) };
}

const STUFEN_TEXT: Record<Stufe, string> = {
  dringend: "Dringend",
  hoch: "Hoch",
  normal: "Normal",
  planbar: "Planbar",
};

export function auswerten(e: Eingaben): Auswertung {
  const a = e.antworten;
  const anliegen = ANLIEGEN.find((x) => x.id === e.anliegen)!;
  const zusammenfassung = anliegen.fragen.map((f) => `${f.text.replace(/\?$/, "")}: ${a[f.id]}`);

  if (e.anliegen === "reparatur") {
    const kritisch = a.problem === "Heizung aus / kein Warmwasser" || a.problem === "Wasser tritt aus";
    if (kritisch && a.seit === "Seit heute") {
      return {
        stufe: "dringend",
        stufeText: "Dringend – heute zurückrufen",
        zusammenfassung,
        naechsterSchritt:
          a.problem === "Wasser tritt aus"
            ? "Sofort anrufen, Hauptwasserhahn schließen lassen, Notdienst einplanen."
            : "Heute anrufen, Notdienst oder ersten Termin morgen früh anbieten.",
      };
    }
    return {
      stufe: kritisch ? "hoch" : "normal",
      stufeText: kritisch ? "Hoch – in den nächsten 2 Tagen" : "Normal – Termin diese Woche",
      zusammenfassung,
      naechsterSchritt: "Termin vorschlagen, Fehlercode oder Foto vom Gerät erfragen.",
    };
  }

  if (e.anliegen === "wartung") {
    return {
      stufe: "planbar",
      stufeText: "Planbar – in die Tourenplanung",
      zusammenfassung,
      naechsterSchritt:
        a.letzte === "Länger her / weiß nicht"
          ? "Wartungstermin mit Tour im Gebiet bündeln, Wartungsvertrag anbieten."
          : "Wartungstermin mit Tour im Gebiet bündeln.",
    };
  }

  const bald = a.zeitraum === "So schnell wie möglich";
  const infophase = a.zeitraum === "Ich informiere mich erst";

  if (e.anliegen === "heizung") {
    const alt = a.alter === "Über 30 Jahre";
    return {
      stufe: bald || alt ? "hoch" : infophase ? "normal" : "hoch",
      stufeText: bald || alt ? "Hoch – Vor-Ort-Termin diese Woche" : infophase ? "Normal – erst beraten" : "Hoch – Vor-Ort-Termin in 2 Wochen",
      zusammenfassung,
      naechsterSchritt: infophase
        ? "Infomail zu Wärmepumpe und Förderung schicken, Beratungstermin anbieten."
        : "Vor-Ort-Termin anbieten: Heizlast prüfen, Förderung ansprechen.",
    };
  }

  // Bad
  return {
    stufe: bald ? "hoch" : "normal",
    stufeText: bald ? "Hoch – Aufmaß-Termin anbieten" : "Normal – Beratung anbieten",
    zusammenfassung,
    naechsterSchritt:
      a.barrierearm === "Ja"
        ? "Aufmaß-Termin anbieten, Zuschüsse für barrierearmen Umbau ansprechen."
        : "Aufmaß-Termin anbieten, Fotos vom jetzigen Bad erfragen.",
  };
}
