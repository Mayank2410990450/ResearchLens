'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Share2,
  FileText,
  Sparkles,
  Bot,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface GraphNode {
  id: string;
  label: string;
  type: 'paper' | 'methodology' | 'dataset';
  x: number;
  y: number;
  radius: number;
  color: string;
  details: string;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export default function VisualizationsPage() {
  const { papers, setActiveReaderPaper } = useWorkspace();
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>('paper-vaswani-2017');
  const [zoom, setZoom] = React.useState(1);

  const nodes: GraphNode[] = [
    {
      id: 'paper-vaswani-2017',
      label: 'Attention Is All You Need',
      type: 'paper',
      x: 350,
      y: 220,
      radius: 28,
      color: '#6366f1',
      details: 'NeurIPS 2017 • Self-Attention Transduction without Recurrence',
    },
    {
      id: 'paper-dao-2022',
      label: 'FlashAttention',
      type: 'paper',
      x: 550,
      y: 140,
      radius: 24,
      color: '#06b6d4',
      details: 'NeurIPS 2022 • IO-Aware SRAM Memory Tiling',
    },
    {
      id: 'paper-hu-2022',
      label: 'LoRA Adaptation',
      type: 'paper',
      x: 550,
      y: 320,
      radius: 24,
      color: '#10b981',
      details: 'ICLR 2022 • Low-Rank Intrinsic Rank Decomposition',
    },
    {
      id: 'paper-devlin-2019',
      label: 'BERT Representations',
      type: 'paper',
      x: 180,
      y: 120,
      radius: 22,
      color: '#8b5cf6',
      details: 'NAACL 2019 • Bidirectional Masked Language Modeling',
    },
    {
      id: 'paper-he-2016',
      label: 'ResNet Deep Learning',
      type: 'paper',
      x: 150,
      y: 300,
      radius: 22,
      color: '#f59e0b',
      details: 'CVPR 2016 • Identity Residual Shortcut Mappings',
    },
    {
      id: 'meth-attention',
      label: 'Self-Attention Mechanism',
      type: 'methodology',
      x: 350,
      y: 100,
      radius: 16,
      color: '#a78bfa',
      details: 'Core Algorithmic Class: Scaled Dot-Product Attention',
    },
    {
      id: 'meth-peft',
      label: 'Parameter-Efficient PEFT',
      type: 'methodology',
      x: 420,
      y: 380,
      radius: 16,
      color: '#34d399',
      details: 'Fine-Tuning Paradigm: Low-Rank Intrinsic Adaptation',
    },
  ];

  const links: GraphLink[] = [
    { source: 'paper-vaswani-2017', target: 'meth-attention', label: 'Formulates' },
    { source: 'paper-dao-2022', target: 'meth-attention', label: 'Accelerates' },
    { source: 'paper-devlin-2019', target: 'paper-vaswani-2017', label: 'Encodes' },
    { source: 'paper-hu-2022', target: 'paper-vaswani-2017', label: 'Adapts' },
    { source: 'paper-hu-2022', target: 'meth-peft', label: 'Implements' },
    { source: 'paper-he-2016', target: 'paper-vaswani-2017', label: 'Precedes' },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const connectedLinks = links.filter(
    (l) => l.source === selectedNodeId || l.target === selectedNodeId
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan">Knowledge Lineages & Topology</Badge>
            <span className="text-xs font-mono text-slate-400">
              {nodes.length} Nodes • {links.length} Methodological Edges
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Research Knowledge Graph
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interactive visualization of paper lineages, architectural descendants, and methodology clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setZoom(Math.max(0.7, zoom - 0.15))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-mono px-2">{(zoom * 100).toFixed(0)}%</span>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setZoom(Math.min(1.4, zoom + 0.15))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="glass" size="sm" onClick={() => setZoom(1)}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Interactive Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Network Canvas */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl relative overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[460px] flex items-center justify-center bg-slate-950/70">
          <svg
            className="w-full h-[440px] select-none"
            viewBox="0 0 700 440"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* Draw Connecting Links */}
            {links.map((link, idx) => {
              const src = nodes.find((n) => n.id === link.source);
              const tgt = nodes.find((n) => n.id === link.target);
              if (!src || !tgt) return null;
              const isHighlight =
                link.source === selectedNodeId || link.target === selectedNodeId;

              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHighlight ? '#22d3ee' : '#334155'}
                    strokeWidth={isHighlight ? 2.5 : 1.5}
                    strokeDasharray={link.label === 'Accelerates' ? '4 4' : 'none'}
                    className="transition-all duration-300"
                  />
                  {isHighlight && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 8}
                      fill="#22d3ee"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform"
                >
                  {/* Outer Glow Halo for Selected Node */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}

                  {/* Core Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill="#0f172a"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Icon Indicator */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius / 2.5}
                    fill={node.color}
                    opacity="0.8"
                  />

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 16}
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="lg:col-span-4">
          <Card variant="glass" className="p-6 border-violet-500/30 shadow-glow space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={selectedNode.type === 'paper' ? 'violet' : 'cyan'}>
                {selectedNode.type.toUpperCase()} NODE
              </Badge>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedNode.label}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {selectedNode.details}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Connected Topological Edges ({connectedLinks.length})
              </span>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                {connectedLinks.map((l, i) => {
                  const otherId = l.source === selectedNodeId ? l.target : l.source;
                  const other = nodes.find((n) => n.id === otherId);
                  return (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-violet-400 font-semibold">{l.label} →</span>
                      <span className="text-slate-200 truncate max-w-[140px]">
                        {other?.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {selectedNode.type === 'paper' && (
              <div className="pt-2">
                <Link href="/workspace/assistant">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      const paperObj = papers.find((p) => p.id === selectedNode.id);
                      if (paperObj) setActiveReaderPaper(paperObj);
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open in Document Reader</span>
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
