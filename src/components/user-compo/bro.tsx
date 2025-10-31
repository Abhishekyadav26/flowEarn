"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { defineChain, getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { formatEther } from "ethers";
import { client } from "@/lib/client";
import { motion } from "framer-motion";

export default function BountyList() {
  const router = useRouter();

  const contract = useMemo(
    () =>
      getContract({
        client,
        address: "0xa6657D9E736dEF639906FB360Ca340d1d1eFA9db",
        chain: defineChain(545), // Flow Sepolia
      }),
    []
  );

  const { data, isPending, error } = useReadContract({
    contract,
    method:
      "function getTasks() view returns ((string title, string description, uint256 reward, address creator, address worker, string proof, bool completed, bool paid, uint256 createdAt, uint256 completedAt)[])",
    params: [],
  });

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full mb-3"
        />
        <p className="text-lg animate-pulse">Loading bounties...</p>
      </div>
    );
  }

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-400">
        <p className="text-2xl font-semibold mb-2">⚠️ Failed to load bounties</p>
        <p className="text-sm opacity-70">{error.message}</p>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-5xl mb-4"
        >
          🪙
        </motion.div>
        <p className="text-lg font-medium">No bounties yet</p>
        <p className="text-sm opacity-60 mt-1">
          Be the first to create one and earn rewards!
        </p>
      </div>
    );

  // 🎯 Map smart contract tasks to formatted cards
  const bountyCards = data.map((task: any, index: number) => {
    const rewardEth = parseFloat(formatEther(task.reward));
    const cusdcReward = task.reward;
    const status = task.completed ? "✅ Completed" : "🟡 Active";

    return {
      id: index,
      title: task.title || `Bounty #${index + 1}`,
      description: task.description || "No description provided.",
      reward: `${cusdcReward} cUSDC`,
      status,
      creator: task.creator,
      proof: task.proof,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        Explore Active Bounties
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {bountyCards.map((bounty, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => router.push(`/bounty/${bounty.id}`)}
            className="relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 cursor-pointer hover:scale-[1.03] transition-all duration-300"
          >
            <div className="bg-[#0a0a0a] dark:bg-[#111] rounded-2xl p-6 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all duration-300">
              <h2 className="text-xl font-semibold text-white mb-2">
                {bounty.title}
              </h2>
              <p className="text-gray-300 text-sm mb-5 leading-relaxed line-clamp-3">
                {bounty.description}
              </p>

              <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                <span className="text-sm font-medium text-green-400">
                  💰 {bounty.reward}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    bounty.status.includes("Completed")
                      ? "bg-green-900/40 text-green-300"
                      : "bg-yellow-900/40 text-yellow-300"
                  }`}
                >
                  {bounty.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
