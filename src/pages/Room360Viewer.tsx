import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  ChevronLeft,
  Loader2,
  RotateCw,
  Move,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function Room360Viewer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { data: room, isLoading } = trpc.room.byId.useQuery({ id: roomId });

  const panoramaUrl = room?.threeSixtyImage || room?.featuredImage ||
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1600";

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = panoramaUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [panoramaUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current || !imageLoaded) return;

    const img = imageRef.current;

    const draw = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);

      const viewWidth = canvas.offsetWidth;
      const viewHeight = canvas.offsetHeight;

      // Fill background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // Calculate visible portion of the panoramic image
      const imgWidth = img.width;
      const imgHeight = img.height;

      const zoomedWidth = viewWidth * zoom;
      const zoomedHeight = viewHeight * zoom;

      const offsetX = (rotation.x % 1) * imgWidth;
      const offsetY = Math.max(0, Math.min(imgHeight - imgHeight * 0.3, rotation.y * imgHeight * 0.3));

      // Draw the panoramic slice
      const sourceX = Math.abs(offsetX) % imgWidth;
      const sourceWidth = Math.min(imgWidth - sourceX, imgWidth);
      const sourceHeight = imgHeight * 0.6; // Take middle 60% vertically

      ctx.drawImage(
        img,
        sourceX, imgHeight * 0.2 + offsetY * 0.5, sourceWidth, sourceHeight,
        0, 0, zoomedWidth, zoomedHeight
      );

      // If the slice doesn't fill the canvas, draw the remaining part from the beginning
      if (sourceX + sourceWidth < imgWidth && zoomedWidth < viewWidth) {
        ctx.drawImage(
          img,
          0, imgHeight * 0.2 + offsetY * 0.5, viewWidth - zoomedWidth, sourceHeight,
          zoomedWidth, 0, viewWidth - zoomedWidth, zoomedHeight
        );
      }

      // Draw gradient overlay at bottom
      const gradient = ctx.createLinearGradient(0, viewHeight - 100, 0, viewHeight);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, "rgba(15, 23, 42, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, viewHeight - 100, viewWidth, 100);
    };

    draw();

    // Auto-rotate slowly
    const interval = setInterval(() => {
      if (!isDragging) {
        setRotation((prev) => ({ ...prev, x: prev.x + 0.001 }));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [imageLoaded, rotation, zoom, isDragging]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - dragStart.x) / 500;
      const deltaY = (e.clientY - dragStart.y) / 500;
      setRotation((prev) => ({
        x: prev.x + deltaX,
        y: Math.max(-1, Math.min(1, prev.y + deltaY)),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const deltaX = (touch.clientX - dragStart.x) / 500;
      const deltaY = (touch.clientY - dragStart.y) / 500;
      setRotation((prev) => ({
        x: prev.x + deltaX,
        y: Math.max(-1, Math.min(1, prev.y + deltaY)),
      }));
      setDragStart({ x: touch.clientX, y: touch.clientY });
    };
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(2, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.2));
  const handleReset = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-dark text-white relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <h1 className="text-sm font-bold">{room?.title || "360° View"}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      />

      {/* Controls */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-2xl p-2">
        <button onClick={handleZoomOut} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={handleReset} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
          <RotateCw className="w-5 h-5" />
        </button>
        <button onClick={handleZoomIn} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Instructions */}
      {!isDragging && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2"
        >
          <Move className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-gray-300">Drag to look around</span>
        </motion.div>
      )}
    </div>
  );
}
