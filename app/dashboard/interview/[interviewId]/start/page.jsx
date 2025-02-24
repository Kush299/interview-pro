"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function StartInterview({ params }) {
    const [interviewData, setInterviewData] = useState();
    const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
    const [activeQuestionIndex,setActiveQuestionIndex]=useState(0);

    useEffect(() => {
        const fetchParams = async () => {
            const resolvedParams = await params;
            GetInterviewDetails(resolvedParams.interviewId);
        };
        fetchParams();
    }, []);

    /** Used to get interview details by mockId */
    const GetInterviewDetails = async (interviewId) => {
        const result = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId));

        const jsonMockResp = JSON.parse(result[0].jsonMockResp);
        console.log("mock",jsonMockResp);
        setMockInterviewQuestion(jsonMockResp);
        setInterviewData(result[0]);
    };

    return (
        <div>
            <div className='grid grid-flow-col-1 md:grid-cols-2'>
                <QuestionsSection 
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                />
                <RecordAnswerSection
                    mockInterviewQuestion={mockInterviewQuestion}
                    activeQuestionIndex={activeQuestionIndex}
                    interviewData={interviewData}
                />
            </div>
            <div className='flex justify-end gap-5 mx-16'>
                {activeQuestionIndex > 0 && 
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex-1)}>
                        Previous Question
                    </Button>
                }
                {activeQuestionIndex !== mockInterviewQuestion?.questions?.length-1 && 
                    <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex+1)}>
                        Next Question
                    </Button>
                }
                {activeQuestionIndex === mockInterviewQuestion?.questions?.length-1 && 
                    <Link href={'/dashboard/interview/'+interviewData?.mockId+'/feedback'}>
                        <Button>End Interview</Button>
                    </Link>
                }
            </div>
        </div>
    );
}

export default StartInterview;
