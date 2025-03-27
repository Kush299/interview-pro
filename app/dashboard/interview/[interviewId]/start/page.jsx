"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";

function StartInterview({ params }) {
    const [interviewData, setInterviewData] = useState(null);
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState(null);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [showEndingMessage, setShowEndingMessage] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [testEndedByViolation, setTestEndedByViolation] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchParams = async () => {
            const resolvedParams = await params;
            GetInterviewDetails(resolvedParams.interviewId);
        };

        fetchParams();
        setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);

        // Ensure fullscreen mode is active on mount
        enterFullScreen();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    /** Fetch interview details */
    const GetInterviewDetails = async (interviewId) => {
        const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId, interviewId));

        if (result.length > 0) {
            const jsonMockResp = JSON.parse(result[0].jsonMockResp);
            setMockInterviewQuestion(jsonMockResp);
            setInterviewData(result[0]);
        }
    };

    /** Handle tab change or fullscreen exit */
    const handleVisibilityChange = () => {
        if (document.hidden) {
            triggerWarning();
        }
    };

    const handleFullscreenChange = () => {
        // Block fullscreen exit if test is still running
        if (!document.fullscreenElement) {
            triggerWarning();
            enterFullScreen(); // Re-enter fullscreen to prevent exit
        }
    };

    /** Trigger a warning */
    const triggerWarning = () => {
        setWarningCount((prevCount) => {
            const newCount = prevCount + 1;
            setShowWarning(true);

            setTimeout(() => {
                setShowWarning(false);
                if (newCount >= 3) {
                    setTestEndedByViolation(true);
                    triggerTestEnding();
                }
            }, 3000);

            return newCount;
        });
    };

    /** Show "Test is Ending..." message and redirect based on reason */
    const triggerTestEnding = () => {
        setShowEndingMessage(true);
        setTimeout(() => {
            exitFullScreen();
            if (testEndedByViolation) {
                router.push("/dashboard");
            } else {
                router.push(`/dashboard/interview/${interviewData?.mockId}/feedback`);
            }
        }, 3000);
    };

    /** Exit fullscreen mode */
    const exitFullScreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    /** Force fullscreen mode */
    const enterFullScreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.log("Fullscreen failed:", err);
            });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6 relative">
            {/* Warning Messages */}
            {showWarning && warningCount < 3 && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
                    ⚠️ Warning {warningCount}/3: Do not switch tabs or exit fullscreen!
                </div>
            )}
            {showWarning && warningCount === 3 && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
                    ❌ You have exceeded the limit. Test is ending...
                </div>
            )}
            {showEndingMessage && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white text-xl font-bold px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
                    🚨 Test is Ending...
                </div>
            )}

            {/* Interview Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuestionsSection
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    isDarkMode={isDarkMode}
                />
                <RecordAnswerSection
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    interviewData={interviewData}
                />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                {activeQuestionIndex > 0 && (
                    <Button
                        className={`px-6 py-3 rounded-md shadow-md transition-all ${
                            isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-black hover:bg-gray-300"
                        }`}
                        onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                    >
                        Previous
                    </Button>
                )}
                {activeQuestionIndex !== mockInterviewQuestion?.questions?.length - 1 && (
                    <Button
                        className={`px-6 py-3 rounded-md shadow-md transition-all ${
                            isDarkMode ? "bg-blue-700 text-white hover:bg-blue-600" : "bg-blue-500 text-black hover:bg-blue-400"
                        }`}
                        onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                    >
                        Next
                    </Button>
                )}
                {activeQuestionIndex === mockInterviewQuestion?.questions?.length - 1 && (
                    <Button
                        className={`px-6 py-3 rounded-md shadow-md transition-all ${
                            isDarkMode ? "bg-green-700 text-white hover:bg-green-600" : "bg-green-500 text-black hover:bg-green-400"
                        }`}
                        onClick={() => {
                            setTestEndedByViolation(false);
                            triggerTestEnding();
                        }}
                    >
                        End Interview
                    </Button>
                )}
            </div>
        </div>
    );
}

export default StartInterview;
