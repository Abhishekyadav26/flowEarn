"use client";

import { client } from "@/lib/client";
import { useState } from "react";
import { prepareContractCall, getContract, defineChain } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react"; // optional for wallet status


// Replace with your deployed contract address and chain
const CONTRACT_ADDRESS = "0xa6657D9E736dEF639906FB360Ca340d1d1eFA9db";

export default function CreateTaskForm() {
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [taskId, setTaskId] = useState("");

  const handleCreateTask = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const contract = getContract({
        client: client,
        chain: defineChain(545),
        address: CONTRACT_ADDRESS,
      });

      const transaction = prepareContractCall({
        contract,
        method: "function createTask(string _title, string _desc, uint256 _reward)",
        params: [title, desc, BigInt(reward)],
      });

      await sendTransaction(transaction);
      setTitle("");
      setDesc("");
      setReward("");
    } catch (err) {
      console.error("❌ Error creating task:", err);
      alert("Transaction failed. Check console for details.");
    }
  };

  const handleAcceptTask = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!taskId) {
      alert("Please enter a task ID!");
      return;
    }

    try {
      const contract = getContract({
        client: client,
        chain: defineChain(545),
        address: CONTRACT_ADDRESS,
      });

      const transaction = prepareContractCall({
        contract,
        method: "function acceptTask(uint256 _id)",
        params: [BigInt(taskId)],
      });

      await sendTransaction(transaction);
      setTaskId("");
    } catch (err) {
      console.error("❌ Error accepting task:", err);
      alert("Transaction failed. Check console for details.");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Create New Bounty
          </h1>
          <p className="text-gray-400 text-lg">
            Launch your task and connect with contributors
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg">
          {/* Form Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Task Details</h2>
              <p className="text-gray-400">Fill in the information below</p>
            </div>
          </div>

          <form className="space-y-6">
            {/* Task Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Task Title *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">📋</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Task Description Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3">
                  <span className="text-gray-400">📄</span>
                </div>
                <textarea
                  placeholder="Describe the task requirements..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Reward Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Reward Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">💰</span>
                </div>
                <input
                  type="number"
                  placeholder="Enter reward amount..."
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full pl-10 pr-16 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400 text-sm">USDC</span>
                </div>
              </div>
            </div>

            {/* Wallet Connection Status */}
            {!account && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">⚠️</span>
                  <div>
                    <p className="text-yellow-300 font-medium">Wallet Not Connected</p>
                    <p className="text-yellow-200/80 text-sm">Please connect your wallet to create a task</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={isPending || !account || !title.trim() || !desc.trim() || !reward}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Task...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>Create Bounty</span>
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Success Message Placeholder */}
          {title && desc && reward && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <div>
                  <p className="text-green-300 font-medium">Ready to Launch!</p>
                  <p className="text-green-200/80 text-sm">Your bounty is ready to be created</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accept Task Section */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">✅</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Accept Task</h2>
              <p className="text-gray-400">Accept an existing task by ID</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Task ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">#</span>
                </div>
                <input
                  type="number"
                  placeholder="Enter task ID..."
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleAcceptTask}
                disabled={isPending || !account || !taskId.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Accepting Task...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>✅</span>
                    <span>Accept Task</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Your task will be published on the blockchain and visible to all contributors
          </p>
        </div>
      </div>
    </div>
  );
}
