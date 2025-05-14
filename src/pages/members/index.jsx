import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constan";
import { useNavigate } from "react-router-dom";

export default function MembersIndex() {
    const [members, setMembers] = useState([]);
    const [error, setError] = useState("");
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

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-lg mb-4 shadow-lg">
                    {error}
                </div>
            )}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Members Directory</h1>
                <p className="text-gray-300 mt-2">A clean and premium list of all registered members.</p>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-2xl bg-gray-800 border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">No</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">KTP Number</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Name</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Address</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-200 uppercase tracking-wider">
                                <span className="bg-blue-700 px-2 py-1 rounded-full">Date of Birth</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">
                                    No members found.
                                </td>
                            </tr>
                        ) : (
                            members.map((member, index) => (
                                <tr
                                    key={member.id}
                                    className="hover:bg-blue-900/30 transition duration-200 border-b border-gray-700"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100 font-semibold">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{member.no_ktp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{member.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{member.alamat}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{member.tgl_lahir}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}