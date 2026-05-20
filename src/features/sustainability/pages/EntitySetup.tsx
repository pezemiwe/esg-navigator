import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  Factory,
  PieChart,
  Network,
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  ClipboardCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useRegionStore } from "@/store/regionStore";
import { useShallow } from "zustand/react/shallow";
import { SASB_TAXONOMY } from "@/config/sasb.config";
import {
  SAMPLE_INTERNAL_RISKS,
  SAMPLE_EXTERNAL_RISKS,
  SAMPLE_ERM_RISKS,
  SAMPLE_ISSB_RISKS,
  SAMPLE_REGULATOR_RISKS,
} from "@/config/sampleRisks";

const countryStateMap: Record<string, string[]> = {
  Nigeria: [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ],
  Ghana: [
    "Ashanti",
    "Ahafo",
    "Bono",
    "Bono East",
    "Central",
    "Eastern",
    "Greater Accra",
    "North East",
    "Northern",
    "Oti",
    "Savannah",
    "Upper East",
    "Upper West",
    "Volta",
    "Western",
    "Western North",
  ],
};

const STEPS = [
  {
    id: 0,
    label: "Corporate Identity",
    icon: Landmark,
    desc: "Establish your entity's legal profile",
  },
  {
    id: 1,
    label: "Industry & Materiality",
    icon: Factory,
    desc: "Map operations to SASB standards",
  },
  {
    id: 2,
    label: "Operational Scale",
    icon: PieChart,
    desc: "Define magnitude of operations",
  },
  {
    id: 3,
    label: "Value Chain",
    icon: Network,
    desc: "Map upstream & downstream activities",
  },
  {
    id: 4,
    label: "Review & Submit",
    icon: ClipboardCheck,
    desc: "Verify profile before proceeding",
  },
];

interface TagInputProps {
  label: string;
  items?: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
}

