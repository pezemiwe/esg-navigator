const fs = require('fs');

let content = fs.readFileSync('src/features/cra/pages/CRAReporting.tsx', 'utf8');

// 1. Remove MUI imports
content = content.replace(/import \{[\s\S]*?\} from "@mui\/material";/g, '');

// 2. Replace Grid
content = content.replace(/<Grid container spacing=\{[^\}]+\}>/g, '<div className="grid grid-cols-1 md:grid-cols-12 gap-6">');
content = content.replace(/<Grid item xs=\{12\} md=\{6\}>/g, '<div className="md:col-span-6">');
content = content.replace(/<Grid item xs=\{12\} md=\{4\}>/g, '<div className="md:col-span-4">');
content = content.replace(/<Grid item xs=\{12\} md=\{8\}>/g, '<div className="md:col-span-8">');
content = content.replace(/<Grid item xs=\{12\} sm=\{6\} md=\{4\}>/g, '<div className="col-span-12 sm:col-span-6 md:col-span-4">');
content = content.replace(/<Grid item xs=\{12\}>/g, '<div className="col-span-12">');
content = content.replace(/<Grid item[^>]*>/g, '<div>');
content = content.replace(/<\/Grid>/g, '</div>');

// 3. Stack -> flex col / gap
content = content.replace(/<Stack spacing=\{[^\}]+\}[^>]*>/g, '<div className="flex flex-col gap-4">');
content = content.replace(/<Stack direction="row" spacing=\{[^\}]+\}[^>]*>/g, '<div className="flex flex-row items-center gap-4">');
content = content.replace(/<\/Stack>/g, '</div>');

// 4. Box -> div
content = content.replace(/<Box[^>]*sx={{[^}]*}}[^>]*>/g, '<div>');
content = content.replace(/<Box([^>]*)>/g, '<div>');
content = content.replace(/<\/Box>/g, '</div>');

// 5. Typography -> h1-h6, p
content = content.replace(/<Typography variant="h4".*?>/g, '<h1 className="text-3xl font-bold mb-4">');
content = content.replace(/<Typography variant="h5".*?>/g, '<h2 className="text-2xl font-bold mb-4">');
content = content.replace(/<Typography variant="h6".*?>/g, '<h3 className="text-xl font-bold mb-3">');
content = content.replace(/<Typography variant="subtitle1".*?>/g, '<h4 className="text-lg font-semibold mb-2">');
content = content.replace(/<Typography variant="body1".*?>/g, '<p className="text-base text-slate-700 mb-2">');
content = content.replace(/<Typography variant="body2".*?>/g, '<p className="text-sm text-slate-600 mb-2">');
content = content.replace(/<Typography[^>]*color="text.secondary"[^>]*>/g, '<p className="text-sm text-slate-500 mb-2">');
content = content.replace(/<Typography[^>]*>/g, '<p className="mb-2">');
content = content.replace(/<\/Typography>/g, '</p></h1></h2></h3></h4></p></p></p>');

// Actually wait, multiple </...> tags is invalid React. I need to be more precise or just use generic <div className="text-..."> for typography.
// Let's stop and think. Is there a simpler way?
// The file is 158KB.
