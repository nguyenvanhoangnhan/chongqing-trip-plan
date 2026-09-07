import { ArrowRight, MapPin } from "lucide-react";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { PasswordSignInForm } from "@/components/auth/password-sign-in-form";
import { messages } from "@/i18n";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { error } = await searchParams;

  if (session?.user?.personId) {
    redirect("/");
  }

  return (
    <main className="login-page">
      <section className="login-poster">
        <div className="login-poster__city" aria-hidden="true">
          <span>{messages.login.latitude}</span>
          <strong lang="zh-CN">
            {messages.login.cityMark.split("").map((character, index) => (
              <span key={character}>
                {index > 0 && <br />}
                {character}
              </span>
            ))}
          </strong>
          <span>{messages.login.longitude}</span>
        </div>
        <div className="login-poster__copy">
          <span className="section-kicker">
            <MapPin size={16} aria-hidden="true" /> {messages.login.location}
          </span>
          <h1>
            {messages.login.titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel__topline">
          <span>{messages.login.boardLabel}</span>
          <b>{messages.login.boardDate}</b>
        </div>
        <div className="login-panel__body">
          <span className="login-panel__mark" lang="zh-CN">
            {messages.login.giftMark}
          </span>
          <h2 id="login-title">{messages.login.title}</h2>
          <p>{messages.login.access}</p>

          {error && (
            <p className="login-error" role="alert">
              {messages.login.signInFailed}
            </p>
          )}

          <PasswordSignInForm
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", {
                  personId: formData.get("personId"),
                  password: formData.get("password"),
                  redirectTo: "/",
                });
              } catch (signInError) {
                if (signInError instanceof AuthError) {
                  redirect("/login?error=CredentialsSignin");
                }

                throw signInError;
              }
            }}
          />

          <div className="login-divider">
            <span>{messages.login.alternative}</span>
          </div>

          <a className="google-button" href="/auth/google">
            <span aria-hidden="true">{messages.login.googleMark}</span>
            {messages.login.googleButton}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
