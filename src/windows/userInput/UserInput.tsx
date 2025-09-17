import { FC, useEffect, useState } from "react";
import Header from "../../components/Header";
import styled from "styled-components";
import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { inputMaxLength } from "../../utils/maxLengthUtils";
import { useAppContext } from "../../context/AppContext";
import { sendRenderer } from "../../utils/sendRendererUtils";

const UserInputContainer = styled.div`
  background-color: var(--bg-color);
  color: var(--paragraph);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px 16px;
  width: 320px;
  max-width: 100%;
`;
const QuestionText = styled.h2`
  font-size: 14px;
  color: var(--header-title);
  margin: 0;
  user-select: none;
`;
const AnswerInput = styled.input`
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background-color: #1A1D1F;
  color: var(--title);
  outline: none;
  transition: border 0.2s, background-color 0.2s;

  &:focus {
    border-color: var(--button-bg);
    background-color: #202427;
  }
`;
const TagsScroll = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #2c3a45;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;
const Tag = styled.span<{ selected: boolean; $arming?: boolean; }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${({ $arming, selected }) =>
    $arming
      ? "rgba(239, 68, 68, 0.9)"
      : selected
        ? "var(--button-bg)"
        : "#1A1D1F"};
  color: ${({ selected }) => (selected ? "white" : "var(--paragraph)")};
  border: 1px solid var(--input-border);
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.5s linear;

  &:hover {
    background-color: ${({ $arming, selected }) =>
    $arming
      ? "rgba(239, 68, 68, 1)"
      : selected
        ? "#2c78d6"
        : "#202427"};
  }
`;
const AddTagButton = styled.button`
  min-width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid var(--input-border);
  background-color: #1A1D1F;
  color: var(--paragraph);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: #202427;
  }
`;
const TagInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
const TagInput = styled.input`
  padding: 4px 19px 4px 8px;
  font-size: 12px;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  background-color: #1A1D1F;
  color: var(--title);
  outline: none;
  width: 110px;

  &:focus {
    border-color: var(--button-bg);
    background-color: #202427;
  }
`;
const TagInputButton = styled.button`
  position: absolute;
  right: 4px;
  border: none;
  background: transparent;
  color: var(--paragraph);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--button-bg);
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
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  gap: 6px;

  &:hover {
    background-color: #2c78d6;
  }
`;


const UserInput: FC = () => {

  const { t, preFilledTags, response, setResponse, fAddResponse, questionText } = useAppContext();

  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [armingTag, setArmingTag] = useState<string | null>(null);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  let holdTimeout: number;


  useEffect(() => {
    if (preFilledTags && preFilledTags.length > 0) {
      setTags(preFilledTags);
    }
  }, [preFilledTags]);

  const addTag = () => {
    const tagTrimmed = newTag.trim();
    if (tagTrimmed !== "" && tags.length < 5) {
      setTags((prev) => [...prev, tagTrimmed]);
      setSelectedTags((prev) => [...prev, tagTrimmed]);
    }
    setNewTag("");
    setAdding(false);
  };
  const deleteTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setSelectedTags(selectedTags.filter((t) => t !== tag));
    if (deletingTag === tag) setDeletingTag(null);
  };
  const handleSubmit = async () => {
    const trimmedAnswer = answerInput.trim();
    if (!trimmedAnswer) {
      alert("Digite sua resposta antes de enviar.");
      return;
    }

    const newId = response.length > 0 ? Math.max(...response.map((r) => Number(r.id))) + 1 : 1;

    const newResponse = {
      id: newId,
      question: questionText ? questionText : t("user-input.default-question"),
      response: trimmedAnswer,
      tags: selectedTags,
      favorited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setResponse((prev) => [...prev, newResponse]);

    await fAddResponse(newResponse);

    setAnswerInput("");
    setSelectedTags([]);
    sendRenderer["close-window"]();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  const startHoldDelete = (tag: string) => {
    holdTimeout = window.setTimeout(() => {
      setArmingTag(tag);
      deleteTag(tag);
    }, 1000);
  };
  const cancelHoldDelete = () => {
    clearTimeout(holdTimeout);
    setArmingTag(null);
  };
  const toggleDeleteMode = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    setDeletingTag(deletingTag === tag ? null : tag);
  };

  return (
    <>
      <Header title="" hideMaximize={true} />
      <UserInputContainer>
        <QuestionText>{questionText ? questionText : t("user-input.default-question")}</QuestionText>

        <AnswerInput
          type="text"
          placeholder={t("user-input.i-asnwer")}
          maxLength={inputMaxLength.response}
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)} />

        <TagsScroll>
          {tags.map((tag) => (
            <Tag
              key={tag}
              selected={selectedTags.includes(tag)}
              $arming={armingTag === tag}
              onClick={() => {
                if (!deletingTag) toggleTag(tag);
              }}
              onContextMenu={(e) => toggleDeleteMode(e, tag)}
              onMouseDown={(e) => { if (e.button === 0) startHoldDelete(tag); }}
              onMouseUp={cancelHoldDelete}
              onMouseLeave={cancelHoldDelete}
            >
              {tag}
              {deletingTag === tag && (
                <FiTrash2
                  size={12}
                  color="#ff8a8a"
                  style={{ marginLeft: 4, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTag(tag);
                  }}
                />
              )}
            </Tag>
          ))}

          {adding ? (
            <TagInputWrapper>
              <TagInput
                autoFocus
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTag();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewTag("");
                  }
                }}
                maxLength={inputMaxLength.tag}
              />
              <TagInputButton onClick={addTag}>
                <FiPlus size={14} />
              </TagInputButton>
            </TagInputWrapper>
          ) : (
            <AddTagButton onClick={() => setAdding(true)}>
              <FiPlus size={14} />
            </AddTagButton>
          )}
        </TagsScroll>

        <SubmitButton onClick={handleSubmit}>
          <FiCheck size={14} />
          {t("user-input.s-button")}
        </SubmitButton>
      </UserInputContainer>
    </>
  )
}

export default UserInput;