"use client";
import React, { useState, useEffect } from "react";
import { FaComment, FaEllipsisV, FaEdit } from "react-icons/fa";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Posting from "./posting";
import Comments from "./comment";
import EditPost from "./editpost";
import RepostEdit from "./repostEdit";
import LikeButton from "./like";
import ShareButton from "./share";
import fetchPosts from "./fetchPosts";
import DeleteButton from "./deletebutton";

const Contents = ({ className }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingRepost, setEditingRepost] = useState(null);

  // ✅ Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch and sort posts from newest to oldest
  useEffect(() => {
    const loadPosts = async () => {
      const allPosts = await fetchPosts();

      // ✅ Fix: Sort from newest to oldest
      const sortedPosts = allPosts.sort(
        (a, b) => new Date(b.createdAt || b.sharedAt) - new Date(a.createdAt || a.sharedAt)
      );

      setPosts(sortedPosts);
    };
    loadPosts();
  }, [user]);

  const toggleComments = (postId) => {
    setPosts(posts.map((p) => (p.id === postId ? { ...p, showComments: !p.showComments } : p)));
  };

  return (
    <div className={`${className} text-left p-0 m-0`}>
      <h2 className="text-lg font-semibold">Trending</h2>
      {user && <Posting refreshPosts={() => fetchPosts().then(setPosts)} user={user} />}
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
                    <p className="text-gray-500 text-sm">{post.formattedTime}</p>
                  </div>
                </div>

                {user && (
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}>
                      <FaEllipsisV />
                    </button>
                    {menuOpen === post.id && (
                      <div className="absolute right-0 mt-2 w-28 bg-white shadow-lg rounded-md">
                        {/* ✅ Edit/Delete Buttons for Original Posts */}
                        {user.uid === post.userId && !post.isShared && (
                          <>
                            <button
                              className="w-full text-left px-3 py-1 hover:bg-gray-200 flex items-center"
                              onClick={() => setEditingPost(post)}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            <DeleteButton postId={post.id} isShared={false} refreshPosts={() => fetchPosts().then(setPosts)} />
                          </>
                        )}

                        {/* ✅ Edit/Delete Buttons for Shared Posts */}
                        {user.uid === post.sharedById && post.isShared && (
                          <>
                            <button
                              className="w-full text-left px-3 py-1 hover:bg-gray-200 flex items-center"
                              onClick={() => setEditingRepost(post)}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            <DeleteButton postId={post.id} isShared={true} refreshPosts={() => fetchPosts().then(setPosts)} />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ Display for Shared Posts */}
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
                <LikeButton postId={post.id} refreshPosts={() => fetchPosts().then(setPosts)} />
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

      {/* ✅ Render EditPost Modal for Editing Original Posts */}
      {editingPost && <EditPost post={editingPost} onClose={() => setEditingPost(null)} refreshPosts={() => fetchPosts().then(setPosts)} />}

      {/* ✅ Render RepostEdit Modal for Editing Shared Posts */}
      {editingRepost && <RepostEdit sharedPost={editingRepost} onClose={() => setEditingRepost(null)} refreshPosts={() => fetchPosts().then(setPosts)} />}
    </div>
  );
};

export default Contents;
