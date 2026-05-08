import fs from 'fs';

let content = fs.readFileSync('src/features/sustainability/pages/AIReport.tsx', 'utf8');

content = content.replace(/import\s*\{[^}]*\}\s*from\s*"@mui\/material";/g, '');

const twComponents = \import { jsPDF } from "jspdf";
import React from 'react';

// --- MUI to Tailwind Compat ---
const alpha = (color, opacity) => color; 
const useTheme = () => ({ palette: { mode: 'light' } });

const Box = React.forwardRef(({ sx, children, onClick, ...props }, ref) => (
  <div ref={ref} onClick={onClick} {...props}>{children}</div>
));
const Paper = React.forwardRef(({ sx, children, ...props }, ref) => (
  <div ref={ref} className="bg-white border border-gray-200 shadow-sm" {...props}>{children}</div>
));
const Stack = React.forwardRef(({ direction="column", spacing=0, alignItems, justifyContent, sx, children, ...props }, ref) => {
  let cls = 'flex';
  if (direction === 'column') cls += ' flex-col';
  if (direction === 'row') cls += ' flex-row';
  if (alignItems === 'center') cls += ' items-center';
  if (alignItems === 'flex-start') cls += ' items-start';
  if (justifyContent === 'space-between') cls += ' justify-between';
  if (justifyContent === 'center') cls += ' justify-center';
  if (spacing === 1) cls += ' gap-1';
  if (spacing === 1.5) cls += ' gap-1.5';
  if (spacing === 2) cls += ' gap-2';
  if (spacing === 3) cls += ' gap-3';
  return <div ref={ref} className={cls} {...props}>{children}</div>;
});
const Typography = React.forwardRef(({ variant, sx, children, color, ...props }, ref) => {
  let cls = 'text-gray-900';
  if (variant === 'h4') cls = 'text-2xl font-bold text-gray-900';
  if (variant === 'h5') cls = 'text-xl font-bold text-gray-900';
  if (variant === 'h6') cls = 'text-lg font-bold text-gray-900';
  if (variant === 'subtitle1') cls = 'text-base font-bold text-gray-900';
  if (variant === 'subtitle2') cls = 'text-sm font-bold text-gray-900';
  if (variant === 'body1') cls = 'text-base text-gray-800';
  if (variant === 'body2') cls = 'text-sm text-gray-700';
  if (variant === 'caption') cls = 'text-xs text-gray-500';
  if (color === 'text.secondary') cls += ' text-gray-500';
  if (color === 'error') cls += ' text-red-600';
  return <div ref={ref} className={cls} {...props}>{children}</div>;
});

const Button = React.forwardRef(({ variant, size, startIcon, endIcon, onClick, disabled, children, sx, ...props }, ref) => {
  let cls = 'inline-flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  if (variant === 'contained') cls += ' bg-[#86bc25] text-white hover:bg-[#75a620]';
  else if (variant === 'outlined') cls += ' border border-gray-300 text-gray-700 hover:bg-gray-50';
  else cls += ' text-gray-700 hover:bg-gray-100';
  if (size === 'small') cls += ' px-3 py-1.5 text-xs';
  else if (size === 'large') cls += ' px-5 py-2.5 text-base';
  else cls += ' px-4 py-2 text-sm';
  return (
    <button ref={ref} onClick={onClick} disabled={disabled} className={cls} {...props}>
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
});
const IconButton = React.forwardRef(({ size, onClick, children, sx, ...props }, ref) => (
  <button ref={ref} onClick={onClick} className="p-1 hover:bg-gray-100 transition-colors text-gray-600" {...props}>{children}</button>
));
const TextField = React.forwardRef(({ select, label, value, onChange, placeholder, size, fullWidth, multiline, rows, children, ...props }, ref) => {
  let baseCls = 'block border-gray-300 text-sm focus:border-[#86bc25] focus:ring-[#86bc25] bg-white p-2 border';
  if (fullWidth) baseCls += ' w-full';
  if (select) {
    return (
      <div className="flex flex-col">
        {label && <label className="text-xs font-bold text-gray-700 mb-1">{label}</label>}
        <select ref={ref} value={value} onChange={onChange} className={baseCls} {...props}>{children}</select>
      </div>
    );
  }
  if (multiline) {
    return (
      <div className="flex flex-col">
        {label && <label className="text-xs font-bold text-gray-700 mb-1">{label}</label>}
        <textarea ref={ref} value={value} onChange={onChange} placeholder={placeholder} rows={rows || 3} className={baseCls} {...props} />
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {label && <label className="text-xs font-bold text-gray-700 mb-1">{label}</label>}
      <input ref={ref} type="text" value={value} onChange={onChange} placeholder={placeholder} className={baseCls} {...props} />
    </div>
  );
});

function Grid({ container, spacing, size, children, ...props }) {
  if (container) {
    let gap = 'gap-4';
    if (spacing === 1) gap = 'gap-2';
    if (spacing === 2) gap = 'gap-4';
    if (spacing === 3) gap = 'gap-6';
    return <div className={\lex flex-wrap \\} {...props}>{children}</div>;
  }
  let w = 'w-full';
  if (size?.md === 4) w = 'md:w-1/3 w-full';
  if (size?.sm === 6) w = 'sm:w-1/2 w-full';
  return <div className={w} {...props}>{children}</div>;
}

const Chip = ({ icon, label, size, sx, ...props }) => (
  <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-800" {...props}>
    {icon && <span className="mr-1">{icon}</span>}
    {label}
  </span>
);
const Snackbar = ({ open, autoHideDuration, onClose, message, ...props }) => {
  if (!open) return null;
  return <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 text-sm" {...props}>{message}</div>;
};
const MenuItem = ({ value, children, ...props }) => <option value={value} {...props}>{children}</option>;
const Tabs = ({ value, onChange, children, ...props }) => {
  return (
    <div className="flex border-b border-gray-200" {...props}>
      {React.Children.map(children, (child, i) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { 
          selected: value === i,
          onClick: () => onChange && onChange({}, i)
        });
      })}
    </div>
  );
};
const Tab = ({ label, icon, selected, onClick, iconPosition, ...props }) => {
  return (
    <button 
      onClick={onClick}
      className={\lex items-center px-4 py-3 text-sm font-bold border-b-2 transition-colors \\}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};
const Tooltip = ({ title, children, ...props }) => <div title={title} {...props}>{children}</div>;
const Collapse = ({ in: inProp, children, ...props }) => inProp ? <div {...props}>{children}</div> : null;
const Avatar = ({ children, sx, ...props }) => <div className="flex items-center justify-center bg-gray-100 w-8 h-8" {...props}>{children}</div>;
const LinearProgress = ({ variant, value, sx, ...props }) => (
  <div className="w-full bg-gray-200 h-1.5 overflow-hidden" {...props}>
    <div className="bg-[#86bc25] h-full transition-all duration-300" style={{ width: \\%\ }}></div>
  </div>
);

// --- End Compat ---
\;

content = content.replace(/import \{ jsPDF \} from "jspdf";/g, twComponents);

fs.writeFileSync('src/features/sustainability/pages/AIReport.tsx', content);
console.log("Replaced MUI imports!");
