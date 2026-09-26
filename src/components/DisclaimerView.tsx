import React from 'react';
import { ShieldAlert, FileText, ArrowLeft } from 'lucide-react';

interface DisclaimerViewProps {
  onBackToScanner?: () => void;
}

export const DisclaimerView: React.FC<DisclaimerViewProps> = ({ onBackToScanner }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-[#FAF7F2] dark:bg-[#0F1117] border border-[#D8CCC0] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2D7C7] dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#332421] dark:text-slate-100 tracking-tight">
                Disclaimer
              </h1>
              <p className="text-xs text-[#332421]/70 dark:text-slate-400 font-mono mt-0.5">
                Last updated: 27/09/2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToScanner && (
              <button
                type="button"
                onClick={onBackToScanner}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CCC0] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#EFE8DC] dark:hover:bg-slate-800 text-[#332421] dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Scanner</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlighted Warning Box */}
        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          LabelLens uses AI and can make mistakes. Results are informational only and are not an official legal determination. Always verify against the physical product and the Legal Metrology (Packaged Commodities) Rules, 2011.
        </div>

        {/* Full Disclaimer Clauses (1-12) */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-[#332421]/90 dark:text-slate-300 divide-y divide-[#EADFCF] dark:divide-slate-800/80 font-sans">
          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              1. What LabelLens is
            </h2>
            <p>
              LabelLens is an AI-assisted tool that reads product images and labels and compares the extracted information against the Legal Metrology (Packaged Commodities) Rules, 2011. It was developed by Team Straw Hats , college LNCTS as a prototype for Smart India Hackathon 2026 and is provided for informational and demonstration purposes only. It is not a production system.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              2. AI can make mistakes
            </h2>
            <p>
              LabelLens relies on artificial intelligence, including Google&apos;s Gemini API, to read and interpret images. Results may be incomplete, inaccurate, or misleading. Accuracy can be affected by glare, curved or creased packaging, low resolution, poor lighting, regional scripts, faded print, and errors in size estimation, including the reference-object calibration mode. LabelLens may flag a compliant product or fail to flag a non-compliant one.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              3. Not an official determination or legal advice
            </h2>
            <p>
              Nothing on this website is legal advice or an official finding that any product, manufacturer, packer, importer or seller has violated the law. Only authorized officers under the applicable Legal Metrology laws can determine non-compliance and take enforcement action. LabelLens is not an official tool of, and is not affiliated with or endorsed by, the Department of Consumer Affairs, any Legal Metrology authority, or any other government body.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              4. Verify before you rely
            </h2>
            <p>
              Before acting on any result, whether purchasing, complaining, or taking enforcement action, verify it against the physical product and the current text of the applicable rules. You are responsible for how you use the results.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              5. Reporting feature
            </h2>
            <p>
              The option to contact or report to government customer care is provided for convenience. Submit a report only if you have personally verified the issue and believe it to be true. You are responsible for the content of any report you send. LabelLens does not verify reports, and does not submit them on your behalf without your action.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              6. No statement about any brand
            </h2>
            <p>
              LabelLens results are automated outputs about a specific image you supplied. They are not statements of fact by the developers about any product, brand or company. Product names shown in examples or the prototype are used for demonstration only. If you are a manufacturer, packer or brand owner and believe a result is wrong, contact us at{' '}
              <a href="mailto:utkrishtasingoria@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline">
                utkrishtasingoria@gmail.com
              </a>{' '}
              or{' '}
              <a href="mailto:ymuskan252@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline">
                ymuskan252@gmail.com
              </a>{' '}
              and we will review it.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              7. Rules and reference data
            </h2>
            <p>
              The rules compendium, standard pack sizes, allergen, ingredient and nutrition information reflect our reading of publicly available sources as of the date above. Laws and standards change and our summaries may be incomplete or out of date. Consult the official text.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              8. Data and privacy
            </h2>
            <p>
              Images you upload are processed by third-party AI services, including Google Gemini, and, if you sign in, scan records may be stored with your account. Do not upload images containing personal or sensitive information.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              9. Availability
            </h2>
            <p>
              The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, express or implied, including accuracy, reliability, fitness for a particular purpose, or uninterrupted availability.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              10. Limitation of liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, [Team name / college] and its members are not liable for any loss, damage, or consequence arising from your use of, or reliance on, LabelLens or its results, including decisions, complaints, or actions taken based on them. Nothing in this disclaimer excludes liability that cannot be excluded under applicable law.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              11. Governing law
            </h2>
            <p>
              This disclaimer is governed by the laws of India. Courts at bhopal have jurisdiction, subject to applicable law.
            </p>
          </div>

          <div className="pt-4 space-y-1.5">
            <h2 className="font-bold text-[#332421] dark:text-slate-100 text-sm sm:text-base">
              12. Contact
            </h2>
            <p className="font-medium">
              Straw Hats &middot;{' '}
              <a href="mailto:utkrishtasingoria@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline">
                utkrishtasingoria@gmail.com
              </a>{' '}
              or{' '}
              <a href="mailto:ymuskan252@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline">
                ymuskan252@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-8 pt-4 border-t border-[#E2D7C7] dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Smart India Hackathon 2026 Prototype &bull; Team Straw Hats &bull; LNCTS</span>
          </div>
          <span>Bhopal, MP, India</span>
        </div>
      </div>
    </div>
  );
};
