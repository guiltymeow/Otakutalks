"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaCamera } from "react-icons/fa";
import { auth, db, storage } from "../../lib/firebase";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditProfile = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Fetch latest user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setNewUsername(userData.username || "");
          setNewProfilePic(userData.profilePic || "");
        }
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, user?.uid]);

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const updates = {};

      // Update username in Firestore
      if (newUsername.trim() !== "") {
        updates.username = newUsername;
      }

      // Update password in Firebase Auth (only if user enters a new password)
      if (newPassword.trim() !== "") {
        await updatePassword(auth.currentUser, newPassword);
      }

      // Upload new profile picture if selected
      if (imageFile) {
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);
        updates.profilePic = imageUrl;
        setNewProfilePic(imageUrl); // Update state for immediate UI change
      }

      // Update Firestore document
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        onProfileUpdated(); // Refresh profile panel with new data
      }

      alert("Profile updated successfully!");
      onClose(); // Close modal
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setNewProfilePic(URL.createObjectURL(e.target.files[0])); // Show preview immediately
    }
  };

  if (!isOpen) return null; // Don't render if modal is not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-24 h-24">
            <img
              src={newProfilePic || "https://via.placeholder.com/100"}
              alt="Profile"
              className="w-full h-full rounded-full border"
            />
            <label className="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded-full cursor-pointer">
              <FaCamera />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* Change Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Change Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="New Name"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        {/* Change Password (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Change Password (Optional)</label>
          <input
            type="password"
            className="w-full p-2 border rounded-md"
            placeholder="Leave empty to keep current password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button className="p-2 bg-gray-300 rounded-md" onClick={onClose}>
            Cancel
          </button>
          <button className="p-2 bg-blue-500 text-white rounded-md" onClick={handleSaveChanges}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
