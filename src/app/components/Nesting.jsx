import React, { useState } from "react";
import { doc, deleteDoc, updateDoc, addDoc, collection, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Nesting = ({ comment, user, fetchComments }) => {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDeleteComment = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "comments", comment.id));
            fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !user) return;

        try {
            // Fetch user data from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            const finalUsername = userDocSnap.exists() ? userDocSnap.data().username || "Anonymous" : "Anonymous";
            const profilePic = userDocSnap.exists() ? userDocSnap.data().profilePic || "" : "";

            const newReply = {
                postId: comment.postId,
                userId: user.uid,
                username: finalUsername,
                profilePic: profilePic,
                text: replyText,
                parentId: comment.id, // Keep it under the main comment
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, "comments"), newReply);
            setReplyText("");
            setIsReplyOpen(false);
            fetchComments();
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const handleEditComment = async () => {
        if (!editedText.trim()) return;

        try {
            const commentRef = doc(db, "comments", comment.id);
            await updateDoc(commentRef, { text: editedText });
            setIsEditing(false);
            fetchComments();
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    return (
        <div className="p-2 border rounded bg-white mb-2 relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        src={comment.profilePic || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full mr-2"
                    />
                    <strong>{comment.username || "Anonymous"}</strong>
                </div>

                {user?.uid === comment.userId && (
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
                            ⋮
                        </button>

                        {menuOpen && (
                            <div className="absolute bg-white border rounded shadow-md right-0 mt-2 w-32">
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setMenuOpen(false);
                                    }}
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDeleteComment}
                                    className="block w-full px-4 py-2 text-left hover:bg-red-200 text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="mt-2">
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                    />
                    <div className="flex mt-2">
                        <button onClick={handleEditComment} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
                            Save
                        </button>
                        <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-3 py-1 rounded">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="mt-1">{comment.text}</p>
            )}

            <button className="text-black mt-2 hover:underline" onClick={() => setIsReplyOpen(!isReplyOpen)}>
                Reply
            </button>

            {isReplyOpen && user && (
                <div className="mt-2 flex">
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button className="text-blue-500 ml-2" onClick={handleReply}>Send</button>
                </div>
            )}

            {comment.replies.length > 0 && (
                <div className="ml-6 border-l-2 pl-3 mt-2">
                    {comment.replies.map((reply) => (
                        <Nesting key={reply.id} comment={reply} user={user} fetchComments={fetchComments} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Nesting;
