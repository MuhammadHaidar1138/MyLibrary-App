import React, { useState } from "react";
import backgroundImage from "../assets/imagebg.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../constan";

export default function Login() {
    const [login, setLogin] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    let navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault();
        setError(""); // Reset error

        // Validasi manual
        if (!login.email || !login.password) {
            setError("Email and password are required.");
            return;
        }

        axios.post(API_URL + "login", login, {
            headers: {
                Accept: 'application/json',
                "Content-Type": "application/json",
            }
        })
        .then(res => {
            if (res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            } else {
                setError("Login failed. Please check your email and password.");
            }
        })
        .catch(err => {
            let msg = "Login failed. Please check your email and password.";
            if (err.response && err.response.data) {
                if (typeof err.response.data === "string") {
                    msg = err.response.data;
                } else if (err.response.data.message) {
                    msg = err.response.data.message;
                } else if (err.response.data.error) {
                    msg = err.response.data.error;
                }
            }
            setError(msg);
        });
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(16,23,42,0.92),rgba(16,23,42,0.96)), url(${backgroundImage})` }}
        >
            <div className="w-full max-w-md rounded-2xl shadow-2xl bg-gradient-to-br from-blue-900 via-gray-900 to-blue-800 border border-blue-800 p-8 relative">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-800 bg-opacity-80 rounded-full p-3 shadow-lg mb-3">
                        <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="#2563eb" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 16h8M8 8h8" stroke="#fff" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-blue-100 tracking-wide text-center drop-shadow-lg">MyLibrary</h1>
                    <span className="text-blue-300 text-sm mt-1 tracking-widest font-mono">Digital Library System</span>
                </div>
                {/* ALERT ERROR */}
                {error && (
                    <div className="bg-red-600/90 text-white p-3 rounded-lg mb-4 flex items-center gap-2 shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-blue-200 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            autoComplete="username"
                            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="Input Your Email"
                            onChange={(e) => setLogin({ ...login, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-blue-200 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-blue-800 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="Input Your Password"
                            onChange={(e) => setLogin({ ...login, password: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold shadow-lg tracking-widest text-lg transition"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-8 text-center text-xs text-blue-300 opacity-60 select-none">
                    &copy; {new Date().getFullYear()} MyLibrary. All rights reserved.
                </div>
            </div>
        </div>
    );
}