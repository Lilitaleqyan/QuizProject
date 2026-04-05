import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, LayoutGrid, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getAllQuizzes } from "@/lib/storage";

export default function QuizLibrary() {
    const [quizzesList, setQuizzesList] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [lives, setLives] = useState(3)

    useEffect(() => {
        const loadData = async () => {
            const data = await getAllQuizzes();
            setQuizzesList(data);
        };
        loadData();
    }, []);

    const memoAnswers = useMemo(() => {
        if (!selectedQuiz || !selectedQuiz.question || !selectedQuiz.question[currentQuestionIndex]) {
            return [];
        }
        const currentQuestion = selectedQuiz.question[currentQuestionIndex];
        const allAnswers = [
            currentQuestion.correctAnswer,
            currentQuestion.wrongAnswer1,
            currentQuestion.wrongAnswer2,
            currentQuestion.wrongAnswer3
        ].filter(Boolean);
        return allAnswers.sort(() => Math.random() - 0.5);
    }, [currentQuestionIndex, selectedQuiz]);

    //select Quiz
    const startQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setCurrentQuestionIndex(0);
        setPlayerScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsCorrect(null)
        setLives(3);
    };


    //submit answer
    const answerClick = (answer) => {

        const currentQuestion = selectedQuiz.question[currentQuestionIndex];
        setSelectedAnswer(answer)
        let correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setPlayerScore(prev => prev + 1);
            setTimeout(() => {
            nextStep();
        }, 1000);
            

        }
        else {
            setLives(prev => {
                const newLives = prev - 1;
                if(newLives <= 0) {
                    setTimeout(() => setShowResult(true), 1000)
                }   
                else {
                    setTimeout(() => {
                    nextStep();
                }, 1000);
                }
                return newLives;
            });
         




    };}
           const nextStep = () => {
            const nextQuestion = currentQuestionIndex + 1;
            if (nextQuestion < selectedQuiz.question.length) {
                setCurrentQuestionIndex(nextQuestion);
                setSelectedAnswer(null)
                setIsCorrect(null)
            } else {
                setShowResult(true);
            }
        };


    //Result
    if (showResult) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center p-8 rounded-3xl shadow-2xl border-none">
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Ավարտվեց!</h2>
                    <p className="text-xl text-slate-600 mb-6">
                        Ձեր արդյունքը: <span className="font-bold text-indigo-600">{playerScore} / {selectedQuiz.question.length}</span>
                    </p>
                    <Button variant="ghost" onClick={() => {
                        setSelectedQuiz(null);
                        setShowResult(false);

                    }} className="mb-4">
                        Վերադառնալ
                    </Button>
                </Card>
            </div>
        );
    }

    // Game


    if (selectedQuiz) {
        const currentQuestion = selectedQuiz.question[currentQuestionIndex];


        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <Button variant="outline" onClick={() => setSelectedQuiz(null)} className="hover:bg-blue-600 ">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Հետ
                </Button>

                <Card className="rounded-3xl shadow-xl overflow-hidden border-none">
                    <CardHeader className="bg-indigo-600 text-white p-8">
                        <div className="flex justify-between mb-2 opacity-80 text-sm font-medium">
                            <span>Հարց {currentQuestionIndex + 1} / {selectedQuiz.question.length}</span>
                            <span className="text-xl"> {"❤️".repeat(lives)}</span>
                            <span>Միավոր: {playerScore}</span>
                        </div>
                        <CardTitle className="text-2xl leading-snug">{currentQuestion.content}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 gap-3">
                        {memoAnswers.map((answer, index) => {
                            let buttonClass = "border-2 rounded-2xl transition-all h-16 text-lg justify-start px-6 ";

                            if (selectedAnswer === answer) {
                                buttonClass += isCorrect
                                    ? "bg-green-600 border-green-200 text-black font-bold"
                                    : "bg-red-700 border-red-200 text-black font-bold ";
                            } else {
                                buttonClass += "hover:bg-blue-500 hover:border-indigo-500 bg-white text-slate-700";
                            }
                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={buttonClass}
                                    onClick={() => !selectedAnswer && answerClick(answer)}
                                    disabled={!!selectedAnswer}
                                >
                                    {answer}
                                </Button>
                            )
                        })
                        }
                    </CardContent>
                </Card>
            </div>

        );}


        // Quiz cards 
        return (
            <div className="max-w-7xl mx-auto p-8 space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-extrabold text-slate-900 flex items-center gap-3">
                        <LayoutGrid className="text-indigo-600" /> Քուիզներ
                    </h1>
                    <p className="text-slate-500 text-lg">Ընտրեք թեման և սկսեք խաղալ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quizzesList.map((quiz) => (
                        <Card key={quiz.id} className="group hover:shadow-2xl transition-all duration-300 border-none rounded-3xl overflow-hidden flex flex-col shadow-md">
                            <CardHeader className="bg-indigo-50 p-6">
                                <span className="px-3 py-1 rounded-full bg-white text-indigo-600 text-xs font-bold w-fit mb-4 shadow-sm">
                                    {quiz.level}
                                </span>
                                <CardTitle className="text-2xl font-bold text-slate-800">{quiz.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    <span>{quiz.topic}</span>
                                </div>
                                <p className="mt-2 text-slate-500 text-sm">Հարցերի քանակը: {quiz.question?.length || 0}</p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button
                                    onClick={() => startQuiz(quiz)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl text-lg font-semibold"
                                >
                                    Սկսել
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }