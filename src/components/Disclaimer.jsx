import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export function Disclaimer() {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-12 mb-6 mx-auto max-w-[1400px]">
            <div className="bg-surface shadow-neumorph-sm rounded-3xl p-6">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-between text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface shadow-neumorph-sm rounded-full text-secondary">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-black text-secondary uppercase tracking-widest">
                            Disclaimer & Terms of Use
                        </span>
                    </div>
                    {expanded ? <ChevronUp size={18} className="text-secondary" /> : <ChevronDown size={18} className="text-secondary" />}
                </button>

                {expanded && (
                    <div className="mt-4 pt-4 border-t border-primary/5 space-y-3 text-sm text-secondary leading-relaxed">
                        <p>
                            <strong className="text-primary">Educational Project.</strong>{' '}
                            This dashboard was developed as an academic exercise at the University of North Carolina at Chapel Hill Kenan-Flagler Business School. It is not endorsed, reviewed, monitored, approved, or operated by UNC, Kenan-Flagler, or any instructor. All design, implementation, and deployment decisions are solely the responsibility of the student developer.
                        </p>
                        <p>
                            <strong className="text-primary">Not Financial Advice.</strong>{' '}
                            Nothing presented on this dashboard constitutes investment, financial, legal, tax, or other professional advice. All data, analytics, visualizations, metrics, scores, signals, and commentary are provided strictly for informational and educational purposes. Results may be incomplete, approximate, delayed, or inaccurate. Users should not rely on any information displayed here to make investment or financial decisions. Consult a qualified professional before acting on any information.
                        </p>
                        <p>
                            <strong className="text-primary">Data Sources & Limitations.</strong>{' '}
                            Financial statement data is sourced from the SEC EDGAR XBRL API, a publicly available U.S. government resource. Market price data is provided by Twelve Data. Both sources are subject to delays, omissions, and errors beyond the control of this application. No proprietary, confidential, or NDA-protected data is used. Sector classifications, sentiment labels, and constraint signals are computed heuristics — not professional analyst opinions.
                        </p>
                        <p>
                            <strong className="text-primary">No Warranties.</strong>{' '}
                            This dashboard is provided "as is" without warranties of any kind, express or implied, including but not limited to warranties of accuracy, completeness, timeliness, merchantability, or fitness for a particular purpose. The developer assumes no liability for any losses, damages, or decisions arising from use of this tool.
                        </p>
                        <p>
                            <strong className="text-primary">Privacy.</strong>{' '}
                            This application does not collect, store, process, or transmit any personally identifiable information. No cookies, analytics trackers, or user accounts are used. Ticker searches are processed in real time and are not logged or retained.
                        </p>
                    </div>
                )}

                {!expanded && (
                    <p className="mt-3 text-xs text-secondary/60 leading-relaxed">
                        Educational project — not financial advice. Data from SEC EDGAR & Twelve Data. Click above to view full terms.
                    </p>
                )}
            </div>
        </div>
    );
}
