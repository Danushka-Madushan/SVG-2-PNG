import { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import { Image as NextuiImage } from "@heroui/react"
import toast from 'react-hot-toast';
import SyncLink from './Icons/SyncLink';
import UnLink from './Icons/UnLink';
import { motion, AnimatePresence } from "framer-motion";

/* ─── Design Tokens ─────────────────────────────────────────────────────────
   Palette:
     Background   #F5F4F2  (warm off-white, stone-100 territory)
     Surface      #FFFFFF
     Border       #E4E2DE  (warm stone-200)
     Text primary #1C1917  (stone-900)
     Text muted   #78716C  (stone-500)
     Text faint   #A8A29E  (stone-400)
     Accent       #1D4ED8  (blue-700 — measured, corporate)
     Accent soft  #EFF6FF  (blue-50)
     Success      #15803D  (green-700)
     Danger       #B91C1C  (red-700)
────────────────────────────────────────────────────────────────────────────── */

const App = () => {
  /* Aspect Ratio */
  const [SyncAspectRatio, setSyncAspectRatio] = useState(true);
  const [InitialAspectRatio, setInitialAspectRatio] = useState(1);

  /* Data URLs */
  const [PNGDataURL, setPNGDataURL] = useState<string>('');
  const [SVGData, setSVGData] = useState<string>('');
  const [FileName, setFileName] = useState<string>('');

  /* Output Height Width */
  const [Width, setWidth] = useState(0);
  const [Height, setHeight] = useState(0);

  /* Output Image Size */
  const [size, setSize] = useState('');

  /* Element Ref */
  const CanvasRef = useRef<HTMLCanvasElement>(null);
  const FileInputRef = useRef<HTMLInputElement>(null);

  /* Get Current SVG Resolution on Load */
  const getCurrentResolution = (svgData: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    let w = 0;
    let h = 0;

    const widthAttr = svgElement.getAttribute('width');
    const heightAttr = svgElement.getAttribute('height');
    const viewBox = svgElement.getAttribute('viewBox');

    if (widthAttr && !widthAttr.includes('%')) {
      w = parseFloat(widthAttr);
    }
    if (heightAttr && !heightAttr.includes('%')) {
      h = parseFloat(heightAttr);
    }

    if ((w === 0 || h === 0) && viewBox) {
      const viewBoxValues = viewBox.split(/[ ,]+/).map(v => parseFloat(v));
      if (viewBoxValues.length === 4) {
        if (w === 0) w = viewBoxValues[2];
        if (h === 0) h = viewBoxValues[3];
      }
    }

    if (w > 0 && h > 0) {
      setWidth(w);
      setHeight(h);
      setInitialAspectRatio(w / h);
    }
  };

  /* onFileChange Event */
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/svg+xml') {
        toast.error('Unsupported File Selected!');
        event.target.value = '';
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgData = e.target?.result as string;
        setSVGData(svgData);
        getCurrentResolution(svgData);
        event.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  /* Image Resizing */
  const ResizeResolution = (value: number, type: 'Height' | 'Width') => {
    const numValue = Math.max(0, value);
    if (SyncAspectRatio) {
      if (type === 'Width') {
        setWidth(numValue);
        setHeight(Math.round(numValue / InitialAspectRatio));
      } else {
        setHeight(numValue);
        setWidth(Math.round(numValue * InitialAspectRatio));
      }
    } else {
      type === 'Height' ? setHeight(numValue) : setWidth(numValue);
    }
  };

  /* Convert SVG to PNG */
  const ConvertSVG2PNG = useCallback(() => {
    const canvas = CanvasRef.current;
    if (!canvas || !SVGData || Width === 0 || Height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();

    // Use a base64 data URI instead of a blob: URL.
    // Blob URLs trigger an async fetch internally; for SVGs with linearGradient /
    // paint-server references the browser can fire onload before those references
    // are composited, causing drawImage() to capture a blank or partially-rendered
    // frame. A data URI is decoded inline so all references are resolved before
    // onload fires.
    const svgBase64 = btoa(decodeURIComponent(encodeURIComponent(SVGData)));
    const url = `data:image/svg+xml;base64,${svgBase64}`;

    img.onload = () => {
      // Double requestAnimationFrame: defers the canvas write until after the
      // browser has completed its next two paint cycles, guaranteeing the SVG
      // renderer has fully composited gradients, filters, and opacity layers.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          canvas.width = Width;
          canvas.height = Height;
          ctx.clearRect(0, 0, Width, Height);
          ctx.drawImage(img, 0, 0, Width, Height);

          const PNGData = canvas.toDataURL('image/png');
          const base64String = PNGData.split(',')[1];
          const decodedLength = (base64String.length * 3) / 4 - (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);

          if (decodedLength >= 1048576) {
            setSize(`${(decodedLength / 1048576).toFixed(2)} MB`);
          } else {
            setSize(`${(decodedLength / 1024).toFixed(2)} KB`);
          }
          setPNGDataURL(PNGData);
        });
      });
    };

    img.onerror = () => {
      toast.error('Failed to process SVG');
    };

    img.src = url;
  }, [Width, Height, SVGData]);

  useEffect(() => {
    ConvertSVG2PNG();
  }, [ConvertSVG2PNG]);

  /* Open PNG in new tab via Blob URL (data: URLs are blocked by browsers) */
  const openInNewTab = () => {
    if (!PNGDataURL) return;
    const byteString = atob(PNGDataURL.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: 'image/png' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    /* Revoke after a short delay so the tab has time to load it */
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const handleReset = () => {
    setSVGData('');
    setPNGDataURL('');
    setWidth(0);
    setHeight(0);
    setInitialAspectRatio(1);
    setFileName('');
    setSize('');
    if (FileInputRef.current) FileInputRef.current.value = '';
  };

  return (
    <div className="min-h-full h-screen flex flex-col" style={{ backgroundColor: '#F5F4F2', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E4E2DE',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#1D4ED8',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.3px' }}>
            SVG<span style={{ color: '#1D4ED8', fontWeight: 500 }}>2</span>PNG
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {SVGData && (
            <button
              onClick={handleReset}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#B91C1C',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '5px 12px',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
            >
              Reset
            </button>
          )}
        </div>
      </nav>

      {/* ── Main Layout ── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Sidebar ── */}
        <aside
          style={{
            width: '320px',
            minWidth: '320px',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E4E2DE',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* ── Section: Input Source ── */}
            <section>
              <SectionLabel>Input Source</SectionLabel>

              {!SVGData ? (
                /* Upload Drop Zone */
                <div
                  onClick={() => FileInputRef.current?.click()}
                  style={{
                    border: '1.5px dashed #BFDBFE',
                    borderRadius: '10px',
                    padding: '28px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#EFF6FF',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#DBEAFE';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#93C5FD';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = '#EFF6FF';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#BFDBFE';
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#DBEAFE',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1D4ED8', marginBottom: '2px' }}>Click to upload SVG</p>
                    <p style={{ fontSize: '11px', color: '#78716C' }}>or drag and drop</p>
                  </div>
                </div>
              ) : (
                /* File Info Card */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#F9F8F7',
                    border: '1px solid #E4E2DE',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      backgroundColor: '#EFF6FF',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{FileName}</p>
                    <p style={{ fontSize: '11px', color: '#78716C', marginTop: '1px' }}>Source loaded</p>
                  </div>
                  <button
                    onClick={() => FileInputRef.current?.click()}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                      border: '1px solid #E4E2DE',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#78716C',
                      transition: 'background-color 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0EFED')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    title="Replace file"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>
                </div>
              )}
            </section>

            {/* ── Sections shown only when SVG loaded ── */}
            {SVGData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                {/* ── Section: Resolution ── */}
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <SectionLabel noMargin>Resolution</SectionLabel>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: SyncAspectRatio ? '#1D4ED8' : '#78716C',
                        backgroundColor: SyncAspectRatio ? '#EFF6FF' : '#F5F4F2',
                        border: `1px solid ${SyncAspectRatio ? '#BFDBFE' : '#E4E2DE'}`,
                        borderRadius: '4px',
                        padding: '2px 8px',
                      }}
                    >
                      {SyncAspectRatio ? 'Locked' : 'Free'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Width / Link / Height row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'end', minWidth: 0 }}>
                      <div style={{ minWidth: 0 }}>
                      <FieldGroup label="Width">
                        <NumberInput
                          value={Width}
                          onChange={val => ResizeResolution(val, 'Width')}
                          suffix="px"
                        />
                      </FieldGroup>
                      </div>

                      {/* Link toggle */}
                      <div style={{ paddingBottom: '2px' }}>
                        <button
                          onClick={() => setSyncAspectRatio(!SyncAspectRatio)}
                          style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: `1px solid ${SyncAspectRatio ? '#BFDBFE' : '#E4E2DE'}`,
                            backgroundColor: SyncAspectRatio ? '#EFF6FF' : '#F9F8F7',
                            color: SyncAspectRatio ? '#1D4ED8' : '#A8A29E',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          title={SyncAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                        >
                          {SyncAspectRatio ? <SyncLink size={15} /> : <UnLink size={15} />}
                        </button>
                      </div>

                      <div style={{ minWidth: 0 }}>
                      <FieldGroup label="Height">
                        <NumberInput
                          value={Height}
                          onChange={val => ResizeResolution(val, 'Height')}
                          suffix="px"
                          disabled={SyncAspectRatio}
                        />
                      </FieldGroup>
                      </div>
                    </div>

                    {/* Aspect ratio toggle */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <ToggleSwitch
                        checked={SyncAspectRatio}
                        onChange={setSyncAspectRatio}
                      />
                      <span style={{ fontSize: '12px', color: '#78716C', fontWeight: 500 }}>
                        Maintain aspect ratio
                      </span>
                    </label>
                  </div>
                </section>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#E4E2DE' }} />

                {/* ── Section: Export ── */}
                <section>
                  <SectionLabel noMargin style={{ marginBottom: '14px' }}>Export</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Size row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#F9F8F7',
                        borderRadius: '6px',
                        border: '1px solid #E4E2DE',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#78716C', fontWeight: 500 }}>Estimated size</span>
                      <span style={{ fontSize: '12px', color: '#15803D', fontWeight: 700 }}>{size}</span>
                    </div>
                    {/* Download button */}
                    <a
                      href={PNGDataURL}
                      download={`converted-${FileName.replace('.svg', '')}.png`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '11px 0',
                        backgroundColor: '#1D4ED8',
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        boxShadow: '0 1px 3px rgba(29,78,216,0.3)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1E40AF')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download PNG
                    </a>
                  </div>
                </section>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #E4E2DE',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span style={{ fontSize: '11px', color: '#A8A29E', fontStyle: 'italic' }}>
              Processing is 100% local and secure
            </span>
          </div>
        </aside>

        {/* ── Right Preview Area ── */}
        <section
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#F5F4F2',
          }}
        >
          {!SVGData ? (
            /* Empty State */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '16px',
                  backgroundColor: '#EEEDE9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4C0BA" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#44403C', marginBottom: '6px' }}>No image selected</h2>
                <p style={{ fontSize: '13px', color: '#A8A29E', maxWidth: '260px', lineHeight: 1.5 }}>
                  Upload an SVG file from the panel on the left to begin.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 20,
                  display: 'flex',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4E2DE',
                  borderRadius: '8px',
                  padding: '3px',
                  gap: '2px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <TabPill active>Live Preview</TabPill>
                <TabPill active={false} disabled>Inspect Result</TabPill>
              </div>

              {/* Image Canvas */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '64px 32px 48px',
                  backgroundImage: `
                    radial-gradient(circle, #C4C0BA 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundColor: '#F5F4F2',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={PNGDataURL}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{
                      position: 'relative',
                      maxWidth: '100%',
                      width: Width > 0 ? Width : 'auto',
                    }}
                  >
                    <NextuiImage
                      src={PNGDataURL}
                      alt="Converted PNG Preview"
                      className="object-contain block max-w-full h-auto"
                      width="100%"
                      radius="none"
                    />
                    {/* Dimension labels */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-26px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        pointerEvents: 'none',
                        padding: '0 2px',
                      }}
                    >
                      <DimLabel>{Width}px</DimLabel>
                      <DimLabel>{Height}px</DimLabel>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Open in new tab */}
              <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                <button
                  onClick={openInNewTab}
                  title="Open in new tab"
                  style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E2DE',
                    borderRadius: '8px',
                    color: '#78716C',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F4F2')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <input type="file" ref={FileInputRef} accept=".svg" onChange={onFileChange} style={{ display: 'none' }} />
      <canvas ref={CanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

/* ── Small UI Primitives ──────────────────────────────────────────────────── */

function SectionLabel({ children, noMargin, style }: { children: React.ReactNode; noMargin?: boolean; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#A8A29E',
        marginBottom: noMargin ? 0 : '14px',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#78716C' }}>{label}</label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${disabled ? '#EEEDE9' : '#E4E2DE'}`,
        borderRadius: '6px',
        backgroundColor: disabled ? '#FAFAF9' : '#FFFFFF',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => !disabled && (e.currentTarget.style.borderColor = '#93C5FD')}
      onBlur={e => (e.currentTarget.style.borderColor = disabled ? '#EEEDE9' : '#E4E2DE')}
    >
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value) || 0)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          padding: '7px 10px',
          fontSize: '13px',
          fontWeight: 600,
          color: disabled ? '#C4C0BA' : '#1C1917',
          backgroundColor: 'transparent',
          minWidth: 0,
        }}
      />
      {suffix && (
        <span
          style={{
            fontSize: '11px',
            color: '#A8A29E',
            padding: '0 10px 0 0',
            fontWeight: 500,
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '34px',
        height: '20px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: checked ? '#1D4ED8' : '#D6D3D1',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.2s',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '17px' : '3px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

function TabPill({ children, active, disabled }: { children: React.ReactNode; active: boolean; disabled?: boolean }) {
  return (
    <div
      style={{
        padding: '5px 14px',
        borderRadius: '5px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        color: active ? '#1C1917' : '#A8A29E',
        backgroundColor: active ? '#F5F4F2' : 'transparent',
        opacity: disabled ? 0.4 : 1,
        userSelect: 'none',
        transition: 'background-color 0.15s',
      }}
    >
      {children}
    </div>
  );
}

function DimLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 600,
        color: '#A8A29E',
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: '1px 5px',
        borderRadius: '3px',
        backdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </span>
  );
}

export default App;
