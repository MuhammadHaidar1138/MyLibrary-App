import React from "react";

export default function Modal({ isOpen, onClose, title, children, width = "max-w-md" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
            <div className={`bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 rounded-2xl shadow-2xl p-6 ${width} w-full relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-blue-200 hover:text-red-400 transition"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {title && (
                    <h2 className="text-xl font-bold text-blue-100 mb-4 text-center drop-shadow">{title}</h2>
                )}
                <div className="text-blue-100">{children}</div>
            </div>
        </div>
    );
}