import { FC, useRef, useState } from "react";
import styled from "styled-components";
import Header from "../../components/Header";
import { RiRectangleLine } from "react-icons/ri";
import { TbRectangleVertical } from "react-icons/tb";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";
import { inputMaxLength } from "../../utils/maxLengthUtils";
import { sendRenderer } from "../../utils/sendRendererUtils";


const TopBar = styled.div<{ $layout: "horizontal" | "vertical" }>`
  display: flex;
  justify-content: space-between;
  padding: ${({ $layout }) => $layout === "vertical" ? "10px 16px" : "10px 24px"};
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--input-border);

  div{
    display: flex;
    gap: 10px;
  }
`;
const LayoutButton = styled.button<{ $active: boolean }>`
  background-color: ${({ $active }) => $active ? "var(--button-bg)" : "#1A1D1F"};
  color: ${({ $active }) => $active ? "white" : "var(--paragraph)"};
  border: 1px solid var(--input-border);
  padding: 6px;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  max-width: 1.9em;
  max-height: 1.75em;

  &:hover {
    background-color: var(--button-bg);
  }
`;

const Container = styled.div<{ $layout: "horizontal" | "vertical" }>`
  background-color: var(--bg-color);
  color: var(--paragraph);
  padding: ${({ $layout }) => $layout === "vertical" ? "12px 16px" : "16px 24px"};
  font-size: 13px;

  display: flex;
  flex-direction: ${({ $layout }) => $layout === "horizontal" ? "row" : "column"};
  flex-wrap: wrap;
  gap: ${({ $layout }) => $layout === "vertical" ? "14px" : "20px"};

  label{
    user-select: none;
  }

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;
const Section = styled.section<{ $layout?: "horizontal" | "vertical" }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $layout }) => $layout === "vertical" ? "8px" : "12px"};
  background-color: #16191C;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: ${({ $layout }) => $layout === "vertical" ? "12px" : "16px"};

  flex: 1;
  min-width: ${({ $layout }) => $layout === "vertical" ? "auto" : "280px"};

  @media (max-width: 900px) {
    width: 100%;
  }

  &:last-child{
    min-height: ${({ $layout }) => $layout === "vertical" ? "181px" : "314px"};
  }
`;
const SectionTitle = styled.h2`
  font-size: 14px;
  color: var(--header-title);
  margin-bottom: 4px;
  user-select: none;
`;
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  input, select, textarea {
    width: fit-content;
    background-color: #1A1D1F;
    border: 1px solid var(--input-border);
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--title);
    font-size: 13px;
    outline: none;
    transition: border 0.2s, background-color 0.2s;
    appearance: none;
  }

  input:focus, select:focus, textarea:focus {
    border-color: var(--button-bg);
    background-color: #202427;
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    background: var(--input-border);
    width: 14px;
    height: 100%;
    cursor: pointer;
    border-left: 1px solid #2e3a45;
  }

  label {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--title);
    gap: 4px;
  }
  
  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border: 1px solid var(--input-border);
    border-radius: 3px;
    background-color: #1A1D1F;
    cursor: pointer;
    position: relative;
    transition: background-color 0.2s, border-color 0.2s;
  }

  input[type="checkbox"]:checked {
    background-color: var(--button-bg);
    border-color: var(--button-bg);
  }

  input[type="checkbox"]:checked::after {
    content: "";
    position: absolute;
    top: 1px;
    left: 5px;
    width: 3px;
    height: 7px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  input[type="time"] {
    color-scheme: dark;
  }

  input[type="time"]::-webkit-datetime-edit {
    color: var(--paragraph);
    padding: 0 2px;
  }

  input[type="time"]::-webkit-datetime-edit-fields-wrapper {
    background-color: transparent;
  }

  input[type="time"]::-webkit-datetime-edit-hour-field,
  input[type="time"]::-webkit-datetime-edit-minute-field {
    background-color: transparent;
    color: var(--paragraph);
  }

  input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(0.6);
    cursor: pointer;
  }

  select {
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 20 20'%3E%3Cpath fill='%2384929D' d='M5.516 7.548a.75.75 0 011.06.032L10 11.293l3.424-3.713a.75.75 0 111.092 1.028l-4 4.333a.75.75 0 01-1.092 0l-4-4.333a.75.75 0 01.032-1.06z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 12px;
      padding-right: 28px;
  }
