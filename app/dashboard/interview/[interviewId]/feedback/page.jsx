"use client"
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from "@/components/ui/collapsible"
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

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
    }

    const calculateOverallRating = () => {
        if (!feedbackList || feedbackList.length === 0) return 0;
        
        // Sum up all ratings (each out of 5)
        const totalPoints = feedbackList.reduce((sum, item) => {
            const rating = Number(item.rating) || 0;
            return sum + rating;
        }, 0);
        const scaledRating = Math.round(totalPoints * 0.4);
        
        return scaledRating;
    }

    return (
        <div className='p-10 mx-10'>
            {feedbackList?.length == 0 ?
                <h2 className='font-bold text-xl text-gray-500'>No Interview Feedback record found</h2>    
                :
                <>
                    <h2 className='text-3xl font-bold text-green-500'>Congratulations!</h2>
                    <h2 className='font-bold text-2xl'>Here is your Interview feedback</h2>
                    <h2 className='text-primary text-lg my-3'>Your overall Interview rating: <strong>{calculateOverallRating()}/5</strong></h2>
                    <h2 className='text-sm text-gray-500'>Find below interview question with correct answer, Your answer and feedback for improvement.</h2>
                    {feedbackList && feedbackList.map((item,index) => (
                        <Collapsible key={index} className='mt-7'>
                            <CollapsibleTrigger className='p-2 flex justify-between bg-secondary rounded-lg my-2 text-left gap-7 w-full'>
                                {item.question} <ChevronsUpDown className='h-5 w-5'/>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className='flex flex-col gap-2'>
                                    <h2 className='text-red-500 p-2 border rounded-lg'><strong>Rating:</strong>{item.rating}</h2>
                                    <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'><strong>Your Answer: </strong>{item.userAns}</h2>
                                    <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'><strong>Correct Answer: </strong>{item.correctAns}</h2>
                                    <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'><strong>Feedback: </strong>{item.feedback}</h2>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </>
            }
            <Button className="mt-5" onClick={() => router.replace('/dashboard')}>Go Home</Button>
        </div>
    );
}

export default Feedback;