const TagInput = ({
  label,
  items = [],
  onAdd,
  onRemove,
  placeholder,
}: TagInputProps) => {
  const [val, setVal] = useState("");
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-bold text-[#525252] uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="border border-[#e0e0e0] bg-[#f4f4f4] p-3 transition-colors focus-within:border-[#86bc25]">
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((it: string) => (
            <div
              key={it}
              className="flex items-center gap-1 bg-[#86bc25]/20 text-[#435e12] px-2 py-1 text-[12px] font-semibold"
            >
              {it}
              <button
                onClick={() => onRemove(it)}
                className="hover:text-[#da1e28]"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-transparent text-[14px] text-[#161616] outline-none placeholder-[#8d8d8d]"
            placeholder={placeholder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && val.trim()) {
                e.preventDefault();
                onAdd(val.trim());
                setVal("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (val.trim()) {
                onAdd(val.trim());
                setVal("");
              }
            }}
            className="text-[#86bc25] font-bold text-[12px] uppercase tracking-wider hover:text-[#435e12]"
          >
            Add
          </button>
        </div>
      </div>
      <span className="text-[11px] text-[#8d8d8d] mt-1 block">
        Press Enter to add
      </span>
    </div>
  );
};

const BranchManager = ({
  branches = [],
  onUpdate,
}: {
  branches: { id: string; name: string; state: string; country: string }[];
  onUpdate: (
    val: { id: string; name: string; state: string; country: string }[],
  ) => void;
}) => {
  const regionCountry = useRegionStore((s) => s.profile.country);
  const [newBranch, setNewBranch] = useState({
    name: "",
    state: "",
    country: regionCountry,
  });

  const handleAdd = () => {
    if (newBranch.name && newBranch.state) {
      onUpdate([...branches, { id: Date.now().toString(), ...newBranch }]);
      setNewBranch({ name: "", state: "", country: newBranch.country });
    }
  };

  const handleRemove = (id: string) => {
    onUpdate(branches.filter((b) => b.id !== id));
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n").slice(1); // skip header
        const newBranches = lines
          .map((line) => {
            const [name, state, country] = line
              .split(",")
              .map((s) => s?.trim());
            if (name && state && country) {
              return {
                id: Date.now().toString() + Math.random(),
                name,
                state,
                country,
              };
            }
            return null;
          })
          .filter(
            (
              branch,
            ): branch is {
              id: string;
              name: string;
              state: string;
              country: string;
            } => Boolean(branch),
          );
        if (newBranches.length > 0) {
          onUpdate([...branches, ...newBranches]);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const templateCsv = `data:text/csv;charset=utf-8,Branch Name,State,Country\nHead Office,${countryStateMap[regionCountry]?.[0] ?? ""},${regionCountry}`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[16px] font-semibold text-[#161616]">
          Operating Presence & Branches
        </h3>
        <p className="text-[13px] text-[#525252]">
          Add branch locations across different states and countries. You can
          add them manually or via bulk upload.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:items-end bg-[#f4f4f4] p-4 border border-[#e0e0e0]">
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-[#525252] uppercase mb-1">
            Country
          </label>
          <select
            value={newBranch.country}
            onChange={(e) =>
              setNewBranch({ ...newBranch, country: e.target.value, state: "" })
            }
            className="w-full border border-[#e0e0e0] bg-white p-2 text-[13px] focus:outline-none focus:border-[#86bc25]"
          >
            <option value="Nigeria">Nigeria</option>
            <option value="Ghana">Ghana</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-[#525252] uppercase mb-1">
            State/Region
          </label>
          <select
            value={newBranch.state}
            onChange={(e) =>
              setNewBranch({ ...newBranch, state: e.target.value })
            }
            className="w-full border border-[#e0e0e0] bg-white p-2 text-[13px] focus:outline-none focus:border-[#86bc25]"
            disabled={!newBranch.country}
          >
            <option value="">Select state...</option>
            {(countryStateMap[newBranch.country] || []).map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-[#525252] uppercase mb-1">
            Branch Name
          </label>
          <input
            type="text"
            placeholder="e.g. Ikeja Branch"
            value={newBranch.name}
            onChange={(e) =>
              setNewBranch({ ...newBranch, name: e.target.value })
            }
            className="w-full border border-[#e0e0e0] bg-white p-2 text-[13px] focus:outline-none focus:border-[#86bc25]"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newBranch.name || !newBranch.state}
            className="w-full md:w-auto bg-[#86bc25] text-white px-4 py-2 font-bold text-[12px] uppercase tracking-wide hover:bg-[#435e12] disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="cursor-pointer text-[#86bc25] hover:text-[#435e12] text-[13px] font-bold underline flex items-center gap-1">
          <Upload size={14} />
          <span>Bulk Upload Branches (CSV)</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleBulkUpload}
          />
        </label>
        <a
          href={templateCsv}
          download="branches_template.csv"
          className="flex items-center gap-1 text-[#525252] hover:text-[#161616] text-[13px] underline"
        >
          <Download size={14} />
          Download CSV Template
        </a>
      </div>

      {branches.length > 0 && (
        <div className="border border-[#e0e0e0] bg-white mt-4 max-h-60 overflow-y-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-[#f4f4f4] text-[#525252] font-semibold sticky top-0">
              <tr>
                <th className="p-3 border-b border-[#e0e0e0]">Branch Name</th>
                <th className="p-3 border-b border-[#e0e0e0]">State/Region</th>
                <th className="p-3 border-b border-[#e0e0e0]">Country</th>
                <th className="p-3 border-b border-[#e0e0e0] w-16 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-[#e0e0e0] last:border-0 hover:bg-[#f9f9f9]"
                >
                  <td className="p-3 text-[#161616]">{b.name}</td>
                  <td className="p-3 text-[#525252]">{b.state}</td>
                  <td className="p-3 text-[#525252]">{b.country}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleRemove(b.id)}
                      className="text-[#da1e28] hover:text-[#a2191f]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function EntitySetup() {
  const navigate = useNavigate();
  const regionProfile = useRegionStore((s) => s.profile);
  const { entityProfile, setEntityProfile, setRisks } = useSustainabilityStore(
    useShallow((state) => ({
      entityProfile: state.entityProfile,
      setEntityProfile: state.setEntityProfile,
      setRisks: state.setRisks,
    })),
  );
  const [activeStep, setActiveStep] = useState(0);

  const handleUpdate = <K extends keyof typeof entityProfile>(
    field: K,
    value: (typeof entityProfile)[K],
  ) => {
    setEntityProfile({ ...entityProfile, [field]: value });
  };

  const handleSave = () => {
    // Load sample risks
    const combinedRisks = [
      ...SAMPLE_INTERNAL_RISKS,
      ...SAMPLE_EXTERNAL_RISKS,
      ...SAMPLE_ERM_RISKS,
      ...SAMPLE_ISSB_RISKS,
      ...SAMPLE_REGULATOR_RISKS,
    ];
    setRisks(combinedRisks);

    setEntityProfile({ ...entityProfile, completed: true });
    navigate("/sustainability");
  };

  const canGoNext = () => {
    if (activeStep === 0) return !!entityProfile.name;
    if (activeStep === 1)
      return !!entityProfile.sasbSector && !!entityProfile.sasbIndustry;
    if (activeStep === 2)
      return !!entityProfile.loanBook && !!entityProfile.employees;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans text-[#161616] p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#161616]">
          Entity Profile Setup
        </h1>
        <p className="text-[14px] text-[#525252]">
          Configure your organization's legal, operational, and structural
          foundation for IFRS S1/S2 reporting.
        </p>
      </div>

      <div className="max-w-350 mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar Steps */}
        <div className="w-full lg:w-70 shrink-0">
          <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isPast = activeStep > idx;
              return (
                <div
                  key={idx}
                  className={`p-3 border transition-colors ${isActive ? "bg-[#f4fadc] border-[#86bc25] text-[#435e12]" : isPast ? "bg-[#f4f4f4] border-[#e0e0e0] text-[#161616]" : "bg-white border-transparent text-[#8d8d8d]"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center border ${isActive ? "bg-[#86bc25] text-white border-transparent" : isPast ? "bg-[#86bc25]/20 text-[#86bc25] border-[#86bc25]/30" : "bg-[#f4f4f4] border-[#e0e0e0]"}`}
                    >
                      {isPast ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                    </div>
                    <div>
                      <p
                        className={`text-[13px] font-bold ${isActive ? "text-[#435e12]" : ""}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider">
                        {isActive
                          ? "In Progress"
                          : isPast
                            ? "Completed"
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-[#e0e0e0] p-8 min-h-[500px] flex flex-col">
          <div className="flex-1">
            {activeStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#161616] mb-1">
                    Corporate Identity
                  </h2>
                  <p className="text-[13px] text-[#525252] border-b border-[#e0e0e0] pb-4">
                    Provide legal and registration details matching your
                    statutory filings.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Legal Entity Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Guaranty Trust Holding Company PLC"
                      value={entityProfile.name}
                      onChange={(e) => handleUpdate("name", e.target.value)}
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="e.g., RC 123456"
                      value={entityProfile.registrationNumber || ""}
                      onChange={(e) =>
                        handleUpdate("registrationNumber", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Year of Incorporation
                    </label>
                    <input
                      type="number"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="YYYY"
                      value={entityProfile.yearOfIncorporation || ""}
                      onChange={(e) =>
                        handleUpdate(
                          "yearOfIncorporation",
                          Number(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Corporate Website
                    </label>
                    <input
                      type="url"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="https://"
                      value={entityProfile.website || ""}
                      onChange={(e) => handleUpdate("website", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Country of Incorporation
                    </label>
                    <select
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25] appearance-none"
                      value={entityProfile.countryOfIncorporation || ""}
                      onChange={(e) =>
                        handleUpdate("countryOfIncorporation", e.target.value)
                      }
                    >
                      <option value="">Select country...</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      HQ State/Region
                    </label>
                    <select
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25] appearance-none"
                      value={entityProfile.hqState || ""}
                      onChange={(e) => handleUpdate("hqState", e.target.value)}
                      disabled={!entityProfile.countryOfIncorporation}
                    >
                      <option value="">Select state...</option>
                      {(
                        (entityProfile.countryOfIncorporation
                          ? countryStateMap[
                              entityProfile.countryOfIncorporation
                            ]
                          : []) || []
                      ).map((s: string) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <TagInput
                  label="Other Countries of Operation"
                  items={entityProfile.otherCountriesOfOperation}
                  onAdd={(val: string) =>
                    handleUpdate("otherCountriesOfOperation", [
                      ...(entityProfile.otherCountriesOfOperation || []),
                      val,
                    ])
                  }
                  onRemove={(val: string) =>
                    handleUpdate(
                      "otherCountriesOfOperation",
                      (entityProfile.otherCountriesOfOperation || []).filter(
                        (x) => x !== val,
                      ),
                    )
                  }
                  placeholder="Type country and press enter..."
                />

                {/* Logo and Business Overview row */}
                <div className="grid grid-cols-1 gap-6 pt-4 border-t border-[#e0e0e0]">
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Company Logo Component
                    </label>
                    <div className="flex items-center gap-4">
                      {entityProfile.companyLogo && (
                        <div className="w-16 h-16 bg-white border border-[#e0e0e0] flex items-center justify-center p-1 rounded">
                          <img
                            src={entityProfile.companyLogo}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e0e0] cursor-pointer hover:bg-black hover:text-white transition-colors duration-300 text-sm font-bold">
                        <Upload size={16} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (loadEvent) => {
                                handleUpdate(
                                  "companyLogo",
                                  loadEvent.target?.result as string,
                                );
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      {entityProfile.companyLogo && (
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-2"
                          onClick={() => handleUpdate("companyLogo", undefined)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Business Overview
                    </label>
                    <textarea
                      placeholder="Provide a brief overview of the business operations, products, and services..."
                      rows={4}
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25] resize-y"
                      value={entityProfile.businessOverview || ""}
                      onChange={(e) =>
                        handleUpdate("businessOverview", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Country, State, and Branch setup */}
                <div className="pt-6 mt-6 border-t border-[#e0e0e0]">
                  <h3 className="text-lg font-bold mb-4 font-space">
                    Branch Locations
                  </h3>
                  <BranchManager
                    branches={entityProfile.branchLocations || []}
                    onUpdate={(val) => handleUpdate("branchLocations", val)}
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#161616] mb-1">
                    Industry & Materiality
                  </h2>
                  <p className="text-[13px] text-[#525252] border-b border-[#e0e0e0] pb-4">
                    Select SASB sector mappings to define base material topics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      SASB Sector *
                    </label>
                    <select
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25] appearance-none"
                      value={entityProfile.sasbSector || ""}
                      onChange={(e) => {
                        handleUpdate("sasbSector", e.target.value);
                        handleUpdate("sasbIndustry", "");
                      }}
                    >
                      <option value="">Select sector...</option>
                      {SASB_TAXONOMY.map((sector) => (
                        <option key={sector.name} value={sector.name}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      SASB Industry *
                    </label>
                    <select
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25] appearance-none"
                      value={entityProfile.sasbIndustry || ""}
                      onChange={(e) =>
                        handleUpdate("sasbIndustry", e.target.value)
                      }
                      disabled={!entityProfile.sasbSector}
                    >
                      <option value="">Select industry...</option>
                      {(
                        SASB_TAXONOMY.find(
                          (s) => s.name === entityProfile.sasbSector,
                        )?.industries || []
                      ).map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      General Sector
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="e.g., Financial Services"
                      value={entityProfile.sector || ""}
                      onChange={(e) => handleUpdate("sector", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      General Sub-Sector
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="e.g., Commercial Banking"
                      value={entityProfile.subSector || ""}
                      onChange={(e) =>
                        handleUpdate("subSector", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#161616] mb-1">
                    Operational Scale
                  </h2>
                  <p className="text-[13px] text-[#525252] border-b border-[#e0e0e0] pb-4">
                    Determine footprint bounds based on financial and physical
                    scale.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Total Assets / Loan Book ({regionProfile.currencySymbol})
                      *
                    </label>
                    <input
                      type="number"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="e.g., 5000000000"
                      value={entityProfile.loanBook || ""}
                      onChange={(e) =>
                        handleUpdate("loanBook", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Total Full-Time Employees *
                    </label>
                    <input
                      type="number"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="e.g., 1500"
                      value={entityProfile.employees || ""}
                      onChange={(e) =>
                        handleUpdate("employees", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Physical Branches / Locations
                    </label>
                    <input
                      type="number"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="e.g., 200"
                      value={entityProfile.branches || ""}
                      onChange={(e) =>
                        handleUpdate("branches", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#525252] uppercase mb-1.5">
                      Reporting Year
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#e0e0e0] bg-[#f4f4f4] p-3 text-[14px] focus:outline-none focus:border-[#86bc25]"
                      placeholder="FY 2024"
                      defaultValue="FY 2024"
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#161616] mb-1">
                    Value Chain Mapping
                  </h2>
                  <p className="text-[13px] text-[#525252] border-b border-[#e0e0e0] pb-4">
                    Essential for mapping Scope 3 emission boundaries and ESG
                    risks across partners.
                  </p>
                </div>

                <TagInput
                  label="Products & Services"
                  items={entityProfile.productsAndServices || []}
                  onAdd={(val: string) =>
                    handleUpdate("productsAndServices", [
                      ...(entityProfile.productsAndServices || []),
                      val,
                    ])
                  }
                  onRemove={(val: string) =>
                    handleUpdate(
                      "productsAndServices",
                      (entityProfile.productsAndServices || []).filter(
                        (x) => x !== val,
                      ),
                    )
                  }
                  placeholder="e.g., Retail Loans, Mortgages..."
                />
                <TagInput
                  label="Upstream Activities (Suppliers/Inputs)"
                  items={entityProfile.upstreamActivities}
                  onAdd={(val: string) =>
                    handleUpdate("upstreamActivities", [
                      ...entityProfile.upstreamActivities,
                      val,
                    ])
                  }
                  onRemove={(val: string) =>
                    handleUpdate(
                      "upstreamActivities",
                      entityProfile.upstreamActivities.filter((x) => x !== val),
                    )
                  }
                  placeholder="e.g., Cloud Hosting, IT Infrastructure..."
                />
                <TagInput
                  label="Downstream Activities (Customers/Impact)"
                  items={entityProfile.downstreamActivities}
                  onAdd={(val: string) =>
                    handleUpdate("downstreamActivities", [
                      ...entityProfile.downstreamActivities,
                      val,
                    ])
                  }
                  onRemove={(val: string) =>
                    handleUpdate(
                      "downstreamActivities",
                      entityProfile.downstreamActivities.filter(
                        (x) => x !== val,
                      ),
                    )
                  }
                  placeholder="e.g., Financed SME Operations..."
                />
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#161616] mb-1">
                    Review & Submit
                  </h2>
                  <p className="text-[13px] text-[#525252] border-b border-[#e0e0e0] pb-4">
                    Confirm profile details before initializing the risk
                    framework.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#f4f4f4] border border-[#e0e0e0] p-6">
                  <div>
                    <p className="text-[10px] text-[#8d8d8d] uppercase tracking-wider font-bold mb-1">
                      Entity Name
                    </p>
                    <p className="text-[14px] font-semibold text-[#161616]">
                      {entityProfile.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8d8d8d] uppercase tracking-wider font-bold mb-1">
                      HQ Location
                    </p>
                    <p className="text-[14px] font-semibold text-[#161616]">
                      {entityProfile.hqState},{" "}
                      {entityProfile.countryOfIncorporation}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8d8d8d] uppercase tracking-wider font-bold mb-1">
                      SASB Industry
                    </p>
                    <p className="text-[14px] font-semibold text-[#161616]">
                      {entityProfile.sasbIndustry || "Not Selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8d8d8d] uppercase tracking-wider font-bold mb-1">
                      Scale
                    </p>
                    <p className="text-[14px] font-semibold text-[#161616]">
                      {entityProfile.employees} Staff | {entityProfile.branches}{" "}
                      Branches
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#8d8d8d] uppercase tracking-wider font-bold mb-1">
                      Products & Services
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(entityProfile.productsAndServices || []).map((p, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white border border-[#e0e0e0] text-[#525252] text-[11px] font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-[#e0e0e0]">
            <button
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              className="px-6 py-2.5 text-[14px] font-bold text-[#525252] hover:bg-[#f4f4f4] transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {activeStep < STEPS.length - 1 ? (
              <button
                onClick={() =>
                  setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))
                }
                disabled={!canGoNext()}
                className="px-6 py-2.5 bg-[#86bc25] text-white text-[14px] font-bold hover:bg-[#70a31d] transition-colors disabled:opacity-50 disabled:bg-[#e0e0e0] disabled:text-[#8d8d8d] flex items-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-[#161616] text-white text-[14px] font-bold hover:bg-[#86bc25] transition-colors flex items-center gap-2"
              >
                Verify & Create Framework <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
