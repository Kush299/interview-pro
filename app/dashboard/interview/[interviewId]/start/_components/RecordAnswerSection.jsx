"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModel'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

function RecordAnswerSection({mockInterviewQuestion,activeQuestionIndex,interviewData}) {
    const [userAnswer,setUserAnswer]=useState('');
    const {user}=useUser();
    const [loading,setLoading]=useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
      } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
      });
      useEffect(()=>{
        results.map((result)=>{
            setUserAnswer(prevAns=>prevAns+result?.transcript)
        })
      },[results])

      useEffect(()=>{
        if(!isRecording&&userAnswer.length>10){
          UpdateUserAnswer();
        }
        
      },[userAnswer])

      const StartStopRecording=async()=>{
        if(isRecording){
          
          stopSpeechToText()
        }
        else{
          startSpeechToText();
        }

      }
      
      const UpdateUserAnswer = async () => {
        try {
            console.log("User Answer:", userAnswer);
            setLoading(true);
    
            const currentQuestion = mockInterviewQuestion?.questions[activeQuestionIndex];
            
            const feedbackPrompt = `Question: ${currentQuestion.question}, 
                User Answer: ${userAnswer},
                Please give a rating (1-5) and feedback for this interview answer in JSON format like:
                {
                    "rating": 3,
                    "feedback": "feedback text here"
                }`;
    
            const result = await chatSession.sendMessage(feedbackPrompt);
            // Fix: Await the text() Promise
            const rawText = await result.response.text();
            
            // Clean and parse the response
            const mockJsonResp = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("AI Response:", mockJsonResp);
            const JsonFeedbackResp = JSON.parse(mockJsonResp);
    
            const resp = await db.insert(UserAnswer)
                .values({
                    mockIdRef: interviewData?.mockId,
                    question: currentQuestion.question,
                    correctAns: currentQuestion.answer,
                    userAns: userAnswer,
                    feedback: JsonFeedbackResp.feedback,
                    rating: JsonFeedbackResp.rating,
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                });
    
            if (resp) {
                toast('User Answer recorded successfully');
                setUserAnswer('');
                setResults([]);
            }
        } catch (error) {
            console.error("Error updating user answer:", error);
            toast.error("Failed to save answer. Please try again.");
        } finally {
            setLoading(false);
            setResults([]);
        }
    };

  return (
    <div className='flex items-center justify-center flex-col'>
        <div className='flex flex-col mt-20 justify-center bg-black items-center rounded-lg p-5'>
            <Image src={'/camera.png'} width={200} height={200} alt='WebCam'
            className='absolute'/>
            <Webcam
            mirrored={true}
            style={{
                height:300,
                width:'100%',
                zIndex:10,
            }}
            />
    </div>
    <Button
    disabled={loading}
    variant="outline" className="my-10"
    onClick={StartStopRecording}>
        {isRecording?
        <h2 className='text-red-500 flex gap-2 animate-pulse items-center'>
            <StopCircle/>Stop Recording
        </h2>
        :
        <h2 className='text-primary flex gap-2 items-center'>
        <Mic/>Record Answer</h2>}</Button>

    </div>
  )
}

export default RecordAnswerSection
