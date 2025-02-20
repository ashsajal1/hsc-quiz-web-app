import { useCQStore } from "@/store/useCqStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Practice() {
  const {
    topics,
    chapters,
    selectedSubject,
    selectedChapter,
    filteredQuestions,
    setSubject,
    setChapter,
  } = useCQStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Practice Questions</h1>

      <div className="flex items-center gap-2">
        {/* Subject Selection using shadcn UI */}
        <div className="mb-6">
          <label
            htmlFor="subject-select"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Select Subject:
          </label>
          <Select
            value={selectedSubject}
            onValueChange={(value) => setSubject(value)}
          >
            <SelectTrigger id="subject-select" className="w-full">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chapter Selection using shadcn UI */}
        <div className="mb-6">
          <label
            htmlFor="chapter-select"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Select Chapter:
          </label>
          <Select
            value={selectedChapter}
            onValueChange={(value) => setChapter(value)}
          >
            <SelectTrigger id="chapter-select" className="w-full">
              <SelectValue placeholder="Select a chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter} value={chapter}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Display Practice Questions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="mb-4 border border-gray-300 p-4 rounded-md"
            >
              <p className="font-bold">{q.question}</p>
              <p>{q.answer}</p>
            </div>
          ))
        ) : (
          <p>No questions available for this selection.</p>
        )}
      </div>
    </div>
  );
}
