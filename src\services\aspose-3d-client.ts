import { randomUUID } from "node:crypto";
import path from "node:path";
import { env } from "../env.js";
import { AppError } from "../utils/errors.js";

export type Aspose3dOutputFormat =
  | "amf"
  | "dae"
  | "fbx"
  | "glb"
  | "gltf"
  | "obj"
  | "pdf"
  | "ply"
  | "rvm"
  | "stl"
  | "u3d"
  | "3ds"
  | "drc";

interface AsposeTokenResponse {
  access_token?: string;
  expires_in?: number;
}

interface AsposeStorageUploadResponse {
  uploaded?: string[];
  errors?: string[];
}

const apiBaseUrl = "https://api.aspose.cloud";
const tokenEndpointCandidates = ["/connect/token", "/oauth2/token"] as const;

function encodeRemotePath(remotePath: string) {
  return remotePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function providerFormatForOutput(format: Aspose3dOutputFormat) {
  const map: Record<Aspose3dOutputFormat, string> = {
    amf: "amf",
    dae: "collada",
    fbx: "fbx7500binary",
    glb: "gltf2_binary",
    gltf: "gltf2",
    obj: "wavefrontobj",
    pdf: "pdf",
    ply: "ply",
    rvm: "rvmbinary",
    stl: "stlbinary",
    u3d: "universal3d",
    "3ds": "discreet3ds",
    drc: "draco"
  };

  return map[format];
}

async function readOptionalJson<T>(response: Response): Promise<T | null> {
  const raw = await response.text();
  if (!raw.trim()) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export interface Aspose3dClient {
  convertFile(buffer: Buffer, fileName: string, outputFormat: Aspose3dOutputFormat, outputFileName: string): Promise<Buffer>;
}

export class Aspose3dSdkClient implements Aspose3dClient {
  private accessToken = "";
  private accessTokenExpiresAt = 0;
  private readonly fetchImpl: typeof fetch;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(clientId: string, clientSecret: string, fetchImpl: typeof fetch = fetch) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.fetchImpl = fetchImpl;
  }

  async convertFile(buffer: Buffer, fileName: string, outputFormat: Aspose3dOutputFormat, outputFileName: string) {
    const requestId = randomUUID();
    const remoteDirectory = `vaptdoc/3d/${requestId}`;
    const remoteInputPath = `${remoteDirectory}/${fileName}`;
    const remoteOutputPath = `${remoteDirectory}/${outputFileName}`;

    await this.uploadFile(remoteInputPath, buffer);

    try {
      return await this.convertStoredFile(remoteInputPath, remoteOutputPath, outputFormat);
    } finally {
      await Promise.allSettled([this.deleteFile(remoteInputPath), this.deleteFile(remoteOutputPath)]);
    }
  }

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret
    });

    let lastError: unknown;

    for (const endpoint of tokenEndpointCandidates) {
      try {
        const response = await this.fetchImpl(`${apiBaseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body
        });

        if (!response.ok) {
          lastError = new AppError("Nao foi possivel autenticar com a Aspose 3D Cloud.", 502, "ASPOSE3D_AUTH_FAILED");
          continue;
        }

        const payload = await readOptionalJson<AsposeTokenResponse>(response);
        if (!payload?.access_token || !payload.expires_in) {
          lastError = new AppError("A Aspose 3D Cloud nao retornou um token valido.", 502, "ASPOSE3D_AUTH_FAILED");
          continue;
        }

        this.accessToken = payload.access_token;
        this.accessTokenExpiresAt = Date.now() + payload.expires_in * 1000;
        return this.accessToken;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof AppError) {
      throw lastError;
    }

    throw new AppError("Nao foi possivel autenticar com a Aspose 3D Cloud.", 502, "ASPOSE3D_AUTH_FAILED");
  }

  private async uploadFile(remotePath: string, buffer: Buffer) {
    const token = await this.getAccessToken();
    const form = new FormData();
    form.set("file", new Blob([new Uint8Array(buffer)], { type: "application/octet-stream" }), path.basename(remotePath));

    const response = await this.fetchImpl(`${apiBaseUrl}/v3.0/3d/storage/file/${encodeRemotePath(remotePath)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    if (!response.ok) {
      throw new AppError("Falha ao enviar o arquivo para a Aspose 3D Cloud.", 502, "ASPOSE3D_UPLOAD_FAILED");
    }

    const payload = await readOptionalJson<AsposeStorageUploadResponse>(response);
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      throw new AppError("A Aspose 3D Cloud recusou o arquivo enviado.", 502, "ASPOSE3D_UPLOAD_FAILED");
    }
  }

  private async convertStoredFile(remoteInputPath: string, remoteOutputPath: string, outputFormat: Aspose3dOutputFormat) {
    const token = await this.getAccessToken();
    const outputProviderFormat = providerFormatForOutput(outputFormat);
    const url = new URL(`${apiBaseUrl}/v3.0/3d/saveas/newformat`);
    url.searchParams.set("name", remoteInputPath);
    url.searchParams.set("newformat", outputProviderFormat);
    url.searchParams.set("newfilename", remoteOutputPath);
    url.searchParams.set("IsOverwrite", "true");

    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        Accept: "application/octet-stream",
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new AppError(
        detail
          ? `A Aspose 3D Cloud nao conseguiu converter este modelo. ${detail.slice(0, 220)}`
          : "A Aspose 3D Cloud nao conseguiu converter este modelo.",
        502,
        "ASPOSE3D_CONVERSION_FAILED"
      );
    }

    return this.downloadFile(remoteOutputPath, token);
  }

  private async deleteFile(remotePath: string) {
    const token = await this.getAccessToken();
    await this.fetchImpl(`${apiBaseUrl}/v3.0/3d/storage/file/${encodeRemotePath(remotePath)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private async downloadFile(remotePath: string, token: string) {
    const response = await this.fetchImpl(`${apiBaseUrl}/v3.0/3d/storage/file/${encodeRemotePath(remotePath)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new AppError("Falha ao baixar o arquivo convertido da Aspose 3D Cloud.", 502, "ASPOSE3D_DOWNLOAD_FAILED");
    }

    return Buffer.from(await response.arrayBuffer());
  }
}

export function pickAspose3dClient(explicitClient?: Aspose3dClient | null, fetchImpl: typeof fetch = fetch) {
  if (explicitClient !== undefined) {
    return explicitClient;
  }

  if (!env.ASPOSE3D_CLIENT_ID || !env.ASPOSE3D_CLIENT_SECRET) {
    return null;
  }

  return new Aspose3dSdkClient(env.ASPOSE3D_CLIENT_ID, env.ASPOSE3D_CLIENT_SECRET, fetchImpl);
}
