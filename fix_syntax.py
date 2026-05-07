with open("src/features/sustainability/pages/EmissionsModule.tsx", "r", encoding="utf8") as f:
    t = f.read()

t = t.replace("(acc[`DQS ${curr.dqs}`) || 0) + 1", "(acc[`DQS ${curr.dqs}`] || 0) + 1")

with open("src/features/sustainability/pages/EmissionsModule.tsx", "w", encoding="utf8") as f:
    f.write(t)
print("done")
