"use client";

import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      GetInterviewList();
    }
  }, [user]);

  const GetInterviewList = async () => {
    setLoading(true);
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(MockInterview.id));

      setInterviewList(result);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mockId) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      await db.delete(MockInterview).where(eq(MockInterview.mockId, mockId));

      // Optimistically update UI
      setInterviewList((prev) => prev.filter((item) => item.mockId !== mockId));

      toast.success("Interview deleted successfully.");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview.");
    }
  };

  return (
    <div>
      <h2 className="font-bold text-xl">Previous Mock Interviews</h2>
      
      {loading ? (
        <p className="text-gray-500 mt-3">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-4">
          {interviewList.length > 0 ? (
            interviewList.map((interview, index) => (
              <div key={index} className="relative">
                <InterviewItemCard interview={interview} />

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  className="absolute top-2 right-2 text-red-600 hover:bg-red-100"
                  onClick={() => handleDelete(interview.mockId)}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No interviews found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default InterviewList;
