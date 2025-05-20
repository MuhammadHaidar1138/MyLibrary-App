import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constan";
import Modal from "../../components/Modal";

export default function LendingsIndex() {
    const [lendings, setLendings] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");
    const [accordionOpen, setAccordionOpen] = useState(false);

    const [formModal, setFormModal] = useState({
        id_buku: "",
        id_member: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
    });

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLending, setDetailLending] = useState(null);

    // Tambahkan state untuk loading tombol return
    const [returnLoadingId, setReturnLoadingId] = useState(null);

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
                    "Failed to fetch Lendings Data."
                );
            });

        // Memanggil endpoint buku untuk mengambil data buku
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
                    "Failed to fetch Books."
                );
            });

        // Memanggil endpoint member untuk mengambil data member
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
                    "Failed to fetch Members."
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
            setAlert({ message: "Successfully added book", type: "success" });
            setFormModal({ id_buku: "", id_member: "", tgl_pinjam: "", tgl_pengembalian: "" });
            fetchData();
        })
        .catch(err => {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
            setModalError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to add lendings."
            );
            setAlert({ message: "Failed to add lendings", type: "error" });
            setTimeout(() => setAlert(""), 3000);
        })
    }

    // Fungsi handleReturn
    function handleReturn(lending) {
        setReturnLoadingId(lending.id);
        const today = new Date().toISOString().split("T")[0];
        if (Number(lending.status) === 1) return;

        // Jika hari ini > tgl_pengembalian maka terlambat, jika <= maka dikembalikan
        const isLate = today > lending.tgl_pengembalian;
        const status = isLate ? 2 : 1;

        axios.put(`${API_URL}peminjaman/pengembalian/${lending.id}`, {
            ...lending,
            status,
            tgl_pengembalian: today
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
        .then(() => {
            setAlert({ message: "Book returned successfully", type: "success" });
            fetchData();
        })
        .catch(() => {
            setAlert({ message: "Failed to return book", type: "error" });
            setTimeout(() => setAlert(""), 3000);
        })
        .finally(() => setReturnLoadingId(null));
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
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

            {/* Form */}
            <div className="flex mb-6 items-stretch">
                {/* Card Form Lebih Lebar */}
                <div className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 mr-8 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-blue-200 mb-4">Create New Lending</h2>
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
                <div className="max-w-xs w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col h-full justify-center">
                    <h3 className="text-lg font-bold text-blue-300 mb-3 text-center">Lending Rules</h3>
                    <ul className="list-disc list-inside text-blue-100 text-sm space-y-3">
                        <li>
                            There is no maximum limit for the number of days a book can be borrowed.
                        </li>
                        <li>
                            If the book is returned late, the borrower will be fined according to library regulations.
                        </li>
                        <li>
                            Damaged or lost books must be replaced at the book's price.
                        </li>
                        <li>
                            Each member can borrow a maximum of 3 books at a time.
                        </li>
                    </ul>
                </div>
            </div>

            {/* Accordion */}
            <div className="rounded-xl shadow-2xl bg-gray-800 border border-gray-700 mt-2 overflow-hidden">
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
                                {lendings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400">
                                            No lendings found.
                                        </td>
                                    </tr>
                                ) : (
                                    lendings.map((lending, index) => {
                                        // Status logic
                                        let statusLabel = "-";
                                        let statusClass = "bg-gray-700 text-gray-100";
                                        if (Number(lending.status) === 1) {
                                            statusLabel = "Dikembalikan";
                                            statusClass = "bg-green-700 text-green-100";
                                        } else if (Number(lending.status) === 0) {
                                            statusLabel = "Dipinjam";
                                            statusClass = "bg-blue-700 text-blue-100";
                                        } else if (Number(lending.status) === 2) {
                                            statusLabel = "Terlambat";
                                            statusClass = "bg-red-700 text-red-100";
                                        }

                                        // Per-row overdue & daysLeft
                                        const isOverdue = new Date(lending.tgl_pengembalian) < new Date() && Number(lending.status) !== 1;
                                        const daysLeft = Math.ceil((new Date(lending.tgl_pengembalian) - new Date()) / (1000 * 60 * 60 * 24));

                                        return (
                                            <tr
                                                key={lending.id}
                                                className="hover:bg-blue-900/30 transition duration-200 border-b border-gray-700"
                                            >
                                                <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 font-semibold text-center">
                                                    {index + 1}
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
                                                    <span className={`px-2 py-1 rounded-full font-semibold ${statusClass}`}>{statusLabel}</span>
                                                    {Number(lending.status) === 0 && (
                                                        <>
                                                            {!isOverdue && (
                                                                <div className="text-xs text-gray-400 mt-1">Sisa waktu: {daysLeft} hari</div>
                                                            )}
                                                            {isOverdue && (
                                                                <div className="text-xs text-red-400 mt-1">Terlambat: {Math.abs(daysLeft)} hari</div>
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
                                                        {Number(lending.status) !== 1 && (
                                                            <button
                                                                className={`flex items-center gap-1 bg-green-700 hover:bg-green-800 text-green-100 px-2 py-1 rounded text-xs min-w-[60px] ${returnLoadingId === lending.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                style={{ fontSize: '11px' }}
                                                                title="Return"
                                                                onClick={() => handleReturn(lending)}
                                                                disabled={returnLoadingId === lending.id}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h7V3m0 0l11 11-4 4-7-7m0 0v7" />
                                                                </svg>
                                                                {returnLoadingId === lending.id ? "Processing..." : "Return"}
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
                )}
            </div>

            {/* Modal Detail */}
            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                title="Lending Detail"
                width="max-w-md"
            >
                {detailLending && (
                    <div className="space-y-4 text-blue-100 text-base">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">Member ID</span>
                            <span className="bg-blue-700 px-3 py-1 rounded-full font-mono">{detailLending.id_member}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">Member Name</span>
                            <span className="bg-blue-700 px-3 py-1 rounded-full">
                                {members.find(m => m.id === detailLending.id_member)?.nama || "Undefined"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">Book ID</span>
                            <span className="bg-blue-700 px-3 py-1 rounded-full font-mono">{detailLending.id_buku}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">Book Title</span>
                            <span className="bg-blue-700 px-3 py-1 rounded-full">
                                {books.find(b => b.id === detailLending.id_buku)?.judul || "Undefined"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">Loan Date</span>
                            <span className="bg-blue-700 px-3 py-1 rounded-full">{detailLending.tgl_pinjam}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">Return Date</span>
                            <span className="bg-blue-700 px-3 py-1 rounded-full">{detailLending.tgl_pengembalian}</span>
                        </div>
                        <div className="flex justify-end pt-4">
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
        </>
    )
}