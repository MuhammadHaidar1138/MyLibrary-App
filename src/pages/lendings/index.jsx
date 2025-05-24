import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constan";
import Modal from "../../components/Modal";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function LendingsIndex() {
    const [lendings, setLendings] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");
    const [accordionOpen, setAccordionOpen] = useState(false);

    // State form peminjaman
    const [formModal, setFormModal] = useState({
        id_buku: "",
        id_member: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
    });

    // State modal detail
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLending, setDetailLending] = useState(null);

    // State denda kerusakan atau terlambat
    const [returnedLendings, setReturnedLendings] = useState({});
    const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
    const [penaltyForm, setPenaltyForm] = useState({
        id_member: "",
        id_buku: "",
        jumlah_denda: "",
        jenis_denda: "kerusakan",
        deskripsi: "",
        lending_id: ""
    });

    const [chartAccordionOpen, setChartAccordionOpen] = useState(false);

    // State untuk mengsearch peminjaman
    const [search, setSearch] = useState("");
    const [filteredLendings, setFilteredLendings] = useState([]);

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    function fetchData() {
        axios.get(`${API_URL}peminjaman`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then((res) => {
                setLendings(res.data.data);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setLendings([]);
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to fetch lending data."
                );
            });

        // Fetch data buku untuk menampilkan data buku(judul)
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

        // Fetch data members untuk menampilkan data member(nama)
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
            })
    }

    function handleSubmitModal(e) {
        e.preventDefault();
        axios.post(`${API_URL}peminjaman`, { ...formModal, status: 0 }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setAlert({ message: "Lending successfully created.", type: "success" });
                setFormModal({ id_buku: "", id_member: "", tgl_pinjam: "", tgl_pengembalian: "" });
                fetchData();
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setAlert({ message: "Failed to create lending.", type: "error" });
                setTimeout(() => setAlert(""), 3000);
            })
    }

    function handlePenaltySubmit(e) {
        e.preventDefault();
        const today = new Date().toISOString().split("T")[0];

        setReturnedLendings(prev => ({
            ...prev,
            [penaltyForm.lending_id]: {
                returned: true,
                returnedAt: today,
                penaltyType: penaltyForm.jenis_denda
            }
        }));

        axios.post(`${API_URL}denda`,
            {
                id_member: penaltyForm.id_member,
                id_buku: penaltyForm.id_buku,
                jumlah_denda: penaltyForm.jumlah_denda,
                jenis_denda: penaltyForm.jenis_denda,
                deskripsi: penaltyForm.deskripsi
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    Accept: 'application/json'
                }
            }
        )
            .then(() => {
                setAlert({ message: "Penalty successfully added.", type: "success" });
            })
            .catch(err => {
                setAlert({
                    message:
                        err.response?.data?.message ||
                        err.response?.data?.error ||
                        "Failed to add penalty.",
                    type: "error"
                });
            });

        setPenaltyModalOpen(false);
        setPenaltyForm({
            id_member: "",
            id_buku: "",
            jumlah_denda: "",
            jenis_denda: "kerusakan",
            deskripsi: "",
            lending_id: ""
        });
    }

    // Chart per bulan
    const lendingPerMonth = {};
    lendings.forEach(lending => {
        const month = new Date(lending.tgl_pinjam).toLocaleString("default", { month: "short", year: "numeric" });
        lendingPerMonth[month] = (lendingPerMonth[month] || 0) + 1;
    });
    const chartLabels = Object.keys(lendingPerMonth);
    const chartData = Object.values(lendingPerMonth);

    const barData = {
        labels: chartLabels,
        datasets: [
            {
                label: "Total Lending",
                data: chartData,
                backgroundColor: "rgba(59, 130, 246, 0.7)",
                borderColor: "rgba(37, 99, 235, 1)",
                borderWidth: 2,
                borderRadius: 8,
                maxBarThickness: 32,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "#3b82f6",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: { color: "#334155" },
                ticks: { color: "#93c5fd", font: { weight: "bold" } },
            },
            y: {
                beginAtZero: true,
                grid: { color: "#334155" },
                ticks: { color: "#93c5fd", font: { weight: "bold" } },
            },
        },
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredLendings(lendings);
        } else {
            setFilteredLendings(
                lendings.filter(lending =>
                    lending.id_buku?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    lending.id_member?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    books.find(b => b.id === lending.id_buku)?.judul?.toLowerCase().includes(search.toLowerCase()) ||
                    members.find(m => m.id === lending.id_member)?.nama?.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
    }, [search, lendings, books, members]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLendings = filteredLendings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLendings.length / itemsPerPage);

    // Export data ke Excel
    function exportExcel() {
        const formatedData = filteredLendings.map((lending, index) => ({
            "No": index + 1,
            "Book ID": lending.id_buku,
            "Book Title": books.find(b => b.id === lending.id_buku)?.judul || "",
            "Member ID": lending.id_member,
            "Member Name": members.find(m => m.id === lending.id_member)?.nama || "",
            "Loan Date": lending.tgl_pinjam,
            "Return Date": lending.tgl_pengembalian,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formatedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lendings");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        saveAs(file, "lendings_data.xlsx");
    }

    // Export riwayat peminjaman member ke PDF
    function exportMemberHistoryPDF() {
        if (!detailLending) return;
        const member = members.find(m => m.id === detailLending.id_member);
        const history = lendings.filter(l => l.id_member === detailLending.id_member);

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Borrowing History", 14, 16);
        doc.setFontSize(12);
        doc.text(`Member: ${member?.nama || detailLending.id_member}`, 14, 26);

        doc.autoTable({
            startY: 32,
            head: [["Book Title", "Loan Date", "Return Date"]],
            body: history.map(l => [
                books.find(b => b.id === l.id_buku)?.judul || l.id_buku,
                l.tgl_pinjam,
                l.tgl_pengembalian
            ]),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [37, 99, 235] },
        });

        doc.save(`borrowing_history_${member?.nama || detailLending.id_member}.pdf`);
    }

    return (
        <>
            {/* Bagian alert/error */}
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg mb-4 shadow-lg">
                    {error}
                </div>
            )}
            {alert && alert.message && (
                <div
                    className={`
                        flex items-center gap-3 mb-4 px-5 py-3 rounded-xl shadow-2xl border-l-8
                        ${alert.type === "success"
                            ? "border-blue-900 bg-gradient-to-r from-blue-900 via-blue-800 to-gray-900 text-blue-100"
                            : "border-red-600 bg-gradient-to-r from-red-900 via-red-800 to-gray-900 text-red-100"}
                        animate-fade-in
                    `}
                    style={{ transition: "all 0.3s" }}
                >
                    <span>
                        {alert.type === "success" ? (
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </span>
                    <span className="flex-1">{alert.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
                {/* Form tambah peminjaman */}
                <div className="w-full max-w-md bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 border border-blue-900 rounded-2xl shadow-2xl p-6 flex flex-col h-fit">
                    <h2 className="text-xl font-bold text-blue-100 mb-4 flex items-center gap-2">
                        <svg className="h-7 w-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="#2563eb" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h8M8 8h8" stroke="#fff" />
                        </svg>
                        Create New Lending
                    </h2>
                    <form onSubmit={handleSubmitModal} className="flex-1 flex flex-col justify-between">
                        <div className="mb-4">
                            <label className="block text-blue-100 text-sm font-semibold mb-2" htmlFor="member">
                                Member Name
                            </label>
                            <select
                                id="member"
                                name="member"
                                value={formModal.id_member}
                                onChange={(e) => setFormModal({ ...formModal, id_member: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                required
                            >
                                <option value="">Select a member</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-blue-100 text-sm font-semibold mb-2" htmlFor="book">
                                Book Title
                            </label>
                            <select
                                id="book"
                                name="book"
                                value={formModal.id_buku}
                                onChange={(e) => setFormModal({ ...formModal, id_buku: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                required
                            >
                                <option value="">Select a book</option>
                                {books.map(book => (
                                    <option key={book.id} value={book.id}>
                                        {book.judul}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-blue-100 text-sm font-semibold mb-2" htmlFor="loanDate">
                                Loan Date
                            </label>
                            <input
                                type="date"
                                id="loanDate"
                                name="loanDate"
                                value={formModal.tgl_pinjam}
                                onChange={(e) => setFormModal({ ...formModal, tgl_pinjam: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-blue-100 text-sm font-semibold mb-2" htmlFor="returnDate">
                                Return Date
                            </label>
                            <input
                                type="date"
                                id="returnDate"
                                name="returnDate"
                                value={formModal.tgl_pengembalian}
                                onChange={(e) => setFormModal({ ...formModal, tgl_pengembalian: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition duration-200"
                        >
                            Create Lending
                        </button>
                    </form>
                </div>

                {/* Card aturan peminjaman */}
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-gray-700 rounded-2xl shadow-2xl p-4 flex flex-col h-fit">
                        <h3 className="text-lg font-bold text-blue-300 mb-3 text-center">Lending Rules</h3>
                        <ul className="list-disc list-inside text-blue-100 text-sm space-y-3">
                            <li>There is no maximum limit for the number of days a book can be borrowed.</li>
                            <li>If the book is returned late, the borrower will be fined according to library regulations.</li>
                            <li>Damaged or lost books must be replaced at the book's price.</li>
                            <li>Each member can borrow a maximum of 3 books at a time.</li>
                        </ul>
                    </div>
                    {/* Bagian chart peminjaman per bulan */}
                    <div className="w-full">
                        <button
                            className="w-full flex justify-between items-center px-3 py-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-blue-200 font-semibold text-sm rounded-xl focus:outline-none shadow"
                            onClick={() => setChartAccordionOpen(!chartAccordionOpen)}
                        >
                            <span>Lending Chart (Monthly)</span>
                            <svg
                                className={`w-4 h-9 transform transition-transform duration-200 ${chartAccordionOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {chartAccordionOpen && (
                            <div className="bg-gray-900 border border-gray-700 rounded-b-2xl p-2 mt-1 shadow-inner">
                                <Bar data={barData} options={barOptions} height={120} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto my-8">
                <div className="flex items-center">
                    <div className="flex-1 border-t-2 border-blue-900" />
                    <span className="mx-4 text-blue-400 font-bold tracking-widest text-lg select-none">LENDING DATA</span>
                    <div className="flex-1 border-t-2 border-blue-900" />
                </div>
            </div>

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

            {/* Bagian search & tabel */}
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-blue-900 rounded-2xl shadow-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by member, book, or ID..."
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
                        <span className="text-blue-300 text-sm">{filteredLendings.length} result(s)</span>
                    </div>
                </div>

                <div className="rounded-xl shadow-xl bg-gray-800 border border-gray-700 mt-2 overflow-hidden">
                    <button
                        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-blue-200 font-bold text-lg focus:outline-none"
                        onClick={() => setAccordionOpen(!accordionOpen)}
                    >
                        <span>Lending List</span>
                        <svg
                            className={`w-5 h-5 transform transition-transform duration-200 ${accordionOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {accordionOpen && (
                        <div>
                            {/* Bagian pagination */}
                            <div className="flex items-center justify-between px-6 py-2 bg-gray-900 border-b border-gray-700">
                                <div className="flex gap-1">
                                    <button
                                        className={`px-3 py-1 rounded-lg font-semibold transition bg-gray-700 text-blue-100 hover:bg-blue-800 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                            onClick={() => setCurrentPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                    <button
                                        className={`px-3 py-1 rounded-lg font-semibold transition bg-gray-700 text-blue-100 hover:bg-blue-800 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                    >
                                        Next
                                        <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-fixed divide-y divide-gray-700">
                                    <thead className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
                                        <tr>
                                            <th className="w-12 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">No</span>
                                            </th>
                                            <th className="w-1/3 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">Book ID</span>
                                            </th>
                                            <th className="w-1/3 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">Member ID</span>
                                            </th>
                                            <th className="w-1/6 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">Loan Date</span>
                                            </th>
                                            <th className="w-36 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">Return Date</span>
                                            </th>
                                            <th className="w-36 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">Status</span>
                                            </th>
                                            <th className="w-36 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                                <span className="bg-blue-700 px-2 py-1 rounded-full">Action</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentLendings.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-8 text-gray-400">
                                                    No lendings found.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentLendings.map((lending, index) => {
                                                const returnedInfo = returnedLendings?.[lending.id];
                                                let statusLabel = "Borrowed";
                                                let statusClass = "bg-blue-700 text-blue-100";

                                                if (returnedInfo?.returned) {
                                                    if (returnedInfo.penaltyType === "terlambat") {
                                                        statusLabel = "Late";
                                                        statusClass = "bg-red-700 text-red-100";
                                                    } else {
                                                        statusLabel = "Returned";
                                                        statusClass = "bg-green-700 text-green-100";
                                                    }
                                                }

                                                const isOverdue = new Date(lending.tgl_pengembalian) < new Date() && !returnedInfo?.returned;
                                                const daysLeft = Math.ceil((new Date(lending.tgl_pengembalian) - new Date()) / (1000 * 60 * 60 * 24));

                                                return (
                                                    <tr key={lending.id} className="hover:bg-blue-900/30 transition duration-200 border-b border-gray-700">
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 font-semibold text-center">
                                                            {indexOfFirstItem + index + 1}
                                                        </td>
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">
                                                            {lending.id_buku} - {books.find(book => book.id === lending.id_buku)?.judul || "Undefined"}
                                                        </td>
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">
                                                            {lending.id_member} - {members.find(member => member.id === lending.id_member)?.nama || "Undefined"}
                                                        </td>
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{lending.tgl_pinjam}</td>
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{lending.tgl_pengembalian}</td>
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">
                                                            <span
                                                                className={`px-2 py-1 rounded-full font-semibold ${statusClass}`}
                                                                style={{ cursor: "not-allowed", opacity: 0.7 }}
                                                                title="Status cannot be clicked"
                                                            >
                                                                {statusLabel}
                                                            </span>
                                                            {!returnedInfo?.returned && (
                                                                <>
                                                                    {daysLeft > 0 && (
                                                                        <div className="text-xs text-gray-400 mt-1">Time left: {daysLeft} days</div>
                                                                    )}
                                                                    {daysLeft === 0 && (
                                                                        <div className="text-xs text-yellow-400 mt-1">Today is the last return day</div>
                                                                    )}
                                                                    {isOverdue && daysLeft !== 0 && (
                                                                        <div className="text-xs text-red-400 mt-1">Late: {Math.abs(daysLeft)} days</div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">
                                                            <div className="flex flex-row justify-center items-center gap-1 flex-wrap">
                                                                <button
                                                                    className="flex items-center gap-1 bg-blue-700 hover:bg-blue-900 text-blue-100 px-2 py-1 rounded text-xs min-w-[60px]"
                                                                    style={{ fontSize: '11px' }}
                                                                    title="Detail"
                                                                    onClick={() => {
                                                                        setDetailLending(lending);
                                                                        setDetailModalOpen(true);
                                                                    }}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    Detail
                                                                </button>
                                                                {!returnedInfo?.returned && (
                                                                    <button
                                                                        className="flex items-center gap-1 bg-green-700 hover:bg-green-900 text-green-100 px-2 py-1 rounded text-xs min-w-[60px]"
                                                                        style={{ fontSize: '11px' }}
                                                                        title="Return"
                                                                        onClick={() => {
                                                                            const today = new Date().toISOString().split("T")[0];
                                                                            const isLate = today > lending.tgl_pengembalian;
                                                                            setPenaltyForm({
                                                                                id_member: lending.id_member,
                                                                                id_buku: lending.id_buku,
                                                                                jumlah_denda: "",
                                                                                jenis_denda: isLate ? "terlambat" : "kerusakan",
                                                                                deskripsi: "",
                                                                                lending_id: lending.id
                                                                            });
                                                                            setPenaltyModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h7V3m0 0l11 11-4 4-7-7z" />
                                                                        </svg>
                                                                        Return
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal detail */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Lending Detail"
                width="max-w-md"
            >
                {detailLending && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
                        <div>
                            <span className="font-semibold">Member ID:</span>
                            <div className="ml-2 break-words font-mono">{detailLending.id_member}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Member Name:</span>
                            <div className="ml-2 break-words">
                                {members.find(m => m.id === detailLending.id_member)?.nama || "Undefined"}
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold">Book ID:</span>
                            <div className="ml-2 break-words font-mono">{detailLending.id_buku}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Book Title:</span>
                            <div className="ml-2 break-words">
                                {books.find(b => b.id === detailLending.id_buku)?.judul || "Undefined"}
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold">Loan Date:</span>
                            <div className="ml-2 break-words">{detailLending.tgl_pinjam}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Return Date:</span>
                            <div className="ml-2 break-words">{detailLending.tgl_pengembalian}</div>
                        </div>

                        {/* Riwayat peminjaman member */}
                        <div className="md:col-span-2 mt-4">
                            <span className="font-semibold block mb-2">Borrowing History:</span>
                            <button
                                onClick={exportMemberHistoryPDF}
                                className="mb-2 px-3 py-1 rounded bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white font-semibold text-xs shadow hover:from-red-800 hover:to-red-950 transition"
                            >
                                Export PDF
                            </button>
                            <div className="max-h-40 overflow-y-auto border border-blue-900 rounded-lg bg-gray-900 p-2">
                                <table className="min-w-full text-xs text-blue-100">
                                    <thead>
                                        <tr>
                                            <th className="text-left py-1 px-2">Book Title</th>
                                            <th className="text-left py-1 px-2">Loan Date</th>
                                            <th className="text-left py-1 px-2">Return Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lendings
                                            .filter(l => l.id_member === detailLending.id_member)
                                            .map((l, idx) => (
                                                <tr key={l.id} className={l.id === detailLending.id ? "bg-blue-900/30" : ""}>
                                                    <td className="py-1 px-2">
                                                        {books.find(b => b.id === l.id_buku)?.judul || l.id_buku}
                                                    </td>
                                                    <td className="py-1 px-2">{l.tgl_pinjam}</td>
                                                    <td className="py-1 px-2">{l.tgl_pengembalian}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {lendings.filter(l => l.id_member === detailLending.id_member).length === 0 && (
                                    <div className="text-gray-400 py-2 text-center">No history found.</div>
                                )}
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

            {/* Modal denda */}
            <Modal
                isOpen={penaltyModalOpen}
                onClose={() => setPenaltyModalOpen(false)}
                title="Add Penalty"
                width="max-w-md"
            >
                <form onSubmit={handlePenaltySubmit} className="space-y-4 text-blue-100">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Member ID</label>
                        <input
                            type="text"
                            value={penaltyForm.id_member}
                            disabled
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Book ID</label>
                        <input
                            type="text"
                            value={penaltyForm.id_buku}
                            disabled
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Penalty Amount</label>
                        <input
                            type="number"
                            value={penaltyForm.jumlah_denda}
                            onChange={e => setPenaltyForm({ ...penaltyForm, jumlah_denda: e.target.value })}
                            required
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Penalty Type</label>
                        {penaltyForm.jenis_denda === "terlambat" ? (
                            <input
                                type="text"
                                value="Late"
                                disabled
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-blue-100"
                            />
                        ) : (
                            <select
                                value={penaltyForm.jenis_denda}
                                onChange={e => setPenaltyForm({ ...penaltyForm, jenis_denda: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100"
                                required
                            >
                                <option value="kerusakan">Damage</option>
                                <option value="lainnya">Other</option>
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Description</label>
                        <textarea
                            value={penaltyForm.deskripsi}
                            onChange={e => setPenaltyForm({ ...penaltyForm, deskripsi: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-blue-100"
                            required
                        />
                    </div>
                    <div className="flex justify-between pt-2 gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 transition"
                            onClick={() => {
                                const today = new Date().toISOString().split("T")[0];
                                setReturnedLendings(prev => ({
                                    ...prev,
                                    [penaltyForm.lending_id]: {
                                        returned: true,
                                        returnedAt: today,
                                        penaltyType: "returned"
                                    }
                                }));
                                setPenaltyModalOpen(false);
                                setPenaltyForm({
                                    id_member: "",
                                    id_buku: "",
                                    jumlah_denda: "",
                                    jenis_denda: "kerusakan",
                                    deskripsi: "",
                                    lending_id: ""
                                });
                            }}
                        >
                            Return
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-700 text-blue-100 hover:bg-gray-600 transition"
                                onClick={() => setPenaltyModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-red-900 text-white hover:bg-red-950 transition"
                            >
                                Add Penalty
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    )
}