"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Nesting from "./nesting";

const Comments = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    if (!postId) return;

    try {
      const q = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);

      const fetchedComments = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const commentData = { id: docSnap.id, ...docSnap.data() };

          // Fetch user profile pic & username
          const userDocRef = doc(db, "users", commentData.userId);
          const userDocSnap = await getDoc(userDocRef);

          return {
            ...commentData,
            profilePic: userDocSnap.exists() ? userDocSnap.data().profilePic || "" : "",
            username: userDocSnap.exists() ? userDocSnap.data().username || "Anonymous" : "Anonymous",
          };
        })
      );

      setComments(formatComments(fetchedComments));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const formatComments = (comments) => {
    const groupedComments = {};
    const rootComments = [];

    comments.forEach((comment) => {
      comment.replies = [];
      groupedComments[comment.id] = comment;
    });

    comments.forEach((comment) => {
      if (comment.parentId && groupedComments[comment.parentId]) {
        groupedComments[comment.parentId].replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const finalUsername = userDocSnap.exists() ? userDocSnap.data().username || "Anonymous" : "Anonymous";
      const profilePic = userDocSnap.exists() ? userDocSnap.data().profilePic || "" : "";

      const newCommentData = {
        postId,
        userId: user.uid,
        username: finalUsername,
        profilePic,
        text: newComment,
        parentId: null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "comments"), newCommentData);
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="mt-2 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>

      {user && (
        <div className="flex mb-4">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button className="bg-blue-500 text-white px-3 py-2 ml-2 rounded" onClick={handleAddComment}>
            Post
          </button>
        </div>
      )}

      {comments.length > 0 ? (
        comments.map((comment) => (
          <Nesting key={comment.id} comment={comment} user={user} fetchComments={fetchComments} />
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default Comments;