`;
const CheckboxRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 2px;

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 12px;
  }
`;

const TagsContainer = styled.div<{ $layout: "horizontal" | "vertical" }>`
  display: flex;
  flex-direction: ${({ $layout }) => $layout === "horizontal" ? "column-reverse" : "row"};
  justify-content: space-between;
  min-height: 32px;
`;
const TagsList = styled.div<{ $layout: "horizontal" | "vertical" }>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: ${({ $layout }) => $layout === "horizontal" ? "0.5em" : ""};
`;
const TagInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 25px;
`;
const TagInput = styled.input<{ $layout: "horizontal" | "vertical" }>`
  padding: 4px 8px;
  font-size: 12px !important;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background-color: #1A1D1F;
  color: var(--title);
  outline: none;
  max-width: ${({ $layout }) => $layout === "horizontal" ? "185px" : "210px"};

  &:focus { border-color: var(--button-bg); }
`;
const AddTagButton = styled.button`
  background-color: var(--button-bg);
  border: none;
  padding: 0.4em;
  margin-bottom: 0.1em;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.1em;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 14px;

  &:hover { background-color: #2c78d6; }
`;
const TrashButton = styled.button`
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #ff8a8a;
  padding: 0;
  line-height: 0;

  &:hover { color: #ff6b6b; }
`;
const Tag = styled.span<{ $arming?: boolean, $deleting?: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${({ $deleting, $arming, }) =>
    $deleting || $arming
      ? "rgba(239, 68, 68, 0.9)"
      : "#1A1D1F"};  
  color: var(--paragraph);
  border: 1px solid var(--input-border);
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.5s linear;

  &:hover {
    background-color: ${({ $deleting, $arming }) =>
    $deleting || $arming
      ? "rgba(239, 68, 68, 1)" : "#202427"};
  }
`;


const UserSettings: FC = () => {
  const {
    layoutMode,
    preFilledTags,
    questionInterval,
    weekDays,
    questionText,
    alwaysOn,
    startTime,
    endTime,
    questionScreenTime,
    notificationMode,
    language,
    t,
    fUpdateAlwaysOn,
    fUpdateEndTime,
    fUpdateLayoutMode,
    fUpdatePreFilledTags,
    fUpdateQuestionInterval,
    fUpdateQuestionScreenTime,
    fUpdateQuestionText,
    fUpdateStartTime,
    fUpdateWeekDays,
    fUpdateNotificationMode,
    fUpdateLanguage,
  } = useAppContext();

  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  const [newTagInput, setNewTagInput] = useState<string>("");
  const [newTagPlaceholder, setNewTagPlaceholder] = useState<string>(t("user-settings.question-i-create-tag"));

  const [armingTag, setArmingTag] = useState<string | null>(null);
  const [contextDeleteTag, setContextDeleteTag] = useState<string | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFlag = useRef(false);

  const weekDaysArray = {
    pt: [
      { label: "D", value: "sunday" },
      { label: "S", value: "monday" },
      { label: "T", value: "tuesday" },
      { label: "Q", value: "wednesday" },
      { label: "Q", value: "thursday" },
      { label: "S", value: "friday" },
      { label: "S", value: "saturday" },
    ],
    en: [
      { label: "S", value: "sunday" },
      { label: "M", value: "monday" },
      { label: "T", value: "tuesday" },
      { label: "W", value: "wednesday" },
      { label: "T", value: "thursday" },
      { label: "F", value: "friday" },
      { label: "S", value: "saturday" },
    ],
  };

  const changeLayout = (mode: "horizontal" | "vertical") => {
    fUpdateLayoutMode(mode);
    sendRenderer["change-settings-layout"](mode);
  };
  
  const toggleDay = (day: string) => {
    const updatedDays = weekDays.includes(day)
      ? weekDays.filter(d => d !== day)
      : [...weekDays, day];
    fUpdateWeekDays(updatedDays);
  };

  const addNewTag = (tag: string) => {
    if (!tag.trim()) return;

    if (preFilledTags.length >= 4) {
      setNewTagInput("");
      setNewTagPlaceholder(t("user-settings.question-max-tags"));
      setTimeout(() => { setNewTagPlaceholder("Nova tag...") }, 2500);
      return;
    }

    if (preFilledTags.includes(tag)) {
      setNewTagInput("");
      setNewTagPlaceholder(t("user-settings.question-tag-exists"));
      setTimeout(() => { setNewTagPlaceholder("Nova tag...") }, 2500);
      return;
    }

    if (newTagInput.length >= 16) {
      setNewTagInput("");
      setNewTagPlaceholder(t("user-settings.question-max-characters"));
      setTimeout(() => { setNewTagPlaceholder("Nova tag...") }, 2500);
      return;
    }

    fUpdatePreFilledTags([...preFilledTags, tag.trim()]);
    setNewTagInput("");
  };
  const deleteTag = async (tag: string) => {
    setDeletingTag(tag);
    const updatedTags = preFilledTags.filter(t => t !== tag);
    await fUpdatePreFilledTags(updatedTags);
    if (contextDeleteTag === tag) setContextDeleteTag(null);
    if (armingTag === tag) setArmingTag(null);

    setTimeout(() => { setDeletingTag(null); }, 1000);
  };

  const startPress = (tag: string) => {
    clearPress();
    longPressFlag.current = false;
    fadeTimer.current = setTimeout(() => setArmingTag(tag), 500);
    deleteTimer.current = setTimeout(() => {
      longPressFlag.current = true;
      deleteTag(tag);
    }, 1500);
  };
  const clearPress = () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    fadeTimer.current = null;
    deleteTimer.current = null;
    setArmingTag(null);
  };
  const handleClickTag = (tag: string) => {
    if (longPressFlag.current) {
      longPressFlag.current = false;
      return;
    }
    if (contextDeleteTag === tag) setContextDeleteTag(null);
  };
  const handleContextMenu = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    clearPress();
    setContextDeleteTag(prev => (prev === tag ? null : tag));
  };

  return (
    <>
      <Header title={t("user-settings.h-title")} hideMaximize={true} />

      <TopBar $layout={layoutMode}>
        <div>
          <LayoutButton
            $active={layoutMode === "horizontal"}
            onClick={() => changeLayout('horizontal')}
          >
            <RiRectangleLine />
          </LayoutButton>
          <LayoutButton
            $active={layoutMode === "vertical"}
            onClick={() => changeLayout('vertical')}
          >
            <TbRectangleVertical />
          </LayoutButton>
        </div>
        <LayoutButton
          $active={layoutMode === "vertical"}
          onClick={() => fUpdateLanguage(language === "pt" ? "en" : "pt")}
        >
          {
            language === "pt" ?
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#525852"></rect><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M3.472,16l12.528,8,12.528-8-12.528-8L3.472,16Z" fill="#979797"></path><circle cx="16" cy="16" r="5" fill="#3e3e3f"></circle><path d="M14,14.5c-.997,0-1.958,.149-2.873,.409-.078,.35-.126,.71-.127,1.083,.944-.315,1.951-.493,2.999-.493,2.524,0,4.816,.996,6.519,2.608,.152-.326,.276-.666,.356-1.026-1.844-1.604-4.245-2.583-6.875-2.583Z" fill="#fff"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#6f6f6f"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#292929"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#323232"></path><path fill="#292929" d="M2 11.385H31V13.231H2z"></path><path fill="#292929" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#292929" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#292929"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#292929"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#5d5d5d"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#ffffff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg>}
        </LayoutButton>
      </TopBar>

      <Container $layout={layoutMode}>
        <Section $layout={layoutMode}>
          <SectionTitle>{t("user-settings.question-frequency")}</SectionTitle>
          <Field>
            <label>{t("user-settings.question-interval")}</label>
            <input
              type="number"
              value={questionInterval}
              onChange={(e) => { const value = e.target.value; fUpdateQuestionInterval(Math.min(Number(value), inputMaxLength.questionInterval)) }}
              max={inputMaxLength.questionInterval}
            />
          </Field>

          <Field>
            <label>{t("user-settings.question-monitoring-time")}</label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="time"
                value={startTime}
                onChange={(e) => fUpdateStartTime(e.target.value)}
                disabled={alwaysOn}
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => fUpdateEndTime(e.target.value)}
                disabled={alwaysOn}
              />
            </div>
            <label style={{ marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={alwaysOn}
                onChange={(e) => fUpdateAlwaysOn(e.target.checked)}
              /> {t("user-settings.question-always-monitor")}
            </label>
          </Field>

          <Field>
            <label>{t("user-settings.question-active-days")}</label>
            <CheckboxRow>
              {weekDaysArray[language].map((day) => (
                <label key={day.value}>
                  <input
                    type="checkbox"
                    checked={weekDays.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </CheckboxRow>
          </Field>
        </Section>

        <Section $layout={layoutMode}>
          <SectionTitle>{t("user-settings.question-window-behavior")}</SectionTitle>
          <Field>
            <label>{t("user-settings.question-screen-time")}</label>
            <input
              type="number"
              value={questionScreenTime}
              onChange={(e) => { const value = e.target.value; fUpdateQuestionScreenTime(Math.min(Number(value), inputMaxLength.questionScreenTime)) }}
            />
          </Field>
          <Field>
            <label>{t("user-settings.question-notification")}</label>
            <select
              value={notificationMode}
              onChange={(e) => fUpdateNotificationMode(e.target.value as "popup" | "toast" | "off")}
            >
              <option value={"popup"}>Popup</option>
              <option value={"toast"}>Toast</option>
              <option value={"off"}>{t("user-settings.question-notification-off-option")}</option>
            </select>
          </Field>
        </Section>

        <Section $layout={layoutMode}>
          <SectionTitle>{t("user-settings.question-personalization")}</SectionTitle>
          <Field>
            <label>{t("user-settings.question-default-question")}</label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => fUpdateQuestionText(e.target.value)}
              maxLength={inputMaxLength.question}
              placeholder={t("user-input.default-question")}
            />
          </Field>
          <Field>
            <label>{t("user-settings.question-pre-selected-tags")}</label>
            <TagsContainer $layout={layoutMode}>
              <TagsList $layout={layoutMode}>
                {preFilledTags.map((tag) => (
                  <Tag
                    key={tag}
                    $arming={armingTag === tag}
                    $deleting={deletingTag === tag}
                    onMouseDown={() => startPress(tag)}
                    onMouseUp={clearPress}
                    onMouseLeave={clearPress}
                    onTouchStart={() => startPress(tag)}
                    onTouchEnd={clearPress}
                    onContextMenu={(e) => handleContextMenu(e, tag)}
                    onClick={() => handleClickTag(tag)}
                  >
                    {tag}
                    {contextDeleteTag === tag && (
                      <TrashButton
                        title={t("user-settings.question-trash-title")}
                        onClick={(e) => { e.stopPropagation(); deleteTag(tag); }}
                      >
                        <FiTrash2 size={14} />
                      </TrashButton>
                    )}
                  </Tag>
                ))}
              </TagsList>

              <TagInputWrapper>
                <TagInput $layout={layoutMode}
                  type="text"
                  placeholder={newTagPlaceholder}
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  maxLength={inputMaxLength.tag}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addNewTag(newTagInput);
                    }
                  }}
                />
                <AddTagButton onClick={() => addNewTag(newTagInput)}><FiPlus size={13} /></AddTagButton>
              </TagInputWrapper>
            </TagsContainer>
          </Field>
        </Section>
      </Container>
    </>
  )
}

export default UserSettings;