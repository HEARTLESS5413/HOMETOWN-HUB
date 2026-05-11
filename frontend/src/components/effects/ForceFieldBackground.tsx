'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface ForceFieldBackgroundProps {
  imageUrl?: string;
  hue?: number;
  saturation?: number;
  threshold?: number;
  minStroke?: number;
  maxStroke?: number;
  spacing?: number;
  noiseScale?: number;
  density?: number;
  invertImage?: boolean;
  invertWireframe?: boolean;
  magnifierEnabled?: boolean;
  magnifierRadius?: number;
  forceStrength?: number;
  friction?: number;
  restoreSpeed?: number;
  className?: string;
}

export function ForceFieldBackground({
  imageUrl = "https://cdn.pixabay.com/photo/2024/12/13/20/29/alps-9266131_1280.jpg",
  hue = 210,
  saturation = 100,
  threshold = 255,
  minStroke = 2,
  maxStroke = 6,
  spacing = 10,
  noiseScale = 0,
  density = 2.0,
  invertImage = true,
  invertWireframe = true,
  magnifierEnabled = true,
  magnifierRadius = 150,
  forceStrength = 10,
  friction = 0.9,
  restoreSpeed = 0.05,
  className = "",
}: ForceFieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const propsRef = useRef({
    hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
    density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
    forceStrength, friction, restoreSpeed
  });

  useEffect(() => {
    propsRef.current = {
      hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
      density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
      forceStrength, friction, restoreSpeed
    };
  }, [hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius, forceStrength, friction, restoreSpeed]);

  useEffect(() => {
    if (!containerRef.current) return;

    let myP5: any = null;
    let cancelled = false;

    // Dynamically import p5 to avoid SSR issues
    import('p5').then((p5Module) => {
      if (cancelled) return;
      const p5 = p5Module.default;

      if (!containerRef.current) return;

      // Cleanup previous instance
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }

      const sketch = (p: any) => {
        let originalImg: any = null;
        let img: any = null;
        let palette: any[] = [];
        let points: {
          pos: any;
          originalPos: any;
          vel: any;
        }[] = [];

        let lastHue = -1;
        let lastSaturation = -1;
        let lastSpacing = -1;
        let lastNoiseScale = -1;
        let lastDensity = -1;
        let lastInvertImage: boolean | null = null;
        let magnifierX = 0;
        let magnifierY = 0;
        let magnifierInertia = 0.1;
        let imageLoaded = false;

        // p5.js 2.0: no preload(), use async setup() instead
        p.setup = async () => {
          const container = containerRef.current;
          if (!container) return;
          const { clientWidth, clientHeight } = container;
          const canvas = p.createCanvas(clientWidth, clientHeight);
          canvas.style('display', 'block');

          magnifierX = p.width / 2;
          magnifierY = p.height / 2;

          // Load image asynchronously in setup (p5.js 2.0 pattern)
          try {
            originalImg = await p.loadImage(imageUrl);
            imageLoaded = true;
            setIsLoading(false);
            processImage();
            generatePalette(propsRef.current.hue, propsRef.current.saturation);
            generatePoints();
          } catch (err) {
            console.error("Failed to load image for force field:", err);
            setError("Failed to load image");
            setIsLoading(false);
          }
        };

        p.windowResized = () => {
          if (!containerRef.current || !imageLoaded) return;
          const { clientWidth, clientHeight } = containerRef.current;
          p.resizeCanvas(clientWidth, clientHeight);
          processImage();
          generatePoints();
        };

        function processImage() {
          if (!originalImg) return;
          img = originalImg.get();
          if (p.width > 0 && p.height > 0) {
            img.resize(p.width, p.height);
          }
          img.filter(p.GRAY);

          if (propsRef.current.invertImage) {
            img.loadPixels();
            for (let i = 0; i < img.pixels.length; i += 4) {
              img.pixels[i] = 255 - img.pixels[i];
              img.pixels[i + 1] = 255 - img.pixels[i + 1];
              img.pixels[i + 2] = 255 - img.pixels[i + 2];
            }
            img.updatePixels();
          }
          lastInvertImage = propsRef.current.invertImage;
        }

        function generatePalette(h: number, s: number) {
          palette = [];
          p.push();
          p.colorMode(p.HSL);
          for (let i = 0; i < 12; i++) {
            let lightness = p.map(i, 0, 11, 95, 5);
            palette.push(p.color(h, s, lightness));
          }
          p.pop();
        }

        function generatePoints() {
          if (!img) return;
          points = [];
          const { spacing, density, noiseScale } = propsRef.current;
          const safeSpacing = Math.max(2, spacing);

          for (let y = 0; y < img.height; y += safeSpacing) {
            for (let x = 0; x < img.width; x += safeSpacing) {
              if (p.random() > density) continue;

              let nx = p.noise(x * noiseScale, y * noiseScale) - 0.5;
              let ny = p.noise((x + 500) * noiseScale, (y + 500) * noiseScale) - 0.5;
              let px = x + nx * safeSpacing;
              let py = y + ny * safeSpacing;

              points.push({
                pos: p.createVector(px, py),
                originalPos: p.createVector(px, py),
                vel: p.createVector(0, 0)
              });
            }
          }

          lastSpacing = spacing;
          lastNoiseScale = noiseScale;
          lastDensity = density;
        }

        function applyForceField(mx: number, my: number) {
          const props = propsRef.current;
          if (!props.magnifierEnabled) return;

          const mouseVec = p.createVector(mx, my);

          for (let pt of points) {
            // Use p5.Vector static method (works in p5.js 2.0)
            let dir = p5.Vector.sub(pt.pos, mouseVec);
            let d = dir.mag();

            if (d < props.magnifierRadius) {
              dir.normalize();
              let force = p5.Vector.mult(dir, props.forceStrength / Math.max(1, d));
              pt.vel.add(force);
            }

            pt.vel.mult(props.friction);

            let restore = p5.Vector.sub(pt.originalPos, pt.pos).mult(props.restoreSpeed);
            pt.vel.add(restore);

            pt.pos.add(pt.vel);
          }
        }

        p.draw = () => {
          if (!img || !imageLoaded) return;
          p.background(0);

          const props = propsRef.current;

          if (props.hue !== lastHue || props.saturation !== lastSaturation) {
            generatePalette(props.hue, props.saturation);
            lastHue = props.hue;
            lastSaturation = props.saturation;
          }

          if (props.invertImage !== lastInvertImage) {
            processImage();
          }

          if (props.spacing !== lastSpacing || props.noiseScale !== lastNoiseScale || props.density !== lastDensity) {
            generatePoints();
          }

          magnifierX = p.lerp(magnifierX, p.mouseX, magnifierInertia);
          magnifierY = p.lerp(magnifierY, p.mouseY, magnifierInertia);

          applyForceField(magnifierX, magnifierY);

          img.loadPixels();
          p.noFill();

          for (let pt of points) {
            let x = pt.pos.x;
            let y = pt.pos.y;
            let d = p.dist(x, y, magnifierX, magnifierY);

            let px = p.constrain(p.floor(x), 0, img.width - 1);
            let py = p.constrain(p.floor(y), 0, img.height - 1);

            let index = (px + py * img.width) * 4;
            let brightness = img.pixels[index];

            if (brightness === undefined) continue;

            let condition = props.invertWireframe
              ? brightness < props.threshold
              : brightness > props.threshold;

            if (condition) {
              let shadeIndex = Math.floor(p.map(brightness, 0, 255, 0, palette.length - 1));
              shadeIndex = p.constrain(shadeIndex, 0, palette.length - 1);

              let strokeSize = p.map(brightness, 0, 255, props.minStroke, props.maxStroke);

              if (props.magnifierEnabled && d < props.magnifierRadius) {
                let factor = p.map(d, 0, props.magnifierRadius, 2, 1);
                strokeSize *= factor;
              }

              if (palette[shadeIndex]) {
                p.stroke(palette[shadeIndex]);
                p.strokeWeight(strokeSize);
                p.point(x, y);
              }
            }
          }
        };
      };

      myP5 = new p5(sketch, containerRef.current!);
      p5InstanceRef.current = myP5;
    });

    return () => {
      cancelled = true;
      if (myP5) {
        myP5.remove();
      }
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-black ${className}`}
      ref={containerRef}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-white/30 text-xs tracking-widest uppercase">
              Initializing...
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500/50 text-xs tracking-widest uppercase z-10">
          {error}
        </div>
      )}
    </div>
  );
}

export default ForceFieldBackground;
