import { renderHook, act } from "@testing-library/react";
import * as api from "../../api/adminSurveyApi";
import { useAdminSurveyApi } from "../../hooks/useAdminSurveyApi";
import { Question } from "../../../types";

// full mock question data with all required fields
const mockQuestions: Question[] = [
  {
    _id: "1",
    question: "Q1",
    questionType: "Input",
    questionCategory: "Vocabulary",
    questionLevel: "Beginner",
  },
  {
    _id: "2",
    question: "Q2",
    questionType: "Input",
    questionCategory: "Grammar",
    questionLevel: "Intermediate",
  },
];

jest.mock("../../api/adminSurveyApi");

describe("useAdminSurveyApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches questions successfully", async () => {
    (api.fetchAllQuestions as jest.Mock).mockResolvedValueOnce(mockQuestions);

    const { result } = renderHook(() => useAdminSurveyApi());

    await act(async () => {
      await result.current.fetchQuestions();
    });

    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(api.fetchAllQuestions).toHaveBeenCalled();
  });

  test("handles fetch error", async () => {
    (api.fetchAllQuestions as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed")
    );

    const { result } = renderHook(() => useAdminSurveyApi());

    await act(async () => {
      await result.current.fetchQuestions();
    });

    expect(result.current.questions).toEqual([]);
    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.isLoading).toBe(false);
  });

  test("publishes survey by deleting, clearing, posting, and refetching", async () => {
    (api.fetchAllQuestions as jest.Mock).mockResolvedValue(mockQuestions);
    (api.deleteQuestions as jest.Mock).mockResolvedValue(undefined);
    (api.clearAllAnswers as jest.Mock).mockResolvedValue(undefined);
    (api.postSurveyQuestions as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAdminSurveyApi());

    // preload questions
    await act(async () => {
      await result.current.fetchQuestions();
    });

    const newSurvey: Question[] = [
      {
        _id: "3",
        question: "Q3",
        questionType: "Input",
        questionCategory: "Vocabulary",
        questionLevel: "Advanced",
      },
    ];

    await act(async () => {
      await result.current.publishSurvey(newSurvey);
    });

    expect(api.deleteQuestions).toHaveBeenCalledWith(["1", "2"]);
    expect(api.clearAllAnswers).toHaveBeenCalled();
    expect(api.postSurveyQuestions).toHaveBeenCalledWith(newSurvey);
    expect(api.fetchAllQuestions).toHaveBeenCalledTimes(2); // initial + after publish
  });

  test("deletes all questions and refetches", async () => {
    (api.deleteQuestions as jest.Mock).mockResolvedValue(undefined);
    (api.fetchAllQuestions as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAdminSurveyApi());

    const toDelete: Question[] = [
      {
        _id: "1",
        question: "Q1",
        questionType: "Input",
        questionCategory: "Vocabulary",
        questionLevel: "Beginner",
      },
      {
        _id: "2",
        question: "Q2",
        questionType: "Input",
        questionCategory: "Grammar",
        questionLevel: "Intermediate",
      },
    ];

    await act(async () => {
      await result.current.deleteAllQuestions(toDelete);
    });

    expect(api.deleteQuestions).toHaveBeenCalledWith(["1", "2"]);
    expect(api.fetchAllQuestions).toHaveBeenCalled();
  });

  test("handles publish error", async () => {
    (api.deleteQuestions as jest.Mock).mockRejectedValueOnce(
      new Error("Delete failed")
    );

    const { result } = renderHook(() => useAdminSurveyApi());

    await act(async () => {
      await result.current.publishSurvey([]);
    });

    expect(result.current.error).toBe("Delete failed");
    expect(result.current.isLoading).toBe(false);
  });
});
