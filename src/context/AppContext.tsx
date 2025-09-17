import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { ResponseInterface } from "../interfaces/responseInterface";
import { deleteField, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { pt } from "../language/pt";
import { en } from "../language/en";

interface ContextInterface {

    // UI
    theme: "dark" | "light";
    setTheme: Dispatch<SetStateAction<"dark" | "light">>;

    // General
    response: ResponseInterface[];
    setResponse: Dispatch<SetStateAction<ResponseInterface[]>>;
    language: "pt" | "en";
    setLanguage: Dispatch<SetStateAction<"pt" | "en">>;
    t: (key: TranslationKey) => string;

    // UserSettings
    questionText: string;
    setQuestionText: Dispatch<SetStateAction<string>>;
    preFilledTags: string[];
    setPreFilledTags: Dispatch<SetStateAction<string[]>>;
    notificationMode: "popup" | "toast" | "off";
    setNotificationMode: Dispatch<SetStateAction<"popup" | "toast" | "off">>;

    questionInterval: number;
    setQuestionInterval: Dispatch<SetStateAction<number>>;
    questionScreenTime: number;
    setQuestionScreenTime: Dispatch<SetStateAction<number>>;

    startTime: string;
    setStartTime: Dispatch<SetStateAction<string>>;
    endTime: string;
    setEndTime: Dispatch<SetStateAction<string>>;
    alwaysOn: boolean;
    setAlwaysOn: Dispatch<SetStateAction<boolean>>;
    weekDays: string[];
    setWeekDays: Dispatch<SetStateAction<string[]>>;

    layoutMode: "horizontal" | "vertical";
    setLayoutMode: Dispatch<SetStateAction<"horizontal" | "vertical">>;

    // Auth
    userId: string | null;
    setUserId: Dispatch<SetStateAction<string | null>>;

    // Helpers Functions
    fAddResponse: (resp: ResponseInterface) => Promise<void>;
    fUpdateLastLogin: (uid: string) => Promise<void>;
    fUpdateResponse: (id: number, updates: Partial<ResponseInterface>) => Promise<void>;
    fDeleteResponse: (id: number) => Promise<void>;
    fUpdateQuestionText: (val: string) => Promise<void>;
    fUpdatePreFilledTags: (tags: string[]) => Promise<void>;
    fUpdateQuestionInterval: (val: number) => Promise<void>;
    fUpdateQuestionScreenTime: (val: number) => Promise<void>;
    fUpdateStartTime: (val: string) => Promise<void>;
    fUpdateEndTime: (val: string) => Promise<void>;
    fUpdateAlwaysOn: (val: boolean) => Promise<void>;
    fUpdateWeekDays: (days: string[]) => Promise<void>;
    fUpdateLayoutMode: (val: "horizontal" | "vertical") => Promise<void>;
    fUpdateLanguage: (val: "pt" | "en") => Promise<void>;
    fUpdateNotificationMode: (val: "popup" | "toast" | "off") => Promise<void>;
}

// Used for t (translation)
type Dictionary = typeof pt | typeof en;
type DotPrefix<T extends string, P extends string> = P extends "" ? T : `${P}.${T}`;
type DotNestedKeys<T, P extends string = ""> = T extends object
    ? {
        [K in keyof T]: DotNestedKeys<T[K], DotPrefix<K & string, P>>;
    }[keyof T]
    : P;
export type TranslationKey = DotNestedKeys<Dictionary>;


const AppContext = createContext<ContextInterface | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {

    const tempResponses: ResponseInterface[] = [
        {
            id: 1,
            question: "What are you doing?",
            response: "I'm studying programming now.",
            tags: ["study", "programming", "focus"],
            favorited: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 2,
            question: "What are you doing?",
            response: "I'm taking a night walk.",
            tags: ["physical activity", "health"],
            favorited: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 3,
            question: "What are you doing?",
            response: "I'm watching a comedy series.",
            tags: ["leisure", "series", "rest"],
            favorited: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 4,
            question: "What are you doing?",
            response: "Working on a personal design project.",
            tags: ["work", "project", "creativity"],
            favorited: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    // UI
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    // General
    const [response, setResponse] = useState<ResponseInterface[]>(tempResponses);
    const [language, setLanguage] = useState<"pt" | "en">("en");

    // UserSettings
    const [questionText, setQuestionText] = useState<string>("");
    const [preFilledTags, setPreFilledTags] = useState<string[]>([]);
    const [questionInterval, setQuestionInterval] = useState<number>(60);
    const [questionScreenTime, setQuestionScreenTime] = useState<number>(10);
    const [startTime, setStartTime] = useState<string>("08:00");
    const [endTime, setEndTime] = useState<string>("22:00");
    const [alwaysOn, setAlwaysOn] = useState<boolean>(true);
    const [weekDays, setWeekDays] = useState<string[]>([]);
    const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("vertical");
    const [notificationMode, setNotificationMode] = useState<"popup" | "toast" | "off">("popup");

    // Auth
    const [userId, setUserId] = useState<string | null>(null);


    // Listener UserInputSettings
    useEffect(() => {
        window.ipcRenderer.send('update-user-input-settings', { questionInterval, startTime, endTime, alwaysOn, weekDays, questionScreenTime, notificationMode });
    }, [questionInterval, startTime, endTime, alwaysOn, weekDays, questionScreenTime, notificationMode])

    // Listener Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);

                try {
                    await fUpdateLastLogin(user.uid);
                } catch (err) {
                    console.error("lastLogin update error: ", err);
                }
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Get firestore data and set to state
    useEffect(() => {
        if (!userId) return;

        const userRef = doc(db, "users", userId);

        const unsub = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();

                if (data.responses) {
                    const responsesArray = Object.values(data.responses) as ResponseInterface[];
                    setResponse(responsesArray);
                }

                if (data.settings) {
                    setQuestionText(data.settings.questionText ?? "");
                    setPreFilledTags(data.settings.preFilledTags ?? []);
                    setQuestionInterval(data.settings.questionInterval ?? 60);
                    setQuestionScreenTime(data.settings.questionScreenTime ?? 10);
                    setStartTime(data.settings.startTime ?? "08:00");
                    setEndTime(data.settings.endTime ?? "22:00");
                    setAlwaysOn(data.settings.alwaysOn ?? true);
                    setWeekDays(data.settings.weekDays ?? []);
                    setLayoutMode(data.settings.layoutMode ?? "vertical");
                    setLanguage(data.settings.language ?? "en");
                    setNotificationMode(data.settings.notificationMode ?? "popup");
                    window.ipcRenderer.send('update-user-input-settings',
                        {
                            questionInterval: data.settings.questionInterval,
                            startTime: data.settings.startTime,
                            endTime: data.settings.endTime,
                            alwaysOn: data.settings.alwaysOn,
                            weekDays: data.settings.weekDays,
                            questionScreenTime: data.settings.questionScreenTime,
                            notificationMode: data.settings.notificationMode
                        });
                }
            }
        });

        return () => unsub();
    }, [userId]);


    // Helpers Functions
    const fAddResponse = async (resp: ResponseInterface) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            [`responses.r${resp.id}`]: resp,
        });
    };

    const fUpdateResponse = async (id: number, updates: Partial<ResponseInterface>) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);

        const current = response.find(r => r.id === id);
        if (!current) return;

        const isOnlyFavoritedUpdate = Object.keys(updates).length === 1 && updates.hasOwnProperty("favorited");

        const updated: ResponseInterface = {
            ...current,
            ...updates,
            updatedAt: isOnlyFavoritedUpdate ? current.updatedAt : new Date().toISOString()
        };

        await updateDoc(userRef, {
            [`responses.r${id}`]: updated,
        });

        setResponse(prev => prev.map(r => r.id === id ? updated : r));
    };

    const fDeleteResponse = async (id: number) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            [`responses.r${id}`]: deleteField(),
        });
    };

    const fUpdateQuestionText = async (val: string) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.questionText": val });
    };

    const fUpdatePreFilledTags = async (tags: string[]) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.preFilledTags": tags });
    };

    const fUpdateQuestionInterval = async (val: number) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.questionInterval": val });
    };

    const fUpdateQuestionScreenTime = async (val: number) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.questionScreenTime": val });
    };

    const fUpdateStartTime = async (val: string) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.startTime": val });
    };

    const fUpdateEndTime = async (val: string) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.endTime": val });
    };

    const fUpdateAlwaysOn = async (val: boolean) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.alwaysOn": val });
    };

    const fUpdateWeekDays = async (days: string[]) => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.weekDays": days });
    };

    const fUpdateLayoutMode = async (val: "horizontal" | "vertical") => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.layoutMode": val });
    };

    const fUpdateLanguage = async (val: "pt" | "en") => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.language": val });
    };

    const fUpdateNotificationMode = async (val: "popup" | "toast" | "off") => {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { "settings.notificationMode": val });
    };

    const fUpdateLastLogin = async (uid: string) => {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                lastLogin: Date.now(),
            });
        } catch (err) {
            console.error("Erro no updateDoc (lastLogin):", err);
        }
    };

    const t = (key: TranslationKey): string => {
        const dict = language === "pt" ? pt : en;
        const parts = key.split(".");

        let value: any = dict;
        for (const p of parts) {
            value = value?.[p];
        }

        return typeof value === "string" ? value : key;
    };


    return (
        <AppContext.Provider value={{
            theme, setTheme,
            response, setResponse,
            language, setLanguage,
            questionText, setQuestionText,
            notificationMode, setNotificationMode,
            preFilledTags, setPreFilledTags,
            questionInterval, setQuestionInterval,
            questionScreenTime, setQuestionScreenTime,
            startTime, setStartTime,
            endTime, setEndTime,
            alwaysOn, setAlwaysOn,
            weekDays, setWeekDays,
            layoutMode, setLayoutMode,
            userId, setUserId,
            fAddResponse,
            fDeleteResponse,
            fUpdateAlwaysOn,
            fUpdateEndTime,
            fUpdateLayoutMode,
            fUpdatePreFilledTags,
            fUpdateQuestionInterval,
            fUpdateQuestionScreenTime,
            fUpdateQuestionText,
            fUpdateResponse,
            fUpdateStartTime,
            fUpdateWeekDays,
            fUpdateNotificationMode,
            fUpdateLastLogin,
            fUpdateLanguage,
            t: t,
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("AppContext error!");
    return context;
}