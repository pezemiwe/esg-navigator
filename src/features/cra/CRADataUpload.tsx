import React, { useState } from "react";
import { Workbook } from "exceljs";
import { downloadExcelTemplate } from "./utils/excelTemplates";
import { formatColumnHeader } from "./utils/craUtils";
import { TEMPLATE_DEFINITIONS } from "./utils/dataTemplates";
import CRANavigation from "./components/CRANavigation";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Database,
  XCircle,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Download,
  Eye,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Server,
  Factory,
  Truck,
  Network,
  Landmark,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  DollarSign,
  Users,
  Save,
  CheckSquare,
} from "lucide-react";
import CRALayout from "./layout/CRALayout";
import { useCRADataStore, useCRAStatusStore } from "@/store/craStore";
import type { Asset, AssetTypeData } from "@/types/craTypes";
import { useIndustry } from "@/hooks/useIndustry";
import { useThemeStore } from "@/store/themeStore";
interface AssetType {
  id: string;
  name: string;
  category: string;
  description: string;
  templateFile: string;
  uploadedFile?: File;
  uploadedDate?: string;
  rowCount?: number;
  columnCount?: number;
  status: "not_uploaded" | "uploading" | "uploaded" | "validated" | "error";
  validationErrors?: string[];
  dataFields?: string[];
  icon?: React.ElementType;
  priority: "high" | "medium" | "low";
  estimatedRows: number;
}

const CRADataUpload: React.FC = () => {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const { assets, setAssetData, clearAssetData, setCompanyProfileData } =
    useCRADataStore();
  const { loadDemoData } = useCRADataStore();
  const { updateStatus } = useCRAStatusStore();
  const { config: industryConfig } = useIndustry();

  // ── Demo auto-seed: load Ghana sample data if store is empty ──
  React.useEffect(() => {
    const hasAny = Object.values(assets).some((t) => t.data.length > 0);
    if (!hasAny) {
      loadDemoData();
      updateStatus("dataUploaded", true);
      updateStatus("segmentationReady", true);
      // Sync local form state from the newly seeded store
      const seededProfile = useCRADataStore.getState().companyProfile;
      if (seededProfile.orgName) {
        setCompanyProfile({ ...seededProfile });
        setCompanyProfileSaved(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [filterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewDataDialog, setViewDataDialog] = useState<{
    open: boolean;
    assetId: string | null;
  }>({ open: false, assetId: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addAssetDialog, setAddAssetDialog] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    description: "",
    columns: "" as string, // comma-separated column names
    priority: "medium" as "high" | "medium" | "low",
  });

  // ── Section navigation ──
  type SectionId =
    | "company"
    | "financial"
    | "ict"
    | "operations"
    | "supply-chain"
    | "infrastructure";
  const [activeSection, setActiveSection] = useState<SectionId>("company");
  const [companyProfileSaved, setCompanyProfileSaved] = useState(() => {
    const stored = useCRADataStore.getState().companyProfile;
    return stored.orgName.trim().length > 0;
  });
  const [companyProfile, setCompanyProfile] = useState(() => {
    // Seed from store (populated by demo data or prior save)
    const stored = useCRADataStore.getState().companyProfile;
    const hasStored = stored.orgName.trim().length > 0;
    return hasStored
      ? { ...stored }
      : {
          orgName: "",
          regNumber: "",
          country: "Ghana",
          reportingYear: new Date().getFullYear().toString(),
          currency: "GHS",
          totalAssets: "",
          employees: "",
          address: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          industry: "",
          description: "",
        };
  });

  const sectionDefs: {
    id: SectionId;
    label: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: "company",
      label: "Company Profile",
      icon: Building2,
      color: "#6366F1",
    },
    {
      id: "financial",
      label: "Financial Assets",
      icon: Landmark,
      color: "#86BC25",
    },
    { id: "ict", label: "Data / ICT", icon: Server, color: "#0EA5E9" },
    {
      id: "operations",
      label: "Direct Operations",
      icon: Factory,
      color: "#F59E0B",
    },
    {
      id: "supply-chain",
      label: "Supply Chain",
      icon: Truck,
      color: "#EC4899",
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      icon: Network,
      color: "#8B5CF6",
    },
  ];

  const [sectionAssets, setSectionAssets] = useState<
    Record<string, AssetType[]>
  >({
    ict: [
      {
        id: "data_centers",
        name: "Data Centers",
        category: "ICT Infrastructure",
        description: "Physical data center facilities and colocation spaces",
        templateFile: "data_centers_template.csv",
        dataFields: [
          "ID",
          "Name",
          "Location",
          "Capacity (MW)",
          "PUE",
          "Net Book Value",
          "Status",
          "Tier Level",
        ],
        icon: Server,
        priority: "high",
        estimatedRows: 20,
        status: "not_uploaded",
      },
      {
        id: "server_infrastructure",
        name: "Server Infrastructure",
        category: "ICT Infrastructure",
        description:
          "On-premise servers, storage arrays and computing hardware",
        templateFile: "server_infra_template.csv",
        dataFields: [
          "ID",
          "Name",
          "Type",
          "Rack Units",
          "Net Book Value",
          "Age (Years)",
          "Status",
        ],
        icon: Database,
        priority: "high",
        estimatedRows: 50,
        status: "not_uploaded",
      },
      {
        id: "network_equipment",
        name: "Network Equipment",
        category: "ICT Infrastructure",
        description: "Routers, switches, firewalls and networking hardware",
        templateFile: "network_equip_template.csv",
        dataFields: [
          "ID",
          "Name",
          "Type",
          "Manufacturer",
          "Net Book Value",
          "Location",
          "Status",
        ],
        icon: Network,
        priority: "medium",
        estimatedRows: 80,
        status: "not_uploaded",
      },
    ],
    operations: [
      {
        id: "offices_facilities",
        name: "Office & Facilities",
        category: "Direct Operations",
        description:
          "Owned and leased office spaces, warehouses and retail locations",
        templateFile: "offices_template.csv",
        dataFields: [
          "ID",
          "Name",
          "Address",
          "Floor Area (sqm)",
          "Ownership",
          "Annual Rent / Book Value",
          "Energy Consumption (kWh)",
          "Status",
        ],
        icon: Building2,
        priority: "high",
        estimatedRows: 30,
        status: "not_uploaded",
      },
      {
        id: "company_fleet",
        name: "Company Fleet",
        category: "Direct Operations",
        description:
          "Corporate vehicles, motorcycles and transportation assets",
        templateFile: "fleet_template.csv",
        dataFields: [
          "ID",
          "Registration",
          "Type",
          "Fuel Type",
          "Year",
          "Net Book Value",
          "Annual Km",
          "Status",
        ],
        icon: Truck,
        priority: "medium",
        estimatedRows: 40,
        status: "not_uploaded",
      },
      {
        id: "industrial_equipment",
        name: "Industrial Equipment",
        category: "Direct Operations",
        description: "Machinery, generators and industrial operational assets",
        templateFile: "industrial_equip_template.csv",
        dataFields: [
          "ID",
          "Name",
          "Type",
          "Capacity",
          "Net Book Value",
          "Age (Years)",
          "Fuel Type",
          "Status",
        ],
        icon: Factory,
        priority: "medium",
        estimatedRows: 25,
        status: "not_uploaded",
      },
    ],
    "supply-chain": [
      {
        id: "tier1_suppliers",
        name: "Tier 1 Suppliers",
        category: "Supply Chain",
        description: "Direct first-tier vendors and raw material suppliers",
        templateFile: "tier1_suppliers_template.csv",
        dataFields: [
          "Supplier ID",
          "Name",
          "Country",
          "Category",
          "Annual Spend",
          "Currency",
          "Credit Score",
          "Status",
        ],
        icon: Truck,
        priority: "high",
        estimatedRows: 50,
        status: "not_uploaded",
      },
      {
        id: "logistics_transport",
        name: "Logistics & Transport",
        category: "Supply Chain",
        description:
          "Freight, last-mile delivery and logistics service providers",
        templateFile: "logistics_template.csv",
        dataFields: [
          "ID",
          "Provider",
          "Mode",
          "Origin Country",
          "Annual Spend",
          "Tonnes (CO2e)",
          "Status",
        ],
        icon: Truck,
        priority: "medium",
        estimatedRows: 30,
        status: "not_uploaded",
      },
      {
        id: "procurement_data",
        name: "Procurement Data",
        category: "Supply Chain",
        description: "Purchase orders, contracts and spend analytics",
        templateFile: "procurement_template.csv",
        dataFields: [
          "PO ID",
          "Supplier",
          "Category",
          "Amount",
          "Currency",
          "Date",
          "Status",
        ],
        icon: Database,
        priority: "low",
        estimatedRows: 200,
        status: "not_uploaded",
      },
    ],
    infrastructure: [
      {
        id: "physical_buildings",
        name: "Physical Buildings",
        category: "Infrastructure",
        description: "Owned real estate, buildings and structures",
        templateFile: "buildings_template.csv",
        dataFields: [
          "ID",
          "Name",
          "Address",
          "Type",
          "Floor Area (sqm)",
          "Year Built",
          "Net Book Value",
          "Status",
        ],
        icon: Building2,
        priority: "high",
        estimatedRows: 20,
        status: "not_uploaded",
      },
      {
        id: "utility_connections",
        name: "Utility Connections",
        category: "Infrastructure",
        description: "Power, water, gas and telecom utility supply points",
        templateFile: "utilities_template.csv",
        dataFields: [
          "Connection ID",
          "Type",
          "Provider",
          "Location",
          "Annual Cost",
          "Annual Consumption",
          "Unit",
          "Status",
        ],
        icon: Network,
        priority: "medium",
        estimatedRows: 15,
        status: "not_uploaded",
      },
      {
        id: "land_assets",
        name: "Land Assets",
        category: "Infrastructure",
        description: "Owned and long-term leased land parcels",
        templateFile: "land_template.csv",
        dataFields: [
          "Parcel ID",
          "Location",
          "Area (Ha)",
          "Land Use",
          "Net Book Value",
          "Tenure",
          "Status",
        ],
        icon: MapPin,
        priority: "medium",
        estimatedRows: 10,
        status: "not_uploaded",
      },
    ],
  });
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(() =>
    industryConfig.assetTypes.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description,
      templateFile: a.templateFile,
      dataFields: a.dataFields,
      icon: a.icon,
      priority: a.priority,
      estimatedRows: a.estimatedRows,
      status: "not_uploaded" as const,
    })),
  );
  React.useEffect(() => {
    setAssetTypes((prev) =>
      prev.map((asset) => {
        const stored = assets[asset.id];
        if (
          stored &&
          stored.uploadedAt &&
          stored.validationStatus === "validated"
        ) {
          return {
            ...asset,
            status: "uploaded",
            uploadedDate: stored.uploadedAt,
            rowCount: stored.rowCount,
            columnCount: stored.columnCount,
            uploadedFile: new File([], stored.fileName || "Stored Data"),
            validationErrors: undefined,
          };
        }
        return asset;
      }),
    );
  }, [assets]);
  const statuses = [
    { value: "all", label: "All Status" },
    { value: "validated", label: "Validated" },
    { value: "uploaded", label: "Uploaded" },
    { value: "not_uploaded", label: "Pending" },
    { value: "error", label: "Error" },
    { value: "uploading", label: "Uploading" },
  ];
  const handleFileUpload = async (assetTypeId: string, file: File) => {
    setUploadQueue((prev) => [...prev, assetTypeId]);
    setAssetTypes((prev) =>
      prev.map((asset) =>
        asset.id === assetTypeId
          ? { ...asset, status: "uploading" as const }
          : asset,
      ),
    );
    try {
      const data = await file.arrayBuffer();
      const jsonData: unknown[][] = [];
      const isCsv =
        file.name.toLowerCase().endsWith(".csv") ||
        file.type === "text/csv" ||
        file.type === "text/plain";
      if (isCsv) {
        const text = new TextDecoder("utf-8").decode(data);
        const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim() !== "");
        for (const line of lines) {
          const cols: string[] = [];
          let cur = "";
          let inQ = false;
          for (let ci = 0; ci < line.length; ci++) {
            const ch = line[ci];
            if (ch === '"') {
              inQ = !inQ;
            } else if (ch === "," && !inQ) {
              cols.push(cur);
              cur = "";
            } else {
              cur += ch;
            }
          }
          cols.push(cur);
          jsonData.push(cols);
        }
      } else {
        const workbook = new Workbook();
        await workbook.xlsx.load(data);
        const worksheet = workbook.worksheets[0];
        worksheet.eachRow((row) => {
          jsonData.push(
            (
              row.values as (
                | string
                | number
                | boolean
                | Date
                | null
                | undefined
              )[]
            ).slice(1),
          );
        });
      }
      if (jsonData.length === 0) {
        throw new Error("Empty file");
      }
      const headers = (jsonData[0] || []).map((h) => String(h).trim());
      const columnCount = headers.length;
      const templateDef =
        TEMPLATE_DEFINITIONS[assetTypeId as keyof typeof TEMPLATE_DEFINITIONS];
      if (templateDef) {
        const requiredColumns = templateDef.columns
          .filter((c) => c.required)
          .map((c) => c.field);
        const normalizedHeaders = headers.map((h) =>
          h.toLowerCase().replace(/[^a-z0-9]/g, ""),
        );
        const missingColumns = requiredColumns.filter((reqCol) => {
          const normReq = reqCol.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (normReq === "bondnameissuer") {
            return !(
              normalizedHeaders.includes("bondnameissuer") ||
              (normalizedHeaders.includes("bondname") &&
                normalizedHeaders.includes("issuer"))
            );
          }
          return !normalizedHeaders.includes(normReq);
        });
        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required columns: ${missingColumns.join(", ")}`,
          );
        }
      }
      const columnMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/[^a-z0-9]/g, "");
        columnMap[key] = index;
      });
      const findValue = (patterns: string[], values: unknown[]): string => {
        for (const pattern of patterns) {
          const idx = columnMap[pattern];
          if (
            idx !== undefined &&
            values[idx] !== undefined &&
            values[idx] !== null
          ) {
            return String(values[idx]).trim();
          }
        }
        return "";
      };
      const parsedAssets: Asset[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const values = jsonData[i];
        if (
          values &&
          values.length > 0 &&
          values.some(
            (v: unknown) =>
              v !== undefined && v !== null && String(v).trim() !== "",
          )
        ) {
          const id =
            findValue(
              [
                "id",
                "assetid",
                "loanid",
                "facilityid",
                "accountid",
                "towerid",
                "segmentid",
                "equipmentid",
                "systemid",
                "licenseid",
                "routeid",
                "vehicleid",
                "propertyid",
                "platformid",
              ],
              values,
            ) || `${assetTypeId.toUpperCase()}-${String(i).padStart(5, "0")}`;
          const borrowerName =
            findValue(
              [
                "borrower",
                "borrowername",
                "name",
                "clientname",
                "customer",
                "sitename",
                "towername",
                "routename",
                "facilityname",
                "equipmentname",
                "licensename",
                "systemname",
                "assetname",
                "platformname",
                "vehiclename",
                "description",
              ],
              values,
            ) || `Asset ${i}`;
          const sector =
            findValue(
              [
                "sector",
                "industry",
                "industrysector",
                "businesstype",
                "segment",
                "category",
                "borrowertype",
                "classification",
                "assettype",
                "securitytype",
                "derivativetype",
                "guaranteetype",
                "producttype",
              ],
              values,
            ) || "Unclassified";
          const region =
            findValue(
              [
                "Geopolitical Zone",
                "State",
                "geopoliticalzone",
                "State",
                "area",
                "province",
                "state",
                "district",
                "zone",
                "city",
                "branch",
                "territory",
              ],
              values,
            ) || "Unknown";
          const exposureStr = findValue(
            [
              "exposure",
              "balance",
              "outstandingbalance",
              "amount",
              "principal",
              "loanamount",
              "valuation",
              "value",
              "marketvalue",
              "bookvalue",
              "netbookvalue",
              "insuredamount",
              "limit",
              "facilityamount",
              "notional",
              "notionalvalue",
              "parvalue",
              "facevalue",
            ],
            values,
          );
          const exposure = parseFloat(exposureStr.replace(/[^\d.-]/g, "")) || 0;
          const currency =
            findValue(["currency", "curr", "ccy"], values) || "NGN";
          const status =
            findValue(
              [
                "status",
                "accountstatus",
                "loanstatus",
                "operationalstatus",
                "condition",
              ],
              values,
            ) || "Active";
          const latStr = findValue(["latitude", "lat"], values);
          const lngStr = findValue(["longitude", "lng", "lon", "long"], values);
          const row: Asset = {
            id,
            borrowerName,
            sector,
            region,
            outstandingBalance: exposure,
            currency,
            status,
            latitude: latStr ? parseFloat(latStr) : undefined,
            longitude: lngStr ? parseFloat(lngStr) : undefined,
          };
          headers.forEach((header, index) => {
            if (
              values[index] !== undefined &&
              ![
                "id",
                "borrower",
                "sector",
                "Geopolitical Zone",
                "State",
                "exposure",
                "currency",
                "status",
                "latitude",
                "longitude",
              ].includes(header.toLowerCase().replace(/[^a-z]/g, ""))
            ) {
              row[header] = values[index];
            }
          });
          parsedAssets.push(row);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadQueue((prev) => prev.filter((id) => id !== assetTypeId));
      const assetData: AssetTypeData = {
        type: assetTypeId,
        data: parsedAssets,
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        rowCount: parsedAssets.length,
        columnCount: columnCount,
        validationStatus: "validated",
        validationErrors: [],
      };
      setAssetData(assetTypeId, assetData);
      updateStatus("dataUploaded", true);
      updateStatus("segmentationReady", true);
      setAssetTypes((prev) =>
        prev.map((asset) => {
          if (asset.id === assetTypeId) {
            return {
              ...asset,
              uploadedFile: file,
              uploadedDate: new Date().toISOString(),
              rowCount: parsedAssets.length,
              columnCount: columnCount,
              status: "validated",
              validationErrors: undefined,
            };
          }
          return asset;
        }),
      );
    } catch (error) {
      setUploadQueue((prev) => prev.filter((id) => id !== assetTypeId));
      setAssetTypes((prev) =>
        prev.map((asset) => {
          if (asset.id === assetTypeId) {
            return {
              ...asset,
              status: "error",
              validationErrors: [
                `Failed to parse file: ${(error as Error).message}`,
              ],
            };
          }
          return asset;
        }),
      );
    }
  };
  const handleRemoveFile = (assetTypeId: string) => {
    clearAssetData(assetTypeId);
    setAssetTypes((prev) =>
      prev.map((asset) =>
        asset.id === assetTypeId
          ? {
              ...asset,
              uploadedFile: undefined,
              uploadedDate: undefined,
              rowCount: undefined,
              columnCount: undefined,
              status: "not_uploaded",
              validationErrors: undefined,
            }
          : asset,
      ),
    );
    const hasData = Object.keys(useCRADataStore.getState().assets).length > 1;
    if (!hasData) {
      updateStatus("dataUploaded", false);
    }
  };
  const handleDownloadTemplate = (assetTypeId: string) => {
    downloadExcelTemplate(assetTypeId as keyof typeof TEMPLATE_DEFINITIONS);
  };
  const handleDownloadAllTemplates = () => {
    assetTypes.forEach((asset) => {
      setTimeout(() => {
        handleDownloadTemplate(asset.id);
      }, 500);
    });
  };
  const handleAddCustomAssetType = () => {
    if (!newAsset.name.trim()) return;
    const id = newAsset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const columns = newAsset.columns
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const customAsset: AssetType = {
      id,
      name: newAsset.name.trim(),
      category: newAsset.category.trim() || "Custom",
      description:
        newAsset.description.trim() ||
        (industryConfig.id === "telecommunications"
          ? `Custom infrastructure & operations: ${newAsset.name}`
          : `Custom asset type: ${newAsset.name}`),
      templateFile: `${id}_template.csv`,
      dataFields: columns.length > 0 ? columns : ["ID", "Name", "Value"],
      icon: Database,
      priority: newAsset.priority,
      estimatedRows: 50,
      status: "not_uploaded",
    };
    setAssetTypes((prev) => [...prev, customAsset]);
    setNewAsset({
      name: "",
      category: "",
      description: "",
      columns: "",
      priority: "medium",
    });
    setAddAssetDialog(false);
  };
  const handleRemoveCustomAsset = (assetId: string) => {
    const configIds = industryConfig.assetTypes.map((a) => a.id);
    if (configIds.includes(assetId)) return;
    clearAssetData(assetId);
    setAssetTypes((prev) => prev.filter((a) => a.id !== assetId));
  };
  const handleViewData = (assetTypeId: string) => {
    setViewDataDialog({ open: true, assetId: assetTypeId });
    setPage(0);
  };
  const getActiveAssetData = () => {
    if (!viewDataDialog.assetId) return [];
    return assets[viewDataDialog.assetId]?.data || [];
  };
  const filteredAssets = assetTypes.filter((asset) => {
    const matchesSearch =
      searchTerm === "" ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.dataFields?.some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      filterCategory === "all" || asset.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const validatedCount = assetTypes.filter(
    (a) => a.status === "validated" || a.status === "uploaded",
  ).length;
  const pendingCount = assetTypes.filter(
    (a) => a.status === "not_uploaded",
  ).length;
  const uploadPct =
    assetTypes.length > 0
      ? Math.round((validatedCount / assetTypes.length) * 100)
      : 0;

  return (
    <CRALayout>
      <div className="flex-1 flex flex-col">
        {/* â”€â”€ Animations & component-scoped styles â”€â”€ */}
        <style>{`
          @keyframes craFadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes craHeroGlow {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50%       { opacity: 0.25; transform: scale(1.06); }
          }
          @keyframes checkPop {
            0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
            60%  { transform: scale(1.2) rotate(3deg);  opacity: 1; }
            100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
          }
          .cra-fu  { animation: craFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
          .cra-chk { animation: checkPop  0.32s cubic-bezier(0.34,1.56,0.64,1) forwards; }

          .cra-card {
            background: white;
            border-radius: 16px;
            border: 1.5px solid #EAEAE8;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
            transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
            display: flex; flex-direction: column;
          }
          .dark .cra-card { background:#141414; border-color:rgba(255,255,255,0.07); box-shadow:0 1px 3px rgba(0,0,0,0.25); }
          .cra-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.09),0 2px 6px rgba(0,0,0,0.04); transform:translateY(-2px); }
          .cra-card.ok  { border-color: rgba(134,188,37,0.35); }
          .dark .cra-card.ok  { border-color: rgba(134,188,37,0.22); }
          .cra-card.err { border-color: rgba(239,68,68,0.35); }
          .dark .cra-card.err { border-color: rgba(239,68,68,0.22); }

          .cra-drop {
            border: 2px dashed #E2E2E0; border-radius: 12px;
            text-align: center; cursor: pointer;
            transition: all 0.2s ease; padding: 20px 12px;
          }
          .dark .cra-drop { border-color: rgba(255,255,255,0.1); }
          .cra-drop:hover { border-color: rgba(134,188,37,0.5); background: rgba(134,188,37,0.025); }
          .cra-drop.over  { border-color: #86BC25; background: rgba(134,188,37,0.06); }

          .cra-btn {
            display:inline-flex; align-items:center; gap:5px;
            height:32px; padding:0 12px; border-radius:8px;
            font-size:12.5px; font-weight:600; cursor:pointer; white-space:nowrap;
            transition:all 0.18s ease; border:1.5px solid #E2E2E0;
            background:white; color:#555;
          }
          .dark .cra-btn { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); color:rgba(255,255,255,0.55); }
          .cra-btn:hover { border-color:rgba(134,188,37,0.55); color:#86BC25; }
          .cra-btn.prim  { background:#86BC25; border-color:#86BC25; color:white; }
          .cra-btn.prim:hover { background:#76A820; border-color:#76A820; }
          .cra-btn.ghost { border-color:transparent; }
          .cra-btn.ghost:hover { border-color:rgba(134,188,37,0.35); background:rgba(134,188,37,0.05); }
          .cra-btn.danger { border-color:transparent; color:#EF4444; }
          .cra-btn.danger:hover { border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.06); }

          .cra-search {
            width:100%; height:40px; padding:0 12px 0 36px;
            background:white; border:1.5px solid #E2E2E0; border-radius:10px;
            font-size:13.5px; color:#1A1A1A; outline:none;
            transition:border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .dark .cra-search { background:#141414; border-color:rgba(255,255,255,0.08); color:#F0F0F0; }
          .cra-search:focus { border-color:#86BC25; box-shadow:0 0 0 3px rgba(134,188,37,0.10); }
          .cra-search::placeholder { color:#B4B4B2; }
          .dark .cra-search::placeholder { color:#444; }
        `}</style>

        {/* â”€â”€ HERO HEADER â”€â”€ */}
        <div className="relative overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13] flex-shrink-0">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
            }}
          />
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #86BC25 0%, transparent 70%)",
              animation: "craHeroGlow 6s ease-in-out infinite",
            }}
          />
          <div className="relative px-6 md:px-10 py-7 md:py-9">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Left: badge + title + subtitle */}
                <div className="cra-fu" style={{ animationDelay: "0ms" }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center shrink-0">
                      <Database size={13} className="text-white" />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Climate Risk Assessment &mdash; Data Management
                    </span>
                  </div>
                  <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-2">
                    {industryConfig.craLabels.dataUploadTitle}
                  </h1>
                  <p className="text-[13px] text-white/60 leading-relaxed max-w-[520px]">
                    {industryConfig.craLabels.dataUploadSubtitle}
                  </p>
                </div>

                {/* Right: stats + progress ring */}
                <div
                  className="cra-fu flex items-center gap-6 shrink-0"
                  style={{ animationDelay: "80ms" }}
                >
                  <div className="flex gap-7 text-center">
                    <div>
                      <div className="text-[24px] font-bold text-white leading-none">
                        {assetTypes.length}
                      </div>
                      <div
                        className="text-[10px] text-white/35 uppercase tracking-widest mt-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Total
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-bold text-[#86BC25] leading-none">
                        {validatedCount}
                      </div>
                      <div
                        className="text-[10px] text-white/35 uppercase tracking-widest mt-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Ready
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-bold text-amber-400 leading-none">
                        {pendingCount}
                      </div>
                      <div
                        className="text-[10px] text-white/35 uppercase tracking-widest mt-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Pending
                      </div>
                    </div>
                  </div>
                  {/* SVG progress ring */}
                  <div className="relative w-[56px] h-[56px]">
                    <svg
                      viewBox="0 0 44 44"
                      className="w-14 h-14 -rotate-90"
                      style={{
                        filter: "drop-shadow(0 0 6px rgba(134,188,37,0.3))",
                      }}
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#86BC25"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 18}`}
                        strokeDashoffset={`${2 * Math.PI * 18 * (1 - uploadPct / 100)}`}
                        style={{
                          transition:
                            "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-white">
                        {uploadPct}
                        <span className="text-[8px] text-white/40">%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#F4F5F7] dark:bg-[#0D0D0D]">
          {/* ── Section Tab Bar ── */}
          <div
            className={`sticky top-0 z-10 border-b border-[#E5E5E3] dark:border-white/[0.07] px-6 md:px-10 ${isDark ? "bg-[#111111]" : "bg-white"} shadow-sm`}
          >
            <div className="max-w-[1400px] mx-auto flex items-center gap-1 overflow-x-auto">
              {sectionDefs.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                      isActive
                        ? "border-[#86BC25] text-[#1A3C21] dark:text-white"
                        : "border-transparent text-[#888] dark:text-white/35 hover:text-[#444] dark:hover:text-white/60 hover:border-[#D0D0CE] dark:hover:border-white/[0.12]"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isActive ? "text-[#86BC25]" : ""}
                    />
                    {sec.label}
                    {sec.id === "company" && companyProfileSaved && (
                      <CheckSquare size={12} className="text-[#86BC25]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 md:px-10 py-6">
            <div className="max-w-[1400px] mx-auto space-y-4">
              {/* ═══════════════════════════════
                  COMPANY PROFILE
              ═══════════════════════════════ */}
              {activeSection === "company" && (
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[17px] font-bold text-[#1D1D1D] dark:text-white/90">
                        Company Profile
                      </h2>
                      <p className="text-[12.5px] text-[#888] dark:text-white/35 mt-0.5">
                        Enter your organisation's core details for the CRA
                        assessment.
                      </p>
                    </div>
                    {companyProfileSaved && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#EBF5D6] dark:bg-[#86BC25]/10 text-[#4D7A0D] dark:text-[#A0D040] border border-[#86BC25]/30">
                        <CheckCircle2 size={11} /> Saved
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#E5E5E3] dark:border-white/[0.07] bg-white dark:bg-[#111111] overflow-hidden shadow-sm">
                    {/* Organisation Identity */}
                    <div className="px-6 py-5 border-b border-[#F0F0EE] dark:border-white/[0.05]">
                      <p
                        className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-4"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Organisation Identity
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Building2 size={11} /> Organisation Name{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="e.g., Agricultural Bank PLC"
                            value={companyProfile.orgName}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                orgName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Database size={11} /> Registration Number
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="e.g., RC123456"
                            value={companyProfile.regNumber}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                regNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Factory size={11} /> Industry / Sector
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="e.g., Financial Services"
                            value={companyProfile.industry}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                industry: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Globe size={11} /> Country of Operation
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="Nigeria"
                            value={companyProfile.country}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                country: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <MapPin size={11} /> Registered Address
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="Street, City, State"
                            value={companyProfile.address}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reporting Context */}
                    <div className="px-6 py-5 border-b border-[#F0F0EE] dark:border-white/[0.05]">
                      <p
                        className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-4"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Reporting Context
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Calendar size={11} /> Reporting Year{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            min="2000"
                            max="2100"
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all"
                            value={companyProfile.reportingYear}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                reportingYear: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <DollarSign size={11} /> Reporting Currency
                          </label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all"
                            value={companyProfile.currency}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                currency: e.target.value,
                              })
                            }
                          >
                            {[
                              "NGN",
                              "GHS",
                              "USD",
                              "EUR",
                              "GBP",
                              "KES",
                              "ZAR",
                            ].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Landmark size={11} /> Total Assets
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="e.g., 1,200,000,000"
                            value={companyProfile.totalAssets}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                totalAssets: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Users size={11} /> No. of Employees
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="e.g., 2500"
                            value={companyProfile.employees}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                employees: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Primary Contact */}
                    <div className="px-6 py-5 border-b border-[#F0F0EE] dark:border-white/[0.05]">
                      <p
                        className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-4"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Primary Contact
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <User size={11} /> Contact Name
                          </label>
                          <input
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="Full name"
                            value={companyProfile.contactName}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                contactName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Mail size={11} /> Email Address
                          </label>
                          <input
                            type="email"
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="name@organisation.com"
                            value={companyProfile.contactEmail}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                contactEmail: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Phone size={11} /> Phone Number
                          </label>
                          <input
                            type="tel"
                            className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20"
                            placeholder="+234 800 000 0000"
                            value={companyProfile.contactPhone}
                            onChange={(e) =>
                              setCompanyProfile({
                                ...companyProfile,
                                contactPhone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="px-6 py-5 border-b border-[#F0F0EE] dark:border-white/[0.05]">
                      <p
                        className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-4"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Organisation Description
                      </p>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCC] dark:placeholder:text-white/20 resize-none"
                        placeholder="Brief description of the organisation's business, operations and primary activities..."
                        value={companyProfile.description}
                        onChange={(e) =>
                          setCompanyProfile({
                            ...companyProfile,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-between px-6 py-4 ${isDark ? "bg-[#161616]" : "bg-[#FAFAF9]"}`}
                    >
                      <p className="text-[11.5px] text-[#AAA] dark:text-white/30">
                        Fields marked{" "}
                        <span className="text-red-400 font-bold">*</span> are
                        required
                      </p>
                      <button
                        onClick={() => {
                          if (
                            companyProfile.orgName.trim() &&
                            companyProfile.reportingYear.trim()
                          ) {
                            setCompanyProfileData(companyProfile);
                            setCompanyProfileSaved(true);
                            setActiveSection("financial");
                          }
                        }}
                        disabled={
                          !companyProfile.orgName.trim() ||
                          !companyProfile.reportingYear.trim()
                        }
                        className="cra-btn prim disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Save size={13} /> Save &amp; Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════
                  FINANCIAL ASSETS
              ═══════════════════════════════ */}
              {activeSection === "financial" && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
                      />
                      <input
                        className="cra-search"
                        placeholder={
                          industryConfig.id === "telecommunications"
                            ? "Search infrastructure..."
                            : "Search asset types..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {statuses.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setFilterStatus(s.value)}
                          className={`h-[30px] px-3 rounded-full text-[11px] font-semibold border transition-all ${
                            filterStatus === s.value
                              ? "bg-[#86BC25] border-[#86BC25] text-white"
                              : "bg-white dark:bg-white/[0.04] border-[#E0E0DE] dark:border-white/[0.08] text-[#555] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25]"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={handleDownloadAllTemplates}
                        className="cra-btn"
                      >
                        <Download size={13} /> All Templates
                      </button>
                      <button
                        onClick={() => setAddAssetDialog(true)}
                        className="cra-btn prim"
                      >
                        <Plus size={13} />
                        {industryConfig.id === "telecommunications"
                          ? "Add New"
                          : "Add Asset Type"}
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border border-[#E5E5E3] dark:border-white/[0.07] overflow-hidden shadow-sm bg-white dark:bg-[#111111]">
                    <div
                      className={`grid text-[10.5px] font-bold uppercase tracking-[0.12em] px-5 py-3 border-b border-[#EBEBEA] dark:border-white/[0.06] ${isDark ? "bg-[#161616]" : "bg-[#FAFAF9]"}`}
                      style={{
                        gridTemplateColumns: "2fr 1fr 1fr 1.2fr 220px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span className="text-[#888] dark:text-white/30">
                        {industryConfig.id === "telecommunications"
                          ? "Infrastructure / Operations"
                          : "Asset Type"}
                      </span>
                      <span className="text-[#888] dark:text-white/30">
                        Status
                      </span>
                      <span className="text-[#888] dark:text-white/30">
                        Data
                      </span>
                      <span className="text-[#888] dark:text-white/30">
                        Priority
                      </span>
                      <span className="text-[#888] dark:text-white/30">
                        Actions
                      </span>
                    </div>

                    {filteredAssets.length === 0 ? (
                      <div className="py-20 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] dark:bg-white/[0.04] mx-auto mb-3 flex items-center justify-center">
                          <Database
                            size={20}
                            className="text-[#CCC] dark:text-white/20"
                          />
                        </div>
                        <p className="text-[13px] font-semibold text-[#888] dark:text-white/30">
                          No matches
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("all");
                          }}
                          className="mt-2 text-[12px] text-[#86BC25] font-semibold hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      filteredAssets.map((asset, idx) => {
                        const isUploading = uploadQueue.includes(asset.id);
                        const isDragOver = dragOverId === asset.id;
                        const isExpanded = expandedAsset === asset.id;
                        const isValidated =
                          asset.status === "validated" ||
                          asset.status === "uploaded";
                        const isError = asset.status === "error";
                        const storedData = assets[asset.id];
                        const totalExposure =
                          storedData?.data?.reduce(
                            (sum, r) =>
                              sum +
                              (Number(r.outstandingBalance) ||
                                Number(r["Net Book Value"]) ||
                                Number(r["Book Value"]) ||
                                0),
                            0,
                          ) ?? 0;
                        const isCustom = !industryConfig.assetTypes.some(
                          (a) => a.id === asset.id,
                        );
                        const isLast = idx === filteredAssets.length - 1;

                        const statusPill = isUploading ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                            <Loader2 size={10} className="animate-spin" />{" "}
                            Uploading
                          </span>
                        ) : isValidated ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF5D6] dark:bg-[#86BC25]/[0.10] text-[#4D7A0D] dark:text-[#A0D040] border border-[#86BC25]/30">
                            <CheckCircle2 size={10} /> Validated
                          </span>
                        ) : isError ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                            <AlertCircle size={10} /> Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F5F7] dark:bg-white/[0.04] text-[#888] dark:text-white/35 border border-[#E5E5E3] dark:border-white/[0.08]">
                            <Database size={10} /> Pending
                          </span>
                        );

                        const priorityPill =
                          asset.priority === "high" ? (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20">
                              High
                            </span>
                          ) : asset.priority === "medium" ? (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 border border-amber-100 dark:border-amber-500/20">
                              Medium
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-white/25 border border-slate-200 dark:border-white/[0.07]">
                              Low
                            </span>
                          );

                        return (
                          <div
                            key={asset.id}
                            className={`cra-fu ${!isLast ? "border-b border-[#EBEBEA] dark:border-white/[0.05]" : ""}`}
                            style={{ animationDelay: `${idx * 25}ms` }}
                          >
                            <div
                              className="grid items-center px-5 py-3.5 gap-4 transition-colors hover:bg-[#FAFAF8] dark:hover:bg-white/[0.015]"
                              style={{
                                gridTemplateColumns: "2fr 1fr 1fr 1.2fr 220px",
                              }}
                            >
                              {/* Col 1: icon + name */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${isValidated ? "bg-[#86BC25] shadow-[0_2px_8px_rgba(134,188,37,0.3)]" : isError ? "bg-red-500/10 dark:bg-red-500/15" : "bg-[#F0F0EE] dark:bg-white/[0.06]"}`}
                                >
                                  {asset.icon ? (
                                    <asset.icon
                                      size={16}
                                      className={
                                        isValidated
                                          ? "text-white"
                                          : isError
                                            ? "text-red-500"
                                            : "text-[#888] dark:text-white/40"
                                      }
                                    />
                                  ) : (
                                    <Database
                                      size={16}
                                      className={
                                        isValidated
                                          ? "text-white"
                                          : "text-[#888]"
                                      }
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13.5px] font-semibold text-[#1D1D1D] dark:text-white/90 truncate">
                                    {asset.name}
                                  </p>
                                  <p className="text-[11px] text-[#AAAAAA] dark:text-white/30 truncate mt-0.5">
                                    {asset.category}
                                    {isCustom && (
                                      <span className="ml-1.5 text-[9.5px] font-bold uppercase tracking-widest text-[#86BC25]">
                                        Custom
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {/* Col 2 */}
                              <div>{statusPill}</div>
                              {/* Col 3 */}
                              <div>
                                {asset.rowCount ? (
                                  <div>
                                    <p className="text-[12.5px] font-semibold text-[#333] dark:text-white/70">
                                      {asset.rowCount.toLocaleString()}{" "}
                                      <span className="font-normal text-[#999]">
                                        rec.
                                      </span>
                                    </p>
                                    {totalExposure > 0 && (
                                      <p className="text-[11px] text-[#999] dark:text-white/30 mt-0.5">
                                        {totalExposure >= 1e9
                                          ? `₦${(totalExposure / 1e9).toFixed(1)}B`
                                          : totalExposure >= 1e6
                                            ? `₦${(totalExposure / 1e6).toFixed(1)}M`
                                            : `₦${totalExposure.toLocaleString()}`}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-[11.5px] text-[#BBBBBB] dark:text-white/25">
                                    Est. {asset.estimatedRows}
                                  </p>
                                )}
                              </div>
                              {/* Col 4 */}
                              <div>{priorityPill}</div>
                              {/* Col 5: actions */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {!asset.uploadedFile ? (
                                  <label
                                    className={`cra-btn cursor-pointer ${isDragOver ? "border-[#86BC25] text-[#86BC25]" : ""}`}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setDragOverId(asset.id);
                                    }}
                                    onDragLeave={() => setDragOverId(null)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      setDragOverId(null);
                                      const f = e.dataTransfer.files?.[0];
                                      if (f) handleFileUpload(asset.id, f);
                                    }}
                                  >
                                    {isUploading ? (
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <UploadCloud size={12} />
                                    )}
                                    {isUploading ? "Uploading..." : "Upload"}
                                    <input
                                      type="file"
                                      accept=".xlsx,.xls,.csv"
                                      hidden
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileUpload(asset.id, f);
                                        if (e.target) e.target.value = "";
                                      }}
                                    />
                                  </label>
                                ) : (
                                  <>
                                    {!isError && (
                                      <button
                                        onClick={() => handleViewData(asset.id)}
                                        className="cra-btn"
                                      >
                                        <Eye size={12} /> View
                                      </button>
                                    )}
                                    <label className="cra-btn cursor-pointer">
                                      <UploadCloud size={12} /> Re-upload
                                      <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        hidden
                                        onChange={(e) => {
                                          const f = e.target.files?.[0];
                                          if (f) handleFileUpload(asset.id, f);
                                          if (e.target) e.target.value = "";
                                        }}
                                      />
                                    </label>
                                    <button
                                      onClick={() => handleRemoveFile(asset.id)}
                                      className="cra-btn danger"
                                      title="Remove"
                                    >
                                      <XCircle size={12} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() =>
                                    handleDownloadTemplate(asset.id)
                                  }
                                  className="cra-btn ghost"
                                  title="Download template"
                                >
                                  <Download size={12} />
                                </button>
                                <button
                                  onClick={() =>
                                    setExpandedAsset(
                                      isExpanded ? null : asset.id,
                                    )
                                  }
                                  className="cra-btn ghost"
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={12} />
                                  ) : (
                                    <ChevronDown size={12} />
                                  )}
                                </button>
                                {isCustom && (
                                  <button
                                    onClick={() =>
                                      handleRemoveCustomAsset(asset.id)
                                    }
                                    className="cra-btn danger"
                                    title="Remove custom type"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Expanded row */}
                            {isExpanded && (
                              <div
                                className={`px-5 pb-5 pt-2 ${isDark ? "bg-white/[0.015]" : "bg-[#FAFAF9]"} border-t border-[#F0F0EE] dark:border-white/[0.04]`}
                              >
                                <div className="flex gap-10">
                                  <div className="flex-1">
                                    <p
                                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-2"
                                      style={{ fontFamily: "var(--font-mono)" }}
                                    >
                                      Required Fields
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {asset.dataFields?.map((field) => (
                                        <span
                                          key={field}
                                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.05] border border-[#E5E5E3] dark:border-white/[0.08] text-[#555] dark:text-white/50"
                                        >
                                          {field}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  {asset.description && (
                                    <div className="max-w-[400px]">
                                      <p
                                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-2"
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                        }}
                                      >
                                        Description
                                      </p>
                                      <p className="text-[12px] text-[#777] dark:text-white/40 leading-relaxed">
                                        {asset.description}
                                      </p>
                                    </div>
                                  )}
                                  {isError && asset.validationErrors?.[0] && (
                                    <div className="flex-1">
                                      <p
                                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400 mb-2"
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                        }}
                                      >
                                        Validation Error
                                      </p>
                                      <p className="text-[12px] text-red-500 leading-relaxed">
                                        {asset.validationErrors[0]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Table footer */}
                    {filteredAssets.length > 0 && (
                      <div
                        className={`px-5 py-3 border-t border-[#EBEBEA] dark:border-white/[0.06] flex items-center gap-6 ${isDark ? "bg-[#161616]" : "bg-[#FAFAF9]"}`}
                      >
                        <span
                          className="text-[11px] text-[#AAA] dark:text-white/25"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {filteredAssets.length} types &nbsp;&middot;&nbsp;{" "}
                          {validatedCount} ready &nbsp;&middot;&nbsp;{" "}
                          {pendingCount} pending
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-[#E5E5E3] dark:bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#86BC25] rounded-full transition-all duration-700"
                              style={{ width: `${uploadPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#86BC25]">
                            {uploadPct}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════
                  ICT / OPERATIONS / SUPPLY CHAIN / INFRASTRUCTURE
              ═══════════════════════════════ */}
              {(
                ["ict", "operations", "supply-chain", "infrastructure"] as const
              ).map((secId) => {
                if (activeSection !== secId) return null;
                const secDef = sectionDefs.find((s) => s.id === secId)!;
                const SecIcon = secDef.icon;
                const secList = sectionAssets[secId] ?? [];
                const setSectionList = (
                  updater: (prev: AssetType[]) => AssetType[],
                ) =>
                  setSectionAssets((prev) => ({
                    ...prev,
                    [secId]: updater(prev[secId] ?? []),
                  }));

                return (
                  <div key={secId} className="space-y-4">
                    {/* Toolbar */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
                        />
                        <input
                          className="cra-search"
                          placeholder={`Search ${secDef.label.toLowerCase()}...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => setAddAssetDialog(true)}
                        className="cra-btn prim ml-auto"
                      >
                        <Plus size={13} /> Add Type
                      </button>
                    </div>

                    {/* Banner */}
                    <div
                      className="rounded-xl border px-4 py-3 flex items-center gap-3"
                      style={{
                        borderColor: `${secDef.color}30`,
                        background: `${secDef.color}08`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${secDef.color}18` }}
                      >
                        <SecIcon size={15} style={{ color: secDef.color }} />
                      </div>
                      <div>
                        <p className="text-[12.5px] font-semibold text-[#1D1D1D] dark:text-white/80">
                          {secDef.label} Data
                        </p>
                        <p className="text-[11px] text-[#888] dark:text-white/35">
                          Upload CSV or Excel files for each data type. Download
                          templates to get started.
                        </p>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-2xl border border-[#E5E5E3] dark:border-white/[0.07] overflow-hidden shadow-sm bg-white dark:bg-[#111111]">
                      <div
                        className={`grid text-[10.5px] font-bold uppercase tracking-[0.12em] px-5 py-3 border-b border-[#EBEBEA] dark:border-white/[0.06] ${isDark ? "bg-[#161616]" : "bg-[#FAFAF9]"}`}
                        style={{
                          gridTemplateColumns: "2fr 1fr 1fr 1.2fr 220px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <span className="text-[#888] dark:text-white/30">
                          Data Type
                        </span>
                        <span className="text-[#888] dark:text-white/30">
                          Status
                        </span>
                        <span className="text-[#888] dark:text-white/30">
                          Data
                        </span>
                        <span className="text-[#888] dark:text-white/30">
                          Priority
                        </span>
                        <span className="text-[#888] dark:text-white/30">
                          Actions
                        </span>
                      </div>

                      {secList.filter(
                        (a) =>
                          searchTerm === "" ||
                          a.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      ).length === 0 ? (
                        <div className="py-20 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] dark:bg-white/[0.04] mx-auto mb-3 flex items-center justify-center">
                            <SecIcon
                              size={20}
                              className="text-[#CCC] dark:text-white/20"
                            />
                          </div>
                          <p className="text-[13px] font-semibold text-[#888] dark:text-white/30">
                            No data types found
                          </p>
                          <button
                            onClick={() => setSearchTerm("")}
                            className="mt-2 text-[12px] text-[#86BC25] font-semibold hover:underline"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : (
                        secList
                          .filter(
                            (a) =>
                              searchTerm === "" ||
                              a.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()),
                          )
                          .map((asset, idx, arr) => {
                            const isUploading = uploadQueue.includes(asset.id);
                            const isDragOver = dragOverId === asset.id;
                            const isExpanded = expandedAsset === asset.id;
                            const isValidated =
                              asset.status === "validated" ||
                              asset.status === "uploaded";
                            const isError = asset.status === "error";
                            const storedData = assets[asset.id];
                            const totalExposure =
                              storedData?.data?.reduce(
                                (sum, r) =>
                                  sum +
                                  (Number(r.outstandingBalance) ||
                                    Number(r["Net Book Value"]) ||
                                    Number(r["Book Value"]) ||
                                    0),
                                0,
                              ) ?? 0;
                            const isCustomSec = idx >= 3;
                            const isLast = idx === arr.length - 1;

                            const handleSecUpload = async (
                              assetId: string,
                              file: File,
                            ) => {
                              setUploadQueue((prev) => [...prev, assetId]);
                              setSectionList((prev) =>
                                prev.map((a) =>
                                  a.id === assetId
                                    ? { ...a, status: "uploading" as const }
                                    : a,
                                ),
                              );
                              try {
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 800),
                                );
                                setUploadQueue((prev) =>
                                  prev.filter((id) => id !== assetId),
                                );
                                setSectionList((prev) =>
                                  prev.map((a) =>
                                    a.id === assetId
                                      ? {
                                          ...a,
                                          uploadedFile: file,
                                          uploadedDate:
                                            new Date().toISOString(),
                                          rowCount:
                                            Math.floor(Math.random() * 80) + 10,
                                          columnCount:
                                            a.dataFields?.length ?? 5,
                                          status: "validated" as const,
                                        }
                                      : a,
                                  ),
                                );
                              } catch {
                                setUploadQueue((prev) =>
                                  prev.filter((id) => id !== assetId),
                                );
                                setSectionList((prev) =>
                                  prev.map((a) =>
                                    a.id === assetId
                                      ? {
                                          ...a,
                                          status: "error" as const,
                                          validationErrors: [
                                            "Failed to parse file",
                                          ],
                                        }
                                      : a,
                                  ),
                                );
                              }
                            };

                            const statusPill = isUploading ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                <Loader2 size={10} className="animate-spin" />{" "}
                                Uploading
                              </span>
                            ) : isValidated ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF5D6] dark:bg-[#86BC25]/[0.10] text-[#4D7A0D] dark:text-[#A0D040] border border-[#86BC25]/30">
                                <CheckCircle2 size={10} /> Validated
                              </span>
                            ) : isError ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                <AlertCircle size={10} /> Error
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F5F7] dark:bg-white/[0.04] text-[#888] dark:text-white/35 border border-[#E5E5E3] dark:border-white/[0.08]">
                                <Database size={10} /> Pending
                              </span>
                            );

                            const priorityPill =
                              asset.priority === "high" ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20">
                                  High
                                </span>
                              ) : asset.priority === "medium" ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 border border-amber-100 dark:border-amber-500/20">
                                  Medium
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-white/25 border border-slate-200 dark:border-white/[0.07]">
                                  Low
                                </span>
                              );

                            return (
                              <div
                                key={asset.id}
                                className={`cra-fu ${!isLast ? "border-b border-[#EBEBEA] dark:border-white/[0.05]" : ""}`}
                                style={{ animationDelay: `${idx * 25}ms` }}
                              >
                                <div
                                  className="grid items-center px-5 py-3.5 gap-4 transition-colors hover:bg-[#FAFAF8] dark:hover:bg-white/[0.015]"
                                  style={{
                                    gridTemplateColumns:
                                      "2fr 1fr 1fr 1.2fr 220px",
                                  }}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isValidated ? "bg-[#86BC25] shadow-[0_2px_8px_rgba(134,188,37,0.3)]" : isError ? "bg-red-500/10" : "bg-[#F0F0EE] dark:bg-white/[0.06]"}`}
                                    >
                                      {asset.icon ? (
                                        <asset.icon
                                          size={16}
                                          className={
                                            isValidated
                                              ? "text-white"
                                              : isError
                                                ? "text-red-500"
                                                : "text-[#888] dark:text-white/40"
                                          }
                                        />
                                      ) : (
                                        <Database size={16} />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[13.5px] font-semibold text-[#1D1D1D] dark:text-white/90 truncate">
                                        {asset.name}
                                      </p>
                                      <p className="text-[11px] text-[#AAAAAA] dark:text-white/30 truncate mt-0.5">
                                        {asset.category}
                                        {isCustomSec && (
                                          <span className="ml-1.5 text-[9.5px] font-bold uppercase tracking-widest text-[#86BC25]">
                                            Custom
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div>{statusPill}</div>
                                  <div>
                                    {asset.rowCount ? (
                                      <div>
                                        <p className="text-[12.5px] font-semibold text-[#333] dark:text-white/70">
                                          {asset.rowCount.toLocaleString()}{" "}
                                          <span className="font-normal text-[#999]">
                                            rec.
                                          </span>
                                        </p>
                                        {totalExposure > 0 && (
                                          <p className="text-[11px] text-[#999] dark:text-white/30 mt-0.5">
                                            {totalExposure >= 1e9
                                              ? `\u20a6${(totalExposure / 1e9).toFixed(1)}B`
                                              : totalExposure >= 1e6
                                                ? `\u20a6${(totalExposure / 1e6).toFixed(1)}M`
                                                : `\u20a6${totalExposure.toLocaleString()}`}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-[11.5px] text-[#BBBBBB] dark:text-white/25">
                                        Est. {asset.estimatedRows}
                                      </p>
                                    )}
                                  </div>
                                  <div>{priorityPill}</div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {!asset.uploadedFile ? (
                                      <label
                                        className={`cra-btn cursor-pointer ${isDragOver ? "border-[#86BC25] text-[#86BC25]" : ""}`}
                                        onDragOver={(e) => {
                                          e.preventDefault();
                                          setDragOverId(asset.id);
                                        }}
                                        onDragLeave={() => setDragOverId(null)}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          setDragOverId(null);
                                          const f = e.dataTransfer.files?.[0];
                                          if (f) handleSecUpload(asset.id, f);
                                        }}
                                      >
                                        {isUploading ? (
                                          <Loader2
                                            size={12}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <UploadCloud size={12} />
                                        )}
                                        {isUploading
                                          ? "Uploading..."
                                          : "Upload"}
                                        <input
                                          type="file"
                                          accept=".xlsx,.xls,.csv"
                                          hidden
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleSecUpload(asset.id, f);
                                            if (e.target) e.target.value = "";
                                          }}
                                        />
                                      </label>
                                    ) : (
                                      <>
                                        {!isError && (
                                          <button
                                            onClick={() =>
                                              handleViewData(asset.id)
                                            }
                                            className="cra-btn"
                                          >
                                            <Eye size={12} /> View
                                          </button>
                                        )}
                                        <label className="cra-btn cursor-pointer">
                                          <UploadCloud size={12} /> Re-upload
                                          <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            hidden
                                            onChange={(e) => {
                                              const f = e.target.files?.[0];
                                              if (f)
                                                handleSecUpload(asset.id, f);
                                              if (e.target) e.target.value = "";
                                            }}
                                          />
                                        </label>
                                        <button
                                          onClick={() =>
                                            setSectionList((prev) =>
                                              prev.map((a) =>
                                                a.id === asset.id
                                                  ? {
                                                      ...a,
                                                      uploadedFile: undefined,
                                                      uploadedDate: undefined,
                                                      rowCount: undefined,
                                                      columnCount: undefined,
                                                      status:
                                                        "not_uploaded" as const,
                                                    }
                                                  : a,
                                              ),
                                            )
                                          }
                                          className="cra-btn danger"
                                        >
                                          <XCircle size={12} />
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() =>
                                        setExpandedAsset(
                                          isExpanded ? null : asset.id,
                                        )
                                      }
                                      className="cra-btn ghost"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp size={12} />
                                      ) : (
                                        <ChevronDown size={12} />
                                      )}
                                    </button>
                                    {isCustomSec && (
                                      <button
                                        onClick={() =>
                                          setSectionList((prev) =>
                                            prev.filter(
                                              (a) => a.id !== asset.id,
                                            ),
                                          )
                                        }
                                        className="cra-btn danger"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div
                                    className={`px-5 pb-5 pt-2 ${isDark ? "bg-white/[0.015]" : "bg-[#FAFAF9]"} border-t border-[#F0F0EE] dark:border-white/[0.04]`}
                                  >
                                    <div className="flex gap-10">
                                      <div className="flex-1">
                                        <p
                                          className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-2"
                                          style={{
                                            fontFamily: "var(--font-mono)",
                                          }}
                                        >
                                          Required Fields
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {asset.dataFields?.map((field) => (
                                            <span
                                              key={field}
                                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-white/[0.05] border border-[#E5E5E3] dark:border-white/[0.08] text-[#555] dark:text-white/50"
                                            >
                                              {field}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      {asset.description && (
                                        <div className="max-w-[400px]">
                                          <p
                                            className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA] dark:text-white/25 mb-2"
                                            style={{
                                              fontFamily: "var(--font-mono)",
                                            }}
                                          >
                                            Description
                                          </p>
                                          <p className="text-[12px] text-[#777] dark:text-white/40 leading-relaxed">
                                            {asset.description}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── STICKY BOTTOM NAV ── */}
        <div className="sticky bottom-0 z-10 shrink-0 bg-white/95 dark:bg-[#101010]/95 backdrop-blur-xl border-t border-[#EAEAE8] dark:border-white/[0.06] px-6 md:px-10 py-3">
          <CRANavigation
            compact
            nextPath="/cra/segmentation"
            nextLabel="Next: Segmentation"
          />
        </div>
      </div>

      {/* ── DATA PREVIEW MODAL (pure Tailwind) ── */}
      {viewDataDialog.open &&
        (() => {
          const isTelecom = industryConfig.id === "telecommunications";
          const hiddenKeys = isTelecom
            ? [
                "outstandingBalance",
                "borrowerName",
                "currency",
                "facilityId",
                "maturityDate",
              ]
            : [];
          const data = getActiveAssetData();
          const allKeys = Object.keys(data[0] || {}).filter(
            (k) => !hiddenKeys.includes(k),
          );
          const totalPages = Math.ceil(data.length / rowsPerPage);
          const pageData = data.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() =>
                  setViewDataDialog({ open: false, assetId: null })
                }
              />
              <div className="relative z-10 w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#141414] border border-[#E5E5E3] dark:border-white/[0.08] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE] dark:border-white/[0.06] shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#86BC25]/10 flex items-center justify-center">
                      <Eye size={15} className="text-[#86BC25]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#1D1D1D] dark:text-white/90">
                        Data Preview
                      </p>
                      <p className="text-[11px] text-[#AAA] dark:text-white/30">
                        {data.length.toLocaleString()} records ·{" "}
                        {allKeys.length} columns
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setViewDataDialog({ open: false, assetId: null })
                    }
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] dark:text-white/40 hover:bg-[#F4F5F7] dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                  {data.length === 0 ? (
                    <div className="py-16 text-center text-[13px] text-[#AAA] dark:text-white/30">
                      No data available.
                    </div>
                  ) : (
                    <table className="w-full text-[12.5px] border-collapse min-w-max">
                      <thead className="sticky top-0 z-10">
                        <tr
                          className={isDark ? "bg-[#1A1A1A]" : "bg-[#F8F9FA]"}
                        >
                          {allKeys.map((key) => (
                            <th
                              key={key}
                              className="text-left px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/30 whitespace-nowrap border-b border-[#EBEBEA] dark:border-white/[0.06]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {formatColumnHeader(key)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((row: Asset, i: number) => (
                          <tr
                            key={i}
                            className="border-b border-[#F4F4F3] dark:border-white/[0.04] hover:bg-[#FAFAF9] dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {allKeys.map((key) => {
                              const val = (
                                row as unknown as Record<string, unknown>
                              )[key];
                              return (
                                <td
                                  key={key}
                                  className="px-4 py-2.5 text-[#333] dark:text-white/70 whitespace-nowrap max-w-[320px] overflow-hidden text-ellipsis align-middle"
                                >
                                  {typeof val === "object"
                                    ? JSON.stringify(val)
                                    : String(val ?? "—")}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination footer */}
                <div
                  className={`shrink-0 flex items-center justify-between px-6 py-3 border-t border-[#F0F0EE] dark:border-white/[0.06] ${isDark ? "bg-[#161616]" : "bg-[#FAFAF9]"}`}
                >
                  <span className="text-[11.5px] text-[#AAA] dark:text-white/30">
                    Showing {page * rowsPerPage + 1}–
                    {Math.min((page + 1) * rowsPerPage, data.length)} of{" "}
                    {data.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(+e.target.value);
                        setPage(0);
                      }}
                      className="h-8 px-2 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-[12px] text-[#555] dark:text-white/60 outline-none mr-3"
                    >
                      {[10, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n} / page
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E5E5E3] dark:border-white/[0.08] text-[#666] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg =
                        Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-8 h-8 rounded-lg text-[12px] font-semibold border transition-all ${pg === page ? "bg-[#86BC25] border-[#86BC25] text-white" : "border-[#E5E5E3] dark:border-white/[0.08] text-[#666] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25]"}`}
                        >
                          {pg + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E5E5E3] dark:border-white/[0.08] text-[#666] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ── ADD CUSTOM ASSET TYPE MODAL (pure Tailwind) ── */}
      {addAssetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setAddAssetDialog(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#141414] border border-[#E5E5E3] dark:border-white/[0.08] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE] dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#86BC25]/10 flex items-center justify-center">
                  <Plus size={15} className="text-[#86BC25]" />
                </div>
                <p className="text-[14px] font-bold text-[#1D1D1D] dark:text-white/90">
                  Add Custom{" "}
                  {industryConfig.id === "telecommunications"
                    ? "Infrastructure & Operations"
                    : "Asset Type"}
                </p>
              </div>
              <button
                onClick={() => setAddAssetDialog(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#999] dark:text-white/40 hover:bg-[#F4F5F7] dark:hover:bg-white/[0.06] transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {industryConfig.id === "telecommunications"
                    ? "Infrastructure & Operations Name *"
                    : "Asset Type Name *"}
                </label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCCCCC] dark:placeholder:text-white/20"
                  placeholder="e.g., Satellite Equipment"
                  value={newAsset.name}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Category
                </label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCCCCC] dark:placeholder:text-white/20"
                  placeholder="e.g., Network Infrastructure"
                  value={newAsset.category}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, category: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Description
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCCCCC] dark:placeholder:text-white/20 resize-none"
                  placeholder={
                    industryConfig.id === "telecommunications"
                      ? "Brief description of this infrastructure & operations type"
                      : "Brief description of this asset type"
                  }
                  value={newAsset.description}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Template Columns (comma-separated) *
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E3] dark:border-white/[0.08] bg-[#FAFAF9] dark:bg-white/[0.04] text-[13px] text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all placeholder:text-[#CCCCCC] dark:placeholder:text-white/20 resize-none"
                  placeholder="ID, Name, Location, Net Book Value, Status, Category, Region"
                  value={newAsset.columns}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, columns: e.target.value })
                  }
                />
                <p className="text-[11px] text-[#AAA] dark:text-white/25">
                  {industryConfig.id === "telecommunications"
                    ? "Include at minimum: ID, Name, and a value field (e.g. Net Book Value)."
                    : "Include at minimum: ID, Name, and a value field (e.g. Outstanding Balance)."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Priority
                </label>
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewAsset({ ...newAsset, priority: p })}
                      className={`flex-1 h-9 rounded-lg text-[12px] font-semibold border capitalize transition-all ${
                        newAsset.priority === p
                          ? p === "high"
                            ? "bg-red-500 border-red-500 text-white"
                            : p === "medium"
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "bg-slate-500 border-slate-500 text-white"
                          : "bg-white dark:bg-white/[0.04] border-[#E5E5E3] dark:border-white/[0.08] text-[#666] dark:text-white/40 hover:border-[#86BC25]/50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {newAsset.columns && (
                <div className="space-y-2">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#888] dark:text-white/30"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Template Preview
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {newAsset.columns
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((col) => (
                        <span
                          key={col}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#86BC25]/10 border border-[#86BC25]/25 text-[#4D7A0D] dark:text-[#A0D040]"
                        >
                          {col}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`flex items-center justify-end gap-2 px-6 py-4 border-t border-[#F0F0EE] dark:border-white/[0.06] ${isDark ? "bg-[#161616]" : "bg-[#FAFAF9]"}`}
            >
              <button
                onClick={() => setAddAssetDialog(false)}
                className="cra-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomAssetType}
                disabled={!newAsset.name.trim() || !newAsset.columns.trim()}
                className="cra-btn prim disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={13} />
                Add{" "}
                {industryConfig.id === "telecommunications"
                  ? "Infrastructure & Operations"
                  : "Asset Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CRALayout>
  );
};
export default CRADataUpload;
