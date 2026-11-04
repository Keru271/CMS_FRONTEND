export interface ExtractedImagePalette {
  background: string;
  cardBg: string;
  textColor: string;
  textMuted: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  isDark: boolean;
  suggestedHeadingFont: string;
  suggestedBodyFont: string;
  suggestedBorderRadius: string;
}

/**
 * Analyzes an image data URL via HTML Canvas to extract the dominant background,
 * accent color, and perceived luminance.
 */
export async function analyzeImagePalette(dataUrl: string): Promise<ExtractedImagePalette | null> {
  if (typeof window === 'undefined' || !dataUrl) return null;

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          // Downscale for fast sampling
          const sampleW = 64;
          const sampleH = 64;
          canvas.width = sampleW;
          canvas.height = sampleH;
          ctx.drawImage(img, 0, 0, sampleW, sampleH);

          const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
          const data = imageData.data;

          // 1. Sample corners & edges to determine background color
          const edgePixels: Array<[number, number, number]> = [];
          for (let x = 0; x < sampleW; x += 4) {
            // Top edge
            let idx = (0 * sampleW + x) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
            // Bottom edge
            idx = ((sampleH - 1) * sampleW + x) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }
          for (let y = 0; y < sampleH; y += 4) {
            // Left edge
            let idx = (y * sampleW + 0) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
            // Right edge
            idx = (y * sampleW + (sampleW - 1)) * 4;
            edgePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
          }

          // Average edge color
          let avgR = 0, avgG = 0, avgB = 0;
          for (const [r, g, b] of edgePixels) {
            avgR += r;
            avgG += g;
            avgB += b;
          }
          avgR = Math.round(avgR / edgePixels.length);
          avgG = Math.round(avgG / edgePixels.length);
          avgB = Math.round(avgB / edgePixels.length);

          const luminance = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
          const isDark = luminance < 140;

          // 2. Scan for highest saturation / chroma pixel for vibrant accent
          let maxSat = -1;
          let bestAccentR = isDark ? 212 : 37;
          let bestAccentG = isDark ? 175 : 99;
          let bestAccentB = isDark ? 55 : 235;

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 128) continue;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            const sat = max === 0 ? 0 : delta / max;

            // Prioritize saturated, non-extreme (not pure black or pure white)
            if (sat > 0.35 && max > 50 && min < 220) {
              if (sat > maxSat) {
                maxSat = sat;
                bestAccentR = r;
                bestAccentG = g;
                bestAccentB = b;
              }
            }
          }

          const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
          const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

          const bgHex = rgbToHex(avgR, avgG, avgB);
          const accentHex = rgbToHex(bestAccentR, bestAccentG, bestAccentB);

          let theme: ExtractedImagePalette;
          if (isDark) {
            theme = {
              background: bgHex === '#000000' ? '#090A0F' : bgHex,
              cardBg: '#12141F',
              textColor: '#F8FAFC',
              textMuted: '#94A3B8',
              primary: '#090A0F',
              secondary: '#1A1D2D',
              accent: accentHex,
              border: '#1E2438',
              isDark: true,
              suggestedHeadingFont: 'Plus Jakarta Sans',
              suggestedBodyFont: 'Inter',
              suggestedBorderRadius: '12px',
            };
          } else {
            theme = {
              background: avgR > 245 && avgG > 245 && avgB > 245 ? '#FFFFFF' : bgHex,
              cardBg: '#FFFFFF',
              textColor: '#0F172A',
              textMuted: '#64748B',
              primary: '#0F172A',
              secondary: '#F1F5F9',
              accent: accentHex,
              border: '#E2E8F0',
              isDark: false,
              suggestedHeadingFont: 'Outfit',
              suggestedBodyFont: 'Inter',
              suggestedBorderRadius: '10px',
            };
          }

          resolve(theme);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    } catch {
      resolve(null);
    }
  });
}
