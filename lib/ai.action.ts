import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

export async function fetchAsDataURL(url: string): Promise<string> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Expected FileReader result to be a string"));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("FileReader error"));
    };

    reader.readAsDataURL(blob);
  });
}

export const generate3DView = async ({ sourceImage }: Generate3DParams) => {
  const dataURL = sourceImage.startsWith("data:") ? sourceImage : await fetchAsDataURL(sourceImage);
  const base64Data = dataURL.split(",")[1];
  const mimeType = dataURL.split(";")[0].split(":")[1] || "application/octet-stream";

  if (!base64Data || !mimeType) throw new Error("Invalid data URL format");

  const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: { w: 1024, h: 1024 },
  });

  const rawImageURL = (response as HTMLImageElement).src ?? null;

  if (!rawImageURL)
    return {
      renderedImage: null,
      renderedPath: undefined,
    };

  const renderedImage = rawImageURL.startsWith("data:") ? rawImageURL : await fetchAsDataURL(rawImageURL);
  return {
    renderedImage,
    renderedPath: undefined,
  };
};
