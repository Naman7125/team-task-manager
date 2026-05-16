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
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (typeof window !== "undefined" && getToken()) {
      throw redirect({ to: search.redirect ?? "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate({ to: search.redirect ?? "/dashboard" });
    },
    onError: (e: Error) => setError(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "");
      return;
    }
    setError(null);
    m.mutate(parsed.data);
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left – editorial brand panel */}
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
              — Issue 04 / 2026
            </p>
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-balance text-foreground">
              The quiet craft of{" "}
              <em className="text-brand not-italic font-display" style={{ fontStyle: "italic" }}>
                shipping
              </em>{" "}
              better work, together.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
              An editorial workspace for teams who care about the small details — typography,
              rhythm, and the things that don't ship themselves.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.2em]">Vol. 01</span>
            <span className="italic">— A studio for makers</span>
          </div>
        </div>
      </aside>

      {/* Right – form */}
      <main className="relative flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-brand-foreground font-display text-lg shadow-elegant">
                T
              </div>
              <span className="font-display text-xl tracking-tight">Taskly</span>
            </div>
          </div>

          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-brand">
            Sign in
          </p>
          <h2 className="font-display text-4xl leading-tight tracking-tight text-balance">
            Welcome{" "}
            <em className="italic font-normal" style={{ fontStyle: "italic" }}>
              back.
            </em>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pick up where you left off. Your team is waiting.
          </p>

          <form onSubmit={submit} className="mt-10 space-y-5">
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
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-border/80 bg-card focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
              />
            </div>
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive animate-fade-in">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={m.isPending}
              className="h-11 w-full rounded-lg bg-gradient-brand text-brand-foreground shadow-elegant transition-all hover:shadow-lift hover:brightness-105"
            >
              {m.isPending ? "Signing in…" : "Sign in →"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link
                to="/signup"
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
