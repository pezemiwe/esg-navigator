import { useEffect, useRef } from "react";

export type HeroCanvasMode = "physical" | "transition";

export function useHeroCanvas(mode: HeroCanvasMode = "physical") {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0,
      H = 0;
    let animationFrameId: number;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const DEG = Math.PI / 180;
    const CLAT = 8 * DEG;
    let globeAngle = 18 * DEG;

    function resize() {
      if (!canvas) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx?.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();

    function ortho(
      lat: number,
      lon: number,
      cx: number,
      cy: number,
      R: number,
      clon: number,
    ) {
      const la = lat * DEG,
        lo = lon * DEG;
      const d =
        Math.sin(CLAT) * Math.sin(la) +
        Math.cos(CLAT) * Math.cos(la) * Math.cos(lo - clon);
      if (d < 0) return null;
      return {
        x: cx + R * Math.cos(la) * Math.sin(lo - clon),
        y:
          cy -
          R *
            (Math.cos(CLAT) * Math.sin(la) -
              Math.sin(CLAT) * Math.cos(la) * Math.cos(lo - clon)),
        d,
      };
    }

    function polyPath(
      poly: [number, number][],
      cx: number,
      cy: number,
      R: number,
      clon: number,
    ) {
      if (!ctx) return;
      let started = false;
      ctx.beginPath();
      for (const [lo, la] of poly) {
        const p = ortho(la, lo, cx, cy, R, clon);
        if (!p) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
    }

    function drawPoly(
      poly: [number, number][],
      cx: number,
      cy: number,
      R: number,
      clon: number,
      fill: string,
      stroke?: string,
    ) {
      if (!ctx) return;
      polyPath(poly, cx, cy, R, clon);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    function drawStar(cx: number, cy: number, r: number, color: string) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? r : r * 0.42;
        const x = cx + Math.cos(angle) * radius,
          y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    const AFRICA: [number, number][] = [
      [-5.6, 35.8],
      [-5.3, 35.2],
      [-2.2, 35.1],
      [-1.8, 34.9],
      [0.0, 35.3],
      [1.5, 36.4],
      [3.0, 36.7],
      [5.0, 36.8],
      [7.0, 37.1],
      [8.6, 37.0],
      [9.8, 37.1],
      [10.2, 36.8],
      [10.8, 35.5],
      [11.0, 33.2],
      [12.5, 32.8],
      [15.0, 32.4],
      [18.0, 32.5],
      [20.0, 32.0],
      [23.0, 31.5],
      [25.0, 31.5],
      [27.5, 31.2],
      [29.5, 31.0],
      [30.5, 31.5],
      [32.3, 31.3],
      [33.3, 30.0],
      [33.7, 28.0],
      [34.0, 26.5],
      [34.5, 24.5],
      [35.5, 22.0],
      [36.5, 19.5],
      [37.5, 18.0],
      [38.6, 18.2],
      [39.5, 16.0],
      [40.5, 15.0],
      [42.0, 13.5],
      [43.5, 12.0],
      [45.0, 11.5],
      [47.0, 11.5],
      [49.0, 11.5],
      [51.0, 11.0],
      [51.4, 10.5],
      [51.0, 8.0],
      [50.0, 5.5],
      [48.5, 3.0],
      [47.0, 1.0],
      [45.5, -0.5],
      [44.0, -1.5],
      [42.0, -2.5],
      [41.0, -3.5],
      [40.0, -5.0],
      [39.5, -7.0],
      [39.5, -8.5],
      [40.0, -10.5],
      [40.5, -13.0],
      [40.5, -15.0],
      [40.0, -17.0],
      [38.0, -18.5],
      [36.0, -19.0],
      [35.5, -21.5],
      [35.5, -23.5],
      [35.0, -25.5],
      [33.0, -27.0],
      [31.0, -29.0],
      [30.0, -30.5],
      [29.0, -31.5],
      [28.0, -32.5],
      [27.0, -33.0],
      [26.0, -33.5],
      [24.0, -34.0],
      [22.0, -34.5],
      [20.0, -34.8],
      [18.5, -34.5],
      [18.0, -33.5],
      [17.8, -32.0],
      [17.0, -30.0],
      [16.0, -28.5],
      [15.5, -26.0],
      [14.5, -23.0],
      [13.5, -20.0],
      [12.5, -17.5],
      [12.0, -15.0],
      [11.8, -12.5],
      [12.0, -9.5],
      [12.0, -6.0],
      [12.0, -4.5],
      [11.0, -2.0],
      [9.8, -0.5],
      [9.3, 0.5],
      [9.0, 1.5],
      [9.7, 2.5],
      [9.3, 3.5],
      [8.8, 4.0],
      [8.3, 4.5],
      [7.5, 4.5],
      [6.5, 4.2],
      [5.8, 4.2],
      [5.5, 4.1],
      [5.0, 4.5],
      [4.3, 5.5],
      [3.5, 6.2],
      [2.7, 6.2],
      [1.5, 6.0],
      [0.5, 5.5],
      [-0.5, 5.0],
      [-1.5, 5.0],
      [-3.0, 5.0],
      [-5.0, 5.2],
      [-7.5, 4.5],
      [-8.5, 5.5],
      [-10.0, 6.5],
      [-11.0, 7.5],
      [-12.0, 8.0],
      [-13.0, 8.5],
      [-14.0, 10.5],
      [-15.5, 11.0],
      [-16.5, 12.5],
      [-17.0, 14.0],
      [-17.5, 14.8],
      [-16.5, 16.0],
      [-16.0, 18.5],
      [-16.5, 20.5],
      [-17.0, 21.5],
      [-17.0, 23.5],
      [-16.0, 24.5],
      [-15.0, 26.0],
      [-13.5, 27.5],
      [-11.5, 29.0],
      [-10.0, 30.5],
      [-8.0, 31.5],
      [-6.0, 33.0],
      [-5.6, 35.0],
      [-5.6, 35.8],
    ];
    const NIGERIA: [number, number][] = [
      [2.7, 6.4],
      [3.0, 6.5],
      [3.4, 6.4],
      [3.8, 6.3],
      [4.3, 6.1],
      [4.7, 5.9],
      [5.1, 5.6],
      [5.4, 5.2],
      [5.6, 4.8],
      [5.8, 4.5],
      [6.1, 4.3],
      [6.5, 4.2],
      [6.9, 4.3],
      [7.3, 4.4],
      [7.7, 4.5],
      [8.1, 4.5],
      [8.5, 4.7],
      [8.8, 5.0],
      [9.0, 5.3],
      [9.1, 5.7],
      [9.2, 6.1],
      [9.3, 6.5],
      [9.5, 7.0],
      [9.8, 7.5],
      [10.5, 7.8],
      [11.0, 8.1],
      [11.5, 8.5],
      [12.0, 8.8],
      [12.4, 9.3],
      [12.7, 9.8],
      [13.0, 10.2],
      [13.3, 10.7],
      [13.6, 11.2],
      [14.0, 11.8],
      [14.3, 12.3],
      [14.6, 12.8],
      [14.7, 13.1],
      [14.2, 13.3],
      [13.6, 13.2],
      [13.0, 13.5],
      [12.3, 13.6],
      [11.5, 13.7],
      [10.5, 13.8],
      [9.5, 13.6],
      [8.5, 13.5],
      [7.5, 13.5],
      [6.5, 13.7],
      [5.5, 13.7],
      [4.7, 13.5],
      [4.0, 13.3],
      [3.6, 12.5],
      [3.3, 11.5],
      [3.0, 10.5],
      [2.8, 9.5],
      [2.7, 8.5],
      [2.7, 7.5],
      [2.7, 6.4],
    ];
    const GHANA: [number, number][] = [
      [-3.1, 4.7],
      [-2.7, 4.8],
      [-2.3, 4.9],
      [-1.8, 5.0],
      [-1.3, 5.1],
      [-0.8, 5.2],
      [-0.3, 5.3],
      [0.0, 5.5],
      [0.4, 5.6],
      [0.8, 5.8],
      [1.0, 6.0],
      [1.2, 6.1],
      [1.2, 6.5],
      [1.0, 7.0],
      [0.7, 7.5],
      [0.5, 8.0],
      [0.4, 8.5],
      [0.3, 9.0],
      [0.2, 9.5],
      [0.0, 10.0],
      [-0.1, 10.5],
      [-0.1, 11.0],
      [-0.5, 11.1],
      [-1.0, 11.0],
      [-1.5, 11.1],
      [-2.0, 11.0],
      [-2.5, 11.0],
      [-3.0, 11.0],
      [-3.2, 10.5],
      [-3.1, 10.0],
      [-3.0, 9.5],
      [-3.0, 9.0],
      [-2.9, 8.5],
      [-2.9, 8.0],
      [-3.0, 7.5],
      [-3.0, 7.0],
      [-3.1, 6.5],
      [-3.1, 6.0],
      [-3.0, 5.5],
      [-3.1, 4.7],
    ];
    const KENYA: [number, number][] = [
      [34.0, -1.0],
      [34.0, 0.0],
      [34.0, 1.0],
      [34.5, 2.0],
      [35.0, 3.0],
      [35.5, 3.5],
      [36.0, 4.0],
      [37.0, 4.5],
      [38.0, 4.0],
      [39.0, 3.5],
      [40.5, 4.0],
      [41.0, 3.0],
      [41.5, 2.0],
      [41.5, 0.5],
      [41.0, -1.0],
      [40.5, -2.0],
      [40.0, -2.5],
      [39.0, -4.5],
      [37.5, -3.5],
      [37.0, -3.0],
      [36.0, -2.0],
      [35.0, -1.5],
      [34.0, -1.0],
    ];
    const SAFRICA: [number, number][] = [
      [17.0, -29.0],
      [17.5, -30.5],
      [18.0, -32.0],
      [18.5, -33.5],
      [19.0, -34.2],
      [20.0, -34.8],
      [22.0, -34.5],
      [24.0, -34.0],
      [26.0, -33.5],
      [27.5, -33.0],
      [28.5, -32.2],
      [29.5, -31.0],
      [30.5, -30.0],
      [31.0, -29.0],
      [32.0, -28.5],
      [32.5, -27.5],
      [32.8, -26.5],
      [32.0, -25.0],
      [31.5, -24.0],
      [31.0, -23.0],
      [30.5, -22.5],
      [29.5, -22.2],
      [29.0, -22.0],
      [28.0, -22.5],
      [27.0, -23.0],
      [25.5, -24.0],
      [24.0, -25.0],
      [22.0, -26.5],
      [20.5, -27.0],
      [19.0, -28.0],
      [17.0, -29.0],
    ];
    const EGYPT: [number, number][] = [
      [25.0, 22.0],
      [28.0, 22.0],
      [31.0, 22.0],
      [34.5, 22.0],
      [36.0, 22.0],
      [36.8, 23.5],
      [35.8, 25.0],
      [35.0, 27.0],
      [34.5, 28.0],
      [33.5, 29.5],
      [32.3, 31.3],
      [31.0, 31.5],
      [30.0, 31.3],
      [29.0, 31.0],
      [27.5, 31.2],
      [25.0, 31.5],
      [25.0, 29.0],
      [25.0, 27.0],
      [25.0, 25.0],
      [25.0, 22.0],
    ];
    const ETHIOPIA: [number, number][] = [
      [33.0, 8.0],
      [33.5, 10.0],
      [34.0, 12.0],
      [35.0, 14.0],
      [36.0, 14.5],
      [37.5, 15.0],
      [39.5, 15.0],
      [40.5, 14.5],
      [41.5, 14.0],
      [42.5, 13.5],
      [43.0, 12.0],
      [44.0, 10.5],
      [45.0, 9.0],
      [46.0, 8.0],
      [47.5, 8.0],
      [48.0, 5.5],
      [46.0, 4.5],
      [44.0, 4.5],
      [42.0, 4.0],
      [41.0, 4.0],
      [40.0, 4.5],
      [38.0, 4.0],
      [36.0, 5.0],
      [34.5, 5.5],
      [33.0, 8.0],
    ];

    const PHYSICAL_HAZARDS = [
      "EXTREME HEAT",
      "DROUGHT",
      "TROPICAL CYCLONES",
      "THUNDERSTORMS",
      "HARMATTAN DUST",
      "HEAVY RAINFALL",
      "RIVER FLOODING",
      "FLASH FLOODING",
      "COASTAL FLOODING",
      "STORM SURGE",
      "LANDSLIDES",
      "BANK EROSION",
      "GROUNDWATER FLOOD",
      "SEA LEVEL RISE",
      "DESERTIFICATION",
      "WILDFIRE",
      "WATER SCARCITY",
      "GLACIAL RETREAT",
      "EARTHQUAKES",
      "VOLCANIC ERUPTION",
      "TSUNAMIS",
    ];

    const TRANSITION_HAZARDS = [
      "CARBON PRICING",
      "POLICY REGULATION",
      "STRANDED ASSETS",
      "TECHNOLOGY SHIFT",
      "MARKET SENTIMENT",
      "LEGAL LIABILITY",
      "NDC ALIGNMENT",
      "REVENUE EROSION",
      "GREEN TAXONOMY",
      "FOSSIL PHASE-OUT",
      "ENERGY TRANSITION",
      "SCOPE 3 EXPOSURE",
      "SUPPLY CHAIN RISK",
      "DISCLOSURE GAP",
      "GREENWASHING RISK",
      "CAPEX REALLOCATION",
      "CREDIT MIGRATION",
      "CONSUMER SHIFT",
      "SUBSIDY REMOVAL",
      "TRADE BARRIERS",
      "ESG DOWNGRADE",
    ];

    const HAZARDS =
      mode === "transition" ? TRANSITION_HAZARDS : PHYSICAL_HAZARDS;

    let particles: {
      x: number;
      y: number;
      r: number;
      a: number;
      ts: number;
      tp: number;
    }[] = [];
    function spawnParticles() {
      particles = Array.from({ length: 160 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 0.85 + 0.15,
        a: Math.random() * 0.28 + 0.04,
        ts: Math.random() * 0.005 + 0.002,
        tp: Math.random() * Math.PI * 2,
      }));
    }
    spawnParticles();

    let lastT = 0;

    function frame(t: number) {
      if (!ctx) return;
      const dt = Math.min(t - lastT, 50);
      lastT = t;
      const dark = document.documentElement.classList.contains("dark");

      globeAngle += dt * 0.000068;
      const clon = globeAngle;

      ctx.fillStyle = dark ? "#060a07" : "#F4F4F2";
      ctx.fillRect(0, 0, W, H);

      const prgb = dark ? "195,228,213" : "134,188,37";
      particles.forEach((p) => {
        const a = p.a * (0.5 + 0.5 * Math.sin(t * 0.001 * p.ts + p.tp));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${prgb},${dark ? a : a * 0.28})`;
        ctx.fill();
      });

      const R = Math.min(W, H) * 0.3;
      const GX = W * 0.74;
      const GY = H * 0.56;

      const atm = ctx.createRadialGradient(GX, GY, R * 0.9, GX, GY, R * 1.55);
      atm.addColorStop(
        0,
        dark ? "rgba(31,219,138,0.16)" : "rgba(134,188,37,0.18)",
      );
      atm.addColorStop(
        0.5,
        dark ? "rgba(31,219,138,0.04)" : "rgba(134,188,37,0.05)",
      );
      atm.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(GX, GY, R * 1.55, 0, Math.PI * 2);
      ctx.fillStyle = atm;
      ctx.fill();

      const grd = ctx.createRadialGradient(
        GX - R * 0.32,
        GY - R * 0.34,
        R * 0.02,
        GX + R * 0.1,
        GY + R * 0.15,
        R * 1.08,
      );
      grd.addColorStop(0, dark ? "#1a5035" : "#22623f");
      grd.addColorStop(0.28, dark ? "#0e2e1c" : "#143a24");
      grd.addColorStop(0.65, dark ? "#071910" : "#0a2518");
      grd.addColorStop(1, dark ? "#020c06" : "#060f0a");
      ctx.beginPath();
      ctx.arc(GX, GY, R, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      const spec = ctx.createRadialGradient(
        GX - R * 0.42,
        GY - R * 0.42,
        0,
        GX - R * 0.18,
        GY - R * 0.18,
        R * 0.64,
      );
      spec.addColorStop(0, "rgba(255,255,255,0.08)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.02)");
      spec.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(GX, GY, R, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(GX, GY, R * 0.999, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = dark
        ? "rgba(31,219,138,0.065)"
        : "rgba(134,188,37,0.09)";
      ctx.lineWidth = 0.3;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let f = true;
        for (let lo = -180; lo <= 180; lo += 2) {
          const p = ortho(lat, lo, GX, GY, R, clon);
          if (!p) {
            f = true;
            continue;
          }
          if (f) {
            ctx.moveTo(p.x, p.y);
            f = false;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for (let lo2 = -180; lo2 <= 180; lo2 += 30) {
        ctx.beginPath();
        let f = true;
        for (let la = -85; la <= 85; la += 2) {
          const p = ortho(la, lo2, GX, GY, R, clon);
          if (!p) {
            f = true;
            continue;
          }
          if (f) {
            ctx.moveTo(p.x, p.y);
            f = false;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(GX, GY, R * 0.999, 0, Math.PI * 2);
      ctx.clip();
      drawPoly(
        AFRICA,
        GX,
        GY,
        R,
        clon,
        dark ? "rgba(20,72,32,0.9)" : "rgba(18,66,28,0.84)",
        dark ? "rgba(31,219,138,0.15)" : "rgba(134,188,37,0.22)",
      );
      drawPoly(
        KENYA,
        GX,
        GY,
        R,
        clon,
        dark ? "rgba(36,102,50,0.58)" : "rgba(36,102,50,0.52)",
      );
      drawPoly(
        SAFRICA,
        GX,
        GY,
        R,
        clon,
        dark ? "rgba(36,102,50,0.58)" : "rgba(36,102,50,0.52)",
      );
      drawPoly(
        EGYPT,
        GX,
        GY,
        R,
        clon,
        dark ? "rgba(36,102,50,0.5)" : "rgba(36,102,50,0.46)",
      );
      drawPoly(
        ETHIOPIA,
        GX,
        GY,
        R,
        clon,
        dark ? "rgba(36,102,50,0.5)" : "rgba(36,102,50,0.46)",
      );

      const ghPt = ortho(7.5, -1.0, GX, GY, R, clon);
      if (ghPt) {
        drawPoly(
          GHANA,
          GX,
          GY,
          R,
          clon,
          `rgba(252,209,22,${0.75 * ghPt.d + 0.1})`,
        );
        const ghTop: [number, number][] = [
          [-3.2, 9],
          [1.2, 9],
          [1.2, 11],
          [-0.5, 11],
          [-2.5, 11],
          [-3.2, 10.5],
          [-3.2, 9],
        ];
        drawPoly(
          ghTop,
          GX,
          GY,
          R,
          clon,
          `rgba(206,17,38,${0.72 * ghPt.d + 0.1})`,
        );
        const ghBot: [number, number][] = [
          [-3.2, 5],
          [-1.5, 5],
          [0.5, 5.5],
          [1.2, 6],
          [1.2, 7],
          [-3.2, 7],
          [-3.2, 5],
        ];
        drawPoly(
          ghBot,
          GX,
          GY,
          R,
          clon,
          `rgba(0,107,63,${0.72 * ghPt.d + 0.1})`,
        );
        drawStar(
          ghPt.x,
          ghPt.y + R * 0.01,
          R * 0.03,
          `rgba(0,0,0,${Math.min(1, 0.75 * ghPt.d + 0.15)})`,
        );
      }

      const ngPt = ortho(9.0, 8.5, GX, GY, R, clon);
      if (ngPt) {
        const ngL: [number, number][] = [
          [3, 7],
          [3, 6.5],
          [3.5, 6.2],
          [6.2, 7.2],
          [6.2, 13.5],
          [5, 13],
          [3, 11],
          [3, 7],
        ];
        const ngR: [number, number][] = [
          [10.5, 8.2],
          [14, 10],
          [14.5, 11.5],
          [14, 13],
          [11.5, 14],
          [10.5, 14],
          [10.5, 8.2],
        ];
        const ngW: [number, number][] = [
          [6.2, 7.2],
          [10.5, 8.2],
          [10.5, 14],
          [8.5, 14],
          [7, 13.5],
          [6.2, 13.5],
          [6.2, 7.2],
        ];
        drawPoly(ngL, GX, GY, R, clon, `rgba(0,135,81,${0.85 * ngPt.d + 0.1})`);
        drawPoly(ngR, GX, GY, R, clon, `rgba(0,135,81,${0.85 * ngPt.d + 0.1})`);
        drawPoly(
          ngW,
          GX,
          GY,
          R,
          clon,
          `rgba(255,255,255,${0.72 * ngPt.d + 0.1})`,
        );
        drawPoly(
          NIGERIA,
          GX,
          GY,
          R,
          clon,
          "transparent",
          `rgba(0,135,81,${Math.min(1, 0.6 * ngPt.d + 0.2)})`,
        );
      }
      ctx.restore();

      const rim = ctx.createRadialGradient(GX, GY, R * 0.68, GX, GY, R);
      rim.addColorStop(0, "transparent");
      rim.addColorStop(1, dark ? "rgba(0,0,0,0.68)" : "rgba(0,0,0,0.48)");
      ctx.beginPath();
      ctx.arc(GX, GY, R, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(GX, GY, R + 3.5, 0, Math.PI * 2);
      ctx.strokeStyle = dark
        ? "rgba(31,219,138,0.30)"
        : "rgba(134,188,37,0.38)";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(GX, GY, R + 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = dark
        ? "rgba(31,219,138,0.12)"
        : "rgba(134,188,37,0.16)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const ngLbl = ortho(9, 8, GX, GY, R, clon);
      if (ngLbl && ngLbl.d > 0.05) {
        ctx.save();
        ctx.font = `bold ${Math.max(7, Math.round(R * 0.054))}px "Barlow Condensed",sans-serif`;
        ctx.fillStyle = `rgba(0,0,0,${Math.min(1, 0.4 + ngLbl.d * 0.55)})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("NIGERIA", ngLbl.x, ngLbl.y);
        ctx.restore();
      }
      const ghLbl = ortho(7.5, -1, GX, GY, R, clon);
      if (ghLbl && ghLbl.d > 0.05) {
        ctx.save();
        ctx.font = `bold ${Math.max(6, Math.round(R * 0.04))}px "Barlow Condensed",sans-serif`;
        ctx.fillStyle = `rgba(0,0,0,${Math.min(1, 0.4 + ghLbl.d * 0.5)})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GHANA", ghLbl.x, ghLbl.y);
        ctx.restore();
      }

      const GA = Math.PI * (3 - Math.sqrt(5)); // golden angle ≈ 2.3999…
      const N = HAZARDS.length; // 21
      const ORB_R = R * 1.58; // orbital sphere radius
      const rotPhi = t * 0.00013; // slow rotation

      type HNode = {
        x: number;
        y: number;
        depth: number;
        label: string;
        idx: number;
      };
      const allNodes: HNode[] = HAZARDS.map((label, i) => {
        const polar = Math.acos(1 - (2 * (i + 0.5)) / N);
        const azim = GA * i + rotPhi;
        const sx = Math.sin(polar) * Math.cos(azim);
        const sz = Math.sin(polar) * Math.sin(azim);
        const sy = Math.cos(polar);
        return {
          x: GX + sx * ORB_R,
          y: GY - sy * ORB_R * 0.88,
          depth: (sz + 1) * 0.5,
          label,
          idx: i,
        };
      });
      allNodes.sort((a, b) => a.depth - b.depth);

      allNodes.forEach(({ x, y, depth }) => {
        if (depth < 0.38) return;
        const a = (depth - 0.38) * 0.28;
        const dx = GX - x,
          dy = GY - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < R + 8) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * (1 - (R + 5) / d), y + dy * (1 - (R + 5) / d));
        ctx.strokeStyle = dark
          ? `rgba(31,219,138,${a})`
          : `rgba(134,188,37,${a * 1.2})`;
        ctx.lineWidth = 0.4;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.restore();
      });

      const usedRects: { x: number; y: number; w: number; h: number }[] = [];
      function hitTest(rx: number, ry: number, rw: number, rh: number) {
        for (const r of usedRects) {
          if (
            rx < r.x + r.w &&
            rx + rw > r.x &&
            ry < r.y + r.h &&
            ry + rh > r.y
          )
            return true;
        }
        return false;
      }

      allNodes.forEach(({ x, y, depth, label, idx }) => {
        if (depth < 0.2) {
          ctx.beginPath();
          ctx.arc(x, y, 0.6 + depth * 2, 0, Math.PI * 2);
          ctx.fillStyle = dark
            ? `rgba(31,219,138,${depth * 0.22})`
            : `rgba(134,188,37,${depth * 0.18})`;
          ctx.fill();
          return;
        }

        const alpha = Math.min(1, 0.25 + depth * 0.75);
        const dotR = 1.2 + depth * 2.6;
        const pulse = 1 + 0.12 * Math.sin(t * 0.002 + idx * 0.9);

        const glow = ctx.createRadialGradient(x, y, 0, x, y, dotR * 5 * pulse);
        glow.addColorStop(
          0,
          dark
            ? `rgba(31,219,138,${alpha * 0.24})`
            : `rgba(134,188,37,${alpha * 0.2})`,
        );
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(x, y, dotR * 5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, dotR * pulse, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(31,219,138,${alpha})`
          : `rgba(134,188,37,${alpha + 0.06})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, dotR * 2 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = dark
          ? `rgba(31,219,138,${alpha * 0.25})`
          : `rgba(134,188,37,${alpha * 0.3})`;
        ctx.lineWidth = 0.45;
        ctx.stroke();

        if (depth < 0.32) return;

        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha * 1.05);
        const fs = Math.max(7.5, 7 + depth * 2.5);
        ctx.font = `700 ${fs.toFixed(1)}px "Barlow Condensed",sans-serif`;
        const tw = ctx.measureText(label).width;
        const padX = 5,
          padY = 3;

        const onRight = x >= GX;
        const lx = onRight ? x + dotR * 2.2 + 5 : x - dotR * 2.2 - 5 - tw;
        let ly = y;

        const bw = tw + padX * 2,
          bh = fs + padY * 2;
        if (hitTest(lx - padX, ly - fs / 2 - padY, bw, bh)) {
          for (let n = 1; n <= 6; n++) {
            const up = ly - n * bh * 0.55;
            if (!hitTest(lx - padX, up - fs / 2 - padY, bw, bh)) {
              ly = up;
              break;
            }
            const dn = ly + n * bh * 0.55;
            if (!hitTest(lx - padX, dn - fs / 2 - padY, bw, bh)) {
              ly = dn;
              break;
            }
          }
        }
        usedRects.push({ x: lx - padX, y: ly - fs / 2 - padY, w: bw, h: bh });

        ctx.fillStyle = dark ? "rgba(6,10,7,0.82)" : "rgba(244,244,242,0.92)";
        ctx.beginPath();
        ctx.roundRect(lx - padX, ly - fs / 2 - padY, bw, bh, 4);
        ctx.fill();

        ctx.strokeStyle = dark
          ? `rgba(31,219,138,${alpha * 0.45})`
          : `rgba(134,188,37,${alpha * 0.55})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        ctx.fillStyle = dark ? "#86e8b4" : "#1a3c21";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, lx, ly);
        ctx.restore();
      });

      const lv = ctx.createLinearGradient(0, 0, W, 0);
      if (dark) {
        lv.addColorStop(0, "rgba(6,10,7,0.98)");
        lv.addColorStop(0.35, "rgba(6,10,7,0.78)");
        lv.addColorStop(0.55, "rgba(6,10,7,0.42)");
        lv.addColorStop(0.75, "rgba(6,10,7,0.22)");
        lv.addColorStop(1, "rgba(6,10,7,0.12)");
      } else {
        lv.addColorStop(0, "rgba(244,244,242,0.98)");
        lv.addColorStop(0.35, "rgba(244,244,242,0.82)");
        lv.addColorStop(0.55, "rgba(244,244,242,0.48)");
        lv.addColorStop(0.75, "rgba(244,244,242,0.28)");
        lv.addColorStop(1, "rgba(244,244,242,0.15)");
      }
      ctx.fillStyle = lv;
      ctx.fillRect(0, 0, W, H);

      // overall transparent screen to tone down the animation
      ctx.fillStyle = dark ? "rgba(6,10,7,0.30)" : "rgba(244,244,242,0.25)";
      ctx.fillRect(0, 0, W, H);

      animationFrameId = requestAnimationFrame(frame);
    }

    animationFrameId = requestAnimationFrame(frame);

    const handleResize = () => {
      resize();
      spawnParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return canvasRef;
}
