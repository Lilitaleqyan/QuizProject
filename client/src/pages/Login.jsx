import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { registration, signIn } from "../lib/auth";


export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        role: "",
        score: 0,

    });

    const loginUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const user = await signIn(formData.userName, formData.password);
            if (user) {
                toast({
                    title: "Մուտքը հաջողվեց",
                    description: `Բարի գալուստ, ${user.userName}!`,
                });
                if (user.role === "ADMIN") {
                    setLocation("/admin");

                }
                else {
                    setLocation("/user")
                }
                window.location.reload();
            } else {
                toast({
                    title: "Մուտքի սխալ",
                    description: "Սխալ օգտանուն կամ գաղտնաբառ",
                    variant: "destructive",
                });
            }
        }
        catch (err) {
            toast({
                title: "Սխալ",
                description: "Մուտքի ժամանակ տեղի ունեցավ սխալ",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const registrationUser = async (e) => {
        e.preventDefault();
        try {
            const { role, ...dataToSend } = formData;
            await registration(dataToSend);
            toast({
                title: "Գրանցումը հաջողվեց",
                description: "Այժմ կարող եք մուտք գործել"
            });
            setIsRegister(false);
        } catch (e) {
            toast({
                title: "Գրանցումը ձախողվեց",
                variant: "destructive"
            });
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Մուտք / Գրանցում</h1>

                </div>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-center">
                            {isRegister ? "Գրանցում" : "Մուտք"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isRegister ? (
                            <>
                                <form onSubmit={registrationUser} className="space-y-4 mt-6">

                                    {[
                                        { name: "userName", placeholder: "Օգտանուն" },
                                        { name: "email", placeholder: "Email", type: "email", pattern: "^[^\s@]+@[^\s@]+\.[^\s@]+$" },
                                        // { name: "password", placeholder: "Գաղտնաբառ", type: showPassword ? "text" : "password", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$" }



                                    ].map(({ name, placeholder, type = "text" }) => (
                                        <input
                                            key={name}
                                            type={type}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            required
                                            className="w-full px-4 py-2 bg-gray-100 border rounded-lg
                                                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ))}
                                    <div className="relative">
                                        <input
                                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Գաղտնաբառ"
                                            required
                                            className="w-full px-4 py-2 bg-gray-100 border rounded-lg"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2" type="button" onClick={() => setShowPassword(!showPassword)}>

                                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg
                       hover:bg-blue-700 transition font-medium"
                                    >
                                        Գրանցվել
                                    </button>
                                </form>
                                <Button

                                    variant="link"
                                    className="w-full mt-4"
                                    onClick={() => setIsRegister(false)}
                                >
                                    Արդեն ունե՞ք հաշիվ — Մուտք
                                </Button>
                            </>
                        ) : (
                            <>
                                <form onSubmit={loginUser} className="space-y-6" autoComplete="off">
                                    <input type="text" name="fake-username" autoComplete="username" style={{ display: "none" }} />
                                    <input type="password" name="fake-password" autoComplete="current-password" style={{ display: "none" }} />

                                    <div>
                                        <Label htmlFor="username" className="mb-2 block">Օգտանուն</Label>
                                        <Input
                                            id="username"
                                            autoComplete="off"
                                            value={formData.userName}
                                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-100 border rounded-lg "

                                            required
                                        />
                                    </div>


                                    <div className="relative">
                                        <Label htmlFor="password" className="mb-2 block">Գաղտնաբառ</Label>

                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-gray-100 border rounded-lg "
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2" type="button" onClick={() => setShowPassword(!showPassword)}>

                                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>
                                    </div>



                                    <Button type="submit" className="w-full">
                                        {isLoading ? "Մուտք..." : "Մուտք"}
                                    </Button>

                                    <Button type="button" className="w-full" onClick={() => setIsRegister(true)}>
                                        Գրանցվել
                                    </Button>
                                </form>
                            </>
                        )}

                    </CardContent>
                </Card>
            </div>

        </div >
    )
}