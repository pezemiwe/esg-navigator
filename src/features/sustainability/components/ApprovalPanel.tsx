import { useState } from "react";
import { ConfirmModal } from "@/components/ui";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  SendHorizonal,
  RotateCcw,
  User,
  MessageSquare,
  Lock,
} from "lucide-react";
import type { PhaseApproval } from "@/store/sustainabilityStore";

function fmt(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PhaseApproval["status"] }) {
  const map = {
    none:      { label: "Not Submitted", cls: "bg-[#f4f4f4] text-[#525252] border-[#e0e0e0]" },
    submitted: { label: "Awaiting Review", cls: "bg-[#fffbeb] text-[#92400e] border-[#f59e0b]/40" },
    approved:  { label: "Approved", cls: "bg-[#f0fdf4] text-[#065f46] border-[#10b981]/40" },
    rejected:  { label: "Revision Required", cls: "bg-[#fff1f1] text-[#da1e28] border-[#ffb3b8]" },
  };
  const { label, cls } = map[status];
  const icons = {
    none:      <Clock className="w-3.5 h-3.5" />,
    submitted: <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />,
    approved:  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />,
    rejected:  <XCircle className="w-3.5 h-3.5 text-[#da1e28]" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 border tracking-wide uppercase ${cls}`}>
      {icons[status]} {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ApprovalPanelProps {
  approval: PhaseApproval;
  phase: "srro" | "report";
  title: string;
  subtitle: string;
  itemCount: number;
  itemLabel: string;
  isLocked: boolean;
  onSubmit: (submittedBy: string) => void;
  onApprove: (reviewedBy: string, comment: string) => void;
  onReject: (reviewedBy: string, comment: string) => void;
  onReset: () => void;
  /**
   * "submitter" = the Deloitte/consultant side that prepares the content and submits it for review.
   * "reviewer" = the client side that approves or requests revisions on what was submitted.
   * Each role only ever sees and acts on its own half of the workflow.
   */
  role: "submitter" | "reviewer";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ApprovalPanel({
  approval,
  title,
  subtitle,
  itemCount,
  itemLabel,
  isLocked,
  onSubmit,
  onApprove,
  onReject,
  onReset,
  role,
}: ApprovalPanelProps) {
  const [submitterName, setSubmitterName] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const { status } = approval;
  const isSubmitter = role === "submitter";

  const handleSubmit = () => {
    if (!submitterName.trim()) return;
    onSubmit(submitterName.trim());
    setSubmitterName("");
  };

  const handleApprove = () => {
    if (!reviewerName.trim()) return;
    onApprove(reviewerName.trim(), comment.trim());
    setReviewerName("");
    setComment("");
    setShowRejectForm(false);
  };

  const handleReject = () => {
    if (!reviewerName.trim() || !comment.trim()) return;
    onReject(reviewerName.trim(), comment.trim());
    setReviewerName("");
    setComment("");
    setShowRejectForm(false);
  };

  const handleReset = () => setResetConfirmOpen(true);

  const doReset = () => {
    onReset();
    setSubmitterName("");
    setReviewerName("");
    setComment("");
    setShowRejectForm(false);
    setResetConfirmOpen(false);
  };

  return (
    <div className="border-2 border-dashed border-[#8d8d8d]/40 bg-white">
      {/* Panel header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-[#f4f4f4] border-b border-[#e0e0e0]">
        <div className="w-8 h-8 bg-[#161616] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#86bc25]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[13px] font-bold text-[#161616] uppercase tracking-wide">{title}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-[12px] text-[#525252] mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">

        {/* ── NONE ── */}
        {status === "none" && (
          isSubmitter ? (
            <div>
              <p className="text-[13px] text-[#525252] mb-4">
                When ready, submit the <strong className="text-[#161616]">{itemCount} {itemLabel}</strong> for the client's review. The content will be locked during the review period.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex-1 max-w-xs">
                  <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
                    Your Name (Submitter) <span className="text-[#da1e28]">*</span>
                  </label>
                  <div className="flex items-center gap-2 bg-[#f4f4f4] border-b border-[#8d8d8d] px-3 py-2.5">
                    <User className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0" />
                    <input
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Enter your full name"
                      className="flex-1 bg-transparent outline-none text-[13px] text-[#161616] placeholder:text-[#c6c6c6]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!submitterName.trim() || itemCount === 0}
                  className="flex items-center gap-2 bg-[#161616] text-white text-[13px] font-bold px-5 py-2.5 hover:bg-[#86bc25] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SendHorizonal className="w-4 h-4" />
                  Submit for Review
                </button>
              </div>
              {itemCount === 0 && (
                <p className="text-[11px] text-[#da1e28] mt-2">Add at least one item before submitting.</p>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-[#525252]">
              Your Deloitte team hasn't submitted this for your review yet. You'll be notified once it's ready.
            </p>
          )
        )}

        {/* ── SUBMITTED ── */}
        {status === "submitted" && (
          isSubmitter ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#f59e0b]/30 px-4 py-3">
                <Clock className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <div className="text-[12px]">
                  <p className="font-semibold text-[#92400e]">Submitted — awaiting client review</p>
                  <p className="text-[#525252] mt-0.5">
                    Submitted by <strong>{approval.submittedBy}</strong> · {fmt(approval.submittedAt)}
                  </p>
                  <p className="text-[#525252]">You'll be notified once the client approves or requests revisions.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#8d8d8d]">
                <Lock className="w-3.5 h-3.5" />
                <span>Content editing is disabled while under review.</span>
                <button onClick={handleReset} className="ml-auto text-[11px] text-[#8d8d8d] underline hover:text-[#da1e28] transition-colors">
                  Recall submission
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#f59e0b]/30 px-4 py-3">
                <Clock className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <div className="text-[12px]">
                  <p className="font-semibold text-[#92400e]">Submitted by your Deloitte team — ready for your review</p>
                  <p className="text-[#525252] mt-0.5">
                    Submitted by <strong>{approval.submittedBy}</strong> · {fmt(approval.submittedAt)}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#e0e0e0] pt-4">
                <p className="text-[11px] font-bold text-[#525252] uppercase tracking-widest mb-4">Your Review</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
                      Your Name (Reviewer) <span className="text-[#da1e28]">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-[#f4f4f4] border-b border-[#8d8d8d] px-3 py-2.5 max-w-xs">
                      <User className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0" />
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Your full name"
                        className="flex-1 bg-transparent outline-none text-[13px] text-[#161616] placeholder:text-[#c6c6c6]"
                      />
                    </div>
                  </div>

                  {showRejectForm && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
                        Reason for Rejection <span className="text-[#da1e28]">*</span>
                      </label>
                      <div className="flex items-start gap-2 bg-[#f4f4f4] border border-[#e0e0e0] px-3 py-2.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0 mt-0.5" />
                        <textarea
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Describe what needs to be revised…"
                          className="flex-1 bg-transparent outline-none text-[13px] text-[#161616] resize-none placeholder:text-[#c6c6c6]"
                        />
                      </div>
                    </div>
                  )}

                  {!showRejectForm && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
                        Comment (optional)
                      </label>
                      <div className="flex items-start gap-2 bg-[#f4f4f4] border border-[#e0e0e0] px-3 py-2.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0 mt-0.5" />
                        <textarea
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Optional review comment…"
                          className="flex-1 bg-transparent outline-none text-[13px] text-[#161616] resize-none placeholder:text-[#c6c6c6]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    {!showRejectForm ? (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={!reviewerName.trim()}
                          className="flex items-center gap-2 bg-[#10b981] text-white text-[13px] font-bold px-5 py-2.5 hover:bg-[#059669] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="flex items-center gap-2 border border-[#da1e28] text-[#da1e28] text-[13px] font-bold px-5 py-2.5 hover:bg-[#da1e28] hover:text-white transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Request Revision
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleReject}
                          disabled={!reviewerName.trim() || !comment.trim()}
                          className="flex items-center gap-2 bg-[#da1e28] text-white text-[13px] font-bold px-5 py-2.5 hover:bg-[#b91c1c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4" /> Send Revision Request
                        </button>
                        <button
                          onClick={() => { setShowRejectForm(false); setComment(""); }}
                          className="text-[13px] text-[#525252] hover:text-[#161616] transition-colors px-3 py-2.5"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── APPROVED ── */}
        {status === "approved" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#10b981]/30 px-4 py-4">
              <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#065f46]">
                  {isSubmitter ? "Approved by the client — no further action required" : "Approved — no further action required"}
                </p>
                <div className="mt-2 space-y-1 text-[12px] text-[#525252]">
                  <p>Submitted by <strong className="text-[#161616]">{approval.submittedBy}</strong> · {fmt(approval.submittedAt)}</p>
                  <p>Approved by <strong className="text-[#161616]">{approval.reviewedBy}</strong> · {fmt(approval.reviewedAt)}</p>
                  {approval.comment && (
                    <p className="mt-2 italic">"{approval.comment}"</p>
                  )}
                </div>
              </div>
            </div>
            {isSubmitter && isLocked && (
              <div className="flex items-center gap-2 text-[11px] text-[#8d8d8d]">
                <Lock className="w-3.5 h-3.5" />
                <span>Content is locked. Reset to make further changes.</span>
                <button onClick={handleReset} className="ml-auto text-[11px] text-[#8d8d8d] underline hover:text-[#da1e28] transition-colors flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset & Edit
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── REJECTED ── */}
        {status === "rejected" && (
          isSubmitter ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-[#fff1f1] border border-[#ffb3b8] px-4 py-4">
                <XCircle className="w-5 h-5 text-[#da1e28] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-[#da1e28]">Revision Requested by the Client</p>
                  <div className="mt-2 space-y-1 text-[12px] text-[#525252]">
                    <p>Submitted by <strong className="text-[#161616]">{approval.submittedBy}</strong> · {fmt(approval.submittedAt)}</p>
                    <p>Reviewed by <strong className="text-[#161616]">{approval.reviewedBy}</strong> · {fmt(approval.reviewedAt)}</p>
                    {approval.comment && (
                      <div className="mt-2 bg-white border border-[#ffb3b8] px-3 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#da1e28] mb-1">Client's Feedback</p>
                        <p className="text-[#161616]">"{approval.comment}"</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] text-[#525252] mt-3">
                    The content has been <strong>unlocked</strong>. Address the feedback above, then resubmit.
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1 max-w-xs">
                  <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
                    Your Name (Submitter) <span className="text-[#da1e28]">*</span>
                  </label>
                  <div className="flex items-center gap-2 bg-[#f4f4f4] border-b border-[#8d8d8d] px-3 py-2.5">
                    <User className="w-3.5 h-3.5 text-[#8d8d8d] shrink-0" />
                    <input
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      placeholder="Enter your full name"
                      className="flex-1 bg-transparent outline-none text-[13px] text-[#161616] placeholder:text-[#c6c6c6]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!submitterName.trim()}
                  className="flex items-center gap-2 bg-[#161616] text-white text-[13px] font-bold px-5 py-2.5 hover:bg-[#86bc25] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SendHorizonal className="w-4 h-4" /> Resubmit for Review
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-[#fff1f1] border border-[#ffb3b8] px-4 py-4">
              <XCircle className="w-5 h-5 text-[#da1e28] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-[#da1e28]">You requested revisions</p>
                <div className="mt-2 space-y-1 text-[12px] text-[#525252]">
                  <p>Submitted by <strong className="text-[#161616]">{approval.submittedBy}</strong> · {fmt(approval.submittedAt)}</p>
                  <p>Reviewed by <strong className="text-[#161616]">{approval.reviewedBy}</strong> · {fmt(approval.reviewedAt)}</p>
                  {approval.comment && (
                    <div className="mt-2 bg-white border border-[#ffb3b8] px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#da1e28] mb-1">Your Feedback</p>
                      <p className="text-[#161616]">"{approval.comment}"</p>
                    </div>
                  )}
                </div>
                <p className="text-[12px] text-[#525252] mt-3">
                  Your Deloitte team has been notified and will resubmit once the feedback has been addressed.
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmModal
        open={resetConfirmOpen}
        title="Reset approval?"
        message="This will unlock the content for further editing and clear the current review status."
        confirmLabel="Reset"
        variant="danger"
        onConfirm={doReset}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
