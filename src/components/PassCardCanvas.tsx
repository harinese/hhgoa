import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export type CardFormat = 'FORMAT_B_PASS' | 'FORMAT_A_PFP';
export type CardTheme = 'GOA_SUNSET' | 'MIDNIGHT_CYBER' | 'RETRO_PARADISE';

interface PassCardCanvasProps {
  photoUrl: string | null;
  name: string;
  role: string;
  handle: string;
  persona: any;
  format: CardFormat;
  theme: CardTheme;
  zoom: number;
  panX: number;
  panY: number;
  onCanvasRendered?: (canvas: HTMLCanvasElement) => void;
}

export const PassCardCanvas: React.FC<PassCardCanvasProps> = ({
  photoUrl,
  name,
  role,
  handle,
  persona,
  format,
  theme,
  zoom,
  panX,
  panY,
  onCanvasRendered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;

    const renderCanvas = async () => {
      // 1. Wait for Google fonts
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check failed', e);
      }

      // 2. Preload user photo
      let userImg: HTMLImageElement | null = null;
      if (photoUrl) {
        try {
          userImg = await loadImage(photoUrl);
        } catch (e) {
          console.error('Failed to preload user photo', e);
        }
      }

      // Themes Colors
      let bgOuter = '#0a1f14';
      let bgCard = '#f7f4ea';
      let headerBg = '#022c22';
      let accentYellow = '#facc15';
      let textDark = '#022c22';
      let textAccent = '#ec4899';

      if (theme === 'MIDNIGHT_CYBER') {
        bgOuter = '#020617';
        bgCard = '#0f172a';
        headerBg = '#1e293b';
        accentYellow = '#38bdf8';
        textDark = '#f8fafc';
        textAccent = '#f43f5e';
      } else if (theme === 'RETRO_PARADISE') {
        bgOuter = '#451a03';
        bgCard = '#fffbeb';
        headerBg = '#78350f';
        accentYellow = '#fbbf24';
        textDark = '#78350f';
        textAccent = '#ea580c';
      }

      // 3. Preload the QR code linking directly to their GitHub Profile
      let qrImg: HTMLImageElement | null = null;
      try {
        const targetUrl = 'https://github.com/harinese';
        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
          margin: 1,
          color: { dark: headerBg, light: '#ffffff' }
        });
        qrImg = await loadImage(qrDataUrl);
      } catch (e) {
        console.error('Failed to pre-generate QR code', e);
      }

      if (!isMounted) return;

      // Set Dimensions
      if (format === 'FORMAT_B_PASS') {
        canvas.width = 800;
        canvas.height = 1100;
      } else {
        canvas.width = 1000;
        canvas.height = 1000;
      }

      const activeCtx = canvas.getContext('2d');
      if (!activeCtx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear
      activeCtx.clearRect(0, 0, width, height);

      if (format === 'FORMAT_B_PASS') {
        // --- FORMAT B: BUILDER PASS ---

        // 1. Outer Background Fill
        activeCtx.fillStyle = bgOuter;
        activeCtx.fillRect(0, 0, width, height);

        // Halftone dots overlay
        activeCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let gx = 0; gx < width; gx += 20) {
          for (let gy = 0; gy < height; gy += 20) {
            activeCtx.beginPath();
            activeCtx.arc(gx, gy, 1.5, 0, Math.PI * 2);
            activeCtx.fill();
          }
        }

        // 2. Card body container with thick outline
        const margin = 20;
        const cardW = width - margin * 2;
        const cardH = height - margin * 2;
        const radius = 24;

        activeCtx.fillStyle = bgCard;
        activeCtx.strokeStyle = headerBg;
        activeCtx.lineWidth = 8;
        drawRoundedRect(activeCtx, margin, margin, cardW, cardH, radius);
        activeCtx.fill();
        activeCtx.stroke();

        // 3. Top Stamp Tag
        const stampW = 180;
        const stampH = 70;
        const stampX = (width - stampW) / 2;
        activeCtx.fillStyle = '#be123c';
        drawRoundedRect(activeCtx, stampX, 0, stampW, stampH, 12);
        activeCtx.fill();

        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = 'bold 20px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('HH GOA', width / 2, 32);
        activeCtx.font = 'bold 16px "Space Grotesk", sans-serif';
        activeCtx.fillStyle = accentYellow;
        activeCtx.fillText('2026', width / 2, 54);

        // 4. Header: HACKER [गोवा] HOUSE
        activeCtx.fillStyle = textDark;
        activeCtx.font = '900 52px "DM Serif Display", Georgia, serif';
        activeCtx.textAlign = 'right';
        activeCtx.fillText('HACKER', width / 2 - 50, 140);

        activeCtx.textAlign = 'left';
        activeCtx.fillText('HOUSE', width / 2 + 60, 140);

        // Pink tilted Devanagari overlay "गोवा"
        activeCtx.save();
        activeCtx.translate(width / 2 + 5, 125);
        activeCtx.rotate(-0.12);
        activeCtx.fillStyle = '#ec4899';
        activeCtx.font = '800 46px "Plus Jakarta Sans", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('गोवा', 0, 0);
        activeCtx.restore();

        // Event Metadata label
        activeCtx.fillStyle = headerBg;
        activeCtx.font = 'bold 14px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('GOA, INDIA  •  28 - 31 OCT 2026', width / 2, 175);


        // --- ILLUSTRATIONS DRAWING (MATCHING IMAGE 4) ---

        // A. Top-Left Postage Stamp ("GOA INDIA")
        const stX = 55;
        const stY = 55;
        const stW = 100;
        const stH = 120;
        activeCtx.save();
        // White stamp background
        activeCtx.fillStyle = '#ffffff';
        activeCtx.strokeStyle = '#9ca3af';
        activeCtx.lineWidth = 1;
        activeCtx.fillRect(stX, stY, stW, stH);
        activeCtx.strokeRect(stX, stY, stW, stH);
        
        // Draw stamp teeth (perforations) along the edges
        activeCtx.fillStyle = bgCard;
        // Top and bottom edges
        for (let px = stX + 10; px < stX + stW; px += 14) {
          activeCtx.beginPath();
          activeCtx.arc(px, stY, 5, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.beginPath();
          activeCtx.arc(px, stY + stH, 5, 0, Math.PI * 2);
          activeCtx.fill();
        }
        // Left and right edges
        for (let py = stY + 12; py < stY + stH; py += 14) {
          activeCtx.beginPath();
          activeCtx.arc(stX, py, 5, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.beginPath();
          activeCtx.arc(stX + stW, py, 5, 0, Math.PI * 2);
          activeCtx.fill();
        }
        
        // Inner stamp illustration: Green Palm tree and sun
        activeCtx.fillStyle = '#fef08a'; // Yellow sun
        activeCtx.beginPath();
        activeCtx.arc(stX + stW / 2, stY + stH / 2 + 10, 20, 0, Math.PI * 2);
        activeCtx.fill();

        // Stamp palm trunk
        activeCtx.strokeStyle = '#065f46';
        activeCtx.lineWidth = 4;
        activeCtx.beginPath();
        activeCtx.moveTo(stX + stW / 2, stY + stH - 20);
        activeCtx.quadraticCurveTo(stX + stW / 2 - 10, stY + stH / 2 + 10, stX + stW / 2, stY + stH / 2 - 5);
        activeCtx.stroke();

        // Stamp palm leaves
        activeCtx.fillStyle = '#065f46';
        for (let leaf = 0; leaf < 5; leaf++) {
          activeCtx.beginPath();
          activeCtx.arc(stX + stW / 2, stY + stH / 2 - 10, 12, leaf * 1.2, leaf * 1.2 + 0.8);
          activeCtx.fill();
        }

        // Stamp text: GOA INDIA
        activeCtx.fillStyle = '#dc2626'; // Red text
        activeCtx.font = '900 12px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('GOA', stX + stW / 2, stY + 24);
        activeCtx.fillText('INDIA', stX + stW / 2, stY + 38);
        activeCtx.restore();


        // B. Top-Right Round Circular Badge Stamp
        const cX = width - 110;
        const cY = 115;
        const cR = 55;
        activeCtx.save();
        activeCtx.strokeStyle = headerBg;
        activeCtx.lineWidth = 2;
        // Inner circle
        activeCtx.beginPath();
        activeCtx.arc(cX, cY, cR, 0, Math.PI * 2);
        activeCtx.stroke();
        // Dashed outer ring
        activeCtx.setLineDash([5, 4]);
        activeCtx.beginPath();
        activeCtx.arc(cX, cY, cR + 6, 0, Math.PI * 2);
        activeCtx.stroke();

        // Stamp text inside
        activeCtx.fillStyle = headerBg;
        activeCtx.font = '900 11px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('BUILD IN GOA', cX, cY - 18);
        
        // Small Palm icon in center
        activeCtx.font = '16px sans-serif';
        activeCtx.fillText('🌴', cX, cY + 5);

        activeCtx.font = '900 10px "Space Grotesk", sans-serif';
        activeCtx.fillText('SHIP FROM', cX, cY + 22);
        activeCtx.fillText('PARADISE', cX, cY + 34);
        activeCtx.restore();


        // 5. Center Avatar Photo Frame
        const photoSize = 280;
        const photoX = width / 2;
        const photoY = 340;

        activeCtx.save();
        activeCtx.beginPath();
        activeCtx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
        activeCtx.closePath();
        activeCtx.clip(); // Guaranteed synchronous clip

        // Fallback default avatar background
        activeCtx.fillStyle = '#e2e8f0';
        activeCtx.fillRect(photoX - photoSize / 2, photoY - photoSize / 2, photoSize, photoSize);

        // Render the preloaded user image
        if (userImg) {
          const imgAspect = userImg.width / userImg.height;
          let drawW, drawH;
          if (imgAspect >= 1) {
            drawH = photoSize * zoom;
            drawW = drawH * imgAspect;
          } else {
            drawW = photoSize * zoom;
            drawH = drawW / imgAspect;
          }
          
          // Scale pan positions by cropper ratio (280 canvas size / 150 crop editor size)
          const scaleFactor = 280 / 150;
          const imgX = photoX - drawW / 2 + panX * scaleFactor;
          const imgY = photoY - drawH / 2 + panY * scaleFactor;

          activeCtx.drawImage(userImg, imgX, imgY, drawW, drawH);
        }
        activeCtx.restore();

        // Circle outline ring
        activeCtx.strokeStyle = accentYellow;
        activeCtx.lineWidth = 8;
        activeCtx.beginPath();
        activeCtx.arc(photoX, photoY, photoSize / 2 + 2, 0, Math.PI * 2);
        activeCtx.stroke();


        // C. Left Side Signpost Illustration ("BUILD", "SHIP", "REPEAT")
        const spX = 140;
        const spY = 270;
        activeCtx.save();
        // Wood post
        activeCtx.fillStyle = '#78350f'; // Brown
        activeCtx.fillRect(spX - 6, spY, 12, 210);

        // Sign 1: BUILD (pointing left, yellow)
        activeCtx.fillStyle = '#facc15';
        activeCtx.strokeStyle = '#000000';
        activeCtx.lineWidth = 2.5;
        // Draw left arrow shape
        activeCtx.beginPath();
        activeCtx.moveTo(spX - 70, spY + 30);
        activeCtx.lineTo(spX - 50, spY + 15);
        activeCtx.lineTo(spX + 20, spY + 15);
        activeCtx.lineTo(spX + 20, spY + 45);
        activeCtx.lineTo(spX - 50, spY + 45);
        activeCtx.closePath();
        activeCtx.fill();
        activeCtx.stroke();
        activeCtx.fillStyle = '#000000';
        activeCtx.font = '900 13px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('BUILD', spX - 20, spY + 35);

        // Sign 2: SHIP (pointing right, pink)
        activeCtx.fillStyle = '#ec4899';
        activeCtx.beginPath();
        activeCtx.moveTo(spX - 20, spY + 80);
        activeCtx.lineTo(spX + 50, spY + 80);
        activeCtx.lineTo(spX + 70, spY + 95);
        activeCtx.lineTo(spX + 50, spY + 110);
        activeCtx.lineTo(spX - 20, spY + 110);
        activeCtx.closePath();
        activeCtx.fill();
        activeCtx.stroke();
        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = '900 13px "Space Grotesk", sans-serif';
        activeCtx.fillText('SHIP', spX + 20, spY + 100);

        // Sign 3: REPEAT (pointing left, green)
        activeCtx.fillStyle = '#10b981';
        activeCtx.beginPath();
        activeCtx.moveTo(spX - 75, spY + 145);
        activeCtx.lineTo(spX - 55, spY + 130);
        activeCtx.lineTo(spX + 15, spY + 130);
        activeCtx.lineTo(spX + 15, spY + 160);
        activeCtx.lineTo(spX - 55, spY + 160);
        activeCtx.closePath();
        activeCtx.fill();
        activeCtx.stroke();
        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = '900 12px "Space Grotesk", sans-serif';
        activeCtx.fillText('REPEAT', spX - 25, spY + 150);
        activeCtx.restore();


        // D. Right Side Goan House & Vespa Illustration
        const ghX = 640;
        const ghY = 320;
        activeCtx.save();
        
        // Goan House main block
        activeCtx.fillStyle = '#f472b6'; // Goan pink walls
        activeCtx.strokeStyle = '#000000';
        activeCtx.lineWidth = 2.5;
        activeCtx.fillRect(ghX, ghY + 50, 95, 85);
        activeCtx.strokeRect(ghX, ghY + 50, 95, 85);

        // Slanted Roof
        activeCtx.fillStyle = '#b91c1c'; // Red clay roof tiles
        activeCtx.beginPath();
        activeCtx.moveTo(ghX - 10, ghY + 50);
        activeCtx.lineTo(ghX + 48, ghY + 15);
        activeCtx.lineTo(ghX + 105, ghY + 50);
        activeCtx.closePath();
        activeCtx.fill();
        activeCtx.stroke();

        // Yellow Door
        activeCtx.fillStyle = '#facc15';
        activeCtx.fillRect(ghX + 35, ghY + 95, 25, 40);
        activeCtx.strokeRect(ghX + 35, ghY + 95, 25, 40);

        // White windows
        activeCtx.fillStyle = '#ffffff';
        activeCtx.fillRect(ghX + 12, ghY + 65, 18, 18);
        activeCtx.strokeRect(ghX + 12, ghY + 65, 18, 18);
        activeCtx.fillRect(ghX + 65, ghY + 65, 18, 18);
        activeCtx.strokeRect(ghX + 65, ghY + 65, 18, 18);

        // Small Red Vespa scooter parked beside it
        const scX = ghX + 60;
        const scY = ghY + 120;
        activeCtx.fillStyle = '#dc2626'; // Red Vespa chassis
        activeCtx.fillRect(scX, scY, 28, 15);
        activeCtx.strokeRect(scX, scY, 28, 15);
        // Vespa wheels
        activeCtx.fillStyle = '#000000';
        activeCtx.beginPath();
        activeCtx.arc(scX + 4, scY + 15, 6, 0, Math.PI * 2);
        activeCtx.arc(scX + 24, scY + 15, 6, 0, Math.PI * 2);
        activeCtx.fill();
        activeCtx.restore();


        // "LET'S BUILD!" Badge on photo corner
        activeCtx.fillStyle = '#facc15';
        activeCtx.strokeStyle = headerBg;
        activeCtx.lineWidth = 3;
        drawRoundedRect(activeCtx, photoX + 85, photoY - 115, 110, 36, 8);
        activeCtx.fill();
        activeCtx.stroke();
        activeCtx.fillStyle = headerBg;
        activeCtx.font = 'bold 13px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText("LET'S BUILD!", photoX + 140, photoY - 92);

        // 6. Name Banner Box
        const nameW = 500;
        const nameH = 65;
        const nameY = 510;

        activeCtx.fillStyle = headerBg;
        drawRoundedRect(activeCtx, (width - nameW) / 2, nameY, nameW, nameH, 12);
        activeCtx.fill();

        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = '900 32px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText(name.toUpperCase() || 'BUILDER NAME', width / 2, nameY + 44);

        // 7. Role / Stack Banner Box
        const roleW = 420;
        const roleH = 45;
        const roleY = 590;

        activeCtx.fillStyle = accentYellow;
        drawRoundedRect(activeCtx, (width - roleW) / 2, roleY, roleW, roleH, 10);
        activeCtx.fill();

        activeCtx.fillStyle = textDark;
        activeCtx.font = 'bold 20px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText(role.toUpperCase() || 'FULL-STACK / RUST / AI', width / 2, roleY + 29);

        // 8. Grid Details Columns
        const gridY = 675;

        // Col 1: Builder Class
        activeCtx.fillStyle = textDark;
        activeCtx.font = '800 13px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦ BUILDER CLASS ✦', 160, gridY);

        activeCtx.fillStyle = textAccent;
        activeCtx.font = '900 18px "Space Grotesk", sans-serif';
        activeCtx.fillText(persona.builderClass, 160, gridY + 32);

        // Col 2: Beach Bag
        activeCtx.fillStyle = textDark;
        activeCtx.font = '800 13px "Space Grotesk", sans-serif';
        activeCtx.fillText('✦ BEACH BAG ✦', width / 2, gridY);

        activeCtx.fillStyle = textDark;
        activeCtx.font = '700 14px "Space Grotesk", sans-serif';
        persona.beachBag.forEach((item: string, idx: number) => {
          activeCtx.fillText(`• ${item}`, width / 2, gridY + 28 + idx * 22);
        });

        // Col 3: Currently Shipping
        activeCtx.fillStyle = textDark;
        activeCtx.font = '800 13px "Space Grotesk", sans-serif';
        activeCtx.fillText('✦ CURRENTLY SHIPPING ✦', width - 160, gridY);

        activeCtx.fillStyle = textAccent;
        activeCtx.font = '900 16px "Space Grotesk", sans-serif';
        activeCtx.fillText(persona.shippingGoal, width - 160, gridY + 32);

        // 9. QR Code & Barcode
        const qrSize = 110;
        const qrX = 80;
        const qrY = 880;

        if (qrImg) {
          activeCtx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        }

        // Barcode lines simulation
        const barX = width - 280;
        const barY = 910;
        activeCtx.fillStyle = textDark;
        activeCtx.font = 'bold 12px monospace';
        activeCtx.fillText('BUILDER ID', barX + 90, barY - 12);
        activeCtx.fillText(`#HH-GOA-${Math.abs(hashCode(name || 'BUILDER')) % 9000 + 1000}`, barX + 90, barY + 54);

        activeCtx.fillStyle = textDark;
        for (let b = 0; b < 180; b += 8) {
          const w = Math.random() > 0.4 ? 4 : 2;
          activeCtx.fillRect(barX + b, barY, w, 35);
        }

        // 10. Footer stamp Tag
        const footW = 380;
        const footH = 45;
        activeCtx.fillStyle = '#be123c';
        drawRoundedRect(activeCtx, (width - footW) / 2, 1015, footW, footH, 10);
        activeCtx.fill();

        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = 'bold 20px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦ #FRAMEINGOA ✦', width / 2, 1044);

      } else {
        // --- FORMAT A: PFP FRAME OVERLAY ---
        activeCtx.fillStyle = '#0f172a';
        activeCtx.fillRect(0, 0, width, height);

        if (userImg) {
          const imgAspect = userImg.width / userImg.height;
          let drawW = width * zoom;
          let drawH = (width / imgAspect) * zoom;
          const imgX = width / 2 - drawW / 2 + panX;
          const imgY = height / 2 - drawH / 2 + panY;
          activeCtx.drawImage(userImg, imgX, imgY, drawW, drawH);
        }

        const frameBorder = 40;
        activeCtx.strokeStyle = bgOuter;
        activeCtx.lineWidth = frameBorder * 2;
        activeCtx.strokeRect(0, 0, width, height);

        activeCtx.strokeStyle = accentYellow;
        activeCtx.lineWidth = 6;
        activeCtx.strokeRect(frameBorder, frameBorder, width - frameBorder * 2, height - frameBorder * 2);

        const topBannerH = 110;
        activeCtx.fillStyle = 'rgba(6, 78, 59, 0.92)';
        activeCtx.fillRect(frameBorder, frameBorder, width - frameBorder * 2, topBannerH);

        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = '900 44px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('HACKER HOUSE GOA 2026', width / 2, frameBorder + 65);

        const botBannerH = 130;
        activeCtx.fillStyle = 'rgba(6, 78, 59, 0.95)';
        activeCtx.fillRect(frameBorder, height - frameBorder - botBannerH, width - frameBorder * 2, botBannerH);

        activeCtx.fillStyle = accentYellow;
        activeCtx.font = '900 40px "Space Grotesk", sans-serif';
        activeCtx.fillText(name.toUpperCase() || 'BUILDER PASS', width / 2, height - frameBorder - 70);

        activeCtx.fillStyle = '#ffffff';
        activeCtx.font = 'bold 24px "Space Grotesk", sans-serif';
        activeCtx.fillText('BUILD IN GOA • #FRAMEINGOA', width / 2, height - frameBorder - 28);
      }

      if (onCanvasRendered && canvas) {
        onCanvasRendered(canvas);
      }
    };

    renderCanvas();

    return () => {
      isMounted = false;
    };
  }, [photoUrl, name, role, handle, persona, format, theme, zoom, panX, panY]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="card-canvas-element" />
    </div>
  );
};

// Helpers
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
