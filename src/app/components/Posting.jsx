"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaImage } from "react-icons/fa";
import { db, storage } from "../firebase";
import { collection, addDoc, doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Posting = ({ refreshPosts, user, posts = [], setPosts, handleDeletePost }) => {
  const [newPost, setNewPost] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [username, setUsername] = useState("Anonymous");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUsername(userDocSnap.data().username || "Anonymous");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, [user]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim() && !image) return; // Prevent empty posts

    let imageUrl = null;
    if (image) {
      const imageRef = ref(storage, `posts/${user.uid}/${image.name}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const finalUsername = userDocSnap.exists() ? userDocSnap.data().username || "Anonymous" : "Anonymous";

      const newPostData = {
        userId: user.uid,
        username: finalUsername,
        content: newPost,
        imageUrl, // Save image URL in Firestore
        visibility: isPublic ? "public" : "private",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "posts"), newPostData);
      setNewPost("");
      setImage(null);
      setImagePreview(null);
      refreshPosts(); // Refresh posts
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  return (
    <div className="mt-3 p-3 border rounded bg-gray-100">
      {/* New Post Section */}
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Write a new post..."
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddPost()}
      />

      {/* Buttons Row */}
      <div className="flex items-center space-x-2 mt-2">
        {/* Add Image Button */}
        <label className="bg-gray-500 text-white px-3 py-1 rounded flex items-center cursor-pointer">
          <FaImage className="mr-1" /> Add Image
          <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
        </label>

        {/* Post Button */}
        <button className="bg-gray-500 text-white px-3 py-1 rounded flex items-center" onClick={handleAddPost}>
          <FaPlus className="mr-1" /> Post
        </button>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-2">
          <img src={imagePreview} alt="Preview" className="w-full max-h-60 object-cover rounded" />
        </div>
      )}

      {/* Posts Section */}
      <div className="mt-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-4 mt-3 border rounded bg-gray-200">
              <p>{post.content}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="Post" className="w-full mt-2 rounded" />}
              {user?.uid === post.userId && (
                <div className="mt-2 flex space-x-2">
                  <button className="text-blue-500" onClick={() => handleDeletePost(post.id)}>
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Posting;
