import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Upload, Download, Share2, ArrowRight, Trash2, RotateCcw 
} from 'lucide-react';
import { PassCardCanvas } from './PassCardCanvas';
import { getRandomPersona, convertHeicIfNeeded } from '../utils/personaData';
import type { BuilderPersona } from '../utils/personaData';

export const StudioModal: React.FC = () => {
  // Navigation step
  const [step, setStep] = useState<'form' | 'result'>('form');

  // Fields
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [handle] = useState<string>('');

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

  // Upload Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processedFile = await convertHeicIfNeeded(file);
      const url = URL.createObjectURL(processedFile);
      setPhotoUrl(url);
      setZoom(1);
      setPanX(0);
      setPanY(0);
    } catch (err) {
      console.error('Error uploading photo', err);
    }
  };



  // Download pass
  const handleDownload = () => {
    const canvas = renderedCanvasRef.current;
    if (!canvas) return;

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeName = (name || 'builder').toLowerCase().replace(/\s+/g, '-');
    link.download = `hhgoa-pass-${safeName}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Share to X
  const handleShareToX = () => {
    const tweetText = encodeURIComponent(
      `Just generated my official Builder Pass for Hacker House Goa 2026! 🚀🌴\n\nClaimed my spot as a ${persona.builderClass}.\n\nCreate your pass here: #FrameInGoa #HHGoa2026 @HackerGoaHouse`
    );
    const intentUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="studio-page-view">
      
      <div className="form-page-title">
        <h3>House Goa 2026</h3>
      </div>

      {step === 'form' ? (
        /* Form view */
        <div className="simple-form-card">
          <div className="form-inner-section">
            
            {/* Builder Photo section */}
            <div className="form-group-header">
              <span className="group-label">Builder Photo</span>
            </div>

            {!photoUrl ? (
              /* Empty Dropzone style */
              <div className="dropzone-box">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp, image/heic, image/heif" 
                  onChange={handlePhotoUpload} 
                  id="dropzone-file"
                  className="file-input-hidden"
                />
                <label htmlFor="dropzone-file" className="dropzone-label">
                  <Upload size={28} className="dropzone-icon" />
                  <span className="dropzone-title">Drop your photo here or click to browse</span>
                  <span className="dropzone-formats">JPG, PNG, WEBP or HEIC • Max 10MB</span>
                </label>
              </div>
            ) : (
              /* Photo added container with zoom/positioner */
              <div className="photo-editor-box">
                <div className="editor-status-row">
                  <span className="photo-added-badge">✓ Photo Added</span>
                  <button className="photo-remove-btn" onClick={() => setPhotoUrl(null)}>
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="editor-controls-row">
                  {/* Interactive Crop Circle */}
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
                      <label>
                        Change Photo
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp, image/heic, image/heif" 
                          onChange={handlePhotoUpload} 
                          className="file-input-hidden" 
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
              theme="GOA_SUNSET"
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
            theme="GOA_SUNSET"
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
