import { useMemo } from "react";
import { format } from "date-fns";
import {
  Clock,
  AlertTriangle,
  Leaf,
  Target,
} from "lucide-react";
import { useMaterialityStore } from "@/store/materialityStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";

// Deloitte Enterprise Colors


export function DataOwnerDashboard() {
  const { topics } = useMaterialityStore(
    useShallow((s) => ({ topics: s.topics })),
  );
  
  // NOTE: If your DataOwnerDashboard historically displayed emissions and risks for the user's branch
  // they can be pulled from sustainabilityStore. 
  // We'll mimic what might be typically here.
  const { scope1Assets, risks } = useSustainabilityStore(
    useShallow((s) => ({
      scope1Assets: s.scope1Assets,
      risks: s.risks,
    })),
  );

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );
  
  // For demonstration, let's treat anything not "Approved" as needing attention by owner
  const pendingTasks = selectedTopics.filter((t) => !t.approvalStatus || t.approvalStatus === "Draft" || false);
  
  const upcomingDeadlines = useMemo(() => {
    // Generate some mock deadlines based on topics
    return selectedTopics.slice(0, 3).map((t, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + (idx * 5) + 2);
      return {
        id: t.id,
        task: `Update data for ${t.name}`,
        dueDate: d,
        priority: idx === 0 ? "High" : "Medium",
        status: t.approvalStatus || "Pending",
      };
    });
  }, [selectedTopics]);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto text-[#161616]">
      <div className="mb-6">
        <p className="text-[12px] font-bold text-[#86bc25] uppercase tracking-widest">
          DATA OWNER DASHBOARD
        </p>
        <h2 className="text-[32px] font-light mt-1">My Reporting Tasks</h2>
        <p className="text-[14px] text-[#525252] mt-1">
          Manage your assigned sustainability disclosures and metrics
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-[#86bc25]" />
            <span className="text-[12px] font-bold text-[#525252] uppercase">
              Assigned Topics
            </span>
          </div>
          <span className="text-[28px] font-light">
            {selectedTopics.length}
          </span>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-[#f59e0b]" />
            <span className="text-[12px] font-bold text-[#525252] uppercase">
              Pending Update
            </span>
          </div>
          <span className="text-[28px] font-light">
            {pendingTasks.length}
          </span>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Leaf size={16} className="text-[#10b981]" />
            <span className="text-[12px] font-bold text-[#525252] uppercase">
              My Facilities
            </span>
          </div>
          <span className="text-[28px] font-light">
            {scope1Assets.length}
          </span>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[#ef4444]" />
            <span className="text-[12px] font-bold text-[#525252] uppercase">
              Facility Risks
            </span>
          </div>
          <span className="text-[28px] font-light">
            {risks.length > 0 ? Math.floor(risks.length / 3) : 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#e0e0e0]">
          <div className="px-6 py-4 border-b border-[#e0e0e0]">
            <h3 className="text-[14px] font-bold">Upcoming Deadlines</h3>
          </div>
          <div className="p-4">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-[14px] text-[#525252] text-center my-8">
                No upcoming deadlines.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-3 border border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors cursor-pointer">
                    <div>
                      <p className="text-[14px] font-medium text-[#161616]">{task.task}</p>
                      <p className="text-[12px] text-[#525252] mt-0.5">Due: {format(task.dueDate, "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 text-[11px] font-medium ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e0e0e0]">
          <div className="px-6 py-4 border-b border-[#e0e0e0] flex justify-between items-center">
            <h3 className="text-[14px] font-bold">Recent Activity</h3>
            <span className="text-[12px] text-[#2563eb] font-bold cursor-pointer hover:underline">View All</span>
          </div>
          <div className="p-6">
            <div className="relative border-l border-[#e0e0e0] ml-3 pl-6 pb-6">
              <div className="absolute w-3 h-3 bg-[#10b981] rounded-full -left-1.5 top-1"></div>
              <p className="text-[14px] font-medium mb-1">GHG Emissions Data Approved</p>
              <p className="text-[12px] text-[#525252]">Your Q2 emissions data for Headquarters was reviewed and approved by Jane Doe.</p>
              <p className="text-[11px] text-[#525252] mt-2">2 days ago</p>
            </div>
            <div className="relative border-l border-[#e0e0e0] ml-3 pl-6 pb-6">
              <div className="absolute w-3 h-3 bg-[#f59e0b] rounded-full -left-1.5 top-1"></div>
              <p className="text-[14px] font-medium mb-1">New Topic Assigned: Water Security</p>
              <p className="text-[12px] text-[#525252]">You have been designated as the primary data owner for Water Security metrics.</p>
              <p className="text-[11px] text-[#525252] mt-2">5 days ago</p>
            </div>
            <div className="relative ml-3 pl-6">
              <div className="absolute w-3 h-3 bg-[#86bc25] rounded-full -left-1.5 top-1"></div>
              <p className="text-[14px] font-medium mb-1">System Upload Complete</p>
              <p className="text-[12px] text-[#525252]">Automated sync with the HR system for Diversity & Inclusion metrics finished successfully.</p>
              <p className="text-[11px] text-[#525252] mt-2">1 week ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e0e0e0]">
        <div className="px-6 py-4 border-b border-[#e0e0e0]">
          <h3 className="text-[14px] font-bold">
            My Assigned Disclosures
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f4f4] text-[12px] text-[#525252] border-b border-[#e0e0e0]">
                <th className="px-6 py-3 font-semibold">Disclosure Topic</th>
                <th className="px-6 py-3 font-semibold">Framework</th>
                <th className="px-6 py-3 font-semibold">Data Completeness</th>
                <th className="px-6 py-3 font-semibold">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {selectedTopics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#525252] text-[14px]">
                    No disclosures assigned yet.
                  </td>
                </tr>
              ) : (
                selectedTopics.map((t) => {
                  const completeness = Math.floor(Math.random() * 40) + 60; // Mock 60-100%
                  return (
                    <tr key={t.id} className="border-b border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors">
                      <td className="px-6 py-3 text-[14px] font-medium text-[#161616]">
                        {t.name}
                      </td>
                      <td className="px-6 py-3 text-[14px] text-[#525252]">
                        IFRS {t.id.length % 2 === 0 ? 'S2' : 'S1'}
                      </td>
                      <td className="px-6 py-3">
                         <div className="flex items-center gap-2">
                           <div className="w-full max-w-[100px] h-1.5 bg-[#e0e0e0]">
                             <div className="h-full bg-[#86bc25]" style={{ width: `${completeness}%` }}></div>
                           </div>
                           <span className="text-[12px] text-[#525252]">{completeness}%</span>
                         </div>
                      </td>
                      <td className="px-6 py-3 text-[14px] text-[#525252]">
                        {t.approvalStatus === 'Board Approved' 
                          ? "Q1 2026" 
                          : "End of quarter"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
