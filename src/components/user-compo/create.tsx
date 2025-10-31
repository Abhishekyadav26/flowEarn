"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { prepareContractCall, getContract, defineChain } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import toast, { Toaster } from "react-hot-toast";

import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagicCard } from "../ui/magic-card";
import { SparklesText } from "../ui/sparkles-text";

// ✅ Replace with your actual contract details
const CONTRACT_ADDRESS = "0xa6657D9E736dEF639906FB360Ca340d1d1eFA9db";
const FLOW_SEPOLIA_CHAIN_ID = 545;

export default function CreateBountyCard() {
  const { theme } = useTheme();
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleCreateBounty = async () => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!title || !desc || !reward || Number(reward) <= 0) {
      toast.error("Please fill in all fields correctly!");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Creating bounty on blockchain...");

    try {
      const contract = getContract({
        client,
        chain: defineChain(FLOW_SEPOLIA_CHAIN_ID),
        address: CONTRACT_ADDRESS,
      });

      const transaction = prepareContractCall({
        contract,
        method: "function createTask(string _title, string _desc, uint256 _reward)",
        params: [title, desc, BigInt(reward)],
      });

      const txResult = await sendTransaction(transaction);

      toast.dismiss(loadingToast);
      toast.success("🎉 Bounty created successfully!");
      setTxHash(txResult.transactionHash);

      setTitle("");
      setDesc("");
      setReward("");
    } catch (err) {
      console.error("❌ Error creating bounty:", err);
      toast.dismiss(loadingToast);
      toast.error("Transaction failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
          <Card className="border-none shadow-xl rounded-2xl bg-card/70 backdrop-blur-md">
            <MagicCard
              gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
              className="p-0 rounded-2xl"
            >
              {/* Header */}
              <CardHeader className="border-border border-b p-4">
                <CardTitle className="text-xl md:text-2xl font-bold">
                  <SparklesText>Create Bounty</SparklesText>
                </CardTitle>
                <CardDescription className="text-sm md:text-base mt-10">
                  Fill in the details below to publish your bounty on the blockchain.
                </CardDescription>
              </CardHeader>

              {/* Content */}
              <CardContent className="p-4 space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter bounty title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="desc">Description</Label>
                  <textarea
                    id="desc"
                    placeholder="Describe the bounty details"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reward">Reward (IN USDC)</Label>
                  <Input
                    id="reward"
                    type="number"
                    placeholder="Enter reward amount"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    min="0"
                  />
                </div>

                {/* Transaction hash display */}
                {txHash && (
                  <div className="mt-4 text-xs sm:text-sm bg-muted/50 p-3 rounded-md break-all">
                    <p className="font-medium text-foreground mb-1">Transaction Hash:</p>
                    <a
                      href={`https://flow-sepolia.blockscout.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline break-all"
                    >
                      {txHash}
                    </a>
                  </div>
                )}
              </CardContent>

              {/* Footer */}
              <CardFooter className="border-border border-t p-4">
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-all duration-200"
                  onClick={handleCreateBounty}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Bounty"}
                </Button>
              </CardFooter>
            </MagicCard>
          </Card>
        </div>
      </div>
    </>
  );
}
