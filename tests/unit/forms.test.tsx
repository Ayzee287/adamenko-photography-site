// @vitest-environment jsdom
//
// Form contracts (Roadmap P10): the shared schema + mock action (node-side
// truth) and the InquiryForm island (blur-only validation, persistence,
// pending, success focus, error recovery, honeypot, a11y wiring).

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  initialInquiryState,
  inquirySchema,
  type InquiryState,
} from "../../src/lib/forms/inquiry-schema";
import { submitInquiry } from "../../src/lib/forms/submit-inquiry";
import { TextInput } from "../../src/components/forms/text-input";
import { SelectInput } from "../../src/components/forms/select-input";
import { InquiryForm, type InquiryFormLabels } from "../../src/components/forms/inquiry-form";

afterEach(() => cleanup());

function fd(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(entries)) data.set(k, v);
  return data;
}

const valid = {
  name: "Camille",
  email: "camille@example.com",
  sessionType: "grossesse",
  message: "Bonjour !",
  company: "",
};

describe("submitInquiry — the mock action (real validation)", () => {
  it("valid input succeeds", async () => {
    const out = await submitInquiry(initialInquiryState, fd(valid));
    expect(out.status).toBe("success");
  });

  it("invalid input returns field keys AND echoes every value (input never lost)", async () => {
    const out = await submitInquiry(
      initialInquiryState,
      fd({ ...valid, email: "pas-un-email", message: "" }),
    );
    expect(out.status).toBe("error");
    expect(out.fieldErrors.sort()).toEqual(["email", "message"]);
    expect(out.values.name).toBe("Camille");
    expect(out.values.email).toBe("pas-un-email");
  });

  it("honeypot gets a silent success (bots learn nothing)", async () => {
    const out = await submitInquiry(
      initialInquiryState,
      fd({ ...valid, email: "junk", company: "spam" }),
    );
    expect(out.status).toBe("success");
  });

  it("delivery failure keeps values and flags the form scope", async () => {
    const out = await submitInquiry(
      initialInquiryState,
      fd({ ...valid, message: "test [declencher-erreur]" }),
    );
    expect(out.status).toBe("error");
    expect(out.formError).toBe(true);
    expect(out.fieldErrors).toEqual([]);
    expect(out.values.name).toBe("Camille");
  });

  it("schema: optional fields optional, honeypot must be empty", () => {
    expect(inquirySchema.safeParse(valid).success).toBe(true);
    expect(
      inquirySchema.safeParse({ ...valid, period: "septembre" }).success,
    ).toBe(true);
    expect(inquirySchema.safeParse({ ...valid, company: "x" }).success).toBe(false);
  });
});

describe("field components — a11y wiring", () => {
  it("label always visible; optional suffix; error linked via describedby", () => {
    render(
      <TextInput
        id="f-name"
        name="name"
        label="Votre nom"
        optionalSuffix="(facultatif)"
        error="Dites-moi votre nom."
      />,
    );
    const input = screen.getByLabelText(/Votre nom/);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("f-name-error");
    expect(document.getElementById("f-name-error")?.textContent).toBe(
      "Dites-moi votre nom.",
    );
  });

  it("select renders a disabled placeholder option", () => {
    render(
      <SelectInput
        id="f-type"
        name="sessionType"
        label="Type de séance"
        placeholder="Choisissez…"
        options={[{ value: "famille", label: "Famille" }]}
      />,
    );
    const placeholder = screen.getByText("Choisissez…") as HTMLOptionElement;
    expect(placeholder.disabled).toBe(true);
    expect((screen.getByLabelText("Type de séance") as HTMLSelectElement).value).toBe("");
  });
});

/* ── The island ── */

const labels: InquiryFormLabels = {
  name: "Votre nom",
  email: "Votre e-mail",
  sessionType: "Type de séance",
  sessionTypePlaceholder: "Choisissez…",
  period: "Période envisagée",
  place: "Lieu",
  message: "Votre message",
  source: "Comment m'avez-vous trouvée ?",
  sourcePlaceholder: "Choisissez…",
  optionalSuffix: "(facultatif)",
  honeypot: "Ne pas remplir",
  submit: "Envoyer",
  sending: "Envoi…",
  errors: {
    name: "Dites-moi votre nom.",
    email: "Cet e-mail semble incomplet.",
    sessionType: "Choisissez un type de séance.",
    message: "Dites-m'en un peu plus.",
  },
  formError: "L'envoi n'a pas fonctionné.",
  mailtoLabel: "M'écrire directement",
  success: { heading: "Merci.", body: "Je réponds sous 48 h." },
  statusSent: "Message envoyé.",
  statusError: "L'envoi a échoué.",
};

function renderForm(
  action: (p: InquiryState, f: FormData) => Promise<InquiryState>,
) {
  return render(
    <InquiryForm
      action={action}
      labels={labels}
      sessionTypes={[
        { value: "famille", label: "Famille" },
        { value: "grossesse", label: "Grossesse" },
      ]}
      prefilledSessionType="grossesse"
      origin="/prestations/grossesse"
      locale="fr"
      mailtoHref="mailto:x@y.z"
    />,
  );
}

describe("inquiry-form — interaction contract", () => {
  it("validates on blur ONLY, clears when fixed", () => {
    renderForm(submitInquiry);
    const email = screen.getByLabelText(/Votre e-mail/);
    fireEvent.change(email, { target: { value: "pas-un-email" } });
    expect(screen.queryByText("Cet e-mail semble incomplet.")).toBeNull(); // typing never errors
    fireEvent.blur(email);
    expect(screen.getByText("Cet e-mail semble incomplet.")).toBeDefined();
    fireEvent.change(email, { target: { value: "ok@example.com" } });
    fireEvent.blur(email);
    expect(screen.queryByText("Cet e-mail semble incomplet.")).toBeNull();
  });

  it("prefills the session type from the referrer; honeypot hidden from AT", () => {
    const { container } = renderForm(submitInquiry);
    expect(
      (screen.getByLabelText("Type de séance") as HTMLSelectElement).value,
    ).toBe("grossesse");
    const pot = container.querySelector('input[name="company"]')!;
    expect(pot.closest("[aria-hidden]")).not.toBeNull();
    expect(pot.getAttribute("tabindex")).toBe("-1");
    expect(container.querySelector('input[name="origin"]')?.getAttribute("value")).toBe(
      "/prestations/grossesse",
    );
  });

  it("failed submit shows server errors, keeps values, focuses first invalid", async () => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    renderForm(submitInquiry);
    fireEvent.change(screen.getByLabelText(/Votre nom/), {
      target: { value: "Camille" },
    });
    fireEvent.change(screen.getByLabelText(/Votre e-mail/), {
      target: { value: "cassé" },
    });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() =>
      expect(screen.getByText("Cet e-mail semble incomplet.")).toBeDefined(),
    );
    expect((screen.getByLabelText(/Votre nom/) as HTMLInputElement).value).toBe(
      "Camille", // never lost
    );
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("name")).toBe("email"),
    );
    vi.unstubAllGlobals();
  });

  it("success replaces the form and focuses the heading", async () => {
    renderForm(async () => ({
      ...initialInquiryState,
      status: "success" as const,
    }));
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(screen.getByText("Merci.")).toBeDefined());
    expect(document.querySelector("form")).toBeNull();
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe("Merci."),
    );
  });

  it("delivery failure renders the form-scope ErrorState with the mailto way out", async () => {
    renderForm(async (_p, f) => ({
      status: "error" as const,
      values: { name: String(f.get("name") ?? "") },
      fieldErrors: [],
      formError: true,
    }));
    fireEvent.change(screen.getByLabelText(/Votre nom/), {
      target: { value: "Camille" },
    });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() =>
      expect(screen.getByText("L'envoi n'a pas fonctionné.")).toBeDefined(),
    );
    expect(
      screen.getByText("M'écrire directement").closest("a")?.getAttribute("href"),
    ).toBe("mailto:x@y.z");
    expect(document.querySelector("form")).not.toBeNull(); // form never removed
  });

  it("pending: submit disabled + label swap (no duplicate submissions)", async () => {
    let release!: (s: InquiryState) => void;
    const gate = new Promise<InquiryState>((r) => (release = r));
    renderForm(() => gate);
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: "Envoi…" }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute("aria-busy")).toBe("true");
    });
    release({ ...initialInquiryState, status: "success" });
    await waitFor(() => expect(screen.getByText("Merci.")).toBeDefined());
  });
});
