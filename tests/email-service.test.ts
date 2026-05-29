import { describe, expect, it, vi } from "vitest";
import { createEmailService } from "../src/services/email-service.js";

describe("email service", () => {
  it("stays disabled when no provider credentials are configured", () => {
    const service = createEmailService({
      fromEmail: ""
    });

    expect(service.isConfigured()).toBe(false);
    expect(service.getProvider()).toBe("disabled");
  });

  it("uses Brevo API when a free transactional key is configured", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ messageId: "<mock@brevo>" }), {
        status: 201,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const service = createEmailService({
      brevoApiKey: "brevo-api-key",
      fromEmail: "noreply@vaptdoc.app",
      fromName: "vaptdoc",
      fetchImpl: fetchMock as typeof fetch
    });

    expect(service.isConfigured()).toBe(true);
    expect(service.getProvider()).toBe("brevo-api");

    await service.sendVerificationCode({
      to: "cliente@example.com",
      displayName: "Cliente",
      code: "123456",
      purpose: "register",
      expiresInMinutes: 10
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      "api-key": "brevo-api-key",
      "content-type": "application/json"
    });

    const parsedBody = JSON.parse(String(init.body));
    expect(parsedBody.sender.email).toBe("noreply@vaptdoc.app");
    expect(parsedBody.to[0]).toEqual({
      email: "cliente@example.com",
      name: "Cliente"
    });
    expect(parsedBody.subject).toMatch(/Confirme sua conta/i);
    expect(parsedBody.textContent).toContain("123456");
    expect(parsedBody.htmlContent).toContain("123456");
  });
});
