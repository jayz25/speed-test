"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearHistory, formatConfig, getAverages, getPersonalBests, getRecent, HistoryEntry, loadHistory,
} from "../utils/history";

const RECENT_RUNS = 20;
const TH = "py-2 pr-4 font-medium";
const TD = "py-2 pr-4";

const formatDate = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Personal bests, averages and recent runs from localStorage history. */
export default function YourResults() {
  // null until mounted: history only exists in the browser
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleClear = () => {
    if (!window.confirm("Clear all saved results? This cannot be undone.")) return;
    clearHistory();
    setHistory([]);
  };

  if (history === null) return <p className="text-slate-400 text-sm">Loading your results…</p>;

  if (history.length === 0) {
    return (
      <p className="text-slate-400 text-sm">
        No tests yet —{" "}
        <Link href="/" className="text-[#FFD523] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523] rounded">take one</Link>
      </p>
    );
  }

  const averages = getAverages(history);

  return (
    <div className="flex flex-col gap-8">
      <dl className="flex gap-8">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Average WPM</dt>
          <dd className="text-3xl font-semibold tabular-nums text-[#FFD523]">{averages.wpm}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Average accuracy</dt>
          <dd className="text-3xl font-semibold tabular-nums text-green-400">{averages.accuracy}%</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Tests</dt>
          <dd className="text-3xl font-semibold tabular-nums text-slate-100">{history.length}</dd>
        </div>
      </dl>

      <section aria-labelledby="pb-heading">
        <h3 id="pb-heading" className="text-lg font-semibold mb-2">Personal bests</h3>
        <table className="w-full text-sm text-left">
          <caption className="sr-only">Best WPM for each test setting</caption>
          <thead className="text-slate-400">
            <tr>
              <th scope="col" className={TH}>Test</th>
              <th scope="col" className={TH}>Best WPM</th>
              <th scope="col" className={TH}>Accuracy</th>
              <th scope="col" className={TH}>Runs</th>
            </tr>
          </thead>
          <tbody>
            {getPersonalBests(history).map((row) => (
              <tr key={`${row.mode}-${row.limit}-${row.difficulty}`} className="border-t border-white/10">
                <th scope="row" className={`${TD} font-normal text-slate-300`}>{formatConfig(row)}</th>
                <td className={`${TD} text-white font-semibold tabular-nums`}>{row.wpm}</td>
                <td className={`${TD} text-green-400 tabular-nums`}>{row.accuracy}%</td>
                <td className={`${TD} text-slate-400 tabular-nums`}>{row.runs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="recent-heading">
        <h3 id="recent-heading" className="text-lg font-semibold mb-2">Last {RECENT_RUNS} runs</h3>
        <table className="w-full text-sm text-left">
          <caption className="sr-only">Most recent tests, newest first</caption>
          <thead className="text-slate-400">
            <tr>
              <th scope="col" className={TH}>Date</th>
              <th scope="col" className={TH}>Test</th>
              <th scope="col" className={TH}>WPM</th>
              <th scope="col" className={TH}>Raw</th>
              <th scope="col" className={TH}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {getRecent(history, RECENT_RUNS).map((run) => (
              <tr key={run.id} className="border-t border-white/10">
                <th scope="row" className={`${TD} font-normal text-slate-400`}>{formatDate(run.date)}</th>
                <td className={`${TD} text-slate-300`}>{formatConfig(run)}</td>
                <td className={`${TD} text-white font-semibold tabular-nums`}>{run.wpm}</td>
                <td className={`${TD} text-blue-400 tabular-nums`}>{run.rawWpm}</td>
                <td className={`${TD} text-green-400 tabular-nums`}>{run.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button
        type="button"
        onClick={handleClear}
        className="self-start px-4 py-2 rounded-lg text-sm text-red-400 border border-red-400/40 hover:bg-red-400/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523]"
      >
        Clear history
      </button>
    </div>
  );
}
