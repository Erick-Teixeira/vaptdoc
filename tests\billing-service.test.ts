import crypto from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createBillingService } from "../src/services/billing-service.js";

describe("billing service", () => {
  it("creates a checkout and validates an approved payment", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: "pref-123",
        init_point: "https://pay.example/checkout"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      }));

    const service = createBillingService({
      accessToken: "APP_USR_TEST",
      publicAppUrl: "https://vaptdoc.test",
      stateSecret: "billing-secret"
    }, fetchMock);

    const checkout = await service.createCheckout({
      offerId: "pro-monthly"
    });

    expect(checkout.checkoutUrl).toBe("https://pay.example/checkout");
    expect(checkout.offer.id).toBe("pro-monthly");

    const cookie = service.buildStateCookie(checkout.stateToken);
    const restoredStateToken = service.getStateToken(cookie);
    expect(restoredStateToken).toBe(checkout.stateToken);

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      id: 9988,
      status: "approved",
      transaction_amount: 19.9,
      currency_id: "BRL",
      external_reference: checkout.stateToken,
      date_approved: "2026-05-23T12:30:00.000Z"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }));

    const confirmation = await service.confirmCheckout({
      stateToken: restoredStateToken ?? "",
      paymentId: "9988"
    });

    expect(confirmation.status).toBe("approved");
    expect(confirmation.offer.id).toBe("pro-monthly");
    expect(confirmation.amountBRL).toBe(19.9);
  });

  it("keeps the checkout pending when no approved payment is found yet", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: "pref-123",
        init_point: "https://pay.example/checkout"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        results: []
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }));

    const service = createBillingService({
      accessToken: "APP_USR_TEST",
      publicAppUrl: "https://vaptdoc.test",
      stateSecret: "billing-secret"
    }, fetchMock);

    const checkout = await service.createCheckout({
      offerId: "starter-pack"
    });

    const confirmation = await service.confirmCheckout({
      stateToken: checkout.stateToken
    });

    expect(confirmation.status).toBe("pending");
    expect(confirmation.offer.id).toBe("starter-pack");
  });

  it("preserves discounted checkout amounts through the state token validation", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: "pref-discount",
        init_point: "https://pay.example/discount"
      }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      }));

    const service = createBillingService({
      accessToken: "APP_USR_TEST",
      publicAppUrl: "https://vaptdoc.test",
      stateSecret: "billing-secret"
    }, fetchMock);

    const checkout = await service.createCheckout({
      offerId: "pro-monthly",
      overrideAmountBRL: 14.93
    });

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      id: 2211,
      status: "approved",
      transaction_amount: 14.93,
      currency_id: "BRL",
      external_reference: checkout.stateToken,
      date_approved: "2026-05-25T18:30:00.000Z"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }));

    const confirmation = await service.confirmCheckout({
      stateToken: checkout.stateToken,
      paymentId: "2211"
    });

    expect(confirmation.status).toBe("approved");
    expect(confirmation.amountBRL).toBe(14.93);
    expect(confirmation.offer.amountBRL).toBe(14.93);
  });

  it("validates Mercado Pago webhook signatures before trusting payment notifications", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify({
      id: 8877,
      status: "approved",
      transaction_amount: 19.9,
      currency_id: "BRL",
      external_reference: "vpd_m_nonce_stamp_hash",
      date_approved: "2026-05-23T12:30:00.000Z"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }));
    const webhookSecret = "webhook-secret";
    const requestId = "req-123";
    const timestamp = "1742505638683";
    const dataId = "8877";
    const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
    const signature = crypto.createHmac("sha256", webhookSecret).update(manifest).digest("hex");

    const service = createBillingService({
      accessToken: "APP_USR_TEST",
      publicAppUrl: "https://vaptdoc.test",
      webhookSecret
    }, fetchMock);

    const result = await service.verifyWebhook({
      headers: {
        "x-request-id": requestId,
        "x-signature": `ts=${timestamp},v1=${signature}`
      },
      query: {
        "data.id": dataId
      },
      body: {
        type: "payment",
        data: {
          id: dataId
        }
      }
    });

    expect(result.ok).toBe(true);
    expect(result.paymentId).toBe(dataId);
    expect(result.paymentStatus).toBe("approved");
  });
});
