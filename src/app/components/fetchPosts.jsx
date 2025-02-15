import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import formatTimeAgo from "./timestamp";

const fetchPosts = async () => {
    try {
        const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const sharedQuery = query(collection(db, "sharedPosts"), orderBy("sharedAt", "desc"));

        const [postsSnapshot, sharedSnapshot] = await Promise.all([
            getDocs(postsQuery),
            getDocs(sharedQuery)
        ]);

        let postMap = new Map(); // Track posts to avoid duplicates
        let sharedPostMap = new Map(); // Track shared posts for grouping

        // Process original posts
        for (const docSnap of postsSnapshot.docs) {
            const postData = docSnap.data();
            const createdAt = postData.createdAt?.toDate() || null;
            const postId = docSnap.id;

            let profilePicUrl = "https://via.placeholder.com/40";
            if (postData.userId) {
                try {
                    const userDocRef = doc(db, "users", postData.userId);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        profilePicUrl = userData.profilePic || profilePicUrl;
                    }
                } catch (error) {
                    console.error("Error fetching user profile pic:", error);
                }
            }

            postMap.set(postId, {
                id: postId,
                ...postData,
                profilePic: profilePicUrl,
                formattedTime: createdAt ? formatTimeAgo(createdAt) : "Unknown",
                createdAt,
                showComments: false,
                isShared: false,
                engagement: (postData.likes || 0) + (postData.comments || 0),
            });
        }

        // Process shared posts
        for (const docSnap of sharedSnapshot.docs) {
            const sharedData = docSnap.data();
            const sharedAt = sharedData.sharedAt?.toDate() || null;
            const sharedId = docSnap.id;
            const originalPostId = sharedData.originalPostId;

            let sharedByProfilePic = "https://via.placeholder.com/40";
            let originalProfilePic = "https://via.placeholder.com/40";
            let originalPost = null;

            // Fetch original post data
            if (originalPostId && postMap.has(originalPostId)) {
                originalPost = postMap.get(originalPostId);
            } else if (originalPostId) {
                try {
                    const originalPostRef = doc(db, "posts", originalPostId);
                    const originalPostSnap = await getDoc(originalPostRef);
                    if (originalPostSnap.exists()) {
                        originalPost = originalPostSnap.data();
                        postMap.set(originalPostId, originalPost);
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

            // Determine whether to show shared post or original
            const engagement = (sharedData.likes || 0) + (sharedData.comments || 0);
            const sharedPost = {
                id: sharedId,
                ...sharedData,
                sharedByProfilePic,
                formattedTime: sharedAt ? formatTimeAgo(sharedAt) : "Unknown",
                sharedAt,
                showComments: false,
                isShared: true,
                caption: sharedData.caption || "",
                originalContent: originalPost.content,
                originalUsername: originalPost.username,
                originalProfilePic,
                originalImageUrl: originalPost.imageUrl,
                engagement,
            };

            if (!sharedPostMap.has(originalPostId)) {
                sharedPostMap.set(originalPostId, []);
            }
            sharedPostMap.get(originalPostId).push(sharedPost);
        }

        let finalFeed = [];

        // Decide which posts to show
        postMap.forEach((post, postId) => {
            const sharedVersions = sharedPostMap.get(postId) || [];

            if (sharedVersions.length > 0) {
                const mostEngagingSharedPost = sharedVersions.reduce((max, post) =>
                    post.engagement > max.engagement ? post : max, sharedVersions[0]
                );

                if (mostEngagingSharedPost.engagement > post.engagement) {
                    finalFeed.push(mostEngagingSharedPost);
                } else {
                    finalFeed.push(post);
                }
            } else {
                finalFeed.push(post);
            }
        });


        finalFeed.sort((a, b) => (b.createdAt || b.sharedAt) - (a.createdAt || a.sharedAt));

        return finalFeed;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};

export default fetchPosts;
