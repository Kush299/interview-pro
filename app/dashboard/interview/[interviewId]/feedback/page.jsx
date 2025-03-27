"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Feedback({ params }) {
    const [interviewId, setInterviewId] = useState(null);
    const [feedbackList, setFeedbackList] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchParams() {
            const resolvedParams = await params;
            setInterviewId(resolvedParams.interviewId);
        }
        fetchParams();
    }, [params]);

    useEffect(() => {
        if (interviewId) {
            GetFeedback();
        }
    }, [interviewId]);

    const GetFeedback = async () => {
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, interviewId))
            .orderBy(UserAnswer.id);

        console.log(result);
        setFeedbackList(result);
    };

    const calculateOverallRating = () => {
        if (!feedbackList || feedbackList.length === 0) return 0;
        
        // Sum up all ratings (each out of 5)
        const totalPoints = feedbackList.reduce((sum, item) => {
            const rating = Number(item.rating) || 0;
            return sum + rating;
        }, 0);
        const scaledRating = Math.round(totalPoints * 0.4);
        
        return scaledRating;
    };

    return (
        <div className="p-10 mx-10 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg shadow-md">
            {feedbackList?.length === 0 ? (
                <h2 className="font-bold text-xl text-gray-500 dark:text-gray-400">
                    No Interview Feedback record found
                </h2>
            ) : (
                <>
                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
                        🎉 Congratulations!
                    </h2>
                    <h2 className="font-bold text-2xl">Here is your Interview Feedback</h2>
                    <h2 className="text-primary text-lg my-3">
                        Your overall Interview rating: <strong>{calculateOverallRating()}/5</strong>
                    </h2>
                    <h2 className="text-sm text-gray-500 dark:text-gray-400">
                        Below are the interview questions, correct answers, your responses, and feedback for improvement.
                    </h2>

                    {feedbackList.map((item, index) => (
                        <Collapsible key={index} className="mt-7">
                            <CollapsibleTrigger className="p-3 flex justify-between bg-gray-200 dark:bg-gray-800 rounded-lg my-2 text-left gap-7 w-full hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                                {item.question} 
                                <ChevronsUpDown className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="flex flex-col gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <h2 className="text-red-600 dark:text-red-400 p-2 border rounded-lg">
                                        <strong>Rating:</strong> {item.rating}
                                    </h2>
                                    <h2 className="p-2 border rounded-lg bg-red-100 dark:bg-red-900 text-sm text-red-900 dark:text-red-200">
                                        <strong>Your Answer: </strong> {item.userAns}
                                    </h2>
                                    <h2 className="p-2 border rounded-lg bg-green-100 dark:bg-green-900 text-sm text-green-900 dark:text-green-200">
                                        <strong>Correct Answer: </strong> {item.correctAns}
                                    </h2>
                                    <h2 className="p-2 border rounded-lg bg-blue-100 dark:bg-blue-900 text-sm text-primary dark:text-blue-300">
                                        <strong>Feedback: </strong> {item.feedback}
                                    </h2>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </>
            )}
            <Button 
                className="mt-5 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition-all"
                onClick={() => router.replace("/dashboard")}
            >
                Go Home
            </Button>
        </div>
    );
}

export default Feedback;
