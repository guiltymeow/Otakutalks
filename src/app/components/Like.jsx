"use client";
import React, { useState, useEffect } from "react";
import { FaThumbsUp } from "react-icons/fa";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LikeButton = ({ postId, refreshPosts }) => {
    const [user, setUser] = useState(null);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchLikes = async () => {
            if (!postId) return;

            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                setLikes(postData.likes?.length || 0);
                setLiked(user && postData.likes?.includes(user.uid));
            }
        };

        fetchLikes();
    }, [postId, user]);

    const handleLike = async () => {
        if (!user) return;

        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const postData = postSnap.data();
            let updatedLikes;

            if (liked) {
                updatedLikes = postData.likes.filter((uid) => uid !== user.uid);
                setLikes(updatedLikes.length);
                setLiked(false);
            } else {
                updatedLikes = [...(postData.likes || []), user.uid];
                setLikes(updatedLikes.length);
                setLiked(true);
            }

            await updateDoc(postRef, { likes: updatedLikes });
            if (refreshPosts) refreshPosts();
        }
    };

    return (
        <button className="flex items-center gap-1 hover:text-blue-500 ml-[40px]" onClick={handleLike}>
            <FaThumbsUp className={liked ? "text-blue-500" : ""} />
            Like {likes > 0 && <span>({likes})</span>}
        </button>
    );
};

export default LikeButton;
