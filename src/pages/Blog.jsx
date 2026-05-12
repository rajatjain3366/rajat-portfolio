import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./blog.css";

const DEFAULT_POSTS = [
  {
    id: 1,
    title: "My Thoughts on Design & Aesthetics",
    text: "I believe design should be a balance between functionality and emotion. Dark themes with minimalist layouts always inspire me to create something that feels personal and futuristic.",
    initAgree: 124,
    initDisagree: 2,
  },
  {
    id: 2,
    title: "Balancing Tech and Creativity",
    text: "As someone who codes and dances, I’ve realized creativity isn’t limited to art — it also lives in algorithms. Each project is like choreography for the mind.",
    initAgree: 89,
    initDisagree: 0,
  },
  {
    id: 3,
    title: "The Beauty of Simple Code",
    text: "Clean code isn’t just about fewer lines — it’s about clarity. Elegance in code feels like poetry to me — each function should have rhythm and purpose.",
    initAgree: 215,
    initDisagree: 5,
  },
];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
  }, []);

  async function fetchVotes() {
    try {
      // Check if keys are missing
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn("Supabase keys are missing in .env file");
        throw new Error("Missing API Keys");
      }

      const { data, error } = await supabase.from("blog_votes").select("*");
      
      if (error) throw error;

      const votedByUser = JSON.parse(localStorage.getItem("rj_blog_voted") || "{}");
      
      const mergedPosts = DEFAULT_POSTS.map((p) => {
        const dbVote = data?.find((d) => d.id === p.id);
        return {
          ...p,
          agree: dbVote ? dbVote.agree_count : p.initAgree,
          disagree: dbVote ? dbVote.disagree_count : p.initDisagree,
          userVote: votedByUser[p.id] || null,
        };
      });

      setPosts(mergedPosts);
    } catch (err) {
      console.error("Error fetching votes:", err.message);
      // Fallback
      const votedByUser = JSON.parse(localStorage.getItem("rj_blog_voted") || "{}");
      setPosts(DEFAULT_POSTS.map(p => ({ ...p, agree: p.initAgree, disagree: p.initDisagree, userVote: votedByUser[p.id] || null })));
    } finally {
      setLoading(false);
    }
  }

  async function vote(id, type) {
    const votedByUser = JSON.parse(localStorage.getItem("rj_blog_voted") || "{}");
    const oldVote = votedByUser[id];

    if (oldVote === type) return; // Already voted this way

    const post = posts.find(p => p.id === id);
    let newAgree = post.agree;
    let newDisagree = post.disagree;

    // Local Logic for Immediate UI feedback
    if (oldVote) {
      // Switching vote
      if (oldVote === "agree") { newAgree--; newDisagree++; }
      else { newAgree++; newDisagree--; }
    } else {
      // New vote
      if (type === "agree") newAgree++;
      else newDisagree++;
    }

    // Update UI immediately
    setPosts(posts.map(p => p.id === id ? { ...p, agree: newAgree, disagree: newDisagree, userVote: type } : p));

    // Update Supabase
    try {
      // We use upsert to create the row if it doesn't exist for that post ID
      const { error } = await supabase.from("blog_votes").upsert({
        id: id,
        agree_count: newAgree,
        disagree_count: newDisagree
      });

      if (error) throw error;

      // Persist user's choice locally
      const updatedVotedByUser = { ...votedByUser, [id]: type };
      localStorage.setItem("rj_blog_voted", JSON.stringify(updatedVotedByUser));
    } catch (err) {
      console.error("Error saving vote:", err.message);
      // Revert UI on failure (optional, but good for UX)
    }
  }

  return (
    <motion.section
      id="blog"
      className="blog-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="blog-title"
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        📝 My Blog
      </motion.h2>
      <p className="blog-sub">
        Personal thoughts, experiences, and reflections — feel free to react!
      </p>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading thoughts...</p>
      ) : (
        <div className="blog-grid">
          {posts.map((p, idx) => (
            <motion.div
              key={p.id}
              className="blog-post"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(255,255,255,0.1)",
              }}
            >
              <h3 className="post-title">{p.title}</h3>
              <p className="post-text">{p.text}</p>

              <div className="vote-container">
                <motion.button
                  onClick={() => vote(p.id, "agree")}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.05 }}
                  className={`vote-btn agree ${p.userVote === "agree" ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: p.userVote === "agree" ? "rgba(0, 255, 130, 0.3)" : "rgba(255,255,255,0.05)",
                    color: p.userVote === "agree" ? "#00ff82" : "#ddd",
                    border: p.userVote === "agree" ? "1px solid #00ff82" : "1px solid transparent",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    cursor: p.userVote === "agree" ? "default" : "pointer"
                  }}
                >
                  <ThumbsUp size={18} />
                  <span className="vote-num">{p.agree}</span>
                </motion.button>

                <motion.button
                  onClick={() => vote(p.id, "disagree")}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.05 }}
                  className={`vote-btn disagree ${p.userVote === "disagree" ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: p.userVote === "disagree" ? "rgba(255, 0, 70, 0.3)" : "rgba(255,255,255,0.05)",
                    color: p.userVote === "disagree" ? "#ff0050" : "#ddd",
                    border: p.userVote === "disagree" ? "1px solid #ff0050" : "1px solid transparent",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    cursor: p.userVote === "disagree" ? "default" : "pointer"
                  }}
                >
                  <ThumbsDown size={18} />
                  <span className="vote-num">{p.disagree}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
