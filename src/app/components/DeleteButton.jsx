"use client";
import React from "react";
import { FaTrash } from "react-icons/fa";
import { db } from "../firebase";
import { deleteDoc, doc, collection, getDocs, query, where } from "firebase/firestore";

const DeleteButton = ({ postId, isShared, refreshPosts }) => {
    const handleDelete = async () => {
        try {
            if (isShared) {
                // ✅ Delete only the shared post (not the original)
                await deleteDoc(doc(db, "sharedPosts", postId));
            } else {
                // ✅ Delete all shared posts linked to this post
                const sharedQuery = query(collection(db, "sharedPosts"), where("originalPostId", "==", postId));
                const sharedSnapshot = await getDocs(sharedQuery);
                const deleteSharedPromises = sharedSnapshot.docs.map((docSnap) =>
                    deleteDoc(doc(db, "sharedPosts", docSnap.id))
                );
                await Promise.all(deleteSharedPromises);

                // ✅ Delete all comments linked to this post
                const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
                const commentsSnapshot = await getDocs(commentsQuery);
                const deleteCommentPromises = commentsSnapshot.docs.map((docSnap) =>
                    deleteDoc(doc(db, "comments", docSnap.id))
                );
                await Promise.all(deleteCommentPromises);

                // ✅ Delete the original post itself
                await deleteDoc(doc(db, "posts", postId));
            }

            // ✅ Refresh posts after deletion
            await refreshPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    return (
        <button
            className="w-full text-left px-3 py-1 text-red-500 hover:bg-gray-200 flex items-center"
            onClick={handleDelete}
        >
            <FaTrash className="mr-2" /> Delete
        </button>
    );
};

export default DeleteButton;
