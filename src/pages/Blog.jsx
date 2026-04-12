import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import "./blog.css";

export default function Blog() {
  const defaultPosts = [
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

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem("rj_blog_votes") || "{}");
    const votedByUser = JSON.parse(localStorage.getItem("rj_blog_voted") || "{}");
    const withVotes = defaultPosts.map((p) => ({
      ...p,
      agree: savedVotes[p.id]?.agree !== undefined ? savedVotes[p.id].agree : p.initAgree,
      disagree: savedVotes[p.id]?.disagree !== undefined ? savedVotes[p.id].disagree : p.initDisagree,
      userVote: votedByUser[p.id] || null,
    }));
    setPosts(withVotes);
  }, []);

  function vote(id, type) {
    const votedByUser = JSON.parse(localStorage.getItem("rj_blog_voted") || "{}");
    
    let nextPosts;
    let newVotedByUser = { ...votedByUser };

    if (votedByUser[id] === type) {
      // Unvote (clicked the same button)
      nextPosts = posts.map((p) =>
        p.id === id ? { ...p, [type]: p[type] - 1, userVote: null } : p
      );
      delete newVotedByUser[id];
    } else if (votedByUser[id]) {
      // Switch vote (clicked the other button)
      const oldType = votedByUser[id];
      nextPosts = posts.map((p) =>
        p.id === id
          ? { ...p, [oldType]: p[oldType] - 1, [type]: p[type] + 1, userVote: type }
          : p
      );
      newVotedByUser[id] = type;
    } else {
      // First time voting
      nextPosts = posts.map((p) =>
        p.id === id ? { ...p, [type]: p[type] + 1, userVote: type } : p
      );
      newVotedByUser[id] = type;
    }

    setPosts(nextPosts);

    const votes = Object.fromEntries(
      nextPosts.map((p) => [p.id, { agree: p.agree, disagree: p.disagree }])
    );
    
    localStorage.setItem("rj_blog_votes", JSON.stringify(votes));
    localStorage.setItem("rj_blog_voted", JSON.stringify(newVotedByUser));
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
                className={`vote-btn agree ${
                  p.userVote === "agree" ? "active" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: p.userVote === "agree" ? "rgba(0, 255, 130, 0.2)" : "rgba(255,255,255,0.05)",
                  color: p.userVote === "agree" ? "#00ff82" : "#ddd",
                  border: p.userVote === "agree" ? "1px solid #00ff82" : "1px solid transparent",
                  padding: "8px 16px",
                  borderRadius: "20px",
                }}
              >
                <ThumbsUp size={18} />
                <span className="vote-num">{p.agree}</span>
              </motion.button>

              <motion.button
                onClick={() => vote(p.id, "disagree")}
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                className={`vote-btn disagree ${
                  p.userVote === "disagree" ? "active" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: p.userVote === "disagree" ? "rgba(255, 0, 70, 0.2)" : "rgba(255,255,255,0.05)",
                  color: p.userVote === "disagree" ? "#ff0050" : "#ddd",
                  border: p.userVote === "disagree" ? "1px solid #ff0050" : "1px solid transparent",
                  padding: "8px 16px",
                  borderRadius: "20px",
                }}
              >
                <ThumbsDown size={18} />
                <span className="vote-num">{p.disagree}</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
