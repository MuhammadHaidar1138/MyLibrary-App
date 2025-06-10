import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constan";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function PenaltysIndex() {
    const [penalties, setPenalties] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [alert, setAlert] = useState("");
    const [error, setError] = useState("");
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPenalty, setSelectedPenalty] = useState(null);
    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    function fetchData() {
        axios.get(`${API_URL}denda`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then((res) => {
                setPenalties(res.data.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setPenalties([]);
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to fetch penalaties."
                );
            });

        axios.get(`${API_URL}buku`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then((res) => {
                setBooks(res.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setBooks([]);
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to fetch books."
                );
            });

        axios.get(`${API_URL}member`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then((res) => {
                setMembers(res.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setMembers([]);
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to fetch members."
                );
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    // Filter penalties by search (by member name, book title, or description)
    const filteredPenalties = penalties.filter(penalty => {
        const memberName = members.find(m => m.id === penalty.id_member)?.nama || "";
        const bookTitle = books.find(b => b.id === penalty.id_buku)?.judul || "";
        return (
            penalty.id_member?.toString().toLowerCase().includes(search.toLowerCase()) ||
            penalty.id_buku?.toString().toLowerCase().includes(search.toLowerCase()) ||
            memberName.toLowerCase().includes(search.toLowerCase()) ||
            bookTitle.toLowerCase().includes(search.toLowerCase()) ||
            penalty.jenis_denda?.toLowerCase().includes(search.toLowerCase()) ||
            penalty.deskripsi?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredPenalties.length / itemsPerPage);

    const paginatedPenalties = filteredPenalties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function exportExcel() {
        // Menghitung jumlah data denda berdasarkan jenis
        // Membuat objek kosong
        const typeCounts = {};
        penalties.forEach(penalty => {
            // Jika data jenis nya sudah ada, maka pake data itu lalu ditambah 1, jika belum maka jadi 0 lalu ditambah 1 / buat data baru
            typeCounts[penalty.jenis_denda] = (typeCounts[penalty.jenis_denda] || 0) + 1;
        });

        // Buat format data (column) apa saja yang akan dibuat pada excel
        const formattedData = Object.entries(typeCounts).map(([type, count], index) => ({
            "No": index + 1,
            "Jenis Denda": type,
            "Jumlah Data": count
        }));

        // Menambahkan total dibawahnya
        formattedData.push({
            "No": "",
            "Jenis Denda": "Total Keseluruhan",
            "Jumlah Data": penalties.length
        });

        // ubah array of object jadi worksheet Excel
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Denda");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
        // Simpan file dengan ekstensi .xlsx
        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        // unduh dengan nama file
        saveAs(file, "rekap_denda.xlsx");
    }

    function handlePageChange(page) {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }

    // Reset ke halaman 1 saat search berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-10 px-2 md:px-8">
            {/* Header Card */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-4 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-2xl shadow-2xl p-6 border border-blue-900">
                    <span className="inline-flex items-center justify-center h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="#2563eb" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h8M8 8h8" stroke="#fff" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-100 tracking-tight mb-1">Penalties Management</h1>
                        <p className="text-blue-200 text-sm md:text-base">View, search, and manage all penalty records in your library system.</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
                <div className="flex w-full md:w-auto gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full md:w-80 px-4 py-2 rounded-lg border border-blue-800 bg-gray-900 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700 transition"
                    />
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="px-4 py-2 rounded-lg bg-gray-700 text-blue-100 hover:bg-gray-600 transition font-semibold"
                    >
                        Reset
                    </button>
                </div>
                <div className="hidden md:block">
                    <span className="text-blue-300 text-sm">{filteredPenalties.length} result(s)</span>
                </div>
            </div>

            {/* Button excel */}
            <div className="flex justify-end mb-2 max-w-5xl mx-auto">
                <button
                    onClick={exportExcel}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-700 via-green-800 to-green-900 hover:from-green-800 hover:to-green-950 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200 border border-green-900"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 12h8m0 0l-3-3m3 3l-3 3" />
                    </svg>
                    Export Excel
                </button>
            </div>

            {/* Table Card */}
            <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl bg-gray-800 border border-gray-700 overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-700">
                    <thead className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
                        <tr>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">No</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Member ID</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Book ID</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Amount</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Type</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Description</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Date</th>
                            <th className="px-4 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPenalties.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-400">
                                    No penalties found.
                                </td>
                            </tr>
                        ) : (
                            paginatedPenalties.map((penalty, idx) => (
                                <tr
                                    key={penalty.id}
                                    className="hover:bg-blue-900/30 transition duration-200 border-b border-gray-700"
                                >
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center font-semibold">
                                        {(currentPage - 1) * itemsPerPage + idx + 1}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">
                                        {penalty.id_member} - {members.find(member => member.id === penalty.id_member)?.nama || "Undefined"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">
                                        {penalty.id_buku} - {books.find(book => book.id === penalty.id_buku)?.judul || "Undefined"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">{penalty.jumlah_denda}</td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">{penalty.jenis_denda}</td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">{penalty.deskripsi}</td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">{formatDate(penalty.created_at)}</td>
                                    <td className="px-4 py-3 text-xs text-blue-100 text-center">
                                        <button
                                            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs"
                                            onClick={() => {
                                                setSelectedPenalty(penalty);
                                                setDetailModalOpen(true);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 mb-2 select-none">
                    <button
                        className={`px-3 py-1 rounded-lg font-semibold transition bg-gray-700 text-blue-100 hover:bg-blue-800 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            className={`px-3 py-1 rounded-lg font-bold transition border-2 ${currentPage === idx + 1
                                    ? "bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white border-blue-700 shadow-lg scale-105"
                                    : "bg-gray-800 text-blue-200 border-gray-700 hover:bg-blue-900 hover:text-white"
                                }`}
                            onClick={() => handlePageChange(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        className={`px-3 py-1 rounded-lg font-semibold transition bg-gray-700 text-blue-100 hover:bg-blue-800 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Modal Detail */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Penalty Detail"
                width="max-w-md"
            >
                {selectedPenalty && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
                        <div>
                            <span className="font-semibold">Member ID:</span>
                            <div className="ml-2 break-words font-mono">{selectedPenalty.id_member}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Member Name:</span>
                            <div className="ml-2 break-words">
                                {members.find(m => m.id === selectedPenalty.id_member)?.nama || "Undefined"}
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold">Book ID:</span>
                            <div className="ml-2 break-words font-mono">{selectedPenalty.id_buku}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Book Title:</span>
                            <div className="ml-2 break-words">
                                {books.find(b => b.id === selectedPenalty.id_buku)?.judul || "Undefined"}
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold">Amount:</span>
                            <div className="ml-2 break-words">{selectedPenalty.jumlah_denda}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Type:</span>
                            <div className="ml-2 break-words">{selectedPenalty.jenis_denda}</div>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-semibold">Date:</span>
                            <div className="ml-2 break-words">{formatDate(selectedPenalty.created_at)}</div>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-semibold">Description:</span>
                            <div className="ml-2 whitespace-pre-line break-words max-h-32 overflow-y-auto border border-blue-900 rounded p-2 bg-gray-900">
                                {selectedPenalty.deskripsi}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-700 text-blue-100 hover:bg-gray-600 transition"
                                onClick={() => setDetailModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
