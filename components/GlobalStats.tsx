"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStatCall } from "../redux/stat";
import { AppDispatch, RootState } from "../types/types";

export const GlobalStats = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector((state: RootState) => state.globalStats.stats);
  const status = useSelector((state: RootState) => state.globalStats.status);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      dispatch(getStatCall());
    }
  }, [dispatch]);

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return (
      <p className="text-slate-500 text-sm">
        Stats API not configured. Set <code className="text-slate-300 bg-white/10 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code> to enable.
      </p>
    );
  }

  if (status === "Loading Stats") {
    return <p className="text-slate-500 text-sm animate-pulse">Loading stats…</p>;
  }

  if (!stats || stats.length === 0) {
    return <p className="text-slate-500 text-sm">No stats recorded yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {stats.map((stat) => (
        <li key={stat.id} className="flex gap-6 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm">
          <span className="text-slate-400">{stat.user}</span>
          <span className="text-white font-semibold">{stat.words_per_minute} WPM</span>
          <span className="text-blue-400">{stat.characters_per_minute} CPM</span>
          <span className="text-green-400">{stat.accuracy}%</span>
        </li>
      ))}
    </ul>
  );
};