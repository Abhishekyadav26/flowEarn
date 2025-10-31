"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { defineChain, getContract, prepareContractCall } from "thirdweb";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { formatEther } from "ethers";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";

export default function BountyDetail() {
  const { id } = useParams();
  const bountyId = Number(id);

  const [proof, setProof] = useState("");

  const { mutate: sendTransaction, isPending: isTxPending } = useSendTransaction();

  const contract = useMemo(
    () =>
      getContract({
        client,
        address: "0x52573FDC1af65AB4d09C9fEe193E9775e1676FE2",
        chain: defineChain(545),
      }),
    []
  );

  const { data, isPending, error } = useReadContract({
    contract,
    method:
      "function getTask(uint256 _id) view returns ((string title, string description, uint256 reward, address creator, address worker, string proof, bool completed, bool paid, uint256 createdAt, uint256 completedAt))",
    params: [BigInt(bountyId)],
  });

  // ✅ Accept task
  const handleAcceptTask = async () => {
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function acceptTask(uint256 _id)",
        params: [BigInt(bountyId)],
      });
      sendTransaction(transaction);
    } catch (err) {
      console.error("Error accepting task:", err);
    }
  };

  // ✅ Submit proof function (added from your Component)
  const handleSubmitProof = async () => {
    try {
      if (!proof) {
        alert("Please enter your proof before submitting.");
        return;
      }
      const transaction = prepareContractCall({
        contract,
        method: "function submitProof(uint256 _id, string _proof)",
        params: [BigInt(bountyId), proof],
      });
      sendTransaction(transaction);
    } catch (err) {
      console.error("Error submitting proof:", err);
    }
  };

  if (isPending)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading bounty details...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading bounty: {error.message}
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Bounty not found.
      </div>
    );

  const task = data;
  const rewardEth = task.reward;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-gray-100">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">
        {task.title || `Bounty #${bountyId}`}
      </h1>

      <p className="text-lg text-gray-300 mb-8">{task.description}</p>

      <div className="space-y-2 mb-10">
        <p>
          <span className="font-medium text-gray-400">Reward:</span>{" "}
          <span className="text-green-400">{rewardEth} CUSDC</span>
        </p>
        <p>
          <span className="font-medium text-gray-400">Status:</span>{" "}
          {task.completed ? "✅ Completed" : "🟡 Active"}
        </p>
        <p>
          <span className="font-medium text-gray-400">Creator:</span>{" "}
          {task.creator}
        </p>
      </div>

      {/* Accept Task Button */}
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
        disabled={isTxPending || task.completed}
        onClick={handleAcceptTask}
      >
        {isTxPending
          ? "Processing..."
          : task.completed
          ? "Already Completed ✅"
          : "Accept Task"}
      </Button>

      {/* Submit Proof Section */}
      <div className="mt-8 space-y-4">
        <input
          type="text"
          placeholder="Enter proof (e.g., link to work)"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
        />
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isTxPending}
          onClick={handleSubmitProof}
        >
          {isTxPending ? "Submitting Proof..." : "Submit Proof"}
        </Button>
      </div>
    </div>
  );
}
