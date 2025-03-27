"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";

function Interview() {
    const params = useParams();
    const router = useRouter();
    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnabled, setWebCamEnabled] = useState(false);
    const webcamRef = useRef(null);

    useEffect(() => {
        GetInterviewDetails();
    }, [params]);

    /** Fetch interview details */
    const GetInterviewDetails = async () => {
        const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId));

        setInterviewData(result.length > 0 ? result[0] : {});
    };

    /** Enable webcam */
    const enableWebcam = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setWebCamEnabled(true);
        } catch (error) {
            console.error("Webcam access denied:", error);
            setWebCamEnabled(false);
        }
    };

    /** Enable fullscreen mode */
    const enterFullScreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    return (
        <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-black dark:text-white">
            <h2 className="font-bold text-2xl text-center mb-6">Let's Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Job Details Section */}
                <div className="flex flex-col gap-5">
                    <div className="p-5 rounded-lg border shadow-md dark:border-gray-700">
                        <h2 className="text-lg"><strong>Job Role: </strong>{interviewData?.jobPosition || "N/A"}</h2>
                        <h2 className="text-lg"><strong>Tech Stack: </strong>{interviewData?.jobDesc || "N/A"}</h2>
                        <h2 className="text-lg"><strong>Experience: </strong>{interviewData?.jobExperience || "N/A"}</h2>
                    </div>

                    {/* Information Box */}
                    <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100 dark:bg-yellow-900">
                        <h2 className="flex gap-2 items-center text-yellow-600 dark:text-yellow-300">
                            <Lightbulb />
                            <strong>Information</strong>
                        </h2>
                        <h2 className="mt-3 text-yellow-600 dark:text-yellow-300">
                            {process.env.NEXT_PUBLIC_INFORMATION}
                        </h2>
                    </div>
                </div>

                {/* Webcam Section */}
                <div className="relative flex flex-col items-center border rounded-lg shadow-md dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4">
                    {webCamEnabled ? (
                        <Webcam ref={webcamRef} mirrored={true} className="rounded-lg w-full h-auto" />
                    ) : (
                        <WebcamIcon className="h-40 w-40 text-gray-400 dark:text-gray-600" />
                    )}
                    
                    {/* Webcam Button */}
                    <Button 
                        onClick={enableWebcam} 
                        className={`mt-4 w-full ${webCamEnabled ? "bg-green-600 dark:bg-green-500 cursor-default" : "bg-blue-600 dark:bg-blue-500"}`}
                        disabled={webCamEnabled}
                    >
                        {webCamEnabled ? "Webcam Enabled ✅" : "Enable Webcam & Audio"}
                    </Button>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-6">
                <Button className="mr-4 bg-blue-600 dark:bg-blue-500 text-white" onClick={() => router.replace('/dashboard')}>Go Home</Button>
                <Link href={`/dashboard/interview/${params.interviewId}/start`}>
                    <Button onClick={enterFullScreen} className="bg-blue-600 dark:bg-blue-500 text-white">
                        Start Interview
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default Interview;
