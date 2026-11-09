import type { TimelineEntry } from "@/components/document/types";

/** A made-up notice and hand-written result. No model call or account needed. */
export const SAMPLE_NOTICE = `FIVE-DAY NOTICE TO PAY RENT OR QUIT

TO: Jordan Rivera, and all occupants of 1420 Example Street, Apt 3B

YOU ARE HEREBY NOTIFIED that rent in the amount of $1,350.00 is past due for the month of November 2026. Pursuant to applicable statute, within FIVE (5) DAYS of service of this notice you must pay said amount in full or vacate and surrender possession of the premises. Failure to do so will result in the commencement of unlawful detainer proceedings against you, and Landlord will seek possession, unpaid rent, court costs, and attorney fees.

A hearing on any rental assistance application will be held at the Example County Housing Office on December 2, 2026.

Pay to: Example Property Management, 200 Sample Avenue. Served November 18, 2026.`;

export type SampleResult = {
  languageTag: string;
  label: string;
  summary: string;
  items: TimelineEntry[];
};

const HEARING = "2026-12-02T00:00:00.000Z";

export const SAMPLE_RESULTS: SampleResult[] = [
  {
    languageTag: "en",
    label: "English",
    summary:
      "Your landlord says you owe $1,350 in rent for November. You must pay it or move out within 5 days of getting this notice. This is urgent, but you can get free help and you do not have to move yet.",
    items: [
      {
        id: "demo-1",
        title: "Pay the $1,350 or call for free legal help now",
        description:
          "Pay Example Property Management at 200 Sample Avenue and get a receipt. If you can't pay, call legal aid today. Ask about your rights.\n\nDeadline: within FIVE (5) DAYS of service",
        dueDate: null,
        consequence: "Your landlord can start an eviction case (called \"unlawful detainer\") against you.",
        priority: "HIGH",
        isCompleted: false,
      },
      {
        id: "demo-2",
        title: "Go to your rental assistance hearing",
        description:
          "Go to the Example County Housing Office. Bring this notice and proof of your income.\n\nDeadline: December 2, 2026",
        dueDate: HEARING,
        consequence: "You could lose your chance to get help paying this rent.",
        priority: "HIGH",
        isCompleted: false,
      },
      {
        id: "demo-3",
        title: "Keep copies of everything",
        description: "Take photos of this notice, your receipts, and any messages with your landlord.",
        dueDate: null,
        consequence: "It may be harder to prove what you paid or what you were told.",
        priority: "MEDIUM",
        isCompleted: false,
      },
    ],
  },
  {
    languageTag: "es",
    label: "Español",
    summary:
      "Su arrendador dice que usted debe $1,350 de renta de noviembre. Debe pagar o mudarse dentro de 5 días después de recibir este aviso. Es urgente, pero puede recibir ayuda gratis y todavía no tiene que mudarse.",
    items: [
      {
        id: "demo-1",
        title: "Pague los $1,350 o llame hoy para recibir ayuda legal gratis",
        description:
          "Pague a Example Property Management en 200 Sample Avenue y pida un recibo. Si no puede pagar, llame hoy a una oficina de ayuda legal. Pregunte por sus derechos.\n\nDeadline: within FIVE (5) DAYS of service",
        dueDate: null,
        consequence: "Su arrendador puede iniciar un caso de desalojo en su contra.",
        priority: "HIGH",
        isCompleted: false,
      },
      {
        id: "demo-2",
        title: "Vaya a su audiencia de asistencia para la renta",
        description:
          "Vaya a la Oficina de Vivienda del Condado de Example. Lleve este aviso y prueba de sus ingresos.\n\nDeadline: December 2, 2026",
        dueDate: HEARING,
        consequence: "Podría perder la oportunidad de recibir ayuda para pagar esta renta.",
        priority: "HIGH",
        isCompleted: false,
      },
      {
        id: "demo-3",
        title: "Guarde copias de todo",
        description: "Tome fotos de este aviso, sus recibos y cualquier mensaje con su arrendador.",
        dueDate: null,
        consequence: "Puede ser más difícil demostrar lo que pagó o lo que le dijeron.",
        priority: "MEDIUM",
        isCompleted: false,
      },
    ],
  },
];
