with open("src/features/sustainability/pages/EmissionsModule.tsx", "r", encoding="utf8") as f:
    t = f.read()

t = t.replace(
    ')}<div className="fixed bottom-0 right-0 bg-[#f4f4f4]',
    ')}\n          </div>\n        </main>\n        <div className="fixed bottom-0 right-0 bg-[#f4f4f4]'
)

with open("src/features/sustainability/pages/EmissionsModule.tsx", "w", encoding="utf8") as f:
    f.write(t)
print("done")
