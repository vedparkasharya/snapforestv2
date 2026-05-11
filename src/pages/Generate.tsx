import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles,
  Wand2,
  Download,
  ImageIcon,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { images } from '@/lib/api';
import { useAuthContext } from '@/providers/AuthProvider';

const styles = [
  { id: 'realistic', label: 'Realistic', icon: ImageIcon },
  { id: 'artistic', label: 'Artistic', icon: Sparkles },
  { id: 'anime', label: 'Anime', icon: Wand2 },
  { id: 'watercolor', label: 'Watercolor', icon: Sparkles },
  { id: 'oil-painting', label: 'Oil Painting', icon: ImageIcon },
  { id: 'sketch', label: 'Sketch', icon: Wand2 },
  { id: '3d-render', label: '3D Render', icon: Sparkles },
  { id: 'digital-art', label: 'Digital Art', icon: ImageIcon },
];

const aspectRatios = [
  { id: '1:1', label: 'Square', dimensions: '1024x1024' },
  { id: '16:9', label: 'Landscape', dimensions: '1024x576' },
  { id: '9:16', label: 'Portrait', dimensions: '576x1024' },
  { id: '4:3', label: 'Standard', dimensions: '1024x768' },
  { id: '3:2', label: 'Photo', dimensions: '1024x683' },
];

export default function Generate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill prompts
  const examplePrompts = [
    'A mystical forest with glowing trees and fireflies at twilight',
    'A futuristic cityscape with flying cars and neon lights',
    'A serene Japanese garden with cherry blossoms and a koi pond',
    'A majestic dragon soaring through stormy clouds',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to generate images');
      navigate('/login');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Call backend to initiate generation
      await images.generate({
        prompt,
        style: selectedStyle,
        aspectRatio: selectedRatio,
      });

      // For demo, generate a creative gradient-based image
      // In production, this would come from the AI service
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const ratio = aspectRatios.find(r => r.id === selectedRatio);
      const [width, height] = ratio ? ratio.dimensions.split('x').map(Number) : [1024, 1024];
      canvas.width = width;
      canvas.height = height;

      // Create gradient background based on style
      const gradients: Record<string, [string, string]> = {
        realistic: ['#1a1a2e', '#16213e'],
        artistic: ['#2d1b69', '#0f3460'],
        anime: ['#ff6b9d', '#c44fd1'],
        watercolor: ['#667eea', '#764ba2'],
        'oil-painting': ['#f093fb', '#f5576c'],
        sketch: ['#434343', '#000000'],
        '3d-render': ['#11998e', '#38ef7d'],
        'digital-art': ['#fc466b', '#3f5efb'],
      };

      const [color1, color2] = gradients[selectedStyle] || gradients.realistic;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add some shapes for visual interest
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 100 + 50,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`;
        ctx.fill();
      }

      // Add text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `bold ${Math.floor(width / 15)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Word wrap
      const words = prompt.split(' ');
      let line = '';
      const lines = [];
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width * 0.8 && line !== '') {
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineHeight = Math.floor(width / 12);
      const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((l, i) => {
        ctx.fillText(l, width / 2, startY + i * lineHeight);
      });

      // Add style label
      ctx.font = `${Math.floor(width / 30)}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`Style: ${selectedStyle} | SnapForest AI`, width / 2, height - 40);

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
      toast.success('Image generated successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      if (error.response?.data?.code === 'NO_GENERATIONS') {
        toast.error('No generations left. Please upgrade your plan.');
        navigate('/pricing');
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate image');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    setIsSaving(true);
    try {
      await images.save({
        imageBase64: generatedImage,
        prompt,
        title: `AI Art - ${prompt.substring(0, 30)}`,
        style: selectedStyle,
        aspectRatio: selectedRatio,
      });
      toast.success('Image saved to your gallery!');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `snapforest-${Date.now()}.png`;
    link.click();
    toast.success('Image downloaded!');
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            AI Image{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-muted-foreground">
            Describe your vision and watch AI bring it to life
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Prompt Input */}
            <div className="p-6 rounded-2xl border bg-card">
              <label className="block text-sm font-medium mb-2">
                Describe your image
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A magical forest with glowing mushrooms and fairy lights..."
                className="min-h-[120px] resize-none"
              />
              
              {/* Example Prompts */}
              <div className="mt-3 flex flex-wrap gap-2">
                {examplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-muted-foreground"
                  >
                    {p.length > 40 ? p.substring(0, 40) + '...' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="p-6 rounded-2xl border bg-card">
              <label className="block text-sm font-medium mb-3">
                Art Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      selectedStyle === style.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-border hover:border-emerald-500/30 hover:bg-muted'
                    }`}
                  >
                    <style.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="p-6 rounded-2xl border bg-card">
              <label className="block text-sm font-medium mb-3">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-5 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                      selectedRatio === ratio.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-border hover:border-emerald-500/30 hover:bg-muted'
                    }`}
                  >
                    <div
                      className="border-2 border-current rounded"
                      style={{
                        width: ratio.id === '9:16' ? '16px' : ratio.id === '16:9' ? '32px' : '24px',
                        height: ratio.id === '9:16' ? '32px' : ratio.id === '16:9' ? '16px' : '24px',
                      }}
                    />
                    <span className="text-xs">{ratio.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center"
          >
            <div className="w-full aspect-square rounded-2xl border bg-muted/50 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-muted-foreground animate-pulse">
                      Creating your masterpiece...
                    </p>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                    {/* Actions */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-white/90 text-black hover:bg-white backdrop-blur-sm"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={handleDownload}
                        variant="secondary"
                        className="flex-1 backdrop-blur-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => setGeneratedImage(null)}
                        variant="destructive"
                        size="icon"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-8"
                  >
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Your creation will appear here</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Enter a prompt, select your style, and click Generate to create amazing AI art
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
