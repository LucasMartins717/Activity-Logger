import { FC, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential, } from "firebase/auth";
import { doc, setDoc, } from "firebase/firestore";
import { auth, db } from "../../firebase";
import styled from "styled-components";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import Header from "../../components/Header";
import { sendRenderer } from "../../utils/sendRendererUtils";
import { inputMaxLength } from "../../utils/maxLengthUtils";
import { useAppContext } from "../../context/AppContext";

const UserAuthContainer = styled.div`
  background-color: var(--bg-color);
  color: var(--paragraph);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0px 10px;
  width: 320px;
  max-width: 100%;
  -webkit-app-region: drag;
  margin-top: 1em;
`;
const AuthInput = styled.input<{ $hasError?: boolean }>`
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid ${({ $hasError }) => ($hasError ? "red" : "var(--input-border)")};
  border-radius: 4px;
  background-color: #1A1D1F;
  color: var(--title);
  outline: none;
  transition: border 0.2s, background-color 0.2s, color 0.2s;
  -webkit-app-region: no-drag;

  &::placeholder {
    color: ${({ $hasError }) => ($hasError ? "red" : "var(--paragraph)")};
    opacity: 0.8;
  }

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? "red" : "var(--button-bg)")};
    background-color: #202427;
  }
`;
const SubmitButton = styled.button`
  background-color: var(--button-bg);
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  -webkit-app-region: no-drag;

  &:hover {
    background-color: #2c78d6;
  }
`;
const ToggleAuthButton = styled.button`
  display: flex;
  align-items: center;
  position: absolute;
  top: 0%;
  right: 50%;
  transform: translateX(50%);
  background: transparent;
  border: none;
  color: var(--paragraph);
  font-size: 12px;
  cursor: pointer;
  margin-top: 1.25em;
  gap: 4px;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--button-bg);
  }
`;

const UserAuth: FC = () => {

    const { t } = useAppContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fieldError, setFieldError] = useState<"email" | "password" | "general" | null>(null);

    const createUserProfile = async (userCredential: UserCredential) => {
        const { user } = userCredential;

        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            role: "user",
            status: "active",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            responses: {
                r1: {
                    id: 1,
                    question: "What are you doing?",
                    response: "I'm studying programming now.",
                    tags: ["study", "programming", "focus"],
                    favorited: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                r2: {
                    id: 2,
                    question: "What are you doing?",
                    response: "I'm taking a night walk.",
                    tags: ["physical activity", "health"],
                    favorited: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                r3: {
                    id: 3,
                    question: "What are you doing?",
                    response: "I'm watching a comedy series.",
                    tags: ["leisure", "series", "rest"],
                    favorited: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                r4: {
                    id: 4,
                    question: "What are you doing?",
                    response: "Working on a personal design project.",
                    tags: ["work", "project", "creativity"],
                    favorited: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            },
            settings: {
                questionText: "",
                notificationMode: "popup",
                preFilledTags: ["work", "study"],
                questionInterval: 30,
                questionScreenTime: 60,
                startTime: "08:00",
                endTime: "22:00",
                alwaysOn: true,
                weekDays: ["sunday", "saturday", "friday", "thursday", "wednesday", "tuesday", "monday"],
                layoutMode: "vertical",
                language: "en"
            },
        });
    };

    const getErrorMessage = (code: string): string => {
        switch (code) {
            case "auth/invalid-email":
                return t("user-auth.e-invalid-email");
            case "auth/user-disabled":
                return t("user-auth.e-user-disabled");
            case "auth/user-not-found":
                return t("user-auth.e-user-not-found");
            case "auth/wrong-password":
                return t("user-auth.e-wrong-password");
            case "auth/email-already-in-use":
                return t("user-auth.e-email-already-in-use");
            case "auth/weak-password":
                return t("user-auth.e-weak-password");
            case "auth/invalid-credential":
                return t("user-auth.e-invalid-credential");
            default:
                return t("user-auth.e-unexpected");
        }
    }

    const handleSubmit = async () => {
        try {
            setError(null);
            setLoading(true);

            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
                sendRenderer["login-success"](userCredential.user.uid);
            } else {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );
                await createUserProfile(userCredential);

                sendRenderer["login-success"](userCredential.user.uid);
            }
        } catch (err: any) {
            const message = getErrorMessage(err.code);
            setError(message);

            if (["auth/invalid-email", "auth/email-already-in-use", "auth/user-not-found"].includes(err.code)) {
                setFieldError("email");
                setEmail("");
                setPassword("");
            } else if (["auth/wrong-password", "auth/weak-password"].includes(err.code)) {
                setFieldError("password");
                setEmail("");
                setPassword("");
            } else {
                setFieldError("email");
                setEmail("");
                setPassword("");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header title="login" hideMaximize={true} />
            <UserAuthContainer>
                <ToggleAuthButton onClick={() => setIsLogin(!isLogin)} disabled={loading}>
                    {isLogin ? <FiUserPlus size={12} /> : <FiLogIn size={12} />}
                    {isLogin ? t("user-auth.h-change-register") : t("user-auth.h-change-login")}
                </ToggleAuthButton>

                <AuthInput
                    type="email"
                    placeholder={fieldError === "email" ? error || "" : t("user-auth.i-email")}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value), error && setError(null) }}
                    disabled={loading}
                    maxLength={inputMaxLength.email}
                    $hasError={fieldError === "email"}
                />

                <AuthInput
                    type="password"
                    placeholder={fieldError === "password" ? error || "" : t("user-auth.i-password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    maxLength={inputMaxLength.password}
                    $hasError={fieldError === "password"}
                />

                <SubmitButton onClick={handleSubmit} disabled={loading}>
                    {loading ? t("user-auth.i-placeholder") : isLogin ? t("user-auth.s-button-login") : t("user-auth.s-button-register")}
                </SubmitButton>
            </UserAuthContainer>
        </>
    );
};

export default UserAuth;
