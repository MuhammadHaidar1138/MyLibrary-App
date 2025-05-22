import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constan";

export default function Dashboard() {
    const [stats, setStats] = useState([
        { label: "Total Books", value: 0, icon: null, color: "from-blue-700 via-blue-800 to-blue-900" },
        { label: "Total Members", value: 0, icon: null, color: "from-sky-700 via-blue-800 to-blue-900" },
        { label: "Total Lendings", value: 0, icon: null, color: "from-indigo-700 via-blue-800 to-blue-900" },
        { label: "Total Penalties", value: 0, icon: null, color: "from-blue-900 via-blue-800 to-blue-700" }
    ]);
    const [monthly, setMonthly] = useState([]);

    // SVG icons
    const icons = [
        (
            <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} stroke="currentColor" fill="#2563eb" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8M8 12h8M8 16h4" stroke="#fff"/>
            </svg>
        ),
        (
            <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="8" r="4" strokeWidth={2} stroke="currentColor" fill="#2563eb" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="#fff"/>
            </svg>
        ),
        (
            <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth={2} stroke="currentColor" fill="#2563eb" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" stroke="#fff"/>
            </svg>
        ),
        (
            <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth={2} stroke="currentColor" fill="#2563eb" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2 2" stroke="#fff"/>
            </svg>
        )
    ];

    useEffect(() => {
        // Fetch all stats in parallel
        const token = localStorage.getItem("token");
        Promise.all([
            axios.get(`${API_URL}buku`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}member`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}peminjaman`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}denda`, { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([books, members, lendings, penalties]) => {
            setStats([
                { ...stats[0], value: books.data.length, icon: icons[0] },
                { ...stats[1], value: members.data.length, icon: icons[1] },
                { ...stats[2], value: lendings.data.data?.length || lendings.data.length, icon: icons[2] },
                { ...stats[3], value: penalties.data.length, icon: icons[3] }
            ]);
            // Monthly chart data
            const lendingsArr = lendings.data.data || lendings.data;
            const membersArr = members.data;
            // Group by month
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const now = new Date();
            const last6 = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                last6.push({ month: months[d.getMonth()], year: d.getFullYear(), lendings: 0, members: 0 });
            }
            // Count lendings per month
            lendingsArr.forEach(l => {
                const date = new Date(l.tanggal_pinjam || l.created_at);
                const idx = last6.findIndex(m => m.year === date.getFullYear() && m.month === months[date.getMonth()]);
                if (idx !== -1) last6[idx].lendings += 1;
            });
            // Count members per month
            membersArr.forEach(m => {
                const date = new Date(m.created_at);
                const idx = last6.findIndex(mm => mm.year === date.getFullYear() && mm.month === months[date.getMonth()]);
                if (idx !== -1) last6[idx].members += 1;
            });
            setMonthly(last6);
        });
        // eslint-disable-next-line
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-10 px-2 md:px-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <div className="flex items-center gap-4 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-2xl shadow-2xl p-6 border border-blue-900">
                    <span className="inline-flex items-center justify-center h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="#2563eb" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h8M8 8h8" stroke="#fff"/>
                        </svg>
                    </span>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-100 tracking-tight mb-1">Library Dashboard</h1>
                        <p className="text-blue-200 text-sm md:text-base">Welcome! Here’s a quick overview of your library system.</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div
                        key={stat.label}
                        className={`flex flex-col items-center justify-center rounded-2xl shadow-xl p-6 bg-gradient-to-br ${stat.color} border border-blue-900 hover:scale-105 transition-transform duration-200`}
                    >
                        <div className="mb-2">{stat.icon}</div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-blue-200 text-sm font-semibold mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="max-w-5xl mx-auto my-8">
                <div className="flex items-center">
                    <div className="flex-1 border-t-2 border-blue-900" />
                    <span className="mx-4 text-blue-400 font-bold tracking-widest text-lg select-none">OVERVIEW</span>
                    <div className="flex-1 border-t-2 border-blue-900" />
                </div>
            </div>

            {/* Chart Section */}
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-blue-900 rounded-2xl shadow-2xl p-6">
                <h2 className="text-xl font-bold text-blue-200 mb-4">Monthly Activity</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-blue-100 text-sm">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Month</th>
                                <th className="px-4 py-2 text-left">Lendings</th>
                                <th className="px-4 py-2 text-left">New Members</th>
                                <th className="px-4 py-2 text-left">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthly.map((row, idx) => (
                                <tr key={row.month + row.year} className="hover:bg-blue-900/30 transition">
                                    <td className="px-4 py-2 font-semibold">{row.month} {row.year}</td>
                                    <td className="px-4 py-2">{row.lendings}</td>
                                    <td className="px-4 py-2">{row.members}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${row.lendings >= 20 ? "bg-green-400" : "bg-yellow-400"}`}></span>
                                            <span className="text-xs">
                                                {row.lendings >= 20 ? "Up" : "Stable"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Simple chart bar */}
                <div className="mt-8 flex gap-4 items-end h-32">
                    {(() => {
                        // Cari nilai lendings maksimum untuk normalisasi tinggi bar
                        const maxLendings = Math.max(...monthly.map(row => row.lendings), 1);
                        // Maksimal tinggi bar (px)
                        const maxBarHeight = 96;
                        return monthly.map((row, idx) => (
                            <div key={row.month + row.year} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-7 rounded-t-lg bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300 shadow-lg transition-all duration-300"
                                    style={{
                                        height: `${(row.lendings / maxLendings) * maxBarHeight}px`,
                                        minHeight: "8px"
                                    }}
                                    title={`Lendings: ${row.lendings}`}
                                ></div>
                                <div className="text-xs text-blue-200 mt-2">{row.month}</div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* Footer */}
            <div className="max-w-5xl mx-auto mt-12 text-center text-blue-400 text-xs opacity-70">
                &copy; {new Date().getFullYear()} MyLibrary App &mdash; Dashboard UI by GitHub Copilot
            </div>
        </div>
    );
}