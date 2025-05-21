import FormulaPuzzle from "@/components/formula-puzzle";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function Puzzle() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <FormulaPuzzle />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Physics Formula Puzzle</h1>
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-1" />
            <div>
              <h2 className="font-semibold mb-2">How to Play:</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>
                  Each card shows a physics formula and its scrambled name
                </li>
                <li>
                  Click on the letters in the correct order to form the formula
                  name
                </li>
                <li>Use the hint button (?) to see the formula description</li>
                <li>
                  If you make a mistake, use the Reset button to start over
                </li>
                <li>Complete all formulas to win the game!</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
