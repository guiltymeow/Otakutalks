"use client";
import React, { useState, useEffect } from "react";
import { FaShare } from "react-icons/fa";
import { auth, db } from "../firebase";
import { doc, addDoc, collection, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LikeButton from "./like"; // ✅ Import LikeButton

const ShareButton = ({ postId, postUserId, username, content, imageUrl, originalPostId, refreshPosts }) => {
    const [user, setUser] = useState(null);
    const [shared, setShared] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [caption, setCaption] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleShare = async () => {
        if (!user || user.uid === postUserId) return; // Prevent sharing own post

        const trueOriginalPostId = originalPostId || postId;

        if (!trueOriginalPostId) {
            console.error("Error: No post ID found!");
            return;
        }

        try {
            // ✅ Fetch the current user's data from Firestore
            let sharedByUsername = "Anonymous";
            let sharedByProfilePic = "https://via.placeholder.com/40"; // Default profile picture

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                sharedByUsername = userData.username || "Anonymous"; // Get username
                sharedByProfilePic = userData.profilePic || sharedByProfilePic; // Get profile picture
            }

            // ✅ Fetch the original post data
            const postRef = doc(db, "posts", trueOriginalPostId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                console.error("Original post not found!");
                return;
            }

            const postData = postSnap.data();

            const sharedPost = {
                originalPostId: trueOriginalPostId,
                sharedById: user.uid,
                sharedByUsername, // ✅ Now using fetched username
                sharedByProfilePic, // ✅ Now using fetched profile picture
                originalUsername: postData.username || username || "Unknown",
                originalProfilePic: postData.profilePic || "https://via.placeholder.com/40", // Default if missing
                content: postData.content || content || "",
                imageUrl: postData.imageUrl || imageUrl || "",
                caption: caption,
                sharedAt: new Date(),
                likes: [], // ✅ Initialize likes array for shared posts
            };

            await addDoc(collection(db, "sharedPosts"), sharedPost);
            setShared(true);
            setShowModal(false);
            refreshPosts();
        } catch (error) {
            console.error("Error sharing post:", error);
        }
    };

    return (
        <div className="relative">
            {user && user.uid !== postUserId && !shared && (
                <button className="flex items-center gap-1 hover:text-blue-500 mr-[40px]" onClick={() => setShowModal(true)}>
                    <FaShare />
                    Share
                </button>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded-lg shadow-md w-96 z-50">
                        <h2 className="text-lg font-semibold mb-2">Add a Caption</h2>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows="3"
                            placeholder="Write something..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-3">
                            <button className="px-3 py-1 bg-gray-300 rounded-md mr-2" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="px-3 py-1 bg-blue-500 text-white rounded-md" onClick={handleShare}>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Add LikeButton for shared posts */}
            {shared && <LikeButton postId={postId} refreshPosts={refreshPosts} />}
        </div>
    );
};

export default ShareButton;
