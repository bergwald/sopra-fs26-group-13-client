"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import { AUTH_TOKEN_CHANGED_EVENT, getStoredToken } from "@/utils/auth";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();
  const [hasToken, setHasToken] = React.useState<boolean>(false);

  React.useEffect(() => {
    const syncTokenState = () => setHasToken(Boolean(getStoredToken()));
    syncTokenState();
    globalThis.addEventListener("storage", syncTokenState);
    globalThis.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncTokenState);
    return () => {
      globalThis.removeEventListener("storage", syncTokenState);
      globalThis.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncTokenState);
    };
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          {hasToken && (
            <Button type="primary" variant="solid" onClick={() => router.push("/users")}>
              Users Overview
            </Button>
          )}
          {!hasToken && (
            <>
              <Button
                type="primary"
                variant="solid"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
              <Button
                type="primary"
                variant="solid"
                onClick={() => router.push("/login")}
              >
                Go to login
              </Button>
            </>
          )}
        </div>
      </main>
      <footer className={styles.footer}>
        <Button
          type="link"
          icon={<BookOutlined />}
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn
        </Button>
        <Button
          type="link"
          icon={<CodeOutlined />}
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Examples
        </Button>
        <Button
          type="link"
          icon={<GlobalOutlined />}
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to nextjs.org →
        </Button>
      </footer>
    </div>
  );
}
