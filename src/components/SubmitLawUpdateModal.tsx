import React, { useState } from "react";
import { X, Send, Scale, ShieldCheck, Check } from "lucide-react";
import { LawUpdateSubmission } from "../types";
import { HIGH_COURTS_LIST } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface SubmitLawUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Omit<LawUpdateSubmission, "id" | "status" | "submittedAt">) => void;
}

export default function SubmitLawUpdateModal({
  isOpen,
  onClose,
  onSubmit
}: SubmitLawUpdateModalProps) {
  const [title, setTitle] = useState("");
  const [court, setCourt] = useState("Supreme Court");
  const [caseNumber, setCaseNumber] = useState("");
  const [bench, setBench] = useState("");
  const [summary, setSummary] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !caseNumber || !submittedBy || !email || !summary) {
      alert("Please fill in all required fields.");
      return;
    }

    onSubmit({
      title,
      court,
      caseNumber,
      bench: bench || "Hon'ble Court",
      summary,
      submittedBy,
      email
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      // Reset form
      setTitle("");
      setCourt("Supreme Court");
      setCaseNumber("");
      setBench("");
      setSummary("");
      setSubmittedBy("");
      setEmail("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl max-h-[90vh] overflow-y-auto relative z-10"
      >
        {/* Header */}
        <div className="bg-red-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-tight">
              Submit Court News / Judgement Brief
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        <AnimatePresence>
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4"
            >
              <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
                <Check className="w-10 h-10 stroke-[3px]" />
              </div>
              <h4 className="text-xl font-extrabold text-neutral-900">
                Thank You, Advocate!
              </h4>
              <p className="text-sm text-neutral-600 max-w-xs mx-auto leading-relaxed">
                Your legal update has been submitted and is currently being audited by our editorial committee.
              </p>
            </motion.div>
          ) : (
            /* Form fields */
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-neutral-800">
              <div className="bg-neutral-50 border border-neutral-200 p-3.5 rounded-lg flex items-start space-x-2 text-xs text-neutral-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Verification Guard:</strong> Legal updates are fact-checked against the National Judicial Data Grid (NJDG) and official court records prior to distribution.
                </p>
              </div>

              {/* Submitter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Advocate Name / Reporter <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adv. Amit Sen"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Your Contact Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. amit@barcouncil.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm"
                  />
                </div>
              </div>

              {/* Court selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Court Jurisdiction <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm"
                  >
                    <option value="Supreme Court">Supreme Court of India</option>
                    {HIGH_COURTS_LIST.map((hc) => (
                      <option key={hc} value={hc}>
                        {hc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Case / Writ Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SLP (C) No. 4410/2026"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm"
                  />
                </div>
              </div>

              {/* Case details title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Case Name or News Headline <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State of UP v. Dinesh Kumar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm"
                />
              </div>

              {/* Bench */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Bench / Judges Involved
                </label>
                <input
                  type="text"
                  placeholder="e.g. Justice Surya Kant, Justice K.V. Viswanathan"
                  value={bench}
                  onChange={(e) => setBench(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Case summary or Legal analysis <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a clear, unbiased summary of the order, directions issued, and legal ratio decidendi..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-800 text-sm resize-none"
                />
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-800 hover:bg-red-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Filing</span>
                </button>
              </div>
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
