import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { NextRequest, NextResponse } from "next/server";

const client = new SuiClient({
  url: getFullnodeUrl("testnet"),
  network: "testnet"
});

const walrusClient = new WalrusClient({
  network: "testnet",
  suiClient: client,
  uploadRelay: {
    host: "https://upload-relay.testnet.walrus.space",
    sendTip: {
      max: 1_000
    }
  },
  wasmUrl:
    "https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm"
});

function detectImageType(buffer: Buffer): string {
  if (buffer.length < 4) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    if (
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return "image/webp";
    }
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }

  return "image/jpeg";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const blobId = searchParams.get("blobId");

  if (!blobId) {
    return NextResponse.json({ error: "blobId is required" }, { status: 400 });
  }

  try {
    console.log("Fetching blob with Walrus SDK:", blobId);

    const blob = await walrusClient.getBlob({ blobId });
    const files = await blob.files();

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found in blob" },
        { status: 404 }
      );
    }

    const file = files[0];
    const bytes = await file.bytes();
    const tags = await file.getTags();

    // Usa o MIME type das tags se disponível, senão detecta
    let contentType = tags.mimeType || "image/jpeg";

    // Se não tiver MIME type nas tags, tenta detectar
    if (!tags.mimeType || tags.mimeType === "application/octet-stream") {
      const buffer = Buffer.from(bytes);
      contentType = detectImageType(buffer);
    }

    console.log("File decoded successfully:", {
      size: bytes.length,
      mimeType: contentType,
      tags
    });

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Content-Length": bytes.length.toString()
      }
    });
  } catch (error) {
    console.error("Error fetching Walrus blob:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch blob",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
