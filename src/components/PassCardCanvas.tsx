import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export type CardFormat = 'FORMAT_B_PASS' | 'FORMAT_A_PFP';
export type CardTheme = 'GOA_SUNSET' | 'MIDNIGHT_CYBER' | 'RETRO_PARADISE' | 'MINIMAL_CORPORATE';

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

      // Theme Colors config
      let bgOuter = '#031a0e'; 
      let bgCard = '#fdfbf7';  
      let headerBg = '#022c22'; 
      let accentYellow = '#facc15'; 
      let textDark = '#022c22';
      let textAccent = '#e11d48';

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
      } else if (theme === 'MINIMAL_CORPORATE') {
        bgOuter = '#2f342b'; // Dark olive backdrop
        bgCard = '#4d5447';  // Sage green matte card
        headerBg = '#ffffff'; 
        accentYellow = '#c5bfae'; // Warm beige wave accent
        textDark = '#ffffff';
        textAccent = '#c5bfae';
      }

      // 3. Preload the QR code
      let qrImg: HTMLImageElement | null = null;
      try {
        const targetUrl = 'https://github.com/harinese';
        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
          margin: 1,
          color: { dark: theme === 'MINIMAL_CORPORATE' ? '#4d5447' : headerBg, light: '#ffffff' }
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

      // Clear Canvas
      activeCtx.clearRect(0, 0, width, height);

      if (format === 'FORMAT_B_PASS') {
        // --- FORMAT B: BUILDER PASS ---

        if (theme === 'MINIMAL_CORPORATE') {
          // ==========================================
          // --- MINIMAL CORPORATE ID STYLE (IMAGE 12) ---
          // ==========================================
          
          // 1. Dark Olive Backdrop
          activeCtx.fillStyle = bgOuter;
          activeCtx.fillRect(0, 0, width, height);

          // Card dimensions
          const cW = 540;
          const cH = 820;
          const cX = (width - cW) / 2;
          const cY = 160;
          const cR = 24;

          // Metal Ring/Clip structure drawn behind/above card
          activeCtx.save();
          // Silver loop
          activeCtx.strokeStyle = '#9ca3af';
          activeCtx.lineWidth = 7;
          activeCtx.lineCap = 'round';
          activeCtx.beginPath();
          activeCtx.arc(width / 2, 70, 36, 0, Math.PI * 2);
          activeCtx.stroke();
          // Inner shiny stroke
          activeCtx.strokeStyle = '#ffffff';
          activeCtx.lineWidth = 2;
          activeCtx.stroke();

          // Swivel connector / clip hook
          activeCtx.fillStyle = '#d1d5db';
          activeCtx.fillRect(width / 2 - 8, 98, 16, 24);
          activeCtx.strokeRect(width / 2 - 8, 98, 16, 24);
          
          activeCtx.fillStyle = '#e5e7eb';
          activeCtx.beginPath();
          activeCtx.moveTo(width / 2 - 15, 122);
          activeCtx.lineTo(width / 2 + 15, 122);
          activeCtx.lineTo(width / 2 + 6, 175);
          activeCtx.lineTo(width / 2 - 6, 175);
          activeCtx.closePath();
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.restore();

          // Card shadow
          activeCtx.save();
          activeCtx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          activeCtx.shadowBlur = 24;
          activeCtx.shadowOffsetX = 0;
          activeCtx.shadowOffsetY = 12;
          activeCtx.fillStyle = bgCard;
          drawRoundedRect(activeCtx, cX, cY, cW, cH, cR);
          activeCtx.fill();
          activeCtx.restore();

          // Card slot hole
          activeCtx.save();
          activeCtx.fillStyle = bgOuter;
          activeCtx.strokeStyle = 'rgba(0,0,0,0.1)';
          activeCtx.lineWidth = 2;
          drawRoundedRect(activeCtx, width / 2 - 45, cY + 20, 90, 18, 9);
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.restore();

          // Clip to card body to cleanly draw waves
          activeCtx.save();
          drawRoundedRect(activeCtx, cX, cY, cW, cH, cR);
          activeCtx.clip();

          // Draw the warm beige wavy overlay at bottom
          activeCtx.fillStyle = '#c5bfae';
          activeCtx.beginPath();
          activeCtx.moveTo(cX - 10, cY + cH - 240);
          activeCtx.bezierCurveTo(cX + 120, cY + cH - 320, cX + cW - 120, cY + cH - 150, cX + cW + 10, cY + cH - 220);
          activeCtx.lineTo(cX + cW + 10, cY + cH + 10);
          activeCtx.lineTo(cX - 10, cY + cH + 10);
          activeCtx.closePath();
          activeCtx.fill();

          // Draw Photo Circle (no border, clean framing)
          const photoSize = 250;
          const photoX = width / 2;
          const photoY = cY + 270;

          activeCtx.save();
          activeCtx.beginPath();
          activeCtx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
          activeCtx.closePath();
          activeCtx.clip();

          // Default fallback background
          activeCtx.fillStyle = '#a3a3a3';
          activeCtx.fillRect(photoX - photoSize / 2, photoY - photoSize / 2, photoSize, photoSize);

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
            
            const scaleFactor = 250 / 150;
            const imgX = photoX - drawW / 2 + panX * scaleFactor;
            const imgY = photoY - drawH / 2 + panY * scaleFactor;

            activeCtx.drawImage(userImg, imgX, imgY, drawW, drawH);
          }
          activeCtx.restore();

          // Circular photo outline (very thin white ring)
          activeCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          activeCtx.lineWidth = 3;
          activeCtx.beginPath();
          activeCtx.arc(photoX, photoY, photoSize / 2 + 1.5, 0, Math.PI * 2);
          activeCtx.stroke();

          activeCtx.restore(); // Restores clip path limit

          // Logo Branding Header
          activeCtx.fillStyle = '#ffffff';
          activeCtx.textAlign = 'center';
          activeCtx.font = '700 36px "Space Grotesk", sans-serif';
          activeCtx.fillText('hacker house', width / 2, cY + 90, cW - 60);
          activeCtx.fillStyle = '#c5bfae';
          activeCtx.font = '500 13px "Space Grotesk", sans-serif';
          activeCtx.fillText('(goa 2026)', width / 2, cY + 112);

          // Details text over beige bottom wave
          const textY = cY + cH - 150;
          activeCtx.fillStyle = '#4d5447'; // Dark sage contrast color
          activeCtx.textAlign = 'center';
          
          activeCtx.font = '500 18px "Space Grotesk", sans-serif';
          activeCtx.fillText(role.toUpperCase() || 'DEVELOPER', width / 2, textY);

          activeCtx.font = '900 36px "Space Grotesk", sans-serif';
          activeCtx.fillText(name.toUpperCase() || 'BUILDER NAME', width / 2, textY + 48, cW - 60);

          // Separator line
          activeCtx.strokeStyle = '#4d5447';
          activeCtx.lineWidth = 2.5;
          activeCtx.beginPath();
          activeCtx.moveTo(width / 2 - 90, textY + 70);
          activeCtx.lineTo(width / 2 + 90, textY + 70);
          activeCtx.stroke();

          // ID details
          activeCtx.font = 'italic 16px "Space Grotesk", sans-serif';
          activeCtx.fillText(`ID NO: #HH-GOA-${Math.abs(hashCode(name || 'BUILDER')) % 9000 + 1000}`, width / 2, textY + 98);

          // Add a subtle paper grain overlay on corporate badge
          activeCtx.save();
          activeCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          for (let i = 0; i < 2000; i++) {
            const px = cX + Math.random() * cW;
            const py = cY + Math.random() * cH;
            activeCtx.fillRect(px, py, 1.5, 1.5);
          }
          activeCtx.restore();

        } else {
          // ==========================================
          // --- HACKER GOA HYPE STYLE (IMAGE 11) ---
          // ==========================================
          // 1. Outer Background
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

          // 2. Card body container
          const margin = 20;
          const cardW = width - margin * 2;
          const cardH = height - margin * 2;
          const radius = 24;

          activeCtx.save();
          activeCtx.shadowColor = 'rgba(0,0,0,0.5)';
          activeCtx.shadowBlur = 24;
          activeCtx.shadowOffsetX = 4;
          activeCtx.shadowOffsetY = 8;
          activeCtx.fillStyle = bgCard;
          drawRoundedRect(activeCtx, margin, margin, cardW, cardH, radius);
          activeCtx.fill();
          activeCtx.restore();

          activeCtx.strokeStyle = headerBg;
          activeCtx.lineWidth = 8;
          activeCtx.stroke();

          // Inner thin yellow border line
          activeCtx.strokeStyle = accentYellow;
          activeCtx.lineWidth = 3.5;
          drawRoundedRect(activeCtx, margin + 12, margin + 12, cardW - 24, cardH - 24, radius - 8);
          activeCtx.stroke();

          // 3. Top Ribbon Stamp
          const stampW = 160;
          const stampH = 115;
          const stampX = (width - stampW) / 2;
          activeCtx.save();
          activeCtx.fillStyle = '#be123c'; 
          drawRoundedRect(activeCtx, stampX, 15, stampW, stampH, 12);
          activeCtx.fill();
          activeCtx.strokeStyle = accentYellow;
          activeCtx.lineWidth = 3;
          drawRoundedRect(activeCtx, stampX + 6, 21, stampW - 12, stampH - 12, 8);
          activeCtx.stroke();
          // Contents
          activeCtx.font = '24px sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('🌴', width / 2, 54);
          activeCtx.fillStyle = '#ffffff';
          activeCtx.font = '900 18px "Space Grotesk", sans-serif';
          activeCtx.fillText('HH', width / 2, 78);
          activeCtx.fillText('GOA', width / 2, 98);
          activeCtx.fillStyle = accentYellow;
          activeCtx.font = '900 15px "Space Grotesk", sans-serif';
          activeCtx.fillText('2026', width / 2, 118);
          activeCtx.restore();

          // 4. Header Logo: HACKER [गोवा] HOUSE
          activeCtx.save();
          activeCtx.fillStyle = textDark;
          activeCtx.font = '900 58px "Playfair Display", Georgia, serif';
          activeCtx.textAlign = 'right';
          activeCtx.fillText('HACKER', width / 2 - 65, 195, 230);
          activeCtx.textAlign = 'left';
          activeCtx.fillText('HOUSE', width / 2 + 75, 195, 210);

          activeCtx.translate(width / 2 + 5, 185);
          activeCtx.rotate(-0.1);
          activeCtx.fillStyle = '#f43f5e';
          activeCtx.font = '900 52px "Plus Jakarta Sans", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('गोवा', 0, 0);
          activeCtx.restore();

          // Border side metadata
          activeCtx.save();
          activeCtx.fillStyle = '#dc2626';
          activeCtx.font = '800 12px "Space Grotesk", sans-serif';
          activeCtx.translate(45, 340);
          activeCtx.rotate(-Math.PI / 2);
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦  28 - 31 OCT 2026  ✦', 0, 0);
          activeCtx.restore();

          activeCtx.save();
          activeCtx.fillStyle = '#dc2626';
          activeCtx.font = '800 12px "Space Grotesk", sans-serif';
          activeCtx.translate(width - 45, 340);
          activeCtx.rotate(Math.PI / 2);
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦  GOA, INDIA  ✦', 0, 0);
          activeCtx.restore();

          // A. Top-Left Postage Stamp
          const stX = 65;
          const stY = 65;
          const stW = 110;
          const stH = 130;
          activeCtx.save();
          activeCtx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          activeCtx.shadowBlur = 8;
          activeCtx.shadowOffsetX = 4;
          activeCtx.shadowOffsetY = 4;
          activeCtx.fillStyle = '#ffffff';
          activeCtx.strokeStyle = '#022c22';
          activeCtx.lineWidth = 3;
          activeCtx.fillRect(stX, stY, stW, stH);
          activeCtx.strokeRect(stX, stY, stW, stH);
          activeCtx.restore();

          // Stamp teeth
          activeCtx.fillStyle = bgCard;
          for (let px = stX + 8; px < stX + stW; px += 16) {
            activeCtx.beginPath();
            activeCtx.arc(px, stY, 5, 0, Math.PI * 2);
            activeCtx.fill();
            activeCtx.beginPath();
            activeCtx.arc(px, stY + stH, 5, 0, Math.PI * 2);
            activeCtx.fill();
          }
          for (let py = stY + 8; py < stY + stH; py += 16) {
            activeCtx.beginPath();
            activeCtx.arc(stX, py, 5, 0, Math.PI * 2);
            activeCtx.fill();
            activeCtx.beginPath();
            activeCtx.arc(stX + stW, py, 5, 0, Math.PI * 2);
            activeCtx.fill();
          }
          
          // Stamp Artwork
          activeCtx.save();
          const sunGrad = activeCtx.createRadialGradient(stX + stW / 2 + 10, stY + stH / 2 + 25, 5, stX + stW / 2 + 10, stY + stH / 2 + 25, 24);
          sunGrad.addColorStop(0, '#fef08a');
          sunGrad.addColorStop(1, '#facc15');
          activeCtx.fillStyle = sunGrad;
          activeCtx.beginPath();
          activeCtx.arc(stX + stW / 2 + 10, stY + stH / 2 + 25, 24, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.fillStyle = '#064e3b';
          activeCtx.fillRect(stX + 8, stY + stH - 24, stW - 16, 16);
          activeCtx.strokeStyle = '#022c22';
          activeCtx.lineWidth = 4;
          activeCtx.beginPath();
          activeCtx.moveTo(stX + stW - 25, stY + stH - 20);
          activeCtx.quadraticCurveTo(stX + stW - 40, stY + stH / 2 + 10, stX + stW - 22, stY + stH / 2 - 10);
          activeCtx.stroke();
          activeCtx.fillStyle = '#059669';
          for (let leaf = 0; leaf < 5; leaf++) {
            activeCtx.beginPath();
            activeCtx.arc(stX + stW - 22, stY + stH / 2 - 15, 14, leaf * 1.25, leaf * 1.25 + 0.9);
            activeCtx.fill();
          }
          activeCtx.fillStyle = '#dc2626';
          activeCtx.font = '900 14px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'left';
          activeCtx.fillText('GOA', stX + 15, stY + 28);
          activeCtx.font = '700 11px "Space Grotesk", sans-serif';
          activeCtx.fillText('INDIA', stX + 15, stY + 42);
          activeCtx.restore();

          // Red wavy lines
          activeCtx.save();
          activeCtx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
          activeCtx.lineWidth = 2.5;
          for (let wLine = 0; wLine < 3; wLine++) {
            activeCtx.beginPath();
            activeCtx.moveTo(stX + stW + 6, stY + 50 + wLine * 10);
            activeCtx.bezierCurveTo(stX + stW + 25, stY + 45 + wLine * 10, stX + stW + 35, stY + 55 + wLine * 10, stX + stW + 55, stY + 50 + wLine * 10);
            activeCtx.stroke();
          }
          activeCtx.restore();

          // B. Top-Right Circular Badge Stamp
          const cX = width - 110;
          const cY = 120;
          const cR = 50;
          activeCtx.save();
          activeCtx.strokeStyle = headerBg;
          activeCtx.lineWidth = 2.5;
          activeCtx.beginPath();
          activeCtx.arc(cX, cY, cR, 0, Math.PI * 2);
          activeCtx.stroke();
          activeCtx.setLineDash([6, 5]);
          activeCtx.beginPath();
          activeCtx.arc(cX, cY, cR + 6, 0, Math.PI * 2);
          activeCtx.stroke();
          activeCtx.fillStyle = headerBg;
          activeCtx.font = '900 10px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('BUILD IN GOA', cX, cY - 20);
          activeCtx.fillText('★', cX, cY - 7);
          activeCtx.font = '22px sans-serif';
          activeCtx.fillText('🌴', cX, cY + 12);
          activeCtx.font = '900 9px "Space Grotesk", sans-serif';
          activeCtx.fillText('SHIP FROM PARADISE', cX, cY + 32);
          activeCtx.restore();

          // 5. Center Avatar Photo Frame
          const photoSize = 340; 
          const photoX = width / 2;
          const photoY = 430;

          activeCtx.save();
          activeCtx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          activeCtx.shadowBlur = 16;
          activeCtx.shadowOffsetX = 0;
          activeCtx.shadowOffsetY = 6;
          activeCtx.fillStyle = '#ffffff';
          activeCtx.beginPath();
          activeCtx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.restore();

          activeCtx.save();
          activeCtx.beginPath();
          activeCtx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
          activeCtx.closePath();
          activeCtx.clip();

          // Fallback background
          activeCtx.fillStyle = '#e5e7eb';
          activeCtx.fillRect(photoX - photoSize / 2, photoY - photoSize / 2, photoSize, photoSize);

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
            
            const scaleFactor = 340 / 150;
            const imgX = photoX - drawW / 2 + panX * scaleFactor;
            const imgY = photoY - drawH / 2 + panY * scaleFactor;

            activeCtx.drawImage(userImg, imgX, imgY, drawW, drawH);
          }
          activeCtx.restore();

          // Striped border
          activeCtx.save();
          activeCtx.beginPath();
          activeCtx.arc(photoX, photoY, photoSize / 2 + 5, 0, Math.PI * 2);
          activeCtx.closePath();
          activeCtx.strokeStyle = '#facc15';
          activeCtx.lineWidth = 10;
          activeCtx.stroke();
          activeCtx.strokeStyle = '#dc2626';
          activeCtx.setLineDash([14, 14]);
          activeCtx.stroke();
          activeCtx.restore();

          // C. Left Side Signpost & Surfboards
          const spX = 145;
          const spY = 370;
          activeCtx.save();
          activeCtx.shadowColor = 'rgba(0,0,0,0.15)';
          activeCtx.shadowBlur = 4;
          activeCtx.shadowOffsetY = 2;
          
          activeCtx.fillStyle = '#5c2d10'; 
          activeCtx.fillRect(spX - 6, spY, 12, 230);
          activeCtx.strokeStyle = '#000000';
          activeCtx.lineWidth = 2.5;
          activeCtx.strokeRect(spX - 6, spY, 12, 230);

          // Sign 1: BUILD (yellow)
          activeCtx.fillStyle = '#facc15';
          activeCtx.beginPath();
          activeCtx.moveTo(spX - 55, spY + 30);
          activeCtx.lineTo(spX - 35, spY + 12);
          activeCtx.lineTo(spX + 30, spY + 12);
          activeCtx.lineTo(spX + 30, spY + 48);
          activeCtx.lineTo(spX - 35, spY + 48);
          activeCtx.closePath();
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.fillStyle = '#000';
          activeCtx.font = '900 13px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('BUILD', spX - 8, spY + 34);

          // Sign 2: SHIP (pink)
          activeCtx.fillStyle = '#f43f5e';
          activeCtx.beginPath();
          activeCtx.moveTo(spX - 30, spY + 65);
          activeCtx.lineTo(spX + 35, spY + 65);
          activeCtx.lineTo(spX + 55, spY + 80);
          activeCtx.lineTo(spX + 35, spY + 95);
          activeCtx.lineTo(spX - 30, spY + 95);
          activeCtx.closePath();
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.fillStyle = '#fff';
          activeCtx.fillText('SHIP', spX + 8, spY + 84);

          // Sign 3: REPEAT (green)
          activeCtx.fillStyle = '#047857';
          activeCtx.beginPath();
          activeCtx.moveTo(spX - 60, spY + 115);
          activeCtx.lineTo(spX - 40, spY + 98);
          activeCtx.lineTo(spX + 25, spY + 98);
          activeCtx.lineTo(spX + 25, spY + 132);
          activeCtx.lineTo(spX - 40, spY + 132);
          activeCtx.closePath();
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.fillStyle = '#fff';
          activeCtx.fillText('REPEAT', spX - 12, spY + 119);

          // Surfboards
          activeCtx.fillStyle = '#fbbf24';
          activeCtx.beginPath();
          activeCtx.ellipse(spX - 50, spY + 180, 20, 60, 0.1, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.strokeStyle = '#dc2626';
          activeCtx.lineWidth = 3;
          activeCtx.beginPath();
          activeCtx.ellipse(spX - 50, spY + 180, 20, 60, 0.1, Math.PI*0.3, Math.PI*0.7);
          activeCtx.stroke();

          activeCtx.fillStyle = '#f43f5e';
          activeCtx.strokeStyle = '#000';
          activeCtx.lineWidth = 2.5;
          activeCtx.beginPath();
          activeCtx.ellipse(spX - 25, spY + 190, 16, 52, -0.15, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.restore();

          // D. Right Side Goan House & Vespa
          const ghX = 575;
          const ghY = 385;
          activeCtx.save();
          activeCtx.fillStyle = '#ec4899'; 
          activeCtx.strokeStyle = '#000000';
          activeCtx.lineWidth = 2.5;
          activeCtx.fillRect(ghX, ghY + 50, 120, 100);
          activeCtx.strokeRect(ghX, ghY + 50, 120, 100);

          activeCtx.fillStyle = '#dc2626';
          activeCtx.beginPath();
          activeCtx.moveTo(ghX - 15, ghY + 50);
          activeCtx.lineTo(ghX + 60, ghY + 10);
          activeCtx.lineTo(ghX + 135, ghY + 50);
          activeCtx.closePath();
          activeCtx.fill();
          activeCtx.stroke();

          activeCtx.strokeStyle = 'rgba(0,0,0,0.15)';
          activeCtx.lineWidth = 4;
          for (let rLine = 0; rLine < 5; rLine++) {
            activeCtx.beginPath();
            activeCtx.moveTo(ghX + 10 + rLine * 22, ghY + 45);
            activeCtx.lineTo(ghX + 60, ghY + 15);
            activeCtx.stroke();
          }

          activeCtx.fillStyle = '#fbbf24';
          activeCtx.fillRect(ghX + 45, ghY + 100, 30, 50); 
          activeCtx.strokeRect(ghX + 45, ghY + 100, 30, 50);
          activeCtx.strokeStyle = '#000';
          activeCtx.lineWidth = 1.5;
          activeCtx.beginPath();
          activeCtx.moveTo(ghX + 60, ghY + 100);
          activeCtx.lineTo(ghX + 60, ghY + 150);
          activeCtx.stroke();

          activeCtx.fillStyle = '#ffffff';
          activeCtx.fillRect(ghX + 15, ghY + 65, 24, 24);
          activeCtx.strokeRect(ghX + 15, ghY + 65, 24, 24);
          activeCtx.fillRect(ghX + 80, ghY + 65, 24, 24);
          activeCtx.strokeRect(ghX + 80, ghY + 65, 24, 24);
          
          activeCtx.strokeStyle = '#000';
          activeCtx.lineWidth = 1;
          activeCtx.beginPath();
          activeCtx.moveTo(ghX + 27, ghY + 65); activeCtx.lineTo(ghX + 27, ghY + 89);
          activeCtx.moveTo(ghX + 15, ghY + 77); activeCtx.lineTo(ghX + 39, ghY + 77);
          activeCtx.moveTo(ghX + 92, ghY + 65); activeCtx.lineTo(ghX + 92, ghY + 89);
          activeCtx.moveTo(ghX + 80, ghY + 77); activeCtx.lineTo(ghX + 104, ghY + 77);
          activeCtx.stroke();

          activeCtx.fillStyle = '#fbbf24';
          activeCtx.beginPath();
          activeCtx.ellipse(ghX - 25, ghY + 110, 15, 55, 0.18, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.stroke();

          const scX = ghX + 65;
          const scY = ghY + 125;
          activeCtx.fillStyle = '#f43f5e';
          activeCtx.fillRect(scX, scY, 32, 16);
          activeCtx.strokeRect(scX, scY, 32, 16);
          activeCtx.fillStyle = '#000000';
          activeCtx.beginPath();
          activeCtx.arc(scX + 5, scY + 16, 7, 0, Math.PI * 2);
          activeCtx.arc(scX + 27, scY + 16, 7, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.restore();

          // E. Yellow Circular Sticker "LET'S BUILD!"
          const stcR = 54;
          const stcX = photoX + 140;
          const stcY = photoY - 95;
          activeCtx.save();
          activeCtx.translate(stcX, stcY);
          activeCtx.rotate(0.15); 
          activeCtx.shadowColor = 'rgba(0,0,0,0.15)';
          activeCtx.shadowBlur = 6;
          activeCtx.shadowOffsetY = 3;
          activeCtx.fillStyle = '#facc15';
          activeCtx.strokeStyle = '#000000';
          activeCtx.lineWidth = 3;
          activeCtx.beginPath();
          activeCtx.arc(0, 0, stcR, 0, Math.PI * 2);
          activeCtx.fill();
          activeCtx.stroke();
          activeCtx.strokeStyle = '#000000';
          activeCtx.lineWidth = 1.5;
          activeCtx.setLineDash([5, 4]);
          activeCtx.beginPath();
          activeCtx.arc(0, 0, stcR - 6, 0, Math.PI * 2);
          activeCtx.stroke();
          activeCtx.fillStyle = '#000000';
          activeCtx.font = '900 14px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText("LET'S", 0, -8);
          activeCtx.font = '900 16px "Space Grotesk", sans-serif';
          activeCtx.fillText("BUILD!", 0, 12);
          activeCtx.restore();

          // 6. Name Banner Box
          const nameW = 480;
          const nameH = 65;
          const nameY = 625;
          activeCtx.save();
          activeCtx.shadowColor = 'rgba(0,0,0,0.15)';
          activeCtx.shadowBlur = 10;
          activeCtx.shadowOffsetY = 4;
          activeCtx.fillStyle = headerBg;
          drawRoundedRect(activeCtx, (width - nameW) / 2, nameY, nameW, nameH, 12);
          activeCtx.fill();
          activeCtx.restore();
          activeCtx.strokeStyle = '#facc15';
          activeCtx.lineWidth = 2.5;
          drawRoundedRect(activeCtx, (width - nameW) / 2 + 5, nameY + 5, nameW - 10, nameH - 10, 8);
          activeCtx.stroke();
          activeCtx.fillStyle = '#facc15';
          activeCtx.font = '18px sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦', (width - nameW) / 2 + 35, nameY + 38);
          activeCtx.fillText('✦', (width + nameW) / 2 - 35, nameY + 38);
          activeCtx.fillStyle = '#ffffff';
          activeCtx.font = '900 28px "Space Grotesk", sans-serif';
          activeCtx.fillText(name.toUpperCase() || 'BUILDER NAME', width / 2, nameY + 43);

          // 7. Role / Stack Banner Box
          const roleW = 380;
          const roleH = 46;
          const roleY = 705;
          activeCtx.save();
          activeCtx.fillStyle = accentYellow;
          drawRoundedRect(activeCtx, (width - roleW) / 2, roleY, roleW, roleH, 10);
          activeCtx.fill();
          activeCtx.strokeStyle = '#000';
          activeCtx.lineWidth = 2;
          drawRoundedRect(activeCtx, (width - roleW) / 2, roleY, roleW, roleH, 10);
          activeCtx.stroke();
          activeCtx.fillStyle = textDark;
          activeCtx.font = 'bold 20px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('⚡', (width - roleW) / 2 + 30, roleY + 30);
          activeCtx.fillText('⚡', (width + roleW) / 2 - 30, roleY + 30);
          activeCtx.fillText(role.toUpperCase() || 'FULL-STACK DEVELOPER', width / 2, roleY + 30);
          activeCtx.restore();

          // Dividers
          activeCtx.save();
          activeCtx.strokeStyle = 'rgba(2, 44, 34, 0.2)';
          activeCtx.lineWidth = 2;
          activeCtx.setLineDash([6, 5]);
          activeCtx.beginPath();
          activeCtx.moveTo(270, 775); activeCtx.lineTo(270, 860); activeCtx.stroke();
          activeCtx.beginPath();
          activeCtx.moveTo(width - 270, 775); activeCtx.lineTo(width - 270, 860); activeCtx.stroke();
          activeCtx.restore();

          // 8. Grid Details Columns
          const gridY = 785;
          activeCtx.fillStyle = textDark;
          activeCtx.font = '800 12px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦ BUILDER CLASS ✦', 160, gridY);
          activeCtx.fillStyle = textAccent;
          activeCtx.font = '900 18px "Space Grotesk", sans-serif';
          activeCtx.fillText(persona.builderClass.toUpperCase(), 160, gridY + 30);

          activeCtx.save();
          activeCtx.fillStyle = textDark;
          activeCtx.font = '800 12px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦ BEACH BAG ✦', width / 2, gridY);
          const beachItems = persona.beachBag;
          activeCtx.font = '700 14px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'left';
          const startX = width / 2 - 60;
          beachItems.forEach((item: string, idx: number) => {
            let emoji = '🥥';
            if (item.toLowerCase().includes('code') || item.toLowerCase().includes('vs') || item.toLowerCase().includes('neovim')) emoji = '💻';
            if (item.toLowerCase().includes('beats') || item.toLowerCase().includes('music') || item.toLowerCase().includes('headphones') || item.toLowerCase().includes('red bull')) emoji = '🎧';
            if (item.toLowerCase().includes('sunscreen') || item.toLowerCase().includes('sunglasses') || item.toLowerCase().includes('towel')) emoji = '🕶️';
            activeCtx.fillText(`${emoji}   ${item.toUpperCase()}`, startX, gridY + 26 + idx * 22);
          });
          activeCtx.restore();

          activeCtx.fillStyle = textDark;
          activeCtx.font = '800 12px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦ CURRENTLY SHIPPING ✦', width - 160, gridY);
          activeCtx.fillStyle = textAccent;
          activeCtx.font = '900 15px "Space Grotesk", sans-serif';
          activeCtx.fillText(persona.shippingGoal.toUpperCase(), width - 160, gridY + 30);

          // 9. Bottom Section
          const qrSize = 120;
          const qrX = 65;
          const qrY = 875;
          activeCtx.fillStyle = '#ffffff';
          activeCtx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
          activeCtx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
          if (qrImg) {
            activeCtx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          }
          activeCtx.save();
          activeCtx.font = '24px sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.textBaseline = 'middle';
          activeCtx.fillText('🌴', qrX + qrSize/2, qrY + qrSize/2 + 3);
          activeCtx.restore();

          const snX = width / 2;
          const snY = 945;
          activeCtx.save();
          activeCtx.fillStyle = '#f59e0b';
          activeCtx.beginPath();
          activeCtx.arc(snX, snY, 32, Math.PI, 0);
          activeCtx.fill();
          activeCtx.strokeStyle = '#059669';
          activeCtx.lineWidth = 3.5;
          for (let wave = 0; wave < 3; wave++) {
            activeCtx.beginPath();
            activeCtx.moveTo(snX - 70, snY + 6 + wave * 8);
            activeCtx.quadraticCurveTo(snX - 35, snY + (wave % 2 === 0 ? 3 : 9), snX, snY + 6 + wave * 8);
            activeCtx.quadraticCurveTo(snX + 35, snY + (wave % 2 === 0 ? 9 : 3), snX + 70, snY + 6 + wave * 8);
            activeCtx.stroke();
          }
          activeCtx.fillStyle = '#064e3b';
          activeCtx.font = '32px sans-serif';
          activeCtx.fillText('🌴', snX - 70, snY + 12);
          activeCtx.fillText('🌴', snX + 40, snY + 12);
          activeCtx.restore();

          const barX = width - 245;
          const barY = 890;
          const barW = 180;
          const barH = 50;
          activeCtx.save();
          activeCtx.fillStyle = textDark;
          activeCtx.font = 'bold 11px monospace';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('BUILDER ID', barX + barW / 2, barY - 10);
          activeCtx.fillText(`#HH-GOA-${Math.abs(hashCode(name || 'BUILDER')) % 9000 + 1000}`, barX + barW / 2, barY + barH + 18);
          activeCtx.fillStyle = '#000';
          for (let b = 0; b < barW - 6; b += 7) {
            const w = Math.random() > 0.45 ? 4.5 : 2;
            activeCtx.fillRect(barX + 3 + b, barY, w, barH);
          }
          activeCtx.restore();

          const footW = cardW - 24;
          const footH = 50;
          const footY = 1010;
          activeCtx.save();
          activeCtx.fillStyle = '#be123c'; 
          drawRoundedRect(activeCtx, margin + 12, footY, footW, footH, 10);
          activeCtx.fill();
          activeCtx.strokeStyle = accentYellow;
          activeCtx.lineWidth = 2.5;
          drawRoundedRect(activeCtx, margin + 12, footY, footW, footH, 10);
          activeCtx.stroke();
          activeCtx.fillStyle = '#ffffff';
          activeCtx.font = 'bold 20px "Space Grotesk", sans-serif';
          activeCtx.textAlign = 'center';
          activeCtx.fillText('✦  #FRAMEINGOA  ✦', width / 2, footY + 32);
          activeCtx.restore();

          // Global Dust Texture overlay
          activeCtx.save();
          activeCtx.fillStyle = 'rgba(120, 53, 4, 0.035)'; 
          for (let i = 0; i < 4800; i++) {
            const px = Math.random() * width;
            const py = Math.random() * height;
            const size = Math.random() * 2 + 0.5;
            activeCtx.fillRect(px, py, size, size);
          }
          activeCtx.fillStyle = 'rgba(255, 255, 255, 0.08)'; 
          for (let i = 0; i < 3000; i++) {
            const px = Math.random() * width;
            const py = Math.random() * height;
            const size = Math.random() * 1.5;
            activeCtx.fillRect(px, py, size, size);
          }
          activeCtx.restore();

          // Vignette
          activeCtx.save();
          const vign = activeCtx.createRadialGradient(width / 2, height / 2, 400, width / 2, height / 2, 850);
          vign.addColorStop(0, 'rgba(0, 0, 0, 0)');
          vign.addColorStop(1, 'rgba(0, 0, 0, 0.28)'); 
          activeCtx.fillStyle = vign;
          activeCtx.fillRect(0, 0, width, height);
          activeCtx.restore();
        }

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
  activeCtxArcTo(ctx, x + w, y + h, x, y + h, r);
  activeCtxArcTo(ctx, x, y + h, x, y, r);
  activeCtxArcTo(ctx, x, y, x + w, y, r);
  ctx.closePath();
}

function activeCtxArcTo(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, radius: number) {
  ctx.arcTo(x1, y1, x2, y2, radius);
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
