# -*- coding: utf-8 -*-
import re
file_path = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make the CTA slide up and stick to the bottom
old_cta = '''        {/* Transition Risk CTA */}
        {isLastStep && results.length > 0 && (
          <div className="bg-white dark:bg-[#111] border-t-2 border-[#86BC25] px-6 md:px-10 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#86BC25] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Assessment complete</p>
                <h3 className="text-[18px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight">Continue to Transition Risk Assessment</h3>
                <p className="text-[13px] text-[#888] dark:text-[#666] mt-0.5">Analyse exposure to policy, technology, market and reputational transition risks.</p>
              </div>
              <button
                onClick={() => navigate("/cra/transition-risk")}
                className="flex items-center gap-2 px-6 py-3 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <TrendingDown size={14} />
                Transition Risk
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}'''

new_cta = '''        {/* Transition Risk CTA - Slide Up bottom taskbar */}
        <div className={ixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:ml-64 }>
          <div className="bg-white dark:bg-[#111] border-t-2 border-[#86BC25] px-6 md:px-10 py-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#86BC25] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Assessment complete</p>
                <h3 className="text-[18px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight">Continue to Transition Risk Assessment</h3>
                <p className="text-[13px] text-[#888] dark:text-[#666] mt-0.5 max-w-lg hidden sm:block">Analyse exposure to policy, technology, market and reputational transition risks.</p>
              </div>
              <button
                onClick={() => navigate("/cra/transition-risk")}
                className="flex items-center gap-2 px-6 py-3 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors shrink-0 cursor-pointer"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <TrendingDown size={14} />
                Transition Risk
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>'''

text = text.replace(old_cta, new_cta)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
