"use client";
import React, { useState, useEffect } from "react";
import { FaComment, FaEllipsisV, FaEdit } from "react-icons/fa";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Comments from "../components/comment";
import EditPost from "../components/editpost";
import RepostEdit from "../components/repostEdit";
import LikeButton from "../components/like";
import ShareButton from "../components/share";
import fetchSharedPosts from "./sharedpostprofile";
import DeleteButton from "../components/deletebutton";

const Userpost = ({ className }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (!user) return;

      try {
        const userPosts = await fetchSharedPosts(user.uid);
        setPosts(userPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    };

    loadUserPosts();
  }, [user]);

  const toggleComments = (postId) => {
    setPosts(posts.map((p) => (p.id === postId ? { ...p, showComments: !p.showComments } : p)));
  };

  return (
    <div className={`${className} text-left p-0 m-0`}>
      <h2 className="text-lg font-semibold">Your Posts</h2>

      <div className="posts mt-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post p-4 border border-gray-300 rounded-lg shadow-md bg-white mb-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={post.isShared ? post.sharedByProfilePic || "https://via.placeholder.com/40" : post.profilePic || "https://via.placeholder.com/40"}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    {post.isShared ? (
                      <p className="text-gray-500 text-sm">
                        <strong>{post.sharedByUsername || "Anonymous"}</strong> shared this post
                      </p>
                    ) : (
                      <strong>{post.username || "Anonymous"}</strong>
                    )}
                    <p className="text-gray-500 text-sm">{post.formattedTime || post.sharedAt}</p>
                  </div>
                </div>

                {user && (post.userId === user.uid || post.sharedById === user.uid) && (
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}>
                      <FaEllipsisV />
                    </button>
                    {menuOpen === post.id && (
                      <div className="absolute right-0 bg-white border border-gray-300 shadow-lg rounded-md">
                        <button
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-200 w-full"
                          onClick={() => setEditingPost(post)}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                        <DeleteButton postId={post.id} refreshPosts={() => fetchSharedPosts(user.uid).then(setPosts)} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {post.isShared ? (
                <div className="mt-2">
                  {post.caption && <p className="font-semibold mb-2">{post.caption}</p>}
                  <div className="p-3 border border-gray-300 rounded-lg bg-gray-100">
                    <div className="p-3 border border-gray-300 rounded-lg bg-white">
                      <div className="flex items-center mb-2">
                        <img
                          src={post.originalProfilePic || "https://via.placeholder.com/40"}
                          alt="Original User"
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <strong>{post.originalUsername || "Original User"}</strong>
                      </div>
                      <p>{post.originalContent}</p>
                      {post.originalImageUrl && (
                        <div className="mt-2 w-full flex justify-center">
                          <img src={post.originalImageUrl} alt="Original Post" className="w-full max-h-[400px] object-cover rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2">{post.content}</p>
                  {post.imageUrl && (
                    <div className="mt-2 w-full flex justify-center">
                      <img src={post.imageUrl} alt="Post" className="w-full max-h-[400px] object-cover rounded-lg" />
                    </div>
                  )}
                </>
              )}

              <hr className="my-3 border-gray-300" />
              <div className="flex justify-between px-4 py-2">
                <LikeButton postId={post.id} refreshPosts={() => fetchSharedPosts(user.uid).then(setPosts)} />
                <button className="flex items-center gap-1 hover:text-blue-500" onClick={() => toggleComments(post.id)}>
                  <FaComment /> Comment
                </button>
                <ShareButton postId={post.id} />
              </div>
              {post.showComments && <Comments postId={post.id} user={user} />}
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      {editingPost && (
        editingPost.isShared ? (
          <RepostEdit
            sharedPost={editingPost}
            onClose={() => setEditingPost(null)}
            refreshPosts={() => fetchSharedPosts(user.uid).then(setPosts)}
          />
        ) : (
          <EditPost
            post={editingPost}
            onClose={() => setEditingPost(null)}
            refreshPosts={() => fetchSharedPosts(user.uid).then(setPosts)}
          />
        )
      )}
    </div>
  );
};

export default Userpost;
