"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModel";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { db } from "@/utils/db";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useUser();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error before starting

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

      console.log("Raw response:", rawText);

      // Extract JSON safely
      let cleanJson;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        cleanJson = jsonMatch ? jsonMatch[0] : rawText.replace(/```json\s*|\s*```/g, "").trim();

        console.log("Cleaned JSON:", cleanJson);
        const parsedJson = JSON.parse(cleanJson);
        console.log("Parsed JSON:", parsedJson);

        if (parsedJson) {
          const resp = await db.insert(MockInterview)
            .values({
              mockId: uuidv4(),
              jsonMockResp: cleanJson,
              jobPosition: jobPosition,
              jobDesc: jobDesc,
              jobExperience: jobExperience,
              createdBy: user?.primaryEmailAddress?.emailAddress,
              createdAt: moment().format("DD-MM-yyyy"),
            })
            .returning({ mockId: MockInterview.mockId });

          console.log("Inserted ID:", resp);
          if (resp) {
            setOpenDialog(false);
            router.push(`/dashboard/interview/${resp[0]?.mockId}`);
          }
        }
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        setError("Failed to generate interview questions. Please try again.");
      }
    } catch (error) {
      console.error("Error processing response:", error);
      setError("Something went wrong. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Card to Open Dialog */}
      <div
        className="p-6 border rounded-lg bg-gray-100 dark:bg-gray-800 hover:scale-105 hover:shadow-lg cursor-pointer transition-all text-center"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="font-bold text-lg text-black dark:text-white">+ Add New Interview</h2>
      </div>

      {/* Dialog for Adding Interview */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Tell us more about your job</DialogTitle>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Job Role Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold">Job Role</label>
                <Input
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary text-black dark:text-white"
                  placeholder="Ex. Full Stack Developer"
                  required
                  value={jobPosition}
                  onChange={(event) => setJobPosition(event.target.value)}
                />
              </div>

              {/* Job Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold">Job Description / Tech Stack</label>
                <Textarea
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary text-black dark:text-white"
                  placeholder="Ex. React, Node.js, MySQL, etc."
                  required
                  value={jobDesc}
                  onChange={(event) => setJobDesc(event.target.value)}
                />
              </div>

              {/* Years of Experience Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold">Years of Experience</label>
                <Input
                  className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary text-black dark:text-white"
                  placeholder="Ex. 1"
                  type="number"
                  required
                  value={jobExperience}
                  onChange={(event) => setJobExperience(event.target.value)}
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 transition-all flex items-center gap-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Generating AI Questions...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
