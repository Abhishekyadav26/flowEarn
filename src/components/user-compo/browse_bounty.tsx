/* eslint-disable @next/next/no-img-element */
import { client } from "@/lib/client";
import React, { useState, useMemo } from "react";
import { formatEther } from "ethers";
import { defineChain, getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";

const BountyList = () => {
  const contract = useMemo(() => getContract({
    client: client,
    address: "0x52573FDC1af65AB4d09C9fEe193E9775e1676FE2",
    chain: defineChain(545),
  }), []);

  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Fetch all tasks from contract
  const { data: tasksData, isPending, error } = useReadContract({
    contract,
    method: "function getTasks() view returns ((string title, string description, uint256 reward, address creator, address worker, string proof, bool completed, bool paid, uint256 createdAt, uint256 completedAt)[])",
    params: [],
  });

  const allTasks = tasksData || [];
  const visibleTasks = allTasks.slice(0, visibleCount);

  // Calculate stats from all tasks
  const totalRewards = allTasks.reduce((sum, task) => {
    try {
      return sum + BigInt(task.reward);
    } catch (e) {
      console.error("Invalid reward amount:", task.reward);
      return sum;
    }
  }, BigInt(0));

  const activeBounties = allTasks.filter(task => !task.completed).length;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500">Error loading bounties</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading bounty data from blockchain...</p>
        </div>
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-400">No bounties available at the moment</p>
          <p className="text-sm text-gray-500 mt-2">Check back later for new opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter max-w-6xl mx-auto px-4 py-6 sm:px-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-3">
          Browse Opportunities
        </h1>
        <p className="text-gray-400 text-lg">
          Discover and participate in exciting bounty tasks
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{activeBounties}</div>
          <div className="text-xs sm:text-sm text-gray-300">Active Bounties</div>
        </div>
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400">
            {formatEther(totalRewards)}
          </div>
          <div className="text-xs sm:text-sm text-gray-300">Total Rewards (ETH)</div>
        </div>
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-3 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-400">
            {allTasks.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-300">Total Tasks</div>
        </div>
      </div>

      {/* Bounties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleTasks.map((task, i) => {
          const isCompleted = task.completed;
          const isPaid = task.paid;
          const createdAt = task.createdAt ? Number(task.createdAt) : 0;

          // Calculate time difference for "due" display
          const now = Math.floor(Date.now() / 1000);
          const timeDiff = now - createdAt;
          const hoursAgo = Math.floor(timeDiff / 3600);
          const daysAgo = Math.floor(timeDiff / 86400);
          const dueDisplay = daysAgo > 0 ? `${daysAgo}d ago` : `${hoursAgo}h ago`;

          // Convert reward from Wei to ETH
          const rewardInEth = task.reward ? formatEther(task.reward) : "0";

          return (
            <div
              key={`${task.creator}-${task.createdAt}`}
              className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {isCompleted && isPaid ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ Completed & Paid
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    ✓ Completed
                  </span>
                ) : task.worker && task.worker !== "0x0000000000000000000000000000000000000000" ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    🔨 In Progress
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    🔄 Active
                  </span>
                )}
              </div>

              {/* Company Logo and Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-600/50 group-hover:ring-blue-500/50 transition-all duration-300">
                    <span className="text-white text-xl font-bold">
                      {task.title?.charAt(0) || 'B'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">#{i + 1}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                    {task.title || `Bounty Task #${i + 1}`}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Creator: {task.creator?.slice(0, 6)}...{task.creator?.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-300 line-clamp-3">
                  {task.description || "Complete this bounty task to earn rewards and contribute to the ecosystem."}
                </p>
              </div>

              {/* Worker Info (if assigned) */}
              {task.worker && task.worker !== "0x0000000000000000000000000000000000000000" && (
                <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300">
                    Worker: {task.worker.slice(0, 6)}...{task.worker.slice(-4)}
                  </p>
                </div>
              )}

              {/* Tags and Meta Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  🪙 Bounty
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
                  ⏰ Created {dueDisplay}
                </span>
                {task.completedAt && Number(task.completedAt) > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                    ✓ Finished
                  </span>
                )}
              </div>

              {/* Reward Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-700/50 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Ξ</span>
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {rewardInEth}
                    </div>
                    <div className="text-xs text-gray-400">ETH</div>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex justify-end">
                  <button
                    onClick={() => console.log("View Details clicked for task:", task)}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCompleted}
                  >
                    {isCompleted ? "Completed" : "View Details"}
                  </button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {visibleCount < allTasks.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + 6, allTasks.length))}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Load More ({allTasks.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Total count indicator */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Showing {visibleTasks.length} of {allTasks.length} bounties
        </p>
      </div>
    </div>
  );
};

export default BountyList;