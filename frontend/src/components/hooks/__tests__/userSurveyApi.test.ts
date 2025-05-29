import { renderHook, act } from "@testing-library/react";
import { useSurveyApi } from "../userSurveyApi";

// Mock fetch globally
global.fetch = jest.fn();

const fakeQuestions = [
  {
    _id: "1",
    question: "Test?",
    questionType: "Input",
    questionCategory: "Vocabulary",
    questionLevel: "Beginner",
  },
];

describe("useSurveyApi", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  test("fetchQuestions - success", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: fakeQuestions }),
    });

    const { result } = renderHook(() => useSurveyApi());

    await act(async () => {
      await result.current.fetchQuestions();
    });

    expect(result.current.questionsByLevel.Beginner).toHaveLength(1);
    expect(result.current.error).toBe("");
  });

  test("fetchQuestions - failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Fetch failed" }),
    });

    const { result } = renderHook(() => useSurveyApi());

    await act(async () => {
      await result.current.fetchQuestions();
    });

    expect(result.current.error).toBe("Fetch failed");
  });

  test("updateTabQuestions updates local state", () => {
    const { result } = renderHook(() => useSurveyApi());

    const newQuestion = {
      id: "123",
      question: "New?",
      questionType: "Input",
      questionCategory: "Grammar",
      questionLevel: "Beginner",
    };

    act(() => {
      result.current.updateTabQuestions("Beginner", [newQuestion]);
    });

    expect(result.current.questionsByLevel.Beginner[0]).toEqual(newQuestion);
  });

  test("deleteAllQuestions calls delete API", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useSurveyApi());

    const questions = [{ id: "1" }, { id: "2" }] as any;

    await act(async () => {
      await result.current.deleteAllQuestions(questions);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/questions"),
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  test("publishSurvey deletes old + posts new", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ _id: "old1" }, { _id: "old2" }] }),
      })
      .mockResolvedValue({ ok: true }) // deletes
      .mockResolvedValue({ ok: true }) // delete answers
      .mockResolvedValue({ ok: true }); // post new

    const { result } = renderHook(() => useSurveyApi());

    const newQuestions = [
      {
        id: "1",
        question: "New Q1",
        questionType: "Input",
        questionCategory: "Vocabulary",
        questionLevel: "Beginner",
      },
    ];

    await act(async () => {
      await result.current.publishSurvey(newQuestions);
    });

    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/questions"),
      expect.anything()
    );
  });
});
