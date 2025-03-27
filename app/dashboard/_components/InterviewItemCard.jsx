import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

function InterviewItemCard({ interview }) {
  const router = useRouter();

  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };

  const onFeedback = () => {
    router.push("/dashboard/interview/" + interview?.mockId + "/feedback");
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-4 transition-all hover:shadow-lg bg-white dark:bg-gray-800">
      <h2 className="font-semibold text-lg text-primary dark:text-blue-400">
        {interview?.jobPosition}
      </h2>
      <h3 className="text-sm text-gray-600 dark:text-gray-300">
        Experience: {interview?.jobExperience} years
      </h3>
      <h4 className="text-xs text-gray-500 dark:text-gray-400">
        Created At: {interview.createdAt}
      </h4>
      <div className="flex justify-between mt-4 gap-3">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onFeedback} 
          className="w-full transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Feedback
        </Button>
        
        <Button 
          size="sm" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
          onClick={onStart}
        >
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
