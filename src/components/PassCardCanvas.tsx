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

      // 3. Preload illustration assets
      let houseImg: HTMLImageElement | null = null;
      let signpostImg: HTMLImageElement | null = null;
      let postageImg: HTMLImageElement | null = null;
      let sunsetImg: HTMLImageElement | null = null;
      try {
        houseImg = await loadImage('/goan_house.jpg');
        signpostImg = await loadImage('/signpost.jpg');
        postageImg = await loadImage('/postage_stamp.jpg');
        sunsetImg = await loadImage('/beach_sunset.jpg');
      } catch (e) {
        console.error('Failed to preload visual illustrations', e);
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
      }

      // 4. Preload the QR code
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

      // Clear Canvas
      activeCtx.clearRect(0, 0, width, height);

      if (format === 'FORMAT_B_PASS') {
        // --- FORMAT B: BUILDER PASS ---

        // 1. Outer Background Fill
        activeCtx.fillStyle = bgOuter;
        activeCtx.fillRect(0, 0, width, height);

        // 2. Card body container
        const margin = 20;
        const cardW = width - margin * 2;
        const cardH = height - margin * 2;
        const radius = 24;

        // Shadow under the main card
        activeCtx.save();
        activeCtx.shadowColor = 'rgba(0,0,0,0.5)';
        activeCtx.shadowBlur = 24;
        activeCtx.shadowOffsetX = 4;
        activeCtx.shadowOffsetY = 8;
        activeCtx.fillStyle = bgCard;
        drawRoundedRect(activeCtx, margin, margin, cardW, cardH, radius);
        activeCtx.fill();
        activeCtx.restore();

        // Brutalist outer green outline
        activeCtx.strokeStyle = headerBg;
        activeCtx.lineWidth = 8;
        activeCtx.stroke();

        // Inner thin yellow border line
        activeCtx.strokeStyle = accentYellow;
        activeCtx.lineWidth = 3.5;
        drawRoundedRect(activeCtx, margin + 12, margin + 12, cardW - 24, cardH - 24, radius - 8);
        activeCtx.stroke();

        // 3. Top Ribbon Stamp hanging over border
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
        // Top Ribbon contents
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

        // Border side metadata text vertical ribbons
        activeCtx.save();
        activeCtx.fillStyle = '#dc2626';
        activeCtx.font = '800 12px "Space Grotesk", sans-serif';
        // Left text (vertical)
        activeCtx.translate(45, 340);
        activeCtx.rotate(-Math.PI / 2);
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦  28 - 31 OCT 2026  ✦', 0, 0);
        activeCtx.restore();

        activeCtx.save();
        activeCtx.fillStyle = '#dc2626';
        activeCtx.font = '800 12px "Space Grotesk", sans-serif';
        // Right text (vertical)
        activeCtx.translate(width - 45, 340);
        activeCtx.rotate(Math.PI / 2);
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦  GOA, INDIA  ✦', 0, 0);
        activeCtx.restore();


        // --- ILLUSTRATIONS & BACKGROUND LAYER ---

        // A. Top-Left Postage Stamp
        const stX = 65;
        const stY = 65;
        const stW = 110;
        const stH = 130;
        
        if (postageImg) {
          drawImageMultiply(activeCtx, postageImg, stX, stY, stW, stH);
        }

        // Red postal wavy lines coming out of stamp
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

        // Draw soft back shadow for the photo circle
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

        // Clipping mask
        activeCtx.save();
        activeCtx.beginPath();
        activeCtx.arc(photoX, photoY, photoSize / 2, 0, Math.PI * 2);
        activeCtx.closePath();
        activeCtx.clip();

        // Render user image
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


        // C. Left Side Signpost & Surfboards
        const spX = 60;
        const spY = 380;
        const spW = 145;
        const spH = 220;

        if (signpostImg) {
          drawImageMultiply(activeCtx, signpostImg, spX, spY, spW, spH);
        }


        // D. Right Side Goan House & Scooter
        const ghX = 575;
        const ghY = 385;
        const ghW = 160;
        const ghH = 160;

        if (houseImg) {
          drawImageMultiply(activeCtx, houseImg, ghX, ghY, ghW, ghH);
        }


        // --- FOREGROUND AVATAR FRAMING RING ---
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


        // E. Yellow Circular Sticker "LET'S BUILD!"
        const stcR = 54;
        const stcX = photoX + 140;
        const stcY = photoY - 95;
        activeCtx.save();
        activeCtx.translate(stcX, stcY);
        activeCtx.rotate(0.15); 
        
        // Shadow under sticker
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

        // Dashed inner ring
        activeCtx.strokeStyle = '#000000';
        activeCtx.lineWidth = 1.5;
        activeCtx.setLineDash([5, 4]);
        activeCtx.beginPath();
        activeCtx.arc(0, 0, stcR - 6, 0, Math.PI * 2);
        activeCtx.stroke();

        // Text
        activeCtx.fillStyle = '#000000';
        activeCtx.font = '900 14px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText("LET'S", 0, -8);
        activeCtx.font = '900 16px "Space Grotesk", sans-serif';
        activeCtx.fillText("BUILD!", 0, 12);
        activeCtx.restore();


        // --- 4. ARCED TALL-CONDENSED HEADER LOGO (GENTLE SHAPED ARC MATCHING IMAGE 15) ---
        // Draw tilted Devanagari overlay "गोवा" in the center slightly lower to sit beneath arc
        activeCtx.save();
        activeCtx.translate(width / 2, 222);
        activeCtx.rotate(-0.06);
        activeCtx.fillStyle = '#f43f5e';
        activeCtx.font = '900 56px "Plus Jakarta Sans", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('गोवा', 0, 0);
        activeCtx.restore();

        // Curved text along a very wide, gentle arch
        activeCtx.save();
        activeCtx.fillStyle = textDark;
        activeCtx.font = '900 55px "Playfair Display", Georgia, serif';
        activeCtx.textAlign = 'center';
        
        // Dynamic arc geometry: Large radius = very gentle/shallow slope matching competitor
        const arcCenterX = width / 2;
        const arcCenterY = 690;  // Center placed low down
        const arcRadius = 495;   // Large radius for a subtle curve
        
        // HACKER characters start at approx -16.5deg, space 2.4deg per char
        drawTextOnArc(activeCtx, 'HACKER', arcCenterX, arcCenterY, arcRadius, -Math.PI / 2 - 0.29, 0.042);
        
        // HOUSE characters start at approx +4.5deg, space 2.4deg per char
        drawTextOnArc(activeCtx, 'HOUSE', arcCenterX, arcCenterY, arcRadius, -Math.PI / 2 + 0.08, 0.042);
        
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

        // Gold stars
        activeCtx.fillStyle = '#facc15';
        activeCtx.font = '18px sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦', (width - nameW) / 2 + 35, nameY + 38);
        activeCtx.fillText('✦', (width + nameW) / 2 - 35, nameY + 38);

        // Name text
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

        // Thunder symbols
        activeCtx.fillStyle = textDark;
        activeCtx.font = 'bold 20px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('⚡', (width - roleW) / 2 + 30, roleY + 30);
        activeCtx.fillText('⚡', (width + roleW) / 2 - 30, roleY + 30);
        activeCtx.fillText(role.toUpperCase() || 'FULL-STACK DEVELOPER', width / 2, roleY + 30);
        activeCtx.restore();


        // Divider Lines between columns (dashed)
        activeCtx.save();
        activeCtx.strokeStyle = 'rgba(2, 44, 34, 0.2)';
        activeCtx.lineWidth = 2;
        activeCtx.setLineDash([6, 5]);
        activeCtx.beginPath();
        activeCtx.moveTo(270, 775);
        activeCtx.lineTo(270, 860);
        activeCtx.stroke();
        activeCtx.beginPath();
        activeCtx.moveTo(width - 270, 775);
        activeCtx.lineTo(width - 270, 860);
        activeCtx.stroke();
        activeCtx.restore();


        // 8. Grid Details Columns
        const gridY = 785;

        // Col 1: Builder Class
        activeCtx.fillStyle = textDark;
        activeCtx.font = '800 12px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦ BUILDER CLASS ✦', 160, gridY);

        activeCtx.fillStyle = textAccent;
        activeCtx.font = '900 18px "Space Grotesk", sans-serif';
        activeCtx.fillText(persona.builderClass.toUpperCase(), 160, gridY + 30);

        // Col 2: Beach Bag
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

        // Col 3: Currently Shipping
        activeCtx.fillStyle = textDark;
        activeCtx.font = '800 12px "Space Grotesk", sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.fillText('✦ CURRENTLY SHIPPING ✦', width - 160, gridY);

        activeCtx.fillStyle = textAccent;
        activeCtx.font = '900 15px "Space Grotesk", sans-serif';
        activeCtx.fillText(persona.shippingGoal.toUpperCase(), width - 160, gridY + 30);


        // 9. Bottom Section: QR Code, Sunset, and Barcode
        const qrSize = 120;
        const qrX = 65;
        const qrY = 875;

        // Draw QR code background wrapper
        activeCtx.fillStyle = '#ffffff';
        activeCtx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
        activeCtx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);

        if (qrImg) {
          activeCtx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        }
        // Palm Tree in the center of QR code
        activeCtx.save();
        activeCtx.font = '24px sans-serif';
        activeCtx.textAlign = 'center';
        activeCtx.textBaseline = 'middle';
        activeCtx.fillText('🌴', qrX + qrSize/2, qrY + qrSize/2 + 3);
        activeCtx.restore();

        // Beach Sunset drawing
        const snX = width / 2 - 120;
        const snY = 855;
        const snW = 240;
        const snH = 140;

        if (sunsetImg) {
          drawImageMultiply(activeCtx, sunsetImg, snX, snY, snW, snH);
        }

        // Barcode on bottom right
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

        // Draw stripes
        activeCtx.fillStyle = '#000000';
        for (let b = 0; b < barW - 6; b += 7) {
          const w = Math.random() > 0.45 ? 4.5 : 2;
          activeCtx.fillRect(barX + 3 + b, barY, w, barH);
        }
        activeCtx.restore();

        // 10. Pink ribbon footer stamp Tag
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


        // --- VINTAGE / ANALOG DUST & GRAIN GRAPHIC TEXTURES ---

        // A. Multi-toned Paper Noise Texture Simulation
        activeCtx.save();
        activeCtx.fillStyle = 'rgba(120, 53, 4, 0.035)'; // Rich brown dust particles
        for (let i = 0; i < 4800; i++) {
          const px = Math.random() * width;
          const py = Math.random() * height;
          const size = Math.random() * 2 + 0.5;
          activeCtx.fillRect(px, py, size, size);
        }
        activeCtx.fillStyle = 'rgba(255, 255, 255, 0.08)'; // Light dust speckles
        for (let i = 0; i < 3000; i++) {
          const px = Math.random() * width;
          const py = Math.random() * height;
          const size = Math.random() * 1.5;
          activeCtx.fillRect(px, py, size, size);
        }
        activeCtx.restore();

        // B. Retro Vignette
        activeCtx.save();
        const vign = activeCtx.createRadialGradient(width / 2, height / 2, 400, width / 2, height / 2, 850);
        vign.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vign.addColorStop(1, 'rgba(0, 0, 0, 0.28)'); 
        activeCtx.fillStyle = vign;
        activeCtx.fillRect(0, 0, width, height);
        activeCtx.restore();

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

// Blend-mode multiply drawer
function drawImageMultiply(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!img.width) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

// Gentle wide arc text drawer
function drawTextOnArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  angleSpacing: number
) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const angle = startAngle + i * angleSpacing;
    
    ctx.save();
    ctx.translate(
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle)
    );
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
}
