"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClipboardCheck } from "lucide-react"
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast({
          title: "Verificação Necessária",
          description: "Enviamos um link de verificação para o seu e-mail. Por favor, confirme seu cadastro.",
          variant: "default",
          duration: 7000,
        });
      } else {
        toast({
          title: "Login Bem-Sucedido!",
          description: "Redirecionando para o dashboard...",
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      // Verifica se o erro é do tipo esperado
      if (typeof error === "object" && error !== null && "code" in error) {
        const errorCode = (error as { code: string }).code;
        switch (errorCode) {
          case "auth/user-not-found":
            setError("Usuário não encontrado.");
            break;
          case "auth/wrong-password":
            setError("Senha incorreta.");
            break;
          case "auth/invalid-email":
            setError("Email inválido.");
            break;
          case "auth/too-many-requests":
            setError("Muitas tentativas. Tente novamente mais tarde.");
            break;
          default:
            setError("Erro ao fazer login. Tente novamente mais tarde.");
        }
      } else {
        setError("Erro desconhecido. Tente novamente mais tarde.");
      }

      toast({
        title: "Erro ao fazer login",
        description: error as string,
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardCheck className="h-6 w-6" />
        <span className="text-xl font-bold">Gerencia Essa P0$$#</span>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando Nessa P0$$#..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Já possui uma conta?{" "}
              <Link href="/register"
              className="text-primary hover:underline"
              onClick={() => {
                router.push("/register");
              }}>
                Registrar-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}