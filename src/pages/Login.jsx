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
            }
        })
        .catch(err => {
            let msg = "Login failed. Please try again.";
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
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="bg-gray-800 bg-opacity-75 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-white text-center mb-6">Welcome to MyLibrary</h1>
                
                {/* ALERT ERROR */}
                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full mt-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            onChange={(e) => setLogin({ ...login, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full mt-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            onChange={(e) => setLogin({ ...login, password: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-800 hover:bg-blue-600 text-black font-medium py-2 rounded-lg transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <p className="text-gray-400 text-center mt-4">
                    Don't have an account? <a href="#" className="text-blue-400 hover:underline">Sign up</a>
                </p>
            </div>
        </div>
    );
}