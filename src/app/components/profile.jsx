import { useState, useEffect } from "react";
import { FaChevronDown, FaEdit, FaSignOutAlt } from "react-icons/fa";
import { auth, db } from "../../lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import EditProfile from "./editprofile";

const ProfilePanel = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ username: "", profilePic: "" });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser);
      } else {
        setUserData({ username: "", profilePic: "" });
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to refresh user data after profile update
  const handleProfileUpdate = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <img
          src={userData.profilePic || "https://via.placeholder.com/40"}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <span className="ml-3 font-semibold">{userData.username || "Guest"}</span>
        <FaChevronDown className={`ml-auto transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"}`} />
      </div>

      {isDropdownOpen && (
        <div className="mt-3 space-y-2">
          <button 
            className="flex items-center gap-2 w-full p-2 text-left bg-gray-200 rounded-md" 
            onClick={() => setIsEditProfileOpen(true)}
          >
            <FaEdit /> Edit Profile
          </button>
          <button 
            className="flex items-center gap-2 w-full p-2 text-left bg-orange-500 text-white rounded-md" 
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfile 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        user={user} 
        onProfileUpdated={handleProfileUpdate} // Pass function to update profile
      />
    </div>
  );
};

export default ProfilePanel;
