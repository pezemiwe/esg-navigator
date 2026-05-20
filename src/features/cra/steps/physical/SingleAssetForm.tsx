"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  DollarSign,
  ChevronDown,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { useRegionStore } from "@/store/regionStore";
import { SECTORS } from "../../domain/physicalRisk/constants";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const ASSET_GROUPS: Record<string, string[]> = {
  Buildings: [
    "Office Building",
    "Industrial Building",
    "Warehouse / Storage",
    "Retail Outlet / Branch",
    "Healthcare Facility",
    "Educational Facility",
    "Hospitality Building",
    "Religious / Assembly Hall",
    "Military / Security Post",
  ],
  "Critical Infrastructure": [
    "Data Centre",
    "Telecoms Mast / Tower",
    "Power Generation Plant",
    "Electrical Substation",
    "Transmission Line / Pylon",
    "Water Treatment Plant",
    "Water Distribution Network",
    "Server Room / Network Hub",
    "ATM / POS Terminal Network",
    "Broadcasting / Transmission Equipment",
  ],
  "Oil & Gas": [
    "Onshore Refinery / Process Plant",
    "LNG / LPG Terminal",
    "Offshore Platform",
    "Floating Production Vessel (FPSO)",
    "Storage Tank / Tank Farm",
    "Petrol Station / Depot",
    "Pipeline ? Onshore",
    "Pipeline ? Offshore / Subsea",
    "Underground Cable / Duct",
  ],
  Transport: [
    "Road / Bridge / Culvert",
    "Rail Track / Rail Infrastructure",
    "Port / Jetty / Quay",
    "Airport Terminal / Runway",
    "Vessel / Barge / Tug",
    "Vehicle Fleet / Rolling Stock",
  ],
  "Land & Agriculture": [
    "Cropland / Farmland",
    "Irrigation System",
    "Aquaculture Facility",
    "Plantation / Forest",
  ],
  "Mining & Processing": [
    "Mine / Quarry Site",
    "Mineral Processing Plant",
    "Tailings Dam / Waste Facility",
  ],
  Other: [
    "Outdoor Plant & Equipment",
    "Semi-outdoor Kiosk / Booth",
    "Open Yard / Storage Compound",
    "Solar Farm / Wind Farm",
    "Construction Site / Temporary Camp",
    "Modular / Prefabricated Unit",
  ],
};

const STEPS = [
  { num: "01", label: "Name & Address", field: "name" },
  { num: "02", label: "Asset Type", field: "type" },
  { num: "03", label: "Valuation", field: "value" },
  { num: "04", label: "Matrix & Rate", field: "matrix" },
  { num: "05", label: "Sector", field: "sector" },
];

