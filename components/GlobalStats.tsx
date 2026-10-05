"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStatCall, isStatsApiEnabled } from "../redux/stat";
import { AppDispatch, RootState } from "../types/types";

const LEADERBOARD_SIZE = 20;

export const GlobalStats = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector((state: RootState) => state.globalStats.stats);
  const status = useSelector((state: RootState) => state.globalStats.status);

  useEffect(() => {
    if (isStatsApiEnabled) {
      const request = dispatch(getStatCall());
      return () => request.abort();
    }
  }, [dispatch]);

  if (!isStatsApiEnabled) {
    return (
      <p className="text-slate-500 text-sm">
        Stats API not configured. Set <code className="text-slate-300 bg-white/10 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code> to enable.
      </p>
    );
  }

  if (status === "Loading Stats") {
    return <p className="text-slate-500 text-sm animate-pulse">Loading stats…</p>;
  }

  if (status === "Stats API Failed") {
    return (
      <div role="alert" className="flex items-center gap-4 text-sm">
        <p className="text-red-400">Couldn&apos;t load leaderboard</p>
        <button
          type="button"
          onClick={() => dispatch(getStatCall())}
          className="px-3 py-1 rounded-lg bg-[#FFD523] text-black font-semibold hover:bg-yellow-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD523]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return <p className="text-slate-500 text-sm">No stats recorded yet.</p>;
  }

  const topStats = [...stats]
    .sort((a, b) => b.words_per_minute - a.words_per_minute)
    .slice(0, LEADERBOARD_SIZE);

  return (
    <table className="w-full text-sm text-left">
      <caption className="sr-only">Global leaderboard, top {LEADERBOARD_SIZE} by WPM</caption>
      <thead className="text-slate-500">
        <tr>
          <th scope="col" className="py-2 pr-4 font-medium">Rank</th>
          <th scope="col" className="py-2 pr-4 font-medium">Player</th>
          <th scope="col" className="py-2 pr-4 font-medium">WPM</th>
          <th scope="col" className="py-2 pr-4 font-medium">CPM</th>
          <th scope="col" className="py-2 font-medium">Accuracy</th>
        </tr>
      </thead>
      <tbody>
        {topStats.map((stat, index) => (
          <tr key={stat.id} className="border-t border-white/10">
            <td className="py-2 pr-4 text-slate-500">{index + 1}</td>
            <td className="py-2 pr-4 text-slate-400">{stat.user}</td>
            <td className="py-2 pr-4 text-white font-semibold">{stat.words_per_minute}</td>
            <td className="py-2 pr-4 text-blue-400">{stat.characters_per_minute}</td>
            <td className="py-2 text-green-400">{stat.accuracy}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
