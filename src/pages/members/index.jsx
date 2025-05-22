import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constan";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";

export default function MembersIndex() {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState("");
    const [alert, setAlert] = useState("");
    const [search, setSearch] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [modalError, setModalError] = useState("");
    const [formModal, setFormModal] = useState({
        no_ktp: "",
        nama: "",
        alamat: "",
        tgl_lahir: "",
    });
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [detailMember, setDetailMember] = useState(null);

    const navigate = useNavigate();

    function fetchData() {
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

    function handleSubmitModal(e) {
        e.preventDefault();
        axios.post(API_URL + "member", formModal, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setIsAddModalOpen(false);
                setModalError("");
                setAlert({ message: "Successfully added member", type: "success" });
                setFormModal({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
                fetchData();
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                setModalError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to add member."
                );
                setAlert({ message: "Failed to add member", type: "error" });
                setTimeout(() => {
                    setAlert("");
                }, 3000);
            });
    }

    function handleEditModal(e) {
        e.preventDefault();
        axios.put(`${API_URL}member/${editId}`, formModal, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setIsEditModalOpen(false);
                setModalError("");
                setAlert({ message: "Successfully updated member", type: "success" });
                setEditId(null);
                setFormModal({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
                fetchData();
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                setModalError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to update member."
                );
                setAlert({ message: "Failed to update member", type: "error" });
                setTimeout(() => {
                    setAlert("");
                }, 3000);
            });
    }

    function handleDeleteMember(e) {
        e.preventDefault();
        axios.delete(`${API_URL}member/${deleteId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json'
            }
        })
            .then(() => {
                setIsDeleteModalOpen(false);
                setAlert({ message: "Successfully deleted member", type: "success" });
                setDeleteId(null);
                fetchData();
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }
                setAlert({ message: "Failed to delete member", type: "error" });
                setTimeout(() => setAlert(""), 3000);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    const filteredMembers = members.filter(
        m =>
            m.no_ktp.toLowerCase().includes(search.toLowerCase()) ||
            m.nama.toLowerCase().includes(search.toLowerCase()) ||
            m.alamat.toLowerCase().includes(search.toLowerCase()) ||
            m.tgl_lahir.toLowerCase().includes(search.toLowerCase())
    );

    // Count members who joined today
    const today = new Date();
    const todayMembers = members.filter(m => {
        if (!m.created_at) return false;
        const created = new Date(m.created_at);
        return (
            created.getDate() === today.getDate() &&
            created.getMonth() === today.getMonth() &&
            created.getFullYear() === today.getFullYear()
        );
    }).length;

    // Tambahkan state dan logic pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-500 text-white p-3 rounded-lg mb-4 shadow-lg">
                        {error}
                    </div>
                )}

                {/* Success/Error Alert */}
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
                            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-100 tracking-tight mb-1">Members Directory</h1>
                            <p className="text-blue-200 text-sm md:text-base">A clean and premium list of all registered members.</p>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div className="flex flex-1 gap-4 mb-6 max-w-5xl mx-auto">
                    <div className="flex-1 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 rounded-xl p-4 shadow-lg text-center h-[96px] md:h-[128px] flex flex-col justify-center">
                        <div className="text-blue-200 text-sm font-semibold mb-1">Total Members</div>
                        <div className="text-3xl font-bold text-white">{members.length}</div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-sky-700 via-blue-800 to-blue-900 rounded-xl p-4 shadow-lg text-center h-[96px] md:h-[128px] flex flex-col justify-center">
                        <div className="text-blue-200 text-sm font-semibold mb-1">Today's Members</div>
                        <div className="text-3xl font-bold text-white">{todayMembers}</div>
                    </div>
                </div>

                {/* Divider */}
                <div className="max-w-5xl mx-auto my-8">
                    <div className="flex items-center">
                        <div className="flex-1 border-t-2 border-blue-900" />
                        <span className="mx-4 text-blue-400 font-bold tracking-widest text-lg select-none">MEMBER DATA</span>
                        <div className="flex-1 border-t-2 border-blue-900" />
                    </div>
                </div>

                {/* Search & Add */}
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search member..."
                                className="pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-900 text-blue-100 border border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 w-full md:w-64 transition"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <span className="absolute left-3 top-2.5 text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                                </svg>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="px-4 py-2 rounded-lg bg-gray-700 text-blue-100 hover:bg-gray-600 transition font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                    <button
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white px-4 py-2 text-sm rounded shadow font-semibold"
                        onClick={() => {
                            setFormModal({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
                            setModalError("");
                            setIsAddModalOpen(true);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                    </button>
                </div>

                {/* Table Card */}
                <div className="max-w-5xl mx-auto rounded-2xl shadow-2xl bg-gray-800 border border-gray-700 mt-2 overflow-x-auto">
                    <table className="min-w-full table-fixed divide-y divide-gray-700">
                        <thead className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
                            <tr>
                                <th className="w-10 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                    <span className="bg-blue-700 px-2 py-1 rounded-full">No</span>
                                </th>
                                <th className="w-32 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                    <span className="bg-blue-700 px-2 py-1 rounded-full">ID Number</span>
                                </th>
                                <th className="w-32 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                    <span className="bg-blue-700 px-2 py-1 rounded-full">Name</span>
                                </th>
                                <th className="w-40 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                    <span className="bg-blue-700 px-2 py-1 rounded-full">Address</span>
                                </th>
                                <th className="w-32 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                    <span className="bg-blue-700 px-2 py-1 rounded-full">Date of Birth</span>
                                </th>
                                <th className="w-28 px-2 py-3 text-xs font-bold text-blue-200 uppercase tracking-wider text-center whitespace-nowrap">
                                    <span className="bg-blue-700 px-2 py-1 rounded-full">Action</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400">
                                        Member not found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedMembers.map((member, index) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-blue-900/30 transition duration-200 border-b border-gray-700"
                                    >
                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 font-semibold text-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{member.no_ktp}</td>
                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{member.nama}</td>
                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{member.alamat}</td>
                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 text-center">{member.tgl_lahir}</td>
                                        <td className="px-2 py-3 whitespace-nowrap text-xs text-blue-100 flex justify-center gap-1 text-center">
                                            <button
                                                className="flex items-center gap-1 bg-blue-700 hover:bg-blue-900 text-blue-100 px-2 py-1 rounded text-xs"
                                                title="Detail"
                                                onClick={() => {
                                                    setDetailMember(member);
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
                                                    setEditId(member.id);
                                                    setFormModal({
                                                        no_ktp: member.no_ktp,
                                                        nama: member.nama,
                                                        alamat: member.alamat,
                                                        tgl_lahir: member.tgl_lahir,
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
                                                    setDeleteId(member.id);
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6 mb-2 select-none">
                        <button
                            className={`px-3 py-1 rounded-lg font-semibold transition bg-gray-700 text-blue-100 hover:bg-blue-800 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => setCurrentPage(currentPage - 1)}
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
                                className={`px-3 py-1 rounded-lg font-bold transition border-2 ${
                                    currentPage === idx + 1
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Modal Add Member */}
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Member" width="max-w-lg">
                    <form onSubmit={handleSubmitModal} className="space-y-4">
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="no_ktp">ID Number</label>
                            <input
                                id="no_ktp"
                                type="text"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.no_ktp}
                                onChange={e => setFormModal({ ...formModal, no_ktp: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="nama">Name</label>
                            <input
                                id="nama"
                                type="text"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.nama}
                                onChange={e => setFormModal({ ...formModal, nama: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="alamat">Address</label>
                            <input
                                id="alamat"
                                type="text"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.alamat}
                                onChange={e => setFormModal({ ...formModal, alamat: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="tgl_lahir">Date of Birth</label>
                            <input
                                id="tgl_lahir"
                                type="date"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.tgl_lahir}
                                onChange={e => setFormModal({ ...formModal, tgl_lahir: e.target.value })}
                                required
                            />
                        </div>
                        {modalError && (
                            <div className="text-red-400 text-sm">{modalError}</div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
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

                {/* Modal Edit Member */}
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member" width="max-w-lg">
                    <form onSubmit={handleEditModal} className="space-y-4">
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="no_ktp_edit">ID Number</label>
                            <input
                                id="no_ktp_edit"
                                type="text"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.no_ktp}
                                onChange={e => setFormModal({ ...formModal, no_ktp: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="nama_edit">Name</label>
                            <input
                                id="nama_edit"
                                type="text"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.nama}
                                onChange={e => setFormModal({ ...formModal, nama: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="alamat_edit">Address</label>
                            <input
                                id="alamat_edit"
                                type="text"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.alamat}
                                onChange={e => setFormModal({ ...formModal, alamat: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-blue-200 text-sm mb-1" htmlFor="tgl_lahir_edit">Date of Birth</label>
                            <input
                                id="tgl_lahir_edit"
                                type="date"
                                className="w-full px-3 py-2 rounded bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                value={formModal.tgl_lahir}
                                onChange={e => setFormModal({ ...formModal, tgl_lahir: e.target.value })}
                                required
                            />
                        </div>
                        {modalError && (
                            <div className="text-red-400 text-sm">{modalError}</div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
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

                {/* Modal Delete Member */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Member" width="max-w-md">
                    <form onSubmit={handleDeleteMember} className="space-y-4">
                        <div className="text-blue-100 text-center text-lg">
                            Are you sure you want to delete this member?
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

                {/* Modal Detail Member */}
                <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Member Detail" width="max-w-md">
                    {detailMember && (
                        <div className="space-y-4 text-blue-100">
                            <div>
                                <span className="font-semibold">ID Number:</span> {detailMember.no_ktp}
                            </div>
                            <div>
                                <span className="font-semibold">Name:</span> {detailMember.nama}
                            </div>
                            <div>
                                <span className="font-semibold">Address:</span> {detailMember.alamat}
                            </div>
                            <div>
                                <span className="font-semibold">Date of Birth:</span> {detailMember.tgl_lahir}
                            </div>
                            <div>
                                <span className="font-semibold">Join Date:</span>{" "}
                                {detailMember.created_at
                                    ? new Date(detailMember.created_at).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })
                                    : "-"}
                            </div>
                            <div className="flex justify-end pt-2">
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
        </>
    );
}