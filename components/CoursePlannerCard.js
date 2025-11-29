"use client";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/shadcn-io/3d-card";
import { FaBookOpen } from "react-icons/fa";
import Link from "next/link";

export default function CoursePlannerCard() {
  return (
    <Link href="/course-planner" className="block">
      <CardContainer className="inter-var cursor-pointer" containerClassName="py-8">
        <CardBody className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative group/card hover:shadow-2xl hover:shadow-blue-400/[0.2] border-gray-600 w-auto sm:w-[24rem] h-auto rounded-xl p-6 border-2 transition-all duration-300">
          <CardItem
            translateZ="50"
            className="text-2xl font-bold text-blue-300 mb-2 flex items-center gap-3"
          >
            <FaBookOpen className="text-blue-400" />
            Course Planner
          </CardItem>
          <CardItem
            as="p"
            translateZ="60"
            className="text-gray-300 text-base max-w-sm mt-2 mb-4"
          >
            Plan your courses, avoid time conflicts, and review sections easily.
          </CardItem>
          <CardItem translateZ="100" className="w-full mt-4">
            <img
              src="/routine.jpg"
              height="400"
              width="600"
              className="h-48 w-full object-cover rounded-xl group-hover/card:shadow-xl"
              alt="Course planning and study materials"
            />
          </CardItem>
          <CardItem translateZ={20} className="flex justify-center mt-6">
            <span className="text-blue-300 font-bold text-sm">
              Go to Planner →
            </span>
          </CardItem>
        </CardBody>
      </CardContainer>
    </Link>
  );
}