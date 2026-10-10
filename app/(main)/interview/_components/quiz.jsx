"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import useSpeech from "@/hooks/useSpeech";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    isSpeaking,
    isAutoPlayEnabled,
    setIsAutoPlayEnabled,
    isSupported,
    speakQuestion,
    stop,
  } = useSpeech();

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  // Auto read-aloud when question changes
  useEffect(() => {
    if (quizData && quizData[currentQuestion]) {
      if (isAutoPlayEnabled) {
        speakQuestion(currentQuestion + 1, quizData[currentQuestion]);
      }
    }
    return () => {
      stop();
    };
  }, [currentQuestion, quizData, isAutoPlayEnabled, speakQuestion, stop]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    stop();
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    stop();
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    stop();
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuizFn();
    setResultData(null);
  };

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ready to test your knowledge?</CardTitle>
          {isSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextState = !isAutoPlayEnabled;
                setIsAutoPlayEnabled(nextState);
                toast(
                  nextState
                    ? "Auto Read-Aloud enabled for quiz"
                    : "Auto Read-Aloud disabled"
                );
              }}
              className="h-8 text-xs gap-2"
            >
              <Volume2
                className={`h-3.5 w-3.5 ${
                  isAutoPlayEnabled ? "text-primary" : ""
                }`}
              />
              <span>Auto Read</span>
              <Badge
                variant={isAutoPlayEnabled ? "default" : "outline"}
                className="text-[10px] px-1.5 py-0 font-mono"
              >
                {isAutoPlayEnabled ? "ON" : "OFF"}
              </Badge>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CardTitle>
            Question {currentQuestion + 1} of {quizData.length}
          </CardTitle>

          {isSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isSpeaking) {
                  stop();
                } else {
                  speakQuestion(currentQuestion + 1, question);
                }
              }}
              title={
                isSpeaking
                  ? "Stop reading aloud"
                  : "Read question and options aloud"
              }
              className={`h-8 px-2.5 gap-1.5 transition-all ${
                isSpeaking
                  ? "border-primary text-primary bg-primary/10 animate-pulse ring-2 ring-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="text-xs">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="text-xs">Read Aloud</span>
                </>
              )}
            </Button>
          )}
        </div>

        {isSupported && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const nextState = !isAutoPlayEnabled;
              setIsAutoPlayEnabled(nextState);
              if (nextState) {
                toast.success("Auto Read-Aloud enabled");
                speakQuestion(currentQuestion + 1, question);
              } else {
                toast.info("Auto Read-Aloud disabled");
                stop();
              }
            }}
            className="h-8 text-xs gap-2 text-muted-foreground hover:text-foreground border border-border/40"
          >
            {isAutoPlayEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-primary" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" />
            )}
            <span>Auto Read</span>
            <Badge
              variant={isAutoPlayEnabled ? "default" : "outline"}
              className="text-[10px] px-1.5 py-0 font-mono"
            >
              {isAutoPlayEnabled ? "ON" : "OFF"}
            </Badge>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult && (
            <BarLoader className="mt-4" width={"100%"} color="gray" />
          )}
          {currentQuestion < quizData.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
