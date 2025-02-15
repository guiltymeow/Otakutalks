"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { auth, db } from "@/lib/firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter(); // Initialize router

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isSignup) {
                // Sign Up User
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Send email verification
                await sendEmailVerification(user);

                // Save user details in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: user.email,
                    createdAt: new Date(),
                    emailVerified: false,
                });

                alert("Account created successfully! Please check your email to verify your account.");
            } else {
                // Login User
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    throw new Error("Please verify your email before logging in.");
                }

                console.log("User logged in:", user.email); // Debugging log
                alert("Logged in successfully!");

                // Redirect to home page
                router.replace("/");
            }
        } catch (err) {
            console.error("Login error:", err); // Debugging log
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4 text-orange-500">
                    {isSignup ? "Sign Up" : "Login"}
                </h2>

                {error && <p className="text-red-500 text-center mb-3">{error}</p>}

                <form onSubmit={handleAuth}>
                    {isSignup && (
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 mb-3 border border-gray-300 rounded"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-3 border border-gray-300 rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 mb-3 border border-gray-300 rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-orange-500 font-bold ml-1"
                    >
                        {isSignup ? "Login" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
