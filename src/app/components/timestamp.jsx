const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";

    let postDate;

    // Check if timestamp is already a Date object
    if (timestamp instanceof Date) {
        postDate = timestamp;
    } else if (timestamp.toDate) {
        postDate = timestamp.toDate(); // Convert Firestore Timestamp to Date
    } else {
        return "Unknown";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    const diffInMonths = Math.floor(diffInWeeks / 4);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    const diffInYears = Math.floor(diffInMonths / 12);

    return `${diffInYears} years ago`;
};

export default formatTimeAgo;
