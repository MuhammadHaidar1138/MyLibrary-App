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
                if (err.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                setError(err.response.data);
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-800">Members Directory</h1>
                <p className="text-gray-500 mt-2">A clean and premium list of all registered members.</p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg shadow-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                KTP Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date of Birth
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {members.map((member, index) => (
                            <tr key={member.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.no_ktp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.alamat}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.tgl_lahir}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    Previous
                </button>
                <span className="text-gray-600">
                    Page <span className="font-bold">1</span> of <span className="font-bold">5</span>
                </span>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    Next
                </button>
            </div>
        </div>
    );
}