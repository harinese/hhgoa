import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  return (
    <section className="hh-hero">
      {/* Dynamic background decorations matching HH Goa style */}
      <div className="halftone-overlay"></div>
      <div className="wave-decoration-top"></div>
      <div className="wave-decoration-bottom"></div>

      <div className="hero-center-box">
        {/* Massive Hacker House Title with Devanagari Overlay */}
        <div className="title-wrapper">
          <h1 className="display-title">
            <span className="title-hacker">HACKER</span>
            <span className="space-gap"> </span>
            <span className="title-house">HOUSE</span>
          </h1>
          <span className="devanagari-badge">गोवा</span>
        </div>

        {/* Event Meta Pill Ribbon */}
        <div className="meta-ribbon-wrapper">
          <div className="meta-ribbon">
            <span>GOA, INDIA • 28 - 31 OCT 2026</span>
            <span className="ribbon-divider">•</span>
            <span className="ribbon-studio">2:47 PM STUDIO</span>
          </div>
        </div>

        <p className="hero-narrative">
          Claim your official builder pass. Drop your photo, customize your gear, and join the most hyped builder house shipping from paradise.
        </p>

        {/* Tropical Retro Hatch CTA Button */}
        <div className="cta-wrapper">
          <button className="hatch-btn" onClick={onStart}>
            <span>ENTER HOUSE & CLAIM PASS</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Foot Tags */}
        <div className="foot-tags">
          <span>#FrameInGoa</span>
          <span className="bullet">•</span>
          <span>HH GOA 2026</span>
          <span className="bullet">•</span>
          <span>August 28-31, 2026</span>
          <span className="bullet">•</span>
          <span>Goa, India</span>
        </div>
      </div>
    </section>
  );
};