export default function SingleAssetForm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    let animId: number;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const DEG = Math.PI / 180;
    const CLAT = 8 * DEG; // centre latitude (West Africa)
    let globeAngle = 18 * DEG; // current centre longitude — changes over time

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
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
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

    const HAZARDS = [
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
        ctx.fillStyle = `rgba(${prgb},${dark ? a : a * 0.55})`;
        ctx.fill();
      });

      const R = Math.min(W, H) * 0.3;
      const GX = W * 0.74;
      const GY = H * 0.56;

      const atm = ctx.createRadialGradient(GX, GY, R * 0.9, GX, GY, R * 1.55);
      atm.addColorStop(
        0,
        dark ? "rgba(31,219,138,0.30)" : "rgba(134,188,37,0.36)",
      );
      atm.addColorStop(
        0.5,
        dark ? "rgba(31,219,138,0.10)" : "rgba(134,188,37,0.12)",
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
      spec.addColorStop(0, "rgba(255,255,255,0.18)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.06)");
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
        ? "rgba(31,219,138,0.16)"
        : "rgba(134,188,37,0.22)";
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
        const starSz = R * 0.03;
        drawStar(
          ghPt.x,
          ghPt.y + R * 0.01,
          starSz,
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
        drawPoly(ngL, GX, GY, R, clon, `rgba(0,135,81,${0.85 * ngPt.d + 0.1})`);
        const ngR: [number, number][] = [
          [10.5, 8.2],
          [14, 10],
          [14.5, 11.5],
          [14, 13],
          [11.5, 14],
          [10.5, 14],
          [10.5, 8.2],
        ];
        drawPoly(ngR, GX, GY, R, clon, `rgba(0,135,81,${0.85 * ngPt.d + 0.1})`);
        const ngW: [number, number][] = [
          [6.2, 7.2],
          [10.5, 8.2],
          [10.5, 14],
          [8.5, 14],
          [7, 13.5],
          [6.2, 13.5],
          [6.2, 7.2],
        ];
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

      ctx.restore(); // end land clip

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
        ? "rgba(31,219,138,0.55)"
        : "rgba(134,188,37,0.65)";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(GX, GY, R + 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = dark
        ? "rgba(31,219,138,0.28)"
        : "rgba(134,188,37,0.36)";
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
        lv.addColorStop(0, "rgba(6,10,7,0.96)");
        lv.addColorStop(0.38, "rgba(6,10,7,0.58)");
        lv.addColorStop(0.6, "rgba(6,10,7,0.12)");
        lv.addColorStop(1, "rgba(6,10,7,0)");
      } else {
        lv.addColorStop(0, "rgba(244,244,242,0.97)");
        lv.addColorStop(0.38, "rgba(244,244,242,0.66)");
        lv.addColorStop(0.6, "rgba(244,244,242,0.18)");
        lv.addColorStop(1, "rgba(244,244,242,0)");
      }
      ctx.fillStyle = lv;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    const handleResize = () => {
      resize();
      spawnParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const {
    config,
    mappedAssets,
    setConfig,
    setMappedAssets,
    setActiveStep,
    setGeoConfidence,
    setMode,
  } = usePhysicalRiskStore();

  const existingAsset = mappedAssets[0];
  const [assetName, setAssetName] = useState(() => existingAsset?.name ?? "");
  const [address, setAddress] = useState(() => existingAsset?.region ?? "");
  const [assetType, setAssetType] = useState(
    () => existingAsset?.assetType ?? "",
  );
  const [replValue, setReplValue] = useState(() =>
    existingAsset?.value ? String(existingAsset.value) : "",
  );
  const [replDisplay, setReplDisplay] = useState(() => {
    const v = existingAsset?.value;
    return v ? Number(v).toLocaleString() : "";
  });
  const localCode = useRegionStore((s) => s.profile.currencyCode) as
    | "NGN"
    | "GHS";
  const localSymbol = useRegionStore((s) => s.profile.currencySymbol);
  const [currency, setCurrency] = useState<"NGN" | "GHS" | "USD" | null>(() =>
    config.currency === "USD"
      ? "USD"
      : config.currency === "NGN" || config.currency === "GHS"
        ? (config.currency as "NGN" | "GHS")
        : null,
  );
  const [usdRate, setUsdRate] = useState(() => config.usdRate ?? 1600);
  const [matrixSize, setMatrixSize] = useState<number>(() =>
    config.matrixSize && config.matrixSize >= 3 ? config.matrixSize : 0,
  );
  const [sectorId, setSectorId] = useState("");
  const [subsector, setSubsector] = useState("");

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AddressSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAssetTypeDropdown, setShowAssetTypeDropdown] = useState(false);
  const [, setActiveField] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const assetTypeRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "6",
          addressdetails: "1",
        });
        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: { "User-Agent": "ESG-Navigator/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch {
        // autocomplete errors are non-fatal; suggestions silently cleared
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node))
        setShowSuggestions(false);
      if (
        assetTypeRef.current &&
        !assetTypeRef.current.contains(e.target as Node)
      )
        setShowAssetTypeDropdown(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const sectorDef = SECTORS[sectorId];
  const subsectors = useMemo(() => sectorDef?.subsectors ?? [], [sectorDef]);
  useEffect(() => {
    if (!subsectors.includes(subsector)) setSubsector("");
  }, [sectorId, subsectors, subsector]);

  const fieldsDone = {
    name: assetName.trim().length > 0 && address.trim().length > 0,
    type: assetType.length > 0,
    value: parseFloat(replValue) > 0,
    matrix: matrixSize >= 3,
    sector: sectorId.length > 0,
  };
  const completedCount = Object.values(fieldsDone).filter(Boolean).length;
  const progressPct = (completedCount / 5) * 100;
  const isValid = Object.values(fieldsDone).every(Boolean);

  const handleValueChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "").replace(/(\.[0-9]*)\./g, "$1");
    setReplValue(cleaned);
    if (cleaned === "" || cleaned === ".") {
      setReplDisplay(cleaned);
      return;
    }
    const [intPart, decPart] = cleaned.split(".");
    setReplDisplay(
      Number(intPart).toLocaleString() +
        (decPart !== undefined ? "." + decPart : ""),
    );
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    const lat = selectedSuggestion
      ? parseFloat(selectedSuggestion.lat)
      : (mappedAssets[0]?.latitude ?? 0);
    const lon = selectedSuggestion
      ? parseFloat(selectedSuggestion.lon)
      : (mappedAssets[0]?.longitude ?? 0);
    setConfig({
      sectorId,
      subsector,
      currency: currency ?? localCode,
      usdRate,
      matrixSize,
    });
    const asset = {
      id: mappedAssets[0]?.id ?? `SA-${Date.now()}`,
      name: assetName.trim(),
      assetType,
      value: parseFloat(replValue),
      latitude: lat,
      longitude: lon,
      region: selectedSuggestion?.display_name ?? address,
      sector: sectorDef?.name ?? "",
    };
    setMappedAssets([asset]);
    if (selectedSuggestion) {
      let elevation = 0;
      try {
        const elRes = await fetch(
          `https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lon}`,
        );
        if (elRes.ok) {
          const elData = await elRes.json();
          elevation = elData?.results?.[0]?.elevation ?? 0;
        }
      } catch {
        // elevation fetch is best-effort; default 0 is used on failure
      }
      const importance = selectedSuggestion.importance ?? 0;
      const level =
        importance > 0.7
          ? ("Exact Address" as const)
          : importance > 0.4
            ? ("Street Level" as const)
            : ("City Level" as const);
      const coastDist = Math.abs(
        lat - (lon >= 2 && lon < 5 ? 6 : lon >= 5 && lon < 10 ? 5 : 5.5),
      );
      setGeoConfidence({
        lat,
        lon,
        elevation,
        isCoastal: coastDist < 2.5,
        isUrban:
          selectedSuggestion.type === "city" ||
          selectedSuggestion.type === "administrative",
        level,
        displayName: selectedSuggestion.display_name,
      });
    }
    setActiveStep(1);
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <div className="relative z-10 flex-1 flex flex-col">
        <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scaleY(0.94); }
          to { opacity: 1; transform: scaleY(1); }
        }
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(134,188,37,0); }
          50% { box-shadow: 0 0 0 5px rgba(134,188,37,0.12); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes slideRight {
          from { width: 0%; }
          to { width: var(--target-w); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes globeSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes globePulse {
          0%, 100% { opacity: 0.06; transform: scale(1); }
          50% { opacity: 0.10; transform: scale(1.02); }
        }
        @keyframes leafDrift1 {
          0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.07; }
          50% { transform: translate(-60px, 120px) rotate(45deg); opacity: 0.05; }
          90% { opacity: 0.07; }
          100% { transform: translate(-120px, 240px) rotate(90deg); opacity: 0; }
        }
        @keyframes leafDrift2 {
          0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.06; }
          50% { transform: translate(40px, 150px) rotate(-30deg); opacity: 0.04; }
          90% { opacity: 0.06; }
          100% { transform: translate(80px, 300px) rotate(-60deg); opacity: 0; }
        }
        @keyframes leafDrift3 {
          0% { transform: translate(0,0) rotate(15deg); opacity: 0; }
          10% { opacity: 0.05; }
          50% { transform: translate(-30px, 100px) rotate(60deg); opacity: 0.04; }
          100% { transform: translate(-60px, 200px) rotate(105deg); opacity: 0; }
        }
        @keyframes sparkFloat {
          0%, 100% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          20% { opacity: 0.6; transform: translate(var(--sx), var(--sy)) scale(1); }
          80% { opacity: 0.4; transform: translate(var(--ex), var(--ey)) scale(0.8); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.04; transform: scale(1); }
          50% { opacity: 0.08; transform: scale(1.05); }
        }
        .saf-fu { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .saf-si { animation: scaleIn 0.2s cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: top; }
        .saf-check { animation: checkPop 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .saf-blink { animation: dotBlink 2s ease-in-out infinite; }
        .saf-spark {
          position: absolute; width: 4px; height: 4px; border-radius: 50%;
          background: radial-gradient(circle, #86BC25 0%, transparent 70%);
          pointer-events: none; animation: sparkFloat 6s ease-in-out infinite;
        }

        .saf-field { position: relative; transition: transform 0.18s ease; }
        .saf-field:focus-within { transform: translateY(-1px); }

        .saf-input {
          width: 100%;
          background: white;
          border: 1.5px solid #E2E2E0;
          padding: 12px 14px;
          font-size: 15px;
          color: #1A1A1A;
          outline: none;
          border-radius: 8px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .dark .saf-input {
          background: #161616;
          border-color: rgba(255,255,255,0.08);
          color: #F0F0F0;
        }
        .saf-input:focus {
          border-color: #86BC25;
          box-shadow: 0 0 0 3px rgba(134,188,37,0.10), 0 1px 3px rgba(0,0,0,0.06);
          background: #FEFFFE;
        }
        .dark .saf-input:focus { background: #1A1A1A; }
        .saf-input::placeholder { color: #B0B0AE; }
        .dark .saf-input::placeholder { color: #444; }

        .saf-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #8A8A88;
          margin-bottom: 8px;
          font-family: var(--font-mono);
          transition: color 0.18s ease;
        }
        .saf-field:focus-within .saf-label { color: #86BC25; }

        .saf-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #E8E8E6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .dark .saf-card {
          background: #141414;
          border-color: rgba(255,255,255,0.06);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .saf-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        }

        .saf-submit {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }
        .saf-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,60,33,0.25);
        }
        .saf-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(26,60,33,0.15);
        }
        .saf-submit:not(:disabled) { animation: pulseGreen 3.5s ease-in-out infinite; }

        .saf-pill-btn {
          border-radius: 8px;
          transition: all 0.18s ease;
        }
        .saf-pill-btn:hover {
          background: rgba(134,188,37,0.1);
        }
        .dark .saf-pill-btn:hover {
          background: rgba(134,188,37,0.15);
        }

        .saf-dropdown {
          border-radius: 10px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
        }
        .dark .saf-dropdown {
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }
        .saf-card-done {
          border-color: rgba(134,188,37,0.3) !important;
          box-shadow: inset 3px 0 0 #86BC25, 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          transition: box-shadow 0.45s ease, border-color 0.45s ease;
        }
        .dark .saf-card-done {
          border-color: rgba(134,188,37,0.15) !important;
          box-shadow: inset 3px 0 0 #86BC25, 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>

        <div className="relative overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(134,188,37,0.3) 20px, rgba(134,188,37,0.3) 21px)`,
            }}
          />
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #86BC25 0%, transparent 70%)",
              animation: "heroGlow 6s ease-in-out infinite",
            }}
          />

          <div className="relative px-6 md:px-10 py-8 md:py-10">
            <div className="max-w-300 mx-auto">
              <button
                onClick={() => setMode(null)}
                className="flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full mb-6 text-[11px] font-semibold uppercase tracking-widest transition-colors cursor-pointer border border-white/10 w-max"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <ArrowLeft size={12} /> BACK TO MODE SELECTION
              </button>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="saf-fu" style={{ animationDelay: "0ms" }}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#86BC25] flex items-center justify-center">
                      <MapPin size={15} className="text-white" />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Step 01 of 07 &mdash; Asset Details
                    </span>
                  </div>
                  <h1 className="text-[28px] md:text-[34px] font-bold text-white leading-[1.15] tracking-tight mb-2">
                    Define Your Asset
                  </h1>
                  <p className="text-[14px] md:text-[15px] text-white/60 leading-relaxed max-w-130">
                    Provide the key details about the asset you want to assess
                    for physical climate risk. Each field strengthens the
                    precision of your results.
                  </p>
                </div>

                <div
                  className="saf-fu flex items-center gap-5"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="relative w-18 h-18">
                    <svg
                      viewBox="0 0 72 72"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        stroke="#86BC25"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${progressPct * 1.885} 188.5`}
                        style={{
                          transition:
                            "stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-[18px] font-bold text-white"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {completedCount}
                        <span className="text-white/30 text-[13px]">/5</span>
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[12px] text-white/40 font-medium"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {completedCount === 5
                      ? "All fields complete"
                      : `${5 - completedCount} field${5 - completedCount !== 1 ? "s" : ""} remaining`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-0.75 bg-white/6">
            <div
              className="h-full bg-[#86BC25]"
              style={{
                width: `${progressPct}%`,
                transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="hidden xl:flex flex-col w-70 shrink-0 border-r border-[#E6E6E4] dark:border-white/6 bg-white dark:bg-[#111]">
            <div className="px-6 pt-7 pb-5 border-b border-[#EFEFED] dark:border-white/5">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#AAA] dark:text-[#555] mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Form Sections
              </p>
              <div className="space-y-0.5">
                {STEPS.map((step, i) => {
                  const done =
                    fieldsDone[step.field as keyof typeof fieldsDone];
                  const active = !done && completedCount === i;
                  return (
                    <div
                      key={step.num}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        active ? "bg-[#F3F9E8] dark:bg-[#86BC25]/6" : ""
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                          done
                            ? "bg-[#86BC25]"
                            : active
                              ? "bg-[#86BC25]/10 border-[1.5px] border-[#86BC25]"
                              : "bg-[#F4F4F2] dark:bg-white/4 border border-[#E2E2E0] dark:border-white/8"
                        }`}
                      >
                        {done ? (
                          <Check
                            size={11}
                            className="text-white saf-check"
                            strokeWidth={3}
                          />
                        ) : (
                          <span
                            className={`text-[9px] font-bold ${active ? "text-[#86BC25]" : "text-[#C0C0BE] dark:text-[#555]"}`}
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {step.num}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[14px] transition-colors duration-200 ${
                          done
                            ? "text-[#86BC25] font-semibold"
                            : active
                              ? "text-[#1A1A1A] dark:text-[#EEE] font-semibold"
                              : "text-[#A0A09E] dark:text-[#555]"
                        }`}
                      >
                        {step.label}
                      </span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#86BC25] saf-blink" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-5 flex-1">
              <div className="p-4 rounded-xl bg-[#F8FAF3] dark:bg-[#86BC25]/4 border border-[#E8F0D8] dark:border-[#86BC25]/10">
                <div className="w-7 h-7 rounded-lg bg-[#86BC25]/10 flex items-center justify-center mb-3">
                  <MapPin size={13} className="text-[#86BC25]" />
                </div>
                <p className="text-[12px] font-semibold text-[#1A3C21] dark:text-[#86BC25] mb-1">
                  Location Matters
                </p>
                <p className="text-[11px] text-[#6B7B6E] dark:text-[#666] leading-relaxed">
                  The address you provide will be geocoded to determine precise
                  coordinates for climate hazard analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative px-5 md:px-8 lg:px-10 py-8 overflow-y-auto">
            <div className="relative w-full max-w-215 mx-auto xl:mx-0 space-y-6 z-10">
              <div
                className={`saf-card saf-fu ${fieldsDone.name && fieldsDone.type ? "saf-card-done" : ""}`}
                style={{
                  animationDelay: "60ms",
                  position: "relative",
                  zIndex:
                    showAssetTypeDropdown || showSuggestions ? 30 : undefined,
                }}
              >
                <div className="px-6 py-4 border-b border-[#F0F0EE] dark:border-white/4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1A3C21]/6 dark:bg-white/4 flex items-center justify-center">
                    <span
                      className="text-[10px] font-bold text-[#1A3C21] dark:text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      01
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] dark:text-[#F0F0F0] leading-tight">
                      Asset Identity
                    </h3>
                    <p className="text-[13px] text-[#999] dark:text-[#555]">
                      Name, type, and physical location
                    </p>
                  </div>
                  {fieldsDone.name && fieldsDone.type && (
                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86BC25]/10">
                      <Check
                        size={10}
                        className="text-[#86BC25]"
                        strokeWidth={3}
                      />
                      <span
                        className="text-[10px] font-semibold text-[#86BC25]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        COMPLETE
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-5">
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    style={{
                      position: "relative",
                      zIndex: showAssetTypeDropdown ? 400 : "auto",
                    }}
                  >
                    <div className="saf-field">
                      <label className="saf-label">Asset Description</label>
                      <input
                        className="saf-input"
                        placeholder="e.g. Lagos Head Office"
                        value={assetName}
                        onFocus={() => setActiveField("name")}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) => setAssetName(e.target.value)}
                      />
                    </div>
                    <div className="saf-field" style={{ position: "relative" }}>
                      <div ref={assetTypeRef} className="relative">
                        <label className="saf-label">Asset Type</label>
                        <button
                          type="button"
                          onClick={() => setShowAssetTypeDropdown((v) => !v)}
                          className="saf-input w-full flex items-center justify-between cursor-pointer text-left"
                          style={{ paddingRight: "38px" }}
                        >
                          <span
                            className={
                              assetType
                                ? "text-[#1A1A1A] dark:text-[#F0F0F0]"
                                : "text-[#B0B0AE] dark:text-[#444]"
                            }
                          >
                            {assetType || "Select asset type"}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`absolute right-3 text-[#B0B0AE] dark:text-[#444] shrink-0 transition-transform duration-200 ${showAssetTypeDropdown ? "rotate-180" : ""}`}
                          />
                        </button>
                        {showAssetTypeDropdown && (
                          <div className="saf-si saf-dropdown absolute top-full left-0 right-0 z-9999 mt-1 bg-white dark:bg-[#1A1A1A] border border-[#E2E2E0] dark:border-white/8 overflow-y-auto max-h-72">
                            {Object.entries(ASSET_GROUPS).map(
                              ([group, types]) => (
                                <div key={group}>
                                  <div
                                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1A3C21] dark:text-[#86BC25] bg-[#F6F8F3] dark:bg-white/2 border-b border-[#EFEFED] dark:border-white/4 sticky top-0"
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {group}
                                  </div>
                                  {types.map((type) => (
                                    <button
                                      key={type}
                                      onMouseDown={() => {
                                        setAssetType(type);
                                        setShowAssetTypeDropdown(false);
                                      }}
                                      className={`w-full text-left px-4 py-2.5 text-[14px] border-b border-[#F4F4F2] dark:border-white/3 last:border-b-0 hover:bg-[#F3F9E8] dark:hover:bg-white/3 transition-colors ${
                                        assetType === type
                                          ? "text-[#86BC25] font-semibold bg-[#F3F9E8]/50 dark:bg-[#86BC25]/4"
                                          : "text-[#444] dark:text-[#CCC]"
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="saf-field"
                    style={{
                      position: "relative",
                      zIndex: showSuggestions ? 300 : "auto",
                    }}
                  >
                    <div ref={addressRef} className="relative">
                      <label className="saf-label">Location</label>
                      <div className="relative flex items-center">
                        <MapPin
                          size={14}
                          className="absolute left-3.5 text-[#B0B0AE] dark:text-[#444] pointer-events-none"
                        />
                        <input
                          className="saf-input"
                          style={{ paddingLeft: "34px" }}
                          placeholder="Start typing an address..."
                          value={address}
                          onFocus={() => {
                            setActiveField("address");
                            if (suggestions.length > 0)
                              setShowSuggestions(true);
                          }}
                          onBlur={() => setActiveField(null)}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            setSelectedSuggestion(null);
                            fetchSuggestions(e.target.value);
                            setShowSuggestions(true);
                          }}
                        />
                        {loading && (
                          <Loader2
                            size={14}
                            className="absolute right-3.5 text-[#B0B0AE] dark:text-[#444] animate-spin pointer-events-none"
                          />
                        )}
                        {selectedSuggestion && !loading && (
                          <div className="absolute right-3.5 w-5 h-5 rounded-full bg-[#86BC25] flex items-center justify-center">
                            <Check
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </div>
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="saf-si saf-dropdown absolute top-full left-0 right-0 z-9999 mt-1 bg-white dark:bg-[#1A1A1A] border border-[#E2E2E0] dark:border-white/8 overflow-hidden">
                          {suggestions.map((s) => (
                            <button
                              key={`${s.lat}-${s.lon}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedSuggestion(s);
                                setAddress(s.display_name);
                                setSuggestions([]);
                                setShowSuggestions(false);
                              }}
                              className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-[#F2F2F0] dark:border-white/4 last:border-b-0 hover:bg-[#F3F9E8] dark:hover:bg-white/3 transition-colors"
                            >
                              <MapPin
                                size={13}
                                className="text-[#86BC25] mt-0.5 shrink-0"
                              />
                              <span className="text-[14px] text-[#444] dark:text-[#CCC] leading-snug">
                                {s.display_name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedSuggestion && (
                        <div className="mt-2.5 flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#F3FAE8] dark:bg-[#86BC25]/6 border border-[#C8E88A] dark:border-[#86BC25]/20">
                          <Check
                            size={11}
                            className="text-[#86BC25] shrink-0"
                            strokeWidth={3}
                          />
                          <span
                            className="text-[12px] text-[#2D6B3A] dark:text-[#86BC25]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {parseFloat(selectedSuggestion.lat).toFixed(5)}
                            &deg;,&nbsp;
                            {parseFloat(selectedSuggestion.lon).toFixed(5)}&deg;
                          </span>
                          <span
                            className="ml-auto text-[9px] uppercase tracking-[0.12em] font-semibold text-[#86BC25] bg-[#86BC25]/10 dark:bg-[#86BC25]/15 px-2 py-0.5 rounded-full shrink-0"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            Geocoded
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`saf-card saf-fu ${fieldsDone.value ? "saf-card-done" : ""}`}
                style={{ animationDelay: "140ms" }}
              >
                <div className="px-6 py-4 border-b border-[#F0F0EE] dark:border-white/4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1A3C21]/6 dark:bg-white/4 flex items-center justify-center">
                    <span
                      className="text-[10px] font-bold text-[#1A3C21] dark:text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      02
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] dark:text-[#F0F0F0] leading-tight">
                      Valuation &amp; Currency
                    </h3>
                    <p className="text-[13px] text-[#999] dark:text-[#555]">
                      Asset book value or insured value and reporting currency
                    </p>
                  </div>
                  {fieldsDone.value && (
                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86BC25]/10">
                      <Check
                        size={10}
                        className="text-[#86BC25]"
                        strokeWidth={3}
                      />
                      <span
                        className="text-[10px] font-semibold text-[#86BC25]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        COMPLETE
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1 saf-field w-full">
                      <label className="saf-label">
                        Net Book Value / Insured Value / Gross Cost
                      </label>
                      <div className="relative flex items-center">
                        <DollarSign
                          size={14}
                          className="absolute left-3.5 text-[#B0B0AE] dark:text-[#444] pointer-events-none"
                        />
                        <input
                          type="text"
                          inputMode="decimal"
                          className="saf-input"
                          style={{ paddingLeft: "34px" }}
                          placeholder="0.00"
                          value={replDisplay}
                          onFocus={() => setActiveField("value")}
                          onBlur={() => setActiveField(null)}
                          onChange={(e) => handleValueChange(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="relative flex rounded-lg border border-[#E2E2E0] dark:border-white/8 overflow-hidden shrink-0 mb-0.5">
                      <div
                        className="absolute top-0 bottom-0 bg-[#1A3C21] dark:bg-[#86BC25] rounded-[7px] z-0"
                        style={{
                          width: "50%",
                          left: currency === localCode ? "0%" : "50%",
                          opacity: currency === null ? 0 : 1,
                          transition:
                            "left 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
                        }}
                      />
                      {([localCode, "USD"] as Array<"NGN" | "GHS" | "USD">).map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`relative z-10 saf-pill-btn px-4 py-2.75 text-[12px] font-bold tracking-[0.06em] rounded-none first:rounded-l-[7px] last:rounded-r-[7px] transition-colors duration-200 ${
                              currency === c
                                ? "text-white hover:bg-transparent!"
                                : "text-[#777] dark:text-[#666]"
                            }`}
                            style={{
                              fontFamily: "var(--font-mono)",
                              width: "50%",
                            }}
                          >
                            {c === "USD" ? "$ USD" : `${localSymbol} ${c}`}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  {currency !== localCode && currency !== null && (
                    <div className="mt-4 saf-field max-w-70">
                      <label className="saf-label">
                        {currency} Exchange Rate
                      </label>
                      <div className="relative flex items-center">
                        <span
                          className="absolute left-3.5 text-[11px] text-[#B0B0AE] dark:text-[#444] pointer-events-none select-none"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          1 {currency} =
                        </span>
                        <input
                          type="number"
                          min={1}
                          className="saf-input"
                          style={{ paddingLeft: "66px" }}
                          value={usdRate}
                          onChange={(e) =>
                            setUsdRate(Number(e.target.value) || 1)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`saf-card saf-fu ${fieldsDone.matrix && fieldsDone.sector ? "saf-card-done" : ""}`}
                style={{ animationDelay: "220ms" }}
              >
                <div className="px-6 py-4 border-b border-[#F0F0EE] dark:border-white/4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1A3C21]/6 dark:bg-white/4 flex items-center justify-center">
                    <span
                      className="text-[10px] font-bold text-[#1A3C21] dark:text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      03
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] dark:text-[#F0F0F0] leading-tight">
                      Risk Configuration
                    </h3>
                    <p className="text-[13px] text-[#999] dark:text-[#555]">
                      Matrix dimensions and industry classification
                    </p>
                  </div>
                  {fieldsDone.matrix && fieldsDone.sector && (
                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#86BC25]/10">
                      <Check
                        size={10}
                        className="text-[#86BC25]"
                        strokeWidth={3}
                      />
                      <span
                        className="text-[10px] font-semibold text-[#86BC25]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        COMPLETE
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-5">
                  <div className="saf-field">
                    <label className="saf-label">Risk Matrix Size</label>
                    <div className="relative flex rounded-lg border border-[#E2E2E0] dark:border-white/8 overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 bg-[#1A3C21] dark:bg-[#86BC25] rounded-[7px] z-0"
                        style={{
                          width: "25%",
                          left: `${[3, 4, 5, 6].indexOf(matrixSize) * 25}%`,
                          opacity: matrixSize === 0 ? 0 : 1,
                          transition:
                            "left 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
                        }}
                      />
                      {[3, 4, 5, 6].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setMatrixSize(s)}
                          className={`relative z-10 saf-pill-btn flex-1 py-2.75 text-[13px] font-bold tracking-[0.04em] rounded-none first:rounded-l-[7px] last:rounded-r-[7px] transition-colors duration-200 ${
                            matrixSize === s
                              ? "text-white hover:bg-transparent!"
                              : "text-[#777] dark:text-[#666]"
                          }`}
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {s}&times;{s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="saf-field">
                      <label className="saf-label">Sector</label>
                      <div className="relative">
                        <select
                          className="saf-input appearance-none pr-9 cursor-pointer"
                          value={sectorId}
                          onFocus={() => setActiveField("sector")}
                          onBlur={() => setActiveField(null)}
                          onChange={(e) => setSectorId(e.target.value)}
                        >
                          <option value="" disabled>
                            Select a sector
                          </option>
                          {Object.entries(SECTORS).map(([id, s]) => (
                            <option key={id} value={id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B0AE] pointer-events-none"
                        />
                      </div>
                    </div>
                    <div className="saf-field">
                      <label className="saf-label">Subsector</label>
                      <div className="relative">
                        <select
                          className="saf-input appearance-none pr-9 cursor-pointer"
                          value={subsector}
                          onFocus={() => setActiveField("subsector")}
                          onBlur={() => setActiveField(null)}
                          onChange={(e) => setSubsector(e.target.value)}
                        >
                          <option value="" disabled>
                            {sectorId
                              ? "All subsectors"
                              : "Select sector first"}
                          </option>
                          {subsectors.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B0B0AE] pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="saf-fu" style={{ animationDelay: "300ms" }}>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className="saf-submit w-full flex items-center justify-center gap-3 rounded-xl text-[15px] font-bold py-4 disabled:opacity-25 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    background: isValid
                      ? "linear-gradient(135deg, #1A3C21 0%, #2D5A35 100%)"
                      : "#1A3C21",
                    color: "white",
                  }}
                >
                  <span>ASSESS THIS ASSET</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
