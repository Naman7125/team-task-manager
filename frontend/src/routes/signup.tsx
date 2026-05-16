import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth";
import { getToken, setToken } from "@/api/client";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getToken()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      setToken(data.token);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    },
    onError: (error: Error) => setError(error.message),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "");
      return;
    }
    setError(null);
    signupMutation.mutate(parsed.data);
  };

  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-aurora grain lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent,oklch(0.978_0.012_80)_85%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground font-display text-lg shadow-elegant">
              T
            </div>
            <span className="font-display text-xl tracking-tight">Taskly</span>
          </div>

          <div className="max-w-md animate-fade-up">
            <p className="mb-4 text-[11px] font-mono uppercase tracking-[0.28em] text-brand">
              Issue 04 / 2026
            </p>
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-balance text-foreground">
              Start the workspace where{" "}
              <em className="text-brand not-italic font-display" style={{ fontStyle: "italic" }}>
                better work
              </em>{" "}
              becomes visible.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
              Create projects, invite members, assign tasks, and keep every deadline accountable.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.2em]">Vol. 01</span>
            <span className="italic">A studio for makers</span>
          </div>
        </div>
      </aside>

      <main className="relative flex items-center justify-center bg-background px-5 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground font-display text-lg shadow-elegant">
                T
              </div>
              <span className="font-display text-xl tracking-tight">Taskly</span>
            </div>
          </div>

          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-brand">
            Create account
          </p>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
            Build your{" "}
            <em className="italic font-normal" style={{ fontStyle: "italic" }}>
              team space.
            </em>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Start organizing projects, people, and tasks in one focused workspace.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5 sm:mt-10">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Name
              </Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
            </div>
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive animate-fade-in">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="h-11 w-full rounded-lg bg-gradient-brand text-brand-foreground shadow-elegant transition-all hover:shadow-lift hover:brightness-105"
            >
              {signupMutation.isPending ? "Creating..." : "Create account ->"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
