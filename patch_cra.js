const fs = require('fs');
let text = fs.readFileSync('src/features/cra/steps/physical/ScreenAssetRegister.tsx', 'utf8');

// The single asset screen back button changed text-white/50 to text-white/90, I must re-apply to portfolio screen 
// just in case 'git checkout' reverted it.
text = text.replace('text-white/50 hover:text-white', 'text-white/90 hover:text-white');

if (!text.includes('useCRADataStore')) {
    text = text.replace('import { usePhysicalRiskStore } from "@/store/physicalRiskStore";',
                        'import { usePhysicalRiskStore } from "@/store/physicalRiskStore";\nimport { useCRADataStore } from "@/store/craStore";');
}

const handlerCode = 
  const handleCRAImport = useCallback(() => {
    setParseError('');
    const craData = useCRADataStore.getState().assets;
    const allAssets = [];
    Object.values(craData).forEach((v) => {
      allAssets.push(...v.data);
    });

    if (allAssets.length === 0) {
      setParseError('No data found in CRA upload section.');
      return;
    }

    const mapped = allAssets.map((a, idx) => {
      const rawValue = cleanNumeric(a.outstandingBalance || a.value || a.amount || 0);
      const currency = String(a.currency || '').toUpperCase();
      const valueLocal = currency === 'USD' ? rawValue * config.usdRate : rawValue;
      return {
        id: a.id || 'asset_' + idx,
        name: a.borrowerName || a.facilityId || a.name || 'Asset ' + (idx + 1),
        assetType: a.assetType || a.type || 'Office Building',
        value: valueLocal,
        latitude: Number(a.latitude) || 0,
        longitude: Number(a.longitude) || 0,
        region: String(a.region || a.address || ''),
        sector: String(a.sector || ''),
      };
    });

    setMappedAssets(mapped);
    setFileName('Imported from CRA Upload');
    geocodePendingRef.current = true;
  }, [config.usdRate, setMappedAssets]);

;

if (!text.includes('handleCRAImport')) {
    const cb_start = text.indexOf('const autoGeocode = useCallback(');
    text = text.slice(0, cb_start) + handlerCode + text.slice(cb_start);
}

const btnCode = 
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleCRAImport}
                        className="text-[14px] font-semibold tracking-wide border-none bg-transparent hover:text-[#78AA1F] transition-colors cursor-pointer"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: '#86BC25',
                          textDecoration: 'underline',
                          textUnderlineOffset: '4px'
                        }}
                      >
                        Or draw data from CRA Uploads
                      </button>
                    </div>
;

if (!text.includes('draw data from CRA Uploads')) {
    // There is an element <div className="mt-3 flex items-center justify-center gap-2 text-white/60">
    const parts = text.split(/<div className="mt-3 flex items-center (justify-center )?gap-2/);
    if (parts.length > 1) {
       const pre = parts[0];
       // match the rest
       const idx = text.indexOf('<div className="mt-3 flex items-center');
       text = text.substring(0, idx) + btnCode + text.substring(idx);
    }
}

fs.writeFileSync('src/features/cra/steps/physical/ScreenAssetRegister.tsx', text);
console.log('Done patching portfolio screen!');
