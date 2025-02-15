import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import formatTimeAgo from "../components/timestamp";

const fetchSharedPosts = async (userId) => {
    if (!userId) return [];

    try {
        const postsQuery = query(
            collection(db, "posts"),
            where("userId", "==", userId)
        );

        const sharedQuery = query(
            collection(db, "sharedPosts"),
            where("sharedById", "==", userId)
        );

        const [postsSnapshot, sharedSnapshot] = await Promise.all([
            getDocs(postsQuery),
            getDocs(sharedQuery)
        ]);

        let posts = [];

        // Process user's original posts
        for (const docSnap of postsSnapshot.docs) {
            const postData = docSnap.data();
            const createdAt = postData.createdAt?.toDate() || null;

            let profilePicUrl = "https://via.placeholder.com/40";
            if (postData.userId) {
                try {
                    const userDocRef = doc(db, "users", postData.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        profilePicUrl = userDocSnap.data().profilePic || profilePicUrl;
                    }
                } catch (error) {
                    console.error("Error fetching user profile pic:", error);
                }
            }

            posts.push({
                id: docSnap.id,
                ...postData,
                profilePic: profilePicUrl,
                formattedTime: createdAt ? formatTimeAgo(createdAt) : "Unknown",
                createdAt,
                showComments: false,
                isShared: false
            });
        }

        // Process shared posts
        for (const docSnap of sharedSnapshot.docs) {
            const sharedData = docSnap.data();
            const sharedAt = sharedData.sharedAt?.toDate() || null;
            const originalPostId = sharedData.originalPostId;

            let sharedByProfilePic = "https://via.placeholder.com/40";
            let originalPost = null;
            let originalProfilePic = "https://via.placeholder.com/40"; // Default in case it's missing

            // Fetch original post data
            if (originalPostId) {
                try {
                    const originalPostRef = doc(db, "posts", originalPostId);
                    const originalPostSnap = await getDoc(originalPostRef);
                    if (originalPostSnap.exists()) {
                        originalPost = originalPostSnap.data();

                        // Fetch the original post's user profile pic
                        if (originalPost.userId) {
                            const originalUserRef = doc(db, "users", originalPost.userId);
                            const originalUserSnap = await getDoc(originalUserRef);
                            if (originalUserSnap.exists()) {
                                originalProfilePic = originalUserSnap.data().profilePic || originalProfilePic;
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching original post:", error);
                }
            }

            if (!originalPost) continue; // Skip if original post is missing

            // Fetch shared user's profile pic
            if (sharedData.sharedById) {
                try {
                    const sharedUserDocRef = doc(db, "users", sharedData.sharedById);
                    const sharedUserDocSnap = await getDoc(sharedUserDocRef);
                    if (sharedUserDocSnap.exists()) {
                        sharedByProfilePic = sharedUserDocSnap.data().profilePic || sharedByProfilePic;
                    }
                } catch (error) {
                    console.error("Error fetching shared user profile pic:", error);
                }
            }

            posts.push({
                id: docSnap.id,
                ...sharedData,
                sharedByProfilePic,
                formattedTime: sharedAt ? formatTimeAgo(sharedAt) : "Unknown",
                sharedAt,
                showComments: false,
                isShared: true,
                caption: sharedData.caption || "",
                originalContent: originalPost.content,
                originalUsername: originalPost.username,
                originalProfilePic: originalProfilePic, // ✅ Correctly fetching the original user's profile pic
                originalImageUrl: originalPost.imageUrl
            });
        }

        // Sort posts (newest first)
        posts.sort((a, b) => (new Date(b.createdAt || b.sharedAt || 0)) - (new Date(a.createdAt || a.sharedAt || 0)));

        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};

export default fetchSharedPosts;
