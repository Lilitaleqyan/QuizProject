import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, HelpCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addQuiz, updateQuiz, getAllQuizzes, deleteQuiz, getAllPlayers, deleteQuestion } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { logout } from "../lib/auth";

const createEmptyQuestion = () => ({
    content: "",
    optionAnswerSet: Array.from({ length: 4 }, () => ({
        text: "",
        correct: false
    }))
});
const initialState = {
    title: "",
    level: "BEGINNER",
    topic: "JAVA_CORE",
    question: [createEmptyQuestion()]

};
export default function AdminPage() {
    const [, setLocation] = useLocation();
    const [quizzesList, setQuizzesList] = useState([]);
    const [playersList, setPlayersList] = useState([])
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null)
    const { toast } = useToast();



    const PROGRAMMING_TOPICS = [
        { value: "JAVA_CORE", label: "Java Core", color: "bg-orange-100 text-orange-700 border-orange-200" },
        { value: "SPRING_BOOT", label: "Spring Boot", color: "bg-green-100 text-green-700 border-green-200" },
        { value: "KAFKA", label: "Apache Kafka", color: "bg-purple-100 text-purple-700 border-purple-200" },
        { value: "DATABASE", label: "SQL & Databases", color: "bg-blue-100 text-blue-700 border-blue-200" },
        { value: "REACT_FRONTEND", label: "React & UI", color: "bg-cyan-100 text-cyan-700 border-cyan-200" }
    ];

    const resetQuiz = () => {
        setEditingQuiz(null)
        setQuiz(initialState)
        setIsQuizOpen(true)

    }

    const loadQuizzes = async () => {
        const data = await getAllQuizzes();
        setQuizzesList(data);
    };
    const loadPlayers = async () => {
        const data = await getAllPlayers();
        setPlayersList(data);
    }

    useEffect(() => {
        loadQuizzes();
        loadPlayers()
    }, []);


    const [quiz, setQuiz] = useState(initialState);

    const handleInputChange = (field, value) => {
        setQuiz(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionDetailChange = (index, field, value) => {
        const updateQuestions = [...quiz.question];
        updateQuestions[index] = { ...updateQuestions[index], [field]: value };

        setQuiz(prev => ({
            ...prev,
            question: updateQuestions


        }));
    };

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const updated = [...quiz.question];

        const options = [...updated[qIndex].optionAnswerSet];

        options[oIndex] = {
            ...options[oIndex],
            [field]: value
        };

        updated[qIndex] = {
            ...updated[qIndex],
            optionAnswerSet: options
        };

        setQuiz(prev => ({
            ...prev,
            question: updated
        }));
    };
    
    const handleCorrectChange = (qIndex, oIndex) => {
        const updated = [...quiz.question];

        updated[qIndex].optionAnswerSet = updated[qIndex].optionAnswerSet.map(
            (opt, i) => ({
                ...opt,
                correct: i === oIndex
            })
        );

        setQuiz(prev => ({
            ...prev,
            question: updated
        }));
    };



    const addQuestionField = () => {
        setQuiz(prev => ({
            ...prev,
            question: [...prev.question, createEmptyQuestion()]
        }));
    };

    const removeQuestionField = async (index) => {
        if (!window.confirm("Վստահ եք, որ ուզում եք ջնջել այս հարցը՞")) return;

        const questionToRemove = quiz.question[index];

        try {   
            if (questionToRemove.id) {
                await deleteQuestion(questionToRemove.id);
            }

            const updatedQuestions = quiz.question.filter((_, i) => i !== index);

            const updatedQuiz = {
                ...quiz,
                question: updatedQuestions
            };

            setQuiz(updatedQuiz);

            toast({
                title: "Ջնջված է",
                description: "Հարցը հաջողությամբ հեռացվեց"
            });

        } catch (err) {
            toast({
                title: "Սխալ",
                description: "Չհաջողվեց ջնջել",
                variant: "destructive"
            });
        }
    };


    const addQuizes = async (e) => {
        if (e) e.preventDefault();
        const quizPayload = {
            title: quiz.title,
            level: quiz.level,
            topic: quiz.topic,
            question: quiz.question

        };

        try {
            if (editingQuiz) {
                await updateQuiz(quizPayload, editingQuiz.id)
                toast({
                    title: "Quiz-ը թարմացվել է",
                    description: "Quiz-ը հաջողությամբ թարմացվել է"
                })
            }
            else {
                await addQuiz(quizPayload);
                toast({
                    title: "Quiz ավելացվել է",
                    description: "Նոր Quiz-ը հաջողությամբ պահպանվեց",
                });
            }
            setIsQuizOpen(false);
            setEditingQuiz(null)
            setQuiz(initialState);
            await loadQuizzes()

        } catch (error) {

            toast({
                title: "Սխալ",
                description: "Չհաջողվեց պահպանել քուիզը",
                variant: "destructive",
            });
        }
    };
    const updateQuizes = async (quiz) => {
        setEditingQuiz(quiz)
        setQuiz(
            {
                title: quiz.title,
                level: quiz.level,
                topic: quiz.topic,
                question: quiz.question
            });
        setIsQuizOpen(true)
    }
    
    const deleteQuizzes = async (id) => {
        if (window.confirm("Վստահ եք որ ուզում եք ջնջել այս քուիզը")) {
            try {
                await deleteQuiz(id);
                toast({
                    title: "Ջնջված է",
                    description: "Քուիզը հաջողությամբ հեռացվեց"
                });
                await loadQuizzes();


            } catch (error) {
                toast({
                    title: "Սխալ",
                    description: "Չհաջողվեց ջնջել",
                    variant: "destructive"
                });
            }
        }
    }   

    const logOut = async (e) => {
        try {
            await logout()
            setLocation("/login")
            window.location.reload();
            toast({
                description: "Դուք հաջողությամբ դուրս եք եկել"
            })

        }
        catch (err) {
            await logout()
            setLocation("/login")
            toast({
                title: "Ձախողվեց",
                variant: "destructive"
            })
        }
    }


    return (


        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 md:p-10 font-sans">

            <Card className="w-full max-w-6xl shadow-2xl border-none rounded-3xl overflow-hidden bg-white">

                <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-8 flex flex-row items-center justify-between border-b border-white/10">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Ադմինի էջ</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={logOut}
                        className="text-white/80 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-xl"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Դուրս գալ
                    </Button>
                </CardHeader>

                <CardContent className="p-6">
                    <Tabs defaultValue="quizzes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="quizzes">Քուիզների Կառավարում</TabsTrigger>
                            <TabsTrigger value="players">Օգտատերերի Պրոգրես</TabsTrigger>
                        </TabsList>

                        <TabsContent value="quizzes" className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-slate-800">Առկա Քուիզներ</h3>
                                <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={resetQuiz}>
                                        <Plus className="w-5 h-5 mr-2" /> Ավելացնել Քուիզ
                                    </Button>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                                {editingQuiz ? "Խմբագրել" : "Ավելացնել"} Քուիզ
                                                <HelpCircle className="text-indigo-500" />
                                            </DialogTitle>
                                            <DialogDescription>Լրացրեք քուիզի տվյալները ստորև</DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={addQuizes} className="space-y-6 mt-4">
                                            <div className="space-y-2">
                                                <Label>Քուիզի անվանումը</Label>
                                                <Input
                                                    value={quiz.title}
                                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Բարդություն</Label>
                                                    <Select value={quiz.level} onValueChange={(val) => handleInputChange("level", val)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="BEGINNER">Սկսնակ</SelectItem>
                                                            <SelectItem value="INTERMEDIATE">Միջին</SelectItem>
                                                            <SelectItem value="ADVANCED">Պրոֆեսիոնալ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Թեմա</Label>
                                                    <Select value={quiz.topic} onValueChange={(val) => handleInputChange("topic", val)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {PROGRAMMING_TOPICS.map(t => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-4 border-t pt-4">
                                                    <div className="flex justify-between items-center">
                                                        <Label className="text-lg font-bold">Հարցեր</Label>
                                                        <Button type="button" variant="outline" size="sm" onClick={addQuestionField}>
                                                            <Plus className="w-4 h-4 mr-1" /> Ավելացնել Հարց
                                                        </Button>
                                                    </div>

                                                    {quiz.question.map((q, index) => (
                                                        <div key={index} className="p-4 border rounded-xl bg-slate-50 space-y-3 relative">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm font-medium text-slate-500">Հարց {index + 1}</span>
                                                                {quiz.question.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        className="text-red-500 h-6 w-6 p-0"
                                                                        onClick={() => removeQuestionField(index)}
                                                                    >
                                                                        ✕
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Հարցի բովանդակությունը</Label>
                                                                <Textarea
                                                                    placeholder="Գրեք հարցը..."
                                                                    value={q.content}
                                                                    onChange={(e) => handleQuestionDetailChange(index, "content", e.target.value)}
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Պատասխաններ</Label>

                                                                {q.optionAnswerSet.map((opt, oIndex) => (
                                                                    <div key={oIndex} className="flex items-center gap-2">

                                                                        <Input
                                                                            placeholder="Պատասխան"
                                                                            value={opt.text}
                                                                            onChange={(e) =>
                                                                                handleOptionChange(index, oIndex, "text", e.target.value)
                                                                            }
                                                                        />

                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${index}`}
                                                                            checked={opt.correct}
                                                                            onChange={() => handleCorrectChange(index, oIndex)}
                                                                        />

                                                                    </div>
                                                                ))}
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div></div>

                                            <Button type="submit" className="w-full bg-indigo-600">Պահպանել</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Վերնագիր</TableHead>
                                            <TableHead>Բարդություն</TableHead>
                                            <TableHead className="text-right">Գործողություններ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quizzesList.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                                <TableCell className="font-medium text-slate-700">{item.title}</TableCell>
                                                <TableCell>
                                                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                                                        {item.level}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => updateQuizes(item)}>Խմբագրել</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => deleteQuizzes(item.id)}>Ջնջել</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                        <TabsContent value="players">
                            <Table >
                                <TableHeader className="bg-slate-50">
                                    <TableHead>
                                        <tr>
                                            <th>Անուն</th>
                                        </tr>
                                    </TableHead>
                                    <TableHead>Էլ․հասցե</TableHead>
                                    <TableHead>Միավոր</TableHead>

                                </TableHeader>
                                <TableBody>
                                    {playersList && playersList.length > 0 ? (
                                        playersList.map((item) => (
                                            <TableRow key={item.id || item.email}>
                                                <TableCell className="font-medium">{item.userName}</TableCell>
                                                <TableCell>{item.email}</TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-indigo-600">
                                                        {item.score}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                                                Տվյալներ չկան
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>

                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

    )
}

