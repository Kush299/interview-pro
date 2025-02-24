"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Webcam from "react-webcam";

function Interview() {
    const params = useParams();
    const [interviewData, setInterviewData] = useState(null); // Initialize as null to prevent errors
    const [webCamEnabled, setWebCamEnabled] = useState(false); // Fixed spelling mistake
    const router=useRouter();
    useEffect(() => {
        console.log(params.interviewId);
        GetInterviewDetails();
    }, [params]);

    /** Used to get interview details by mockId */
    const GetInterviewDetails = async () => {
        const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, params.interviewId));

        setInterviewData(result.length > 0 ? result[0] : {}); // Ensure interviewData is always an object
    };

    return (
        <div className='my-10 mx-20'>
            <h2 className='font-bold text-2xl'>Let's Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            <div className="flex flex-col my-5 gap-5">
                <div className="flex flex-col p-5 rounded-lg border gap-5">
                <h2 className="text-lg"><strong>Job Role/Job Position: </strong>{interviewData?.jobPosition || "N/A"}</h2>
                <h2 className="text-lg"><strong>Job Description/Tech Stack: </strong>{interviewData?.jobDesc || "N/A"}</h2>
                <h2 className="text-lg"><strong>Years of Experience: </strong>{interviewData?.jobExperience || "N/A"}</h2>
                </div>
                <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
                    <h2 className="flex gap-2 items-center text-yellow-500"><Lightbulb/><strong>Information</strong></h2>
                    <h2 className="mt-3 text-yellow-500">{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                </div>
                
            </div>

            <div>
                {webCamEnabled ?
                    <Webcam
                        onUserMedia={() => setWebCamEnabled(true)}
                        onUserMediaError={() => setWebCamEnabled(false)}
                        mirrored={true}
                        style={{
                            height: 200,
                            width: 300
                        }}
                    />
                :
                    <>
                        <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
                        <Button variant="ghost" className="w-full" onClick={() => setWebCamEnabled(true)}>Click to Enable Web Cam and Microphone</Button>
                    </>
                }
            </div>
            

            </div>
            <div className="flex justify-end items-end">
                <Button  className="mx-5" onClick={()=>router.replace('/dashboard')}>Go Home</Button>
                <Link href={'/dashboard/interview/'+params.interviewId+'/start'}>
            <Button>Start Interview</Button>
            </Link>
            </div>

            
            
        </div>
    );
}

export default Interview;
