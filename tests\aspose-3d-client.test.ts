import { describe, expect, it, vi } from "vitest";
import { Aspose3dSdkClient } from "../src/services/aspose-3d-client.js";

describe("Aspose 3D client", () => {
  it("accepts empty upload responses and still completes conversion", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "token-123",
            expires_in: 3600
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response(Buffer.from("solid cube\nendsolid cube\n"), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new Aspose3dSdkClient("client-id", "client-secret", fetchImpl);
    const input = Buffer.from("# cube\nv 0 0 0\n", "utf8");

    const result = await client.convertFile(input, "modelo.obj", "stl", "modelo.stl");

    expect(result.toString("utf8")).toContain("solid cube");
    expect(fetchImpl).toHaveBeenCalledTimes(6);
    expect(String(fetchImpl.mock.calls[1]?.[0])).toContain("/v3.0/3d/storage/file/");
    expect(fetchImpl.mock.calls[1]?.[1]).toMatchObject({ method: "PUT" });
    expect(String(fetchImpl.mock.calls[2]?.[0])).toContain("/v3.0/3d/saveas/newformat");
    expect(fetchImpl.mock.calls[2]?.[1]).toMatchObject({ method: "POST" });
    expect(String(fetchImpl.mock.calls[3]?.[0])).toContain("/v3.0/3d/storage/file/");
    expect(fetchImpl.mock.calls[3]?.[1]).toMatchObject({ method: "GET" });
  });

  it("fails gracefully when the auth endpoint returns an empty body", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }));
    const client = new Aspose3dSdkClient("client-id", "client-secret", fetchImpl);

    await expect(client.convertFile(Buffer.from("obj"), "modelo.obj", "stl", "modelo.stl")).rejects.toMatchObject({
      code: "ASPOSE3D_AUTH_FAILED"
    });
  });

  it("falls back from oauth-style empty token response to connect token response", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "token-123",
            expires_in: 3600
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      )
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response(Buffer.from("solid cube\nendsolid cube\n"), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new Aspose3dSdkClient("client-id", "client-secret", fetchImpl);
    const result = await client.convertFile(Buffer.from("obj"), "modelo.obj", "stl", "modelo.stl");

    expect(result.toString("utf8")).toContain("solid cube");
    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain("/connect/token");
  });
});
