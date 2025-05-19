import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constan";
import Modal from "../../components/Modal";

export default function BooksIndex() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [modalError, setModalError] = useState("");
    const [formModal, setFormModal] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [detailBook, setDetailBook] = useState(null);
    const [search, setSearch] = useState(""); // Tambahkan state untuk search

    const navigate = useNavigate();

    function fetchData() {
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
    }

    function handleSubmitModal(e) {
        e.preventDefault();
        axios.post(API_URL + "buku", formModal, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setIsAddModalOpen(false);
                setModalError("");
                setAlert({ message: "Successfully added book", type: "success" });
                setFormModal({ no_rak: "", judul: "", pengarang: "", tahun_terbit: "", penerbit: "", stok: "", detail: "" });
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
                    "Failed to add book."
                );
                setAlert({ message: "Failed to add book", type: "error" });
                setTimeout(() => setAlert(""), 3000);
            });
    }

    function handleEditModal(e) {
        e.preventDefault();
        axios.put(`${API_URL}buku/${editId}`, formModal, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setIsEditModalOpen(false);
                setModalError("");
                setAlert({ message: "Successfully updated book", type: "success" });
                setFormModal({ no_rak: "", judul: "", pengarang: "", tahun_terbit: "", penerbit: "", stok: "", detail: "" });
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
                    "Failed to update book."
                );
                setAlert({ message: "Failed to update book", type: "error" });
                setTimeout(() => setAlert(""), 3000);
            });
    }

    function handleDeleteBook(e) {
        e.preventDefault();
        axios.delete(`${API_URL}buku/${deleteId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setIsDeleteModalOpen(false);
                setAlert({ message: "Successfully deleted book", type: "success" });
                fetchData();
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setAlert({ message: "Failed to delete book", type: "error" });
                setTimeout(() => setAlert(""), 3000);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const totalStock = books.reduce((sum, book) => sum + (parseInt(book.stok) || 0), 0);

    // Filter books berdasarkan search
    const filteredBooks = books.filter(
        (book) =>
            book.judul?.toLowerCase().includes(search.toLowerCase()) ||
            book.pengarang?.toLowerCase().includes(search.toLowerCase()) ||
            book.no_rak?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
            <h1 className="text-3xl font-bold text-white mb-6">Books List</h1>
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

            {/* Cards */}
            <div className="flex flex-1 gap-4 mb-6">
                <div className="flex-1 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 rounded-xl p-4 shadow-lg text-center h-[96px] md:h-[128px] flex flex-col justify-center">
                    <div className="text-blue-200 text-sm font-semibold mb-1">Total Books</div>
                    <div className="text-3xl font-bold text-white">{books.length}</div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-sky-700 via-blue-800 to-blue-900 rounded-xl p-4 shadow-lg text-center h-[96px] md:h-[128px] flex flex-col justify-center">
                    <div className="text-blue-200 text-sm font-semibold mb-1">Total Stock</div>
                    <div className="text-3xl font-bold text-white">{totalStock}</div>
                </div>
            </div>

            {/* Search & Add Book buttons on the right */}
            <div className="flex justify-end items-center mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Search..."
                    className="px-2 py-1 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm"
                    style={{ width: "140px" }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white px-2 py-1 text-xs rounded shadow font-semibold"
                    style={{ height: "32px" }}
                    onClick={() => {
                        setFormModal({ no_rak: "", judul: "", pengarang: "", tahun_terbit: "", penerbit: "", stok: "", detail: "" });
                        setModalError("");
                        setIsAddModalOpen(true);
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Book
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl shadow-2xl bg-gray-800 border border-gray-700 mt-2">
                <table className="min-w-full table-fixed divide-y divide-gray-700">
                    <thead className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
                        <tr>
                            <th className="w-12 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">No</span>
                            </th>
                            <th className="w-1/3 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Title</span>
                            </th>
                            <th className="w-1/3 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Author</span>
                            </th>
                            <th className="w-1/6 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Stock</span>
                            </th>
                            <th className="w-36 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Action</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">
                                    No books found.
                                </td>
                            </tr>
                        ) : (
                            filteredBooks.map((book, index) => (
                                <tr
                                    key={book.id}
                                    className="hover:bg-blue-900/30 transition duration-200 border-b border-gray-700"
                                >
                                    <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 font-semibold text-center">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{book.judul}</td>
                                    <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{book.pengarang}</td>
                                    <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{book.stok}</td>
                                    <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 flex justify-center gap-1 text-center">
                                        <button
                                            className="flex items-center gap-1 bg-blue-700 hover:bg-blue-900 text-blue-100 px-2 py-1 rounded text-xs"
                                            title="Detail"
                                            onClick={() => {
                                                setDetailBook(book);
                                                setIsDetailModalOpen(true);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-800 text-blue-100 px-2 py-1 rounded text-xs"
                                            title="Edit"
                                            onClick={() => {
                                                setEditId(book.id);
                                                setFormModal({
                                                    no_rak: book.no_rak,
                                                    judul: book.judul,
                                                    pengarang: book.pengarang,
                                                    tahun_terbit: book.tahun_terbit,
                                                    penerbit: book.penerbit,
                                                    stok: book.stok,
                                                    detail: book.detail,
                                                });
                                                setModalError("");
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="flex items-center gap-1 bg-gray-700 hover:bg-red-800 text-blue-100 px-2 py-1 rounded text-xs"
                                            title="Delete"
                                            onClick={() => {
                                                setDeleteId(book.id);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 00-2-2h-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Add */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Book" width="max-w-lg">
                <form onSubmit={handleSubmitModal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="no_rak">Rack Number</label>
                        <input
                            id="no_rak"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.no_rak}
                            onChange={e => setFormModal({ ...formModal, no_rak: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="judul">Title</label>
                        <input
                            id="judul"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.judul}
                            onChange={e => setFormModal({ ...formModal, judul: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="pengarang">Author</label>
                        <input
                            id="pengarang"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.pengarang}
                            onChange={e => setFormModal({ ...formModal, pengarang: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="tahun_terbit">Year</label>
                        <input
                            id="tahun_terbit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.tahun_terbit}
                            onChange={e => setFormModal({ ...formModal, tahun_terbit: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="penerbit">Publisher</label>
                        <input
                            id="penerbit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.penerbit}
                            onChange={e => setFormModal({ ...formModal, penerbit: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="stok">Stock</label>
                        <input
                            id="stok"
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.stok}
                            onChange={e => setFormModal({ ...formModal, stok: e.target.value })}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="detail">Detail</label>
                        <input
                            id="detail"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.detail}
                            onChange={e => setFormModal({ ...formModal, detail: e.target.value })}
                            required
                        />
                    </div>
                    {modalError && (
                        <div className="md:col-span-2 text-red-400 text-sm">{modalError}</div>
                    )}
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-700 text-blue-100 hover:bg-gray-600 transition"
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white font-semibold hover:from-blue-800 hover:to-blue-950 transition"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Book" width="max-w-lg">
                <form onSubmit={handleEditModal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="no_rak_edit">Rack Number</label>
                        <input
                            id="no_rak_edit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.no_rak}
                            onChange={e => setFormModal({ ...formModal, no_rak: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="judul_edit">Title</label>
                        <input
                            id="judul_edit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.judul}
                            onChange={e => setFormModal({ ...formModal, judul: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="pengarang_edit">Author</label>
                        <input
                            id="pengarang_edit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.pengarang}
                            onChange={e => setFormModal({ ...formModal, pengarang: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="tahun_terbit_edit">Year</label>
                        <input
                            id="tahun_terbit_edit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.tahun_terbit}
                            onChange={e => setFormModal({ ...formModal, tahun_terbit: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="penerbit_edit">Publisher</label>
                        <input
                            id="penerbit_edit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.penerbit}
                            onChange={e => setFormModal({ ...formModal, penerbit: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="stok_edit">Stock</label>
                        <input
                            id="stok_edit"
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.stok}
                            onChange={e => setFormModal({ ...formModal, stok: e.target.value })}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-blue-200 text-sm mb-1" htmlFor="detail_edit">Detail</label>
                        <input
                            id="detail_edit"
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            value={formModal.detail}
                            onChange={e => setFormModal({ ...formModal, detail: e.target.value })}
                            required
                        />
                    </div>
                    {modalError && (
                        <div className="md:col-span-2 text-red-400 text-sm">{modalError}</div>
                    )}
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-700 text-blue-100 hover:bg-gray-600 transition"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white font-semibold hover:from-blue-800 hover:to-blue-950 transition"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Delete */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Book" width="max-w-md">
                <form onSubmit={handleDeleteBook} className="space-y-4">
                    <div className="text-blue-100 text-center text-lg">
                        Are you sure you want to delete this book?
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-700 text-blue-100 hover:bg-gray-600 transition"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white font-semibold hover:from-red-800 hover:to-red-950 transition"
                        >
                            Delete
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Book Detail" width="max-w-md">
                {detailBook && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
                        <div>
                            <span className="font-semibold">Rack Number:</span>
                            <div className="ml-2 break-words">{detailBook.no_rak}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Title:</span>
                            <div className="ml-2 break-words">{detailBook.judul}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Author:</span>
                            <div className="ml-2 break-words">{detailBook.pengarang}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Year:</span>
                            <div className="ml-2 break-words">{detailBook.tahun_terbit}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Publisher:</span>
                            <div className="ml-2 break-words">{detailBook.penerbit}</div>
                        </div>
                        <div>
                            <span className="font-semibold">Stock:</span>
                            <div className="ml-2 break-words">{detailBook.stok}</div>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-semibold">Detail:</span>
                            <div className="ml-2 whitespace-pre-line break-words max-h-60 overflow-y-auto border border-blue-900 rounded p-2 bg-gray-900">
                                {detailBook.detail}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-700 text-blue-100 hover:bg-gray-600 transition"
                                onClick={() => setIsDetailModalOpen(false)}
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