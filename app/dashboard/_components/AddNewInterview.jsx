"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModel'
import { LoaderCircle } from 'lucide-react'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { db } from '@/utils/db'
import { useRouter } from 'next/navigation'

function AddNewInterview() {
    const [openDialog,setOpenDialog]=useState(false);
    const [jobPosition,setJobPosition]=useState();
    const [jobDesc,setJobDesc]=useState();
    const [jobExperience,setJobExperience]=useState();
    const [loading,setLoading]=useState(false);
    const [jsonResponse,setJsonResponse]=useState([]);
    const router=useRouter();
    const {user}=useUser();


    const onSubmit = async(e) => {
      setLoading(true)
      e.preventDefault()
      try {
        const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}. 
Please provide exactly ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in the following JSON format:
{
  "questions": [
    {
      "question": "question text here",
      "answer": "answer text here"
    }
  ]
}
Do not include any additional text, markdown formatting, or explanation before or after the JSON.`;
        const result = await chatSession.sendMessage(InputPrompt);
        const rawText = await result.response.text();
        
        // Debug the raw response
        console.log("Raw response:", rawText);
    
        // Clean and parse JSON more carefully
        let cleanJson;
        try {
          // First attempt: Try to find JSON between curly braces
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanJson = jsonMatch[0];
          } else {
            // Alternative cleanup if no clear JSON object is found
            cleanJson = rawText
              .replace(/```json\s*/g, '')
              .replace(/```\s*/g, '')
              .replace(/^\s+|\s+$/g, '');
          }
    
          // Debug the cleaned JSON
          console.log("Cleaned JSON:", cleanJson);
    
          const parsedJson = JSON.parse(cleanJson);
          console.log("Parsed JSON:", parsedJson);
          setJsonResponse(parsedJson);
    
          if (parsedJson) {
            const resp = await db.insert(MockInterview)
              .values({
                mockId: uuidv4(),
                jsonMockResp: cleanJson,
                jobPosition: jobPosition,
                jobDesc: jobDesc,
                jobExperience: jobExperience,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy')
              }).returning({mockId: MockInterview.mockId});
              
            console.log("Inserted ID:", resp)
            if (resp) {
              setOpenDialog(false);
              router.push('/dashboard/interview/'+resp[0]?.mockId)
            }
          }
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          console.log("Problematic JSON string:", cleanJson);
          throw new Error(`Failed to parse JSON: ${jsonError.message}`);
        }
      } catch (error) {
        console.error("Error processing response:", error);
        // Add user-friendly error message
        setError("Failed to generate interview questions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  return (
    <div>
      <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
      onClick={()=>setOpenDialog(true)}>
        <h2 className='font-bold text-lg text-center'>
            + Add New
        </h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl">Tell us more about your job</DialogTitle>
      
        <form onSubmit={onSubmit}>
        <div>
            <h2 className=''>Add details about your position/role, job description and years of experience</h2>
            <div className='mt-7 my-3 text-black font-bold'>
                <label>Job Role</label>
                <Input placeholder="Ex. Full Stack Developer" required
                onChange={(event)=>setJobPosition(event.target.value)}
                />
            </div>

            <div className='my-3 text-black font-bold'>
                <label>Job Description/ Tech Stack (in Brief)</label>
                <Textarea placeholder="Ex. React, Nodejs, Mysql etc" required
                onChange={(event)=>setJobDesc(event.target.value)}
                />
            </div>

            <div className='my-3 text-black font-bold'>
                <label>Years of Experience</label>
                <Input placeholder="Ex. 1" type="number"
                onChange={(event)=>setJobExperience(event.target.value)}
                />
            </div>
        </div>
        
        <div className='flex gap-5 justify-end'>
            <Button type="button" variant="ghost" onClick={()=>setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading?
              <>
              <LoaderCircle className='animate-spin'/>Generating from AI

              </>:'Start Interview'
              }
              </Button>
        </div>
        </form>
      
    </DialogHeader>
  </DialogContent>
</Dialog>

    </div>
  )
}

export default AddNewInterview