import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger,DialogDescription, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, HelpCircle, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; 
import { addQuiz, updateQuiz, getAllQuizzes, deleteQuiz } from "@/lib/storage"; 

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

    const initialState = {
        title: "",
        level: "BEGINNER",
        topic: "JAVA_CORE",
        question: [{
            content: "",
            correctAnswer: "",
            wrongAnswer1: "",
             wrongAnswer2: "",
              wrongAnswer3: ""
        }]

};
export default function AdminPage() {
    
    const [quizzesList, setQuizzesList] = useState([]);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] =useState(null)
    const { toast } = useToast();
    


    const PROGRAMMING_TOPICS = [
  { value: "JAVA_CORE", label: "Java Core", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "SPRING_BOOT", label: "Spring Boot", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "KAFKA", label: "Apache Kafka", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "DATABASE", label: "SQL & Databases", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "REACT_FRONTEND", label: "React & UI", color: "bg-cyan-100 text-cyan-700 border-cyan-200" }
];

const resetQuiz =() => {
    setEditingQuiz(null)
    setQuiz(initialState)
    setIsQuizOpen(true)

}

const loadQuizzes = async () => {
    const data = await getAllQuizzes(); 
    setQuizzesList(data);
};

useEffect(() => {
    loadQuizzes();
}, []);

    const [quiz, setQuiz] = useState(initialState);

    const handleInputChange = ( field, value) => {
        setQuiz(prev => ({ ...prev, [field]:value}));
    };

    const handleQuestionDetailChange = (index,field, value) => {
            const updateQuestions = [...quiz.question];
            updateQuestions[index] = {...updateQuestions[index], [field]:value};


        setQuiz(prev => ({
            ...prev,
           question:updateQuestions
            
        
        }));
    };
    const addQuestionField = () => {
    setQuiz(prev => ({
        ...prev,
        question: [...prev.question, { content: "", correctAnswer: "" }]
    }));
};

const removeQuestionField = (index) => {
    if (quiz.question.length > 1) {
        const updatedQuestions = quiz.question.filter((_, i) => i !== index);
        setQuiz(prev => ({ ...prev, question: updatedQuestions }));
    }
};

    const addQuizes = async (e) => {
        if (e) e.preventDefault();
            const quizPayload = {
                title: quiz.title,
                level: quiz.level,
                topic:quiz.topic,
                question:quiz.question
                
            };

        try {
            if(editingQuiz) {
                await updateQuiz(quizPayload, editingQuiz.id)
                toast({
                    title:"Quiz-ը թարմացվել է",
                    description:"Quiz-ը հաջողությամբ թարմացվել է"
                })
            }
            else {
            await addQuiz(quizPayload); 
            toast({
                title: "Quiz ավելացվել է",
                description: "Նոր Quiz-ը հաջողությամբ պահպանվեց",
            });
            
            setIsQuizOpen(false); 
            setQuiz(initialState); 
        } }catch (error) {
            toast({
                title: "Սխալ",
                description: "Չհաջողվեց պահպանել քուիզը",
                variant: "destructive",
            });
        }
    };
    const updateQuizes = (quiz) =>  {
        setEditingQuiz(quiz)
        setQuiz (
                {
                title: quiz.title,
                level: quiz.level,
                topic:quiz.topic,
                question: quiz.question
            });
            setIsQuizOpen(true)

    }
    const deleteQuizzes=async(id) => {
     if(window.confirm("Վստահ եք որ ուզում եք ջնջել այս քուիզը")) {
      try{
        await deleteQuiz(id);
        toast({ title: "Ջնջված է", description: "Քուիզը հաջողությամբ հեռացվեց" });
        loadQuizzes();
      }catch(error){
        toast({ title: "Սխալ", description: "Չհաջողվեց ջնջել", variant: "destructive" });
      }
     }
    }


return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <Card className="w-full max-w-6xl shadow-2xl border-none rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-8">
                    <CardTitle className="text-3xl font-bold text-center">Ադմինիստրատորի Վահանակ</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs defaultValue="quizzes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="quizzes">Քուիզների Կառավարում</TabsTrigger>
                            <TabsTrigger value="users">Օգտատերերի Պրոգրես</TabsTrigger>
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
                                            
{/* 
                                            <div className="space-y-2">
                                                <Label>Հարցի բովանդակությունը</Label>
                                                <Textarea 
                                                    value={quiz.question[0].content} 
                                                    onChange={(e) => handleQuestionDetailChange("content", e.target.value)} 
                                                    required 
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Ճիշտ պատասխանը</Label>
                                                <Input 
                                                    value={quiz.question[0].correctAnswer} 
                                                    onChange={(e) => handleQuestionDetailChange("correctAnswer", e.target.value)} 
                                                    required 
                                                />
                                            </div> */}
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
                    <Label>Ճիշտ պատասխանը</Label>
                    <Input
                        placeholder="Մուտքագրեք ճիշտ պատասխանը"
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionDetailChange(index, "correctAnswer", e.target.value)}
                        required
                    />
                </div>
                   <div className="space-y-2">
                    <Label>Սխալ պատասխանը</Label>
                    <Input
                        placeholder="Մուտքագրեք սխալ պատասխանը"
                        value={q.wrongAnswer1}
                        onChange={(e) => handleQuestionDetailChange(index, "wrongAnswer1", e.target.value)}
                        required
                    />
                </div>

                     <div className="space-y-2">
                    <Label>Սխալ պատասխանը</Label>
                    <Input
                        placeholder="Մուտքագրեք սխալ պատասխանը"
                        value={q.wrongAnswer2}
                        onChange={(e) => handleQuestionDetailChange(index, "wrongAnswer2", e.target.value)}
                        required
                    />
                </div>     

                  <div className="space-y-2">
                    <Label>Սխալ պատասխանը</Label>
                    <Input
                        placeholder="Մուտքագրեք սխալ պատասխանը"
                        value={q.wrongAnswer3}
                        onChange={(e) => handleQuestionDetailChange(index, "wrongAnswer3", e.target.value)}
                        required
                    />
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

                        <TabsContent value="users">
                            <Card className="border-dashed border-2 text-center p-10 text-slate-500">
                                <p>Օգտատերերի տվյալները շուտով հասանելի կլինեն։</p>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

