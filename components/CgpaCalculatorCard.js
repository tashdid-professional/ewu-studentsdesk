"use client";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/shadcn-io/3d-card";
import { FaCalculator } from "react-icons/fa";
import Link from "next/link";

export default function CgpaCalculatorCard() {
  return (
    <Link href="/cgpa-calculator" className="block">
      <CardContainer className="inter-var cursor-pointer" containerClassName="py-8">
        <CardBody className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative group/card hover:shadow-2xl hover:shadow-purple-400/[0.2] border-gray-600 w-auto sm:w-[24rem] h-auto rounded-xl p-6 border-2 transition-all duration-300">
          <CardItem
            translateZ="50"
            className="text-2xl font-bold text-purple-300 mb-2 flex items-center gap-3"
          >
            <FaCalculator className="text-purple-400" />
            CGPA Calculator
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-gray-300 text-base max-w-sm mt-2 mb-4"
          >
            Calculate your term and total CGPA with ease and accuracy.
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4">
            <img
              src="/cg_calculator.jpg"
              height="400"
              width="600"
              className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
              alt="Calculator and academic grades"
            />
          </CardItem>
          <CardItem translateZ={20} className="flex justify-center mt-6">
            <span className="text-purple-300 font-bold text-sm">
              Calculate CGPA →
            </span>
          </CardItem>
        </CardBody>
      </CardContainer>
    </Link>
  );
}