'use client';

import * as React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { CapabilitiesSection } from '@/components/landing/CapabilitiesSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { ResearchIntelligenceSection } from '@/components/landing/ResearchIntelligenceSection';
import { ProductPreviewSection } from '@/components/landing/ProductPreviewSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-100 overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
      {/* Top Fixed Navigation */}
      <LandingNav />

      {/* 1. Cinematic Hero with 3D WebGL Canvas */}
      <HeroSection />

      {/* 2. Core Capabilities Grid */}
      <CapabilitiesSection />

      {/* 3. 4-Stage Research Workflow Pipeline */}
      <WorkflowSection />

      {/* 4. Interactive Research Intelligence & Knowledge Lineages */}
      <ResearchIntelligenceSection />

      {/* 5. Live Interactive Product Preview */}
      <ProductPreviewSection />

      {/* 6. Final Call to Action */}
      <FinalCtaSection />

      {/* 7. Academic Footer */}
      <LandingFooter />
    </div>
  );
}
