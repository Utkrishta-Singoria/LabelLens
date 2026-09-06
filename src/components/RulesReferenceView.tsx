import React, { useState } from 'react';
import {
  BookOpen,
  Scale,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { STANDARD_PACK_RULES } from '../data/legalMetrologyRules';

export const RulesReferenceView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'schedule2' | 'mpe' | 'typography' | 'stickers'>('schedule2');

  const filteredRules = STANDARD_PACK_RULES.filter(
    (r) =>
      r.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.standardSizes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ruleCitation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 text-slate-300 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-0.5 rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Statutory Reference Framework
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Legal Metrology Rules, 2011 Compendium
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              Official reference guide for standard metric pack sizes (Schedule II), Maximum Permissible Errors (MPE), declaration font heights (Rule 9), and sticker regulations (Rule 18).
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setActiveTab('schedule2')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'schedule2' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Schedule II Packs
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'stickers' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rule 18 Stickers
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'typography' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Font Heights
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Schedule II Standard Pack Sizes */}
      {activeTab === 'schedule2' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Schedule II: Mandatory Quantities in Which Specified Commodities Shall Be Packed
              </h3>
              <p className="text-xs text-slate-400">
                Packaging non-standard quantities without an exemption triggers enforcement action under Section 36(1)
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search commodity or size..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg focus:border-sky-500 focus:outline-none w-56 sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-3.5">Commodity / Goods</th>
                  <th className="py-3 px-3.5">Prescribed Standard Pack Sizes</th>
                  <th className="py-3 px-3.5">Statutory Citation</th>
                  <th className="py-3 px-3.5 text-right">Violation Clause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3.5 font-medium text-slate-200">
                      {rule.commodity}
                    </td>
                    <td className="py-3 px-3.5 text-sky-300 font-medium">
                      {rule.standardSizes}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 text-xs">
                      {rule.ruleCitation}
                    </td>
                    <td className="py-3 px-3.5 text-right font-medium">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rule.isStandardPackRequired
                          ? 'bg-rose-950/70 text-rose-400 border border-rose-800/80'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rule.isStandardPackRequired ? 'Sec 36(1) Enforced' : 'General'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Rule 18 Stickers */}
      {activeTab === 'stickers' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200">
              Rule 18(1) & (2): Prohibition of Overwriting / Pasting Price Stickers on MRP
            </h3>
            <p className="text-xs text-slate-400">
              Clear guidelines on what retail packaging alterations are permitted vs strictly illegal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-950/80 border border-rose-900/60 p-5 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Strictly Prohibited Acts</span>
              </div>
              <ul className="space-y-2.5 text-slate-400 text-xs list-disc list-inside leading-relaxed font-sans">
                <li>
                  <strong className="text-slate-200">No Upward Alteration:</strong> Pasting a sticker over the original printed MRP to charge a higher price is an offense under Section 36(1).
                </li>
                <li>
                  <strong className="text-slate-200">Obscuring Original Price:</strong> Defacing, smudging, or obliterating the manufacturer's printed Maximum Retail Price.
                </li>
                <li>
                  <strong className="text-slate-200">Non-Uniform Price:</strong> Selling identical commodity packs at different rates within the same retail establishment.
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/80 border border-emerald-900/60 p-5 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Permissible Statutory Exceptions</span>
              </div>
              <ul className="space-y-2.5 text-slate-400 text-xs list-disc list-inside leading-relaxed font-sans">
                <li>
                  <strong className="text-slate-200">Downward Revision (Discounts):</strong> Pasting a sticker with a LOWER price than original MRP for consumer promotional discount is permitted provided original MRP remains readable.
                </li>
                <li>
                  <strong className="text-slate-200">Official GST Notifications:</strong> Specific government gazette transitions permitting sticker revision for central tax rate adjustments.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Font Height Rules */}
      {activeTab === 'typography' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200">
              Rule 9 & Table 1: Minimum Height of Numerals & Letters for Declarations
            </h3>
            <p className="text-xs text-slate-400">
              Statutory typography standards to guarantee consumer visibility on the principal display panel
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-3.5">Net Quantity / Principal Display Area</th>
                  <th className="py-3 px-3.5">Minimum Height (Normal Print)</th>
                  <th className="py-3 px-3.5">Minimum Height (Blown / Molded / Perforated)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 text-slate-300">Up to 50 g / 50 mL</td>
                  <td className="py-3 px-3.5 text-sky-400 font-semibold">1.0 mm</td>
                  <td className="py-3 px-3.5 text-slate-400">2.0 mm</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 text-slate-300">50 g/mL to 200 g/mL</td>
                  <td className="py-3 px-3.5 text-sky-400 font-semibold">2.0 mm</td>
                  <td className="py-3 px-3.5 text-slate-400">4.0 mm</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 text-slate-300">200 g/mL to 1 kg / 1 L</td>
                  <td className="py-3 px-3.5 text-sky-400 font-semibold">4.0 mm</td>
                  <td className="py-3 px-3.5 text-slate-400">6.0 mm</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 text-slate-300">Above 1 kg / 1 L</td>
                  <td className="py-3 px-3.5 text-sky-400 font-semibold">6.0 mm</td>
                  <td className="py-3 px-3.5 text-slate-400">8.0 mm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
