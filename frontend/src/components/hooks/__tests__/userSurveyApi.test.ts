import { renderHook, act } from "@testing-library/react";
import * as api from "../../api/userSurveyApi";
import { useUserSurveyApi } from "../../hooks/useUserSurveyApi";

// mock data
const mockQuestions = [
  { _id: "1", question: "Q1", level: "Beginner" },
  { _id: "2", question: "Q2", level: "Beginner" },
];

// mock api methods
jest.mock("../../api/userSurveyApi");

describe("useUserSurveyApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches questions successfully on mount", async () => {
    (api.fetchQuestionsByLevel as jest.Mock).mockResolvedValueOnce(
      mockQuestions
    );

    const { result } = renderHook(() => useUserSurveyApi("Beginner"));

    // wait for useEffect to finish
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.questions).toEqual(mockQuestions);
    expect(api.fetchQuestionsByLevel).toHaveBeenCalledWith("Beginner");
  });

  test("handles fetch error", async () => {
    (api.fetchQuestionsByLevel as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed")
    );

    const { result } = renderHook(() => useUserSurveyApi("Beginner"));

    // wait for useEffect to finish
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.questions).toEqual([]);
  });

  test("submits all answers", async () => {
    const submitAnswerMock = api.submitAnswer as jest.Mock;
    submitAnswerMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUserSurveyApi("Beginner"));

    const mockAnswers = [
      { questionID: "1", answerText: "Answer 1" },
      { questionID: "2", answerText: "Answer 2" },
    ];

    await act(async () => {
      await result.current.submitAllAnswers(mockAnswers);
    });

    expect(submitAnswerMock).toHaveBeenCalledTimes(2);
    expect(submitAnswerMock).toHaveBeenCalledWith("1", "Answer 1");
    expect(submitAnswerMock).toHaveBeenCalledWith("2", "Answer 2");
  });
});
