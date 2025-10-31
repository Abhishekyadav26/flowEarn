"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Highlighter } from "../ui/highlighter";
import { Map } from "./map";


function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["decentralized", "fast", "secure", "scalable", "sustainable"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8">
      <div className="container mx-auto flex flex-col items-center justify-center py-16 sm:py-24 md:py-40 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-3xl leading-tight">
          <span className="text-primary">
            <Highlighter action="underline" color="#FF9800">Earn</Highlighter> with
            </span>
          <span className="relative block h-16 sm:h-20 md:h-24 overflow-hidden mt-2">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute left-0 right-0 font-semibold text-primary"
                initial={{ opacity: 0, y: "-100%" }}
                animate={
                  titleNumber === index
                    ? { opacity: 1, y: "0%" }
                    : { opacity: 0, y: titleNumber > index ? "-100%" : "100%" }
                }
                transition={{ type: "spring", stiffness: 60 }}
              >
                {title}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mt-4 sm:mt-6 leading-relaxed">
          Start earning gigs from decentralized applications on{" "}
          <span className="font-semibold text-primary">
            <Highlighter action="underline" color="#FF9800">Flow</Highlighter>
            </span>. Fast,
          secure, and sustainable blockchain technology for everyone.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 w-full sm:w-auto items-center justify-center">
          <Link href="/createbounty" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-3" variant="outline">
              <Briefcase className="w-4 h-4" />
              Create Bounty
            </Button>
          </Link>

          <Link href="/bountylist" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-3" variant="outline">
              <CircleDollarSign className="w-4 h-4" />
              Browse Bounties
            </Button>
          </Link>
        </div>
      </div>
      {/* <HeroVideoDialogDemo /> */}
      <Map />
    </section>
  );
}

export { Hero };
