"use client";
import Image from "next/image";

import Button from "../ui/Button";
import Container from "../layout/Container";
import { useUser } from "@/providers/UserProvider";
import Link from "next/link";

const Hero = () => {
  const { user } = useUser();

  return (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 opacity-30" />

      <Container className="text-center relative z-10">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary mr-2" />
          The future of communication is here
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight text-[#1F2329]">
          One Unified Platform for <br />
          <span className="text-gradient">Seamless Collaboration</span>
        </h1>

        <p className="text-lg md:text-xl text-[#646A73] mx-auto mb-12 leading-relaxed">
          Unify your city's traffic, energy, and emergency response into a
          single, AI-powered dashboard. Built for resilience, designed for
          citizens.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            href={user ? "/community/chat" : "/auth/register"}
            className="w-full sm:w-auto"
          >
            <Button size="lg" className="w-full">
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto flex items-center"
          >
            Watch Technical Demo
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        <div className="mt-16 flex items-center justify-center space-x-2 text-[#646A73]/70 text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
              >
                <Image
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt={`User ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <span>Trusted by 2,500+ Urban Planners worldwide</span>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
