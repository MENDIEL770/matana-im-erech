"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Type, Trash2, ZoomIn, ZoomOut, RotateCcw, Loader2, X } from "lucide-react";

interface FontEntry { name: string; url: string; }

interface Layer {
  id: string;
  type: "logo" | "text";
  src?: string;       // for logo
  text?: string;      // for text
  fontUrl?: string;
  fontName?: string;
  fontSize?: number;
  color?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  productImage: string;
  productName: string;
  fonts: FontEntry[];
  onSave: (data: { layers: Layer[]; preview: string }) => void;
  onClose: () => void;
}

const CANVAS_W = 600;
const CANVAS_H = 600;

export function CustomizationEditor({ productImage, productName, fonts, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [layerImages, setLayerImages] = useState<Record<string, HTMLImageElement>>({});
  const [removingBg, setRemovingBg] = useState(false);
  const [tab, setTab] = useState<"logo" | "text">("logo");
  const [textInput, setTextInput] = useState("");
  const [selectedFont, setSelectedFont] = useState<FontEntry | null>(fonts[0] ?? null);
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(32);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load background product image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBgImage(img);
    img.src = productImage;
  }, [productImage]);

  // Load custom fonts
  useEffect(() => {
    fonts.forEach((f) => {
      if (loadedFonts.has(f.url)) return;
      const font = new FontFace(f.name, `url(${f.url})`);
      font.load().then((loaded) => {
        document.fonts.add(loaded);
        setLoadedFonts((prev) => new Set([...prev, f.url]));
      }).catch(() => {});
    });
  }, [fonts, loadedFonts]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, CANVAS_W, CANVAS_H);
    } else {
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // Layers
    layers.forEach((layer) => {
      const isSelected = layer.id === selected;

      if (layer.type === "logo" && layer.src) {
        const img = layerImages[layer.id];
        if (img) {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        }
      } else if (layer.type === "text" && layer.text) {
        ctx.save();
        ctx.font = `${layer.fontSize ?? 32}px '${layer.fontName ?? "sans-serif"}'`;
        ctx.fillStyle = layer.color ?? "#000000";
        ctx.textBaseline = "top";
        ctx.fillText(layer.text, layer.x, layer.y);
        const metrics = ctx.measureText(layer.text);
        // update width for hit testing
        layer.width = metrics.width;
        layer.height = (layer.fontSize ?? 32) * 1.2;
        ctx.restore();
      }

      // Selection border + resize handle
      if (isSelected) {
        ctx.strokeStyle = "#B08D57";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8);
        ctx.setLineDash([]);
        // resize handle (bottom-right)
        ctx.fillStyle = "#B08D57";
        ctx.fillRect(layer.x + layer.width + 2, layer.y + layer.height + 2, 12, 12);
      }
    });
  }, [bgImage, layers, layerImages, selected]);

  useEffect(() => { draw(); }, [draw]);

  const getLayerAt = (x: number, y: number) => {
    return [...layers].reverse().find(
      (l) => x >= l.x - 4 && x <= l.x + l.width + 8 && y >= l.y - 4 && y <= l.y + l.height + 8
    );
  };

  const getCanvasPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e);
    const layer = getLayerAt(x, y);
    if (!layer) { setSelected(null); return; }
    setSelected(layer.id);

    // Check resize handle
    const rx = layer.x + layer.width + 2;
    const ry = layer.y + layer.height + 2;
    if (x >= rx && x <= rx + 12 && y >= ry && y <= ry + 12) {
      setResizing(true);
      setResizeStart({ x, y, w: layer.width, h: layer.height });
    } else {
      setDragging(true);
      setDragOffset({ x: x - layer.x, y: y - layer.y });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!selected) return;
    const { x, y } = getCanvasPos(e);
    if (dragging) {
      setLayers((prev) =>
        prev.map((l) => l.id === selected ? { ...l, x: x - dragOffset.x, y: y - dragOffset.y } : l)
      );
    } else if (resizing) {
      const dx = x - resizeStart.x;
      const dy = y - resizeStart.y;
      setLayers((prev) =>
        prev.map((l) =>
          l.id === selected
            ? { ...l, width: Math.max(20, resizeStart.w + dx), height: Math.max(20, resizeStart.h + dy) }
            : l
        )
      );
    }
  };

  const onMouseUp = () => { setDragging(false); setResizing(false); };

  // Upload logo
  const handleLogoUpload = async (file: File) => {
    setRemovingBg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/removebg", { method: "POST", body: fd });

      let blob: Blob;
      if (res.ok) {
        blob = await res.blob();
      } else {
        // removebg not configured — use original
        blob = file;
      }

      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const id = `logo-${Date.now()}`;
        const aspect = img.width / img.height;
        const w = 150;
        const h = w / aspect;
        const newLayer: Layer = { id, type: "logo", src: url, x: CANVAS_W / 2 - w / 2, y: CANVAS_H / 2 - h / 2, width: w, height: h };
        setLayerImages((prev) => ({ ...prev, [id]: img }));
        setLayers((prev) => [...prev, newLayer]);
        setSelected(id);
      };
      img.src = url;
    } catch {
      alert("שגיאה בעיבוד התמונה");
    } finally {
      setRemovingBg(false);
    }
  };

  // Add text layer
  const handleAddText = () => {
    if (!textInput.trim()) return;
    const id = `text-${Date.now()}`;
    const newLayer: Layer = {
      id, type: "text", text: textInput,
      fontUrl: selectedFont?.url, fontName: selectedFont?.name ?? "sans-serif",
      fontSize, color: textColor,
      x: 50, y: CANVAS_H / 2, width: 200, height: fontSize * 1.2,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelected(id);
    setTextInput("");
  };

  const deleteSelected = () => {
    setLayers((prev) => prev.filter((l) => l.id !== selected));
    setSelected(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preview = canvas.toDataURL("image/png");
    onSave({ layers, preview });
  };

  const selectedLayer = layers.find((l) => l.id === selected);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-[#0F2747] text-lg">עיצוב אישי — {productName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">גרור את הלוגו/טקסט למיקום הרצוי על המוצר</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="flex flex-col lg:flex-row gap-0">
          {/* Canvas */}
          <div className="flex-1 p-4 bg-gray-50 flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="w-full max-w-[500px] rounded-lg border border-gray-200 shadow cursor-crosshair"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
            {/* Selection controls */}
            {selectedLayer && (
              <div className="flex items-center gap-2">
                <button onClick={deleteSelected} className="flex items-center gap-1 px-3 py-1.5 text-red-500 border border-red-200 rounded-full text-xs hover:bg-red-50">
                  <Trash2 size={12} /> מחק
                </button>
                {selectedLayer.type === "text" && (
                  <>
                    <input type="color" value={selectedLayer.color} onChange={(e) => setLayers((p) => p.map((l) => l.id === selected ? { ...l, color: e.target.value } : l))} className="w-7 h-7 rounded cursor-pointer border border-gray-200" title="צבע" />
                    <input type="range" min={12} max={120} value={selectedLayer.fontSize} onChange={(e) => setLayers((p) => p.map((l) => l.id === selected ? { ...l, fontSize: Number(e.target.value) } : l))} className="w-24" title="גודל" />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Panel */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-r border-gray-100 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button onClick={() => setTab("logo")} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 ${tab === "logo" ? "text-[#B08D57] border-b-2 border-[#B08D57]" : "text-gray-400"}`}>
                <Upload size={14} /> לוגו
              </button>
              <button onClick={() => setTab("text")} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 ${tab === "text" ? "text-[#B08D57] border-b-2 border-[#B08D57]" : "text-gray-400"}`}>
                <Type size={14} /> טקסט
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {tab === "logo" ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">העלה קובץ PNG/JPG — הרקע יוסר אוטומטית</p>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${removingBg ? "border-gray-200 bg-gray-50" : "border-[#ECE8E2] hover:border-[#B08D57] hover:bg-[#FAF8F5]"}`}>
                    <input type="file" accept="image/*" className="hidden" disabled={removingBg}
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                    {removingBg ? (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 size={20} className="animate-spin text-[#B08D57]" />
                        <span className="text-xs">מסיר רקע...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Upload size={20} className="text-[#B08D57]" />
                        <span className="text-xs text-center">לחץ להעלאת לוגו</span>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">טקסט</label>
                    <input value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddText()}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B08D57]" placeholder="הכנס טקסט..." />
                  </div>
                  {fonts.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">פונט</label>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {fonts.map((f) => (
                          <button key={f.url} onClick={() => setSelectedFont(f)}
                            style={{ fontFamily: f.name }}
                            className={`w-full text-right px-3 py-2 rounded-lg text-sm border transition-colors ${selectedFont?.url === f.url ? "border-[#B08D57] bg-[#FAF8F5] text-[#B08D57]" : "border-gray-100 hover:border-gray-200"}`}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">צבע</label>
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">גודל: {fontSize}px</label>
                      <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
                    </div>
                  </div>
                  <button onClick={handleAddText} disabled={!textInput.trim()}
                    className="w-full py-2 bg-[#B08D57] text-white text-sm rounded-lg hover:bg-[#9a7a48] disabled:opacity-40 transition-colors">
                    הוסף לקנבס
                  </button>
                </div>
              )}
            </div>

            {/* Save */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <button onClick={handleSave} disabled={layers.length === 0}
                className="w-full py-2.5 bg-[#0F2747] text-white text-sm rounded-lg hover:bg-[#1a3a6e] disabled:opacity-40 transition-colors font-medium">
                שמור ועבור להזמנה
              </button>
              <button onClick={onClose} className="w-full py-2 text-gray-400 text-sm hover:text-gray-600">ביטול</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
