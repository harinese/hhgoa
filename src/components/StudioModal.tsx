import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Upload, Download, Share2, ArrowRight, Trash2, RotateCcw 
} from 'lucide-react';
import { PassCardCanvas } from './PassCardCanvas';
import type { CardTheme } from './PassCardCanvas';
import { getRandomPersona, convertHeicIfNeeded } from '../utils/personaData';
import type { BuilderPersona } from '../utils/personaData';

export const StudioModal: React.FC = () => {
  // Navigation step
  const [step, setStep] = useState<'form' | 'result'>('form');

  // Fields
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [handle] = useState<string>('');
  const [theme, setTheme] = useState<CardTheme>('GOA_SUNSET');

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Photo controls
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Drag state for avatar circle
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Persona details
  const [persona] = useState<BuilderPersona>(() => getRandomPersona());

  const renderedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle Dragging within the Circle positioner
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.current.x);
    setPanY(e.clientY - dragStart.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Process and load photo input
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const converted = await convertHeicIfNeeded(file);
      const url = URL.createObjectURL(converted);
      setPhotoUrl(url);
      setZoom(1);
      setPanX(0);
      setPanY(0);
    } catch (err) {
      console.error('Photo processing failed', err);
      alert('Error loading image. Try another file format.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Download card image
  const handleDownload = () => {
    const canvas = renderedCanvasRef.current;
    if (!canvas) {
      alert('Canvas not loaded yet, please wait.');
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `HH_GOA_2026_${name.replace(/\s+/g, '_') || 'BUILDER'}_PASS.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.75 }
      });
    } catch (e) {
      console.error('Failed to export canvas', e);
      alert('Failed to generate PNG. Please try again.');
    }
  };

  // Tweet card link helper
  const handleShareToX = () => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      `Just generated my official Hacker House Goa 2026 Builder Pass! Shipping from paradise next October! 🌴💻✨\n\nClaim yours here:`
    )}&url=${encodeURIComponent('https://x.com/search?q=%23FrameInGoa')}&hashtags=FrameInGoa,HackerHouseGoa`;
    window.open(xUrl, '_blank');
  };

  return (
    <div className="studio-page-view">
      {step === 'form' ? (
        /* Form view: Crop circle, name, and stack role inputs */
        <div className="simple-form-card">
          <div className="form-page-title">
            <h3>CLAIM YOUR BUILDER PASS</h3>
          </div>

          <div className="form-inner-section">
            {/* Photo Editor */}
            <div className="form-group-header">
              <span className="group-label">Builder Photo</span>
            </div>

            {!photoUrl ? (
              /* File Drag Drop Zone */
              <div className="dropzone-box">
                <label className="dropzone-label">
                  <Upload size={32} className="dropzone-icon" />
                  <span className="dropzone-title">Upload a profile photo</span>
                  <span className="dropzone-formats">JPG, PNG, HEIC from iPhone</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp, image/heic, image/heif" 
                    onChange={handlePhotoUpload} 
                    className="file-input-hidden" 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            ) : (
              /* Interactive positioner crop circle */
              <div className="photo-editor-box">
                <div className="editor-status-row">
                  <span className="photo-added-badge">✓ Photo Added</span>
                  <button className="photo-remove-btn" onClick={handleRemovePhoto}>
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="editor-controls-row">
                  <div 
                    className="avatar-crop-circle"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img 
                      src={photoUrl} 
                      alt="Crop Preview" 
                      style={{
                        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                      }}
                      draggable={false}
                    />
                    <div className="drag-helper-text">DRAG</div>
                  </div>

                  {/* Zoom controls */}
                  <div className="editor-sliders-panel">
                    <div className="slider-control-group">
                      <span className="slider-label">Zoom</span>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.5" 
                        step="0.05" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))} 
                        className="editor-range-slider"
                      />
                      <button className="editor-reset-btn" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>
                        <RotateCcw size={12} />
                        <span>Reset</span>
                      </button>
                    </div>

                    <button className="change-photo-btn">
                      <label style={{ cursor: 'pointer' }}>
                        Change Photo
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp, image/heic, image/heif" 
                          onChange={handlePhotoUpload} 
                          className="file-input-hidden" 
                          style={{ display: 'none' }}
                        />
                      </label>
                    </button>
                  </div>
                </div>

                <div className="editor-footer-hint">
                  <span>💡 Drag inside the circle to position your photo.</span>
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="form-input-group">
              <label className="simple-input-label">Full Name</label>
              <input 
                type="text" 
                className="simple-text-input" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Satoshi Nakamoto"
              />
            </div>

            <div className="form-input-group">
              <label className="simple-input-label">Stack / Role</label>
              <input 
                type="text" 
                className="simple-text-input" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                placeholder="e.g. Full-Stack / Rust / AI"
              />
            </div>

            <div className="form-input-group">
              <label className="simple-input-label">Choose Badge Template</label>
              <select 
                className="simple-text-input" 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as CardTheme)}
                style={{ 
                  appearance: 'none', 
                  background: '#fdfbf7 url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23022c22\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center', 
                  cursor: 'pointer',
                  paddingRight: '40px'
                }}
              >
                <option value="GOA_SUNSET">🌴 Hacker Goa 2026 (Illustrated Hype)</option>
                <option value="MINIMAL_CORPORATE">💼 Corporate Minimal (Sage Lanyard Badge)</option>
              </select>
            </div>

            {/* Generate CTA */}
            <button 
              className="generate-pass-btn" 
              onClick={() => {
                if (!photoUrl) {
                  alert('Please upload a photo first!');
                  return;
                }
                setStep('result');
              }}
            >
              <span>Generate Pass</span>
              <ArrowRight size={18} />
            </button>

          </div>
        </div>
      ) : (
        /* Result view showing card canvas */
        <div className="result-preview-card">
          <div className="result-header">
            <h4>Your Builder Pass is Ready!</h4>
            <button className="edit-pass-btn" onClick={() => setStep('form')}>
              Edit Pass
            </button>
          </div>

          <div className="result-canvas-holder">
            <PassCardCanvas
              photoUrl={photoUrl}
              name={name}
              role={role}
              handle={handle}
              persona={persona}
              format="FORMAT_B_PASS"
              theme={theme}
              zoom={zoom}
              panX={panX}
              panY={panY}
              onCanvasRendered={(canvas) => {
                renderedCanvasRef.current = canvas;
              }}
            />
          </div>

          <div className="result-actions-bar">
            <button className="btn-primary btn-lg" onClick={handleDownload}>
              <Download size={20} />
              <span>DOWNLOAD PASS</span>
            </button>

            <button className="btn-secondary btn-lg btn-twitter" onClick={handleShareToX}>
              <Share2 size={20} />
              <span>SHARE TO X (#FRAMEINGOA)</span>
            </button>
          </div>
        </div>
      )}

      {/* Background canvas wrapper hidden from view to handle pre-rendering */}
      {step === 'form' && photoUrl && (
        <div style={{ display: 'none' }}>
          <PassCardCanvas
            photoUrl={photoUrl}
            name={name}
            role={role}
            handle={handle}
            persona={persona}
            format="FORMAT_B_PASS"
            theme={theme}
            zoom={zoom}
            panX={panX}
            panY={panY}
            onCanvasRendered={(canvas) => {
              renderedCanvasRef.current = canvas;
            }}
          />
        </div>
      )}
    </div>
  );
};
