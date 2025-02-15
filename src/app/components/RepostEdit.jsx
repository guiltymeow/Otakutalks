"use client";
import React, { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const RepostEdit = ({ sharedPost, onClose, refreshPosts }) => {
    const [newCaption, setNewCaption] = useState(sharedPost.caption || "");

    const handleSaveChanges = async () => {
        try {
            const sharedPostRef = doc(db, "sharedPosts", sharedPost.id);
            await updateDoc(sharedPostRef, {
                caption: newCaption, // ✅ Only allow editing the caption
            });

            refreshPosts();
            onClose();
        } catch (error) {
            console.error("Error updating shared post:", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-3">Edit Shared Post</h2>

                <textarea
                    className="w-full border p-2 rounded-md"
                    rows="3"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                />

                <div className="flex justify-end space-x-2 mt-3">
                    <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSaveChanges}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepostEdit;
