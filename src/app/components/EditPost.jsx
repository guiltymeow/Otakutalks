"use client";
import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditPost = ({ post, onClose, refreshPosts }) => {
    const [newContent, setNewContent] = useState(post.content);

    const handleSaveChanges = async () => {
        try {
            const postRef = doc(db, "posts", post.id);
            await updateDoc(postRef, {
                content: newContent,
            });

            refreshPosts(); // Refresh the posts after update
            onClose(); // Close the modal
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-3">Edit Post</h2>

                <textarea
                    className="w-full border p-2 rounded-md"
                    rows="3"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
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

export default EditPost;
