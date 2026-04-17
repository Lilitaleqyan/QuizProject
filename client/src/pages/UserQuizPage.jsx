import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, LayoutGrid, ArrowLeft, LogOut, VolumeX, Volume2 } from "lucide-react";
import { getAllQuizzes } from "@/lib/storage";
import { changeScore, getAllPlayers } from "../lib/storage";
import { useToast } from "@/hooks/use-toast";
import { logout } from "../lib/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function UserQuizPage() {
    const [, setLocation] = useLocation();
    const [quizzesList, setQuizzesList] = useState([]);
    const [playersList, setPlayersList] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [selectedAnswer, startwer] = useState(null);
    const [lives, setLives] = useState(3);
    const { toast } = useToast();
    const audioRef = useRef(null);
    const correctAudioRef = useRef(null);
    const wrongAudioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [player, setPlayer] = useState({ id: 0, userName: "", musicEnabled: true });

    useEffect(() => {
        console.log("Current Players List:", playersList);
    }, [playersList]);
    useEffect(() => {

        const loadData = async () => {
            const data = await getAllQuizzes();
            const playersData = await getAllPlayers();
            setQuizzesList(data);
            setPlayersList(playersData);
            const savedUser = localStorage.getItem("library_current_user");
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                const currentData = playersData?.find(p => p.id === parsedUser.id);
                setPlayer(currentData || parsedUser);
            }
        };

        loadData();

    }, []);

    const currentPlayer = useMemo(() => {
        return playersList?.find(p => p.id === player.id) || player;
    }, [playersList, player.id]);
    const sortedQuizzes = useMemo(() => {
        const levelOrder = { "BEGINNER": 1, "INTERMEDIATE": 2, "ADVANCED": 3 };
        return [...quizzesList].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
    }, [quizzesList]);

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


    const levelStatus = useMemo(() => {
        const currentPlayer = playersList?.find(p => p.id === player.id);
        const results = currentPlayer?.quizScoreResultList || [];

        const isLevelPassed = (levelName) => {
            const levelQuizzes = quizzesList.filter(q => q.level === levelName);
            if (levelQuizzes.length === 0) return false;
            return levelQuizzes.every(quiz => {
                const result = results.find(r => r.quiz === quiz.title);
                return result && (result.bestScore / 10) >= 0.8;
            });
        };

        const beginnerPassed = isLevelPassed("BEGINNER");
        const intermediatePassed = isLevelPassed("INTERMEDIATE");

        return {
            BEGINNER: true,
            INTERMEDIATE: beginnerPassed,
            ADVANCED: beginnerPassed && intermediatePassed
        };
    }, [player.id, playersList, quizzesList]);

    const startQuiz = (quiz) => {
        console.log("AudioRef current:", audioRef.current);

        setSelectedQuiz(quiz);
        setCurrentQuestionIndex(0);
        setPlayerScore(0);
        setShowResult(false);
        startwer(null);
        setIsCorrect(null);
        setLives(3);

    }

    const answerClick = (answer) => {
        const currentQuestion = selectedQuiz.question[currentQuestionIndex];
        startwer(answer);
        let correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            correctAudioRef.current?.play();
            if (selectedQuiz.level === "BEGINNER") {
                currentPlayer.current?.play()
                setPlayerScore(prev => prev + 1);
            }
            else if (selectedQuiz.level === "INTERMEDIATE") {
                setPlayerScore(prev => prev + 2);
            } else {
                setPlayerScore(prev => prev + 3);
            }
            setTimeout(() => nextStep(), 1000);
        } else {
            wrongAudioRef.current?.play()
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) setTimeout(() => setShowResult(true), 1000);
                else setTimeout(() => nextStep(), 1000);
                return newLives;
            });
        }
    };

    const nextStep = () => {
        const nextQuestion = currentQuestionIndex + 1;
        if (nextQuestion < 10) {
            setCurrentQuestionIndex(nextQuestion);
            startwer(null);
            setIsCorrect(null);
        } else {
            setShowResult(true);
        }
    };

    const prevStep = () => {
        const prevQuestion = currentQuestionIndex - 1;
        if (prevQuestion > 0) {
            setCurrentQuestionIndex(prevQuestion);
            startwer(null)
            setIsCorrect(null)
        }

    }

    const HandleChangeScore = async () => {
        setShowResult(false);
        const savedUser = JSON.parse(localStorage.getItem("library_current_user"));

        try {
            const updatedUser = await changeScore({
                id: savedUser.id,
                userName: savedUser.userName,
                score: playerScore,
                quizScoreResultList: savedUser.quizScoreResultList
            }, selectedQuiz.id);
            if (updatedUser) {
                localStorage.setItem("library_current_user", JSON.stringify(updatedUser));
                setPlayer(updatedUser)
                const playersData = await getAllPlayers();
                setPlayersList(playersData);
                setSelectedQuiz(null)
                toast({ title: "Միավորները թարմացվեցին" });
            }

        } catch (err) {
            toast({ title: "Միավորը չպահպանվեց", variant: "destructive" });
        }
    };

    const logOut = async () => {
        try {
            await logout();
            setLocation("/login");
            window.location.reload();
        } catch (err) {
            setLocation("/login");
        }
    };
    const toggleMusic = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.play().catch(e => console.log("Error playing:", e));
                audioRef.current.volume = 0.5;
            } else {
                audioRef.current.pause();
            }
            setIsMuted(!isMuted);
        }
    };
    return (
        <>
            <audio ref={audioRef} src="/bgMusic.mp3" loop />
            <audio ref={correctAudioRef} src="/right.mp3" />
            <audio ref={wrongAudioRef} src="/wrong.mp3" />

            {showResult ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full text-center p-8 rounded-3xl shadow-2xl border-none">
                        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />

                        <h2 className="text-3xl font-bold mb-2">Ավարտվեց!</h2>

                        <p className="text-xl text-slate-600 mb-6">
                            Ձեր արդյունքը:{" "}
                            <span className="font-bold text-indigo-600">
                                {playerScore} / {10}
                            </span>
                        </p>

                        <Button
                            onClick={HandleChangeScore}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
                        >
                            Վերադառնալ
                        </Button>
                    </Card>
                </div>

            ) : selectedQuiz ? (
                <div className="max-w-7xl mx-auto p-8 space-y-6">
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                }
                                setSelectedQuiz(null);
                                setShowResult(false);
                            }}
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" /> Հետ
                        </Button>

                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-xl ${i < lives ? "opacity-100" : "opacity-20 grayscale"
                                        }`}
                                >
                                    ❤️
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* QUIZ CARD */}
                    <Card className="rounded-3xl shadow-2xl border-none bg-white">
                        <CardHeader className="bg-indigo-600 text-white p-8">
                            <div className="flex justify-between mb-4 text-sm">
                                <span>
                                    Հարց {currentQuestionIndex + 1} /{" "}
                                    {10}
                                </span>
                                <span>Միավոր: {playerScore}</span>
                            </div>

                            <CardTitle className="text-xl">
                                {selectedQuiz.question[currentQuestionIndex].content}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 space-y-4">
                            {memoAnswers.map((answer, index) => {
                                const currentQuestion =
                                    selectedQuiz.question[currentQuestionIndex];

                                const isThisSelected = selectedAnswer === answer;
                                const isCorrectAnswer =
                                    answer === currentQuestion.correctAnswer;

                                let style = "border p-4 rounded-xl w-full text-left ";

                                if (selectedAnswer) {
                                    if (isCorrectAnswer) {
                                        style += "bg-green-500 text-white";
                                    } else if (isThisSelected) {
                                        style += "bg-red-500 text-white";
                                    } else {
                                        style += "opacity-50";
                                    }
                                } else {
                                    style += "hover:bg-gray-100";
                                }

                                return (
                                    <button
                                        key={index}
                                        className={style}
                                        disabled={!!selectedAnswer}
                                        onClick={() => answerClick(answer)}
                                    >
                                        {String.fromCharCode(65 + index)}. {answer}
                                    </button>
                                );
                            })}
                        </CardContent>
                        <div className="flex justify-between pt-6 mt-4 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentQuestionIndex === 0 || !!selectedAnswer}
                                className="rounded-xl px-6 bg-slate-50 hover:bg-gray-500"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Նախորդ
                            </Button>

                            <Button
                                variant="outline"
                                onClick={nextStep}
                                className="rounded-xl px-6 bg-slate-50 hover:bg-gray-500"
                            >
                                Հաջորդ <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>

            ) : (
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Քուիզներ</h1>

                        <div className="flex gap-8 ">

                            <div className="flex items-center gap-2 bg-yellow-50 px-4  rounded-xl">
                                <span className="text-lg">🏆</span>
                                <span className="font-bold text-slate-800">{player.score}</span>
                            </div>
                            <Button onClick={toggleMusic}>
                                {isMuted ? <VolumeX /> : <Volume2 />}
                            </Button>

                            <Button onClick={logOut}>
                                <LogOut className="h-4 w-4 mr-2" /> Դուրս գալ
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {sortedQuizzes.map((quiz) => {
                            const isLocked = !levelStatus[quiz.level];

                            const quizResult = currentPlayer?.quizScoreResultList?.find(
                                r => r.quiz === quiz.title
                            );

                            const bestScore = quizResult ? quizResult.bestScore : 0;

                            const scorePerQ =
                                quiz.level === "BEGINNER" ? 1 :
                                    quiz.level === "INTERMEDIATE" ? 2 : 3;

                            const maxScore = (10 || 0) * scorePerQ;

                            return (
                                <div
                                    key={quiz.id}
                                    className={`rounded-3xl shadow-md overflow-hidden transition-all 
        ${isLocked ? "opacity-70 grayscale" : "hover:shadow-xl"}`}
                                >
                                    {/* HEADER */}
                                    <div className="bg-indigo-100 p-5 relative">
                                        <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-indigo-600">
                                            {quiz.level}
                                        </span>

                                        <h2 className="text-xl font-bold mt-3 text-slate-800">
                                            {quiz.title}
                                        </h2>
                                    </div>

                                    {/* BODY */}
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            🏆 <span>{quiz.topic}</span>
                                        </div>

                                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-semibold w-fit">
                                            ✔ Լավագույնը: {bestScore} / {maxScore}
                                        </div>
                                    </div>

                                    {/* FOOTER */}
                                    <div className="p-5 pt-0">
                                        <button
                                            disabled={isLocked}
                                            onClick={() => startQuiz(quiz)}
                                            className={`w-full py-3 rounded-xl font-semibold text-white transition
              ${isLocked
                                                    ? "bg-gray-300 cursor-not-allowed"
                                                    : "bg-indigo-600 hover:bg-indigo-700"}
            `}
                                        >
                                            {isLocked ? "Կողպված է" : "Սկսել"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}