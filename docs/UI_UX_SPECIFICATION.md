# ResearchLens: UI/UX Design System & Component Specification

## 1. Design System & Visual Philosophy

ResearchLens is designed as a serious, cognitive workspace for scientific literature analysis. The design avoids generic AI-wrapper aesthetics, prioritizing density, readability, rigorous visual hierarchy, and instant access to verifiable proof.

### 1.1 Color Palette & Tokens
- **Primary Navy / Background Base**:
  - `bg-slate-900` (`#0F172A`): Deep navy header, primary buttons, and dark mode base.
  - `bg-slate-950` (`#020617`): Sidebar base in dark mode.
  - `bg-slate-50` (`#F8FAFC`): Main light canvas workspace.
  - `bg-white` (`#FFFFFF`): Light mode surface cards, paper readers.
- **Accents & Brand Identity**:
  - `brand-violet` (`#7C3AED` / `#6366F1`): Primary brand accents, AI synthesis indicators, active navigation badges.
  - `brand-cyan` (`#06B6D4`): Secondary accent for metric benchmarks and dataset tags.
  - `verified-emerald` (`#10B981`): Verified author citation badge, high-confidence evidence indicator.
  - `hypothesis-amber` (`#F59E0B`): AI-hypothesized gap, unverified claim warning.
  - `error-rose` (`#F43F5E`): Parse failure, prompt injection alert.
- **Borders & Dividers**:
  - `border-slate-200` (`#E2E8F0`) in light mode; `border-slate-800` (`#1E293B`) in dark mode.

### 1.2 Typography
- **Primary Interface**: Inter / Geist Sans (clean sans-serif, high legibility at 12px-14px micro-data sizes).
- **Document Excerpts & Code**: JetBrains Mono / Fira Code (monospaced for token snippets, citations, and algorithmic pseudo-code).
- **Mathematical Formulae**: KaTeX formatted inline `\(...\)` and display `\[...\]`.

---

## 2. Core Application Layout

```
+-----------------------------------------------------------------------------------------------+
| TOP NAVIGATION: [Logo ResearchLens] [Project Dropdown] [Global Search (Ctrl+K)] [Upload +] [Theme] [User] |
+-----------------+-----------------------------------------------------------------------------+
| SIDEBAR         | MAIN WORKSPACE CANVAS                                                       |
| - Dashboard     |                                                                             |
| - Library       |   [Breadcrumbs / View Title]                                                |
| - AI Assistant  |   +-----------------------------------------------------------------------+ |
| - Comparison    |   |                                                                       | |
| - Lit Review    |   |                                                                       | |
| - Gap Explorer  |   |             Active Module View (Interactive Workspace)               | |
| - Notes         |   |                                                                       | |
| - Collections   |   |                                                                       | |
| - Analytics     |   +-----------------------------------------------------------------------+ |
| - Settings      |                                                                             |
+-----------------+-----------------------------------------------------------------------------+
```

---

## 3. Module Wireframes & Interaction Specs

### 3.1 Module A: Intelligent Research Dashboard
- **Metric Cards**:
  1. *Total Papers Indexed* (with total page count).
  2. *Active Research Projects*.
  3. *Saved Notes & Highlights*.
  4. *Synthesized Literature Reviews*.
- **Activity Timeline**: Visual feed of recent paper ingests, queries, and generated reports.
- **Visual Charts**:
  - Methodological distribution (Donut chart).
  - Publication year distribution (Bar chart).
  - Top researched keywords (Pill cloud).
- **Quick Actions**: "Upload New Paper", "Start Multi-Paper Chat", "Generate Comparison Matrix".

### 3.2 Module B: Research Paper Library
- **Drag-and-Drop Dropzone**: Supports batch PDF upload with file size validation (max 35MB), magic-byte check, and instantaneous progress animation.
- **Filtering & Search Bar**: Instant debounce search across Title, Authors, Year, Methodology, Keywords, and Collections.
- **Paper Card / Table View Toggle**:
  - Paper cards display: Title, Authors, Publication Year, Extracted Methodology badge, Page count, Processing Status badge (`Indexed` green, `Processing` blue spinner, `Error` red).
  - Hover actions: Open in PDF Reader, Chat with Paper, Add to Collection, Delete.

### 3.3 Module C: Advanced RAG Research Assistant (Split-Screen View)
- **Left Panel (PDF & Document Inspector)**:
  - Native multi-page PDF viewer with jump-to-page navigation, zoom, and highlight overlays.
  - Document outline sidebar (sections, figures, tables).
- **Right Panel (Grounded Conversation Stream)**:
  - Chat message feed with Markdown and LaTeX rendering.
  - Interactive Citation Pills: e.g. `[Vaswani et al., Page 4]`.
  - **Clicking a citation pill immediately jumps the left PDF viewer to Page 4 and highlights the cited text chunk in yellow.**
  - Grounding indicator banner: explicitly displays whether information is 100% extracted from the document or involves AI synthesis.

### 3.4 Module D: Multi-Paper Comparison Matrix
- **Selection Bar**: Checkbox selector to compare 2 to 5 papers simultaneously.
- **Structured Matrix Grid**:
  - Rows: Research Objective, Problem Formulation, Methodology, Dataset/Corpus, Algorithms, Evaluation Metrics, Key Empirical Results, Stated Limitations, Proposed Future Work.
  - Columns: One column per selected paper, with expandable citation cards for each cell.
- **AI Synthesis Summary Panel**: Executive summary highlighting where methodologies agree or diverge.
- **Export Options**: Export as Markdown table, CSV, or formatted PDF report.

### 3.5 Module E: Research Gap Explorer
- **Two-Column Categorized View**:
  - *Column 1: Stated Limitations & Author Directives* (Extracted directly from "Discussion" and "Limitations" sections with exact quotes and page citations).
  - *Column 2: Cross-Paper Divergences & Hypothesized Opportunities* (Synthesized gaps where papers overlooked specific conditions, datasets, or edge cases).
- Visual badge distinguishing `[Author-Reported Ground Truth]` from `[AI-Hypothesized Opportunity]`.

### 3.6 Module F: Literature Review Generator
- **Multi-Step Synthesizer**:
  1. Select papers from library.
  2. Specify thematic focus (e.g. "Scalability bottlenecks in Vision Transformers").
  3. Generate structured review with editable sections (Introduction, Thematic Review, Comparative Evaluation, Open Gaps, Conclusion, Traceable Citations).
- **Split Editor & Preview**: Markdown editor on left, formatted preview on right with export to `.md` and `.pdf`.

### 3.7 Module G: Notes & Annotations
- Integrated note-taking with tag management.
- Direct links from note items back to the parent paper and highlighted page.

### 3.8 Module H: Interactive Analytics
- Interactive charts powered by Recharts:
  - Paper publication timeline.
  - Domain / Methodology taxonomy chart.
  - Keyword co-occurrence network.
  - Ingestion and query volume over time.

---

## 4. Design States & Usability Standards
- **Loading States**: Shimmer skeleton cards mirroring actual content structures (no generic central spinner).
- **Empty States**: Encouraging academic illustrations, explanatory copy, and one-click "Load Sample Research Papers" action for instant demonstration.
- **Error States**: Non-blocking toast notifications with specific troubleshooting instructions.
- **Accessibility**: ARIA labels on all icon buttons, full keyboard navigation support (`Tab`, `Esc`, `Ctrl+K`), and high-contrast color ratios conforming to WCAG 2.1 AA.
