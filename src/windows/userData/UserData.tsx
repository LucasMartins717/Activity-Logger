import { FC, useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import styled from "styled-components";
import { FiCalendar, FiChevronDown, FiChevronUp, FiEdit2, FiMoreVertical, FiSettings, FiStar, FiTag, FiTrash2, FiType, FiX } from "react-icons/fi";
import { ResponseInterface } from "../../interfaces/responseInterface";
import { useAppContext } from "../../context/AppContext";
import { inputMaxLength } from "../../utils/maxLengthUtils";
import { sendRenderer } from "../../utils/sendRendererUtils";

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 26px 10px 22px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--input-border);
  gap: 12px;
`;
const CenterControls = styled.div`
  justify-self: center;
`;
const Segmented = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: #111416;
  border: 1px solid var(--input-border);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
`;
const SegBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: ${({ $active }) => ($active ? 'var(--title)' : 'var(--icons)')};
  transition: background 0.15s, color 0.15s;

  &:hover { background: #16191C; color: var(--title); }
  &[aria-pressed="true"] { background: #1A1D1F; border-color: var(--input-border); }
`;
const StarSegBtn = styled(SegBtn)`
  color: ${({ $active }) => ($active ? '#FFD166' : 'var(--icons)')};

  &:hover { color: #FFD166; }
`;
const Title = styled.h1`
  font-size: 16px;
  color: var(--header-title);
  justify-self: start;
  user-select: none;

  @media (max-width: 720px) {
    font-size: 15px;
  }
`;
const RightTopBar = styled.div`
  justify-self: end;
  display: flex;
  gap: 8px;
  align-items: center;
`;
const SearchInput = styled.input`
  background-color: #1A1D1F;
  border: 1px solid var(--input-border);
  padding: 6px 8px;
  border-radius: 4px;
  color: var(--title);
  font-size: 13px;
  outline: none;
  width: 240px;
  &:focus { border-color: var(--button-bg); }

  @media (max-width: 720px) {
    width: 175.5px;
  }
`;
const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1A1D1F;
  border: 1px solid var(--input-border);
  padding: 8px 8px 7px 8px;
  border-radius: 4px;
  color: var(--title);
  font-size: 13px;
  margin-right: 4px;
  cursor: pointer;
  &:focus { border-color: var(--button-bg); }
`
const Container = styled.div`
  background-color: var(--bg-color);
  color: var(--paragraph);
  padding: 16px 20px 0 20px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;

  max-height: calc(100vh - 106px);
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: #384857 transparent;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #333; 
    border-radius: 999px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;
const ResponseCard = styled.div`
  background-color: #16191C;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;

  &:last-child{
    margin-bottom: 1em;
  }
`;
const Question = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--title);
`;
const Response = styled.div`
  font-size: 13px;
  color: var(--paragraph);
  line-height: 1.4;
  word-wrap: break-word;
`;
const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const MetaInfo = styled.div`
  font-size: 11px;
  color: var(--header-paragraph);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;
const Tag = styled.span`
  background-color: #1A1D1F;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--paragraph);
  display: inline-flex;
  align-items: end;
  gap: 4px;
`;
const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const StarButton = styled.button<{ $favorited: boolean }>`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ $favorited }) => ($favorited ? "#FFD166" : "var(--icons)")};
  font-size: 16px;
  margin-right: -0.3em;

  &:hover { color: #FFD166; }
`;
const MenuButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: var(--icons);
  font-size: 18px;
  cursor: pointer;

  &:hover { color: var(--header-title); }
`;
const Popover = styled.div`
  position: absolute;
  top: 28px;
  right: 8px;
  min-width: 180px;
  background: #0f1214;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
`;
const PopItem = styled.button`
  display: flex;
  align-items: start;
  background: transparent;
  border: none;
  color: var(--paragraph);
  text-align: left;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;

  svg{
    margin-right: 6px;
  }

  &:hover { background: #16191C; color: var(--title); }
`;
const Divider = styled.div`
  height: 1px; 
  background: var(--input-border);
  margin: 4px 0;
`;
const EmptyState = styled.div`
  opacity: 0.7; 
  padding: 16px; 
  text-align: center; 
  font-size: 13px;
`;

const EditModalCard = styled.div`
  width: 560px;
  max-width: 90vw;
  background: #121518;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const EditModalTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--header-title);
  user-select: none;
`;
const EditModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;
const EditField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const EditLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: var(--title);
  user-select: none;
`;
const EditInput = styled.input`
  background-color: #1A1D1F;
  border: 1px solid var(--input-border);
  padding: 8px 10px;
  border-radius: 4px;
  color: var(--title);
  font-size: 13px;
  outline: none;
  &:focus { border-color: var(--button-bg); }
`;
const EditTextArea = styled.textarea`
  background-color: #1A1D1F;
  border: 1px solid var(--input-border);
  padding: 10px;
  border-radius: 4px;
  color: var(--title);
  font-size: 13px;
  outline: none;
  min-height: 140px;
  resize: vertical;
  &:focus { border-color: var(--button-bg); }
`;
const EditModalActions = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-top: 6px;
`;
const ModalClose = styled(FiX)`
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  color: var(--header-icons);
  width: 16px;
  height: 16px;
  transition: color 0.2s;

  &:hover {
    color: var(--header-title);
  }
`;
const Backdrop = styled.div`
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.5); 
  display: flex; 
  align-items: center; 
  justify-content: center;
  z-index: 50;
`;
const ModalCard = styled.div`
  display: flex; 
  flex-direction: column; 
  width: 560px; 
  max-width: 90vw; 
  background: #121518; 
  border: 1px solid var(--input-border); 
  border-radius: 8px; 
  padding: 16px; 
  position: relative;
  gap: 10px;
`;
const ModalTitle = styled.h3`
  margin: 0; 
  font-size: 14px; 
  color: var(--header-title);
`;
const ModalTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8;
`
const Row = styled.div`
  display: flex; 
  gap: 8px;
`;
const TextInput = styled.input`
  background-color: #1A1D1F; 
  border: 1px solid var(--input-border); 
  padding: 6px 8px; 
  border-radius: 4px; 
  color: var(--title); 
  font-size: 13px; 
  outline: none; 
  flex: 1;
  
  &:focus { border-color: var(--button-bg); }
`;
const Button = styled.button<{ variant?: 'primary' | 'ghost' | 'danger' }>`
  border: 1px solid ${({ variant }) => variant === 'primary' ? 'var(--button-bg)' : variant === 'danger' ? '#b55454' : 'var(--input-border)'};
  background: ${({ variant }) => variant === 'primary' ? 'var(--button-bg)' : 'transparent'};
  color: ${({ variant }) => variant === 'primary' ? 'white' : variant === 'danger' ? '#ff8a8a' : 'var(--paragraph)'};
  padding: 6px 10px; 
  border-radius: 4px; 
  cursor: pointer; 
  font-size: 13px;
  user-select: none;
  &:hover { filter: brightness(1.05); }
`;
const TagPill = styled.span`
  display: inline-flex; 
  align-items: center; 
  gap: 6px; 
  padding: 3px 8px; 
  border: 1px solid var(--input-border); 
  border-radius: 999px; 
  background: #1A1D1F; 
  font-size: 12px; 
  color: var(--paragraph);
`;
const SmallIconBtn = styled.button`
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  width: 18px; 
  height: 18px; 
  border: none; 
  border-radius: 3px; 
  cursor: pointer; 
  background: transparent; 
  color: #ff8a8a;
  
  &:hover { background: #20171a; }
`;

const UserData: FC = () => {
  const { t, response, setResponse, language, fUpdateResponse, fDeleteResponse } = useAppContext();

  const [query, setQuery] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [sortDate, setSortDate] = useState<"asc" | "desc" | null>(null);
  const [sortName, setSortName] = useState<"asc" | "desc" | null>(null);
  const [sortFavorites, setSortFavorites] = useState(false);

  const [editingModal, setEditingModal] = useState<null | ResponseInterface>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editResponse, setEditResponse] = useState("");

  const [editingTags, setEditingTags] = useState<null | ResponseInterface>(null);
  const [newTag, setNewTag] = useState("");

  const popoverRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!popoverRef.current) return;
      const el = popoverRef.current;
      if (openMenuId && !el.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);

    const locale = language == "en" ? "en" : "pt";

    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date)
  };
  const toggleFavorite = (id: number) => {
    setResponse(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, favorited: !i.favorited } : i);
      const item = updated.find(i => i.id === id);
      if (item) fUpdateResponse(id, { favorited: item.favorited });
      return updated;
    });
  };
  const deleteItem = (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta resposta?")) return;
    setResponse(prev => prev.filter(i => i.id !== id));
    fDeleteResponse(id);
    setOpenMenuId(null);
  };

  const startEdit = (it: ResponseInterface) => {
    setEditQuestion(it.question);
    setEditResponse(it.response);
    setEditingModal(it);
    setOpenMenuId(null);
  };
  const saveEdit = () => {
    if (!editingModal) return;
    const trimmedQ = editQuestion.trim();
    const trimmedR = editResponse.trim();
    if (!trimmedQ || !trimmedR) {
      alert('Preencha pergunta e resposta.');
      return;
    }
    setResponse(prev => {
      const updated = prev.map(i => i.id === editingModal.id ? { ...i, question: trimmedQ, response: trimmedR } : i);
      fUpdateResponse(editingModal.id, { question: trimmedQ, response: trimmedR });
      return updated;
    });
    setEditingModal(null);
  };

  const startTagManage = (it: ResponseInterface) => {
    setEditingTags(it);
    setNewTag("");
    setOpenMenuId(null);
  };
  const addTagToItem = () => {
    const tag = newTag.trim();
    if (!tag) return;

    setResponse(prev => {
      const updated = prev.map(i => {
        if (i.id !== editingTags?.id) return i;
        if (i.tags.includes(tag)) return i;
        const newTags = [...i.tags, tag];
        fUpdateResponse(i.id, { tags: newTags });
        return { ...i, tags: newTags };
      });
      return updated;
    });

    setEditingTags(prev => {
      if (!prev || prev.tags.includes(tag)) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    setNewTag("");
  };
  const removeTagFromItem = (tag: string) => {
    if (!editingTags) return;

    setResponse(prev => {
      const updated = prev.map(i => {
        if (i.id !== editingTags.id) return i;
        const newTags = i.tags.filter(t => t !== tag);
        fUpdateResponse(i.id, { tags: newTags });
        return { ...i, tags: newTags };
      });
      return updated;
    });

    setEditingTags(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
  };

  const filtered = useMemo(() => {
    let result = [...response];

    if (!sortDate && !sortName && !sortFavorites) {
      result.sort((a, b) => a.id - b.id);
    }

    if (sortFavorites) {
      result = result.filter((it) => it.favorited);
    }

    if (sortDate) {
      result = [...result].sort((a, b) =>
        sortDate === "desc"
          ? new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
          : new Date(a.updatedAt ?? a.createdAt).getTime() -
          new Date(b.updatedAt ?? b.createdAt).getTime()
      );
    }

    if (sortName) {
      result = [...result].sort((a, b) => {
        const qa = a.response || "";
        const qb = b.response || "";
        return sortName === "asc"
          ? qa.localeCompare(qb, "pt-BR", { sensitivity: "base" })
          : qb.localeCompare(qa, "pt-BR", { sensitivity: "base" });
      });
    }

    if (query.trim()) {
      result = result.filter(
        (it) =>
          it.question.toLowerCase().includes(query.toLowerCase()) ||
          it.response.toLowerCase().includes(query.toLowerCase()) ||
          it.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      );
    }

    return result;
  }, [response, sortFavorites, sortDate, sortName, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setEditingModal(null); setEditingTags(null); }
      if (e.key === 'Enter' && editingModal) { e.preventDefault(); saveEdit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingModal, saveEdit]);

  return (
    <>
      <Header title={t("user-data.h-title")} />

      <TopBar>
        <Title>AL</Title>

        <CenterControls>
          <Segmented>

            {/* Sort Date */}
            <SegBtn
              $active={!!sortDate}
              aria-pressed={!!sortDate}
              onClick={() => {
                if (sortDate === "desc") setSortDate("asc");
                else if (sortDate === "asc") setSortDate(null);
                else setSortDate("desc");
                setSortName(null);
              }}
              title={
                sortDate === "desc"
                  ? t("user-data.t-date-desc")
                  : sortDate === "asc"
                    ? t("user-data.t-date-asc")
                    : t("user-data.t-date-off")
              }
            >
              <FiCalendar />
              {sortDate === "desc" ? <FiChevronDown /> : sortDate === "asc" ? <FiChevronUp /> : null}
            </SegBtn>

            {/* Sort Name */}
            <SegBtn
              $active={!!sortName}
              aria-pressed={!!sortName}
              onClick={() => {
                if (sortName === "asc") setSortName("desc");
                else if (sortName === "desc") setSortName(null);
                else setSortName("asc");
                setSortDate(null);
              }}
              title={
                sortName === "asc"
                  ? t("user-data.t-name-asc")
                  : sortName === "desc"
                    ? t("user-data.t-name-desc")
                    : t("user-data.t-name-off")
              }
            >
              <FiType />
              {sortName === "asc" ? <FiChevronUp /> : sortName === "desc" ? <FiChevronDown /> : null}
            </SegBtn>

            {/* Sort Favorites */}
            <StarSegBtn
              $active={sortFavorites}
              aria-pressed={sortFavorites}
              onClick={() => setSortFavorites((prev) => !prev)}
              title={t("user-data.t-favorites")}
            >
              <FiStar />
            </StarSegBtn>
          </Segmented>
        </CenterControls>

        <RightTopBar>
          <SearchInput
            placeholder={t("user-data.i-search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
          />
          <SettingsButton onClick={() => sendRenderer["open-settings"]()}>
            <FiSettings />
          </SettingsButton>
        </RightTopBar>
      </TopBar>



      <Container>
        {filtered.length === 0 && (
          <EmptyState>{t("user-data.e-empty")}</EmptyState>
        )}

        {filtered.map((it) => (
          <ResponseCard key={it.id}>
            <Question>{it.question}</Question>
            <Response>{it.response}</Response>
            <CardFooter>
              <MetaInfo>
                <span>{formatDate(it.updatedAt)}</span>
                {it.tags.map(tag => (
                  <Tag key={tag}><FiTag size={12} /> {tag}</Tag>
                ))}
                {it.tags.length === 0 && <Tag><FiTag size={12} /> {t("user-data.l-no-tag")}</Tag>}
              </MetaInfo>
              <Actions>
                <StarButton
                  $favorited={it.favorited}
                  onClick={() => toggleFavorite(it.id)}
                  title={it.favorited ? t("user-data.b-unfavorite") : t("user-data.b-favorite")}
                >
                  <FiStar />
                </StarButton>
              </Actions>
            </CardFooter>

            <MenuButton aria-label="menu" onClick={() => setOpenMenuId(prev => prev === it.id ? null : it.id)}>
              <FiMoreVertical />
            </MenuButton>

            {openMenuId === it.id && (
              <Popover ref={popoverRef}>
                <PopItem onClick={() => startEdit(it)}><FiEdit2 /> {t("user-data.m-edit")}</PopItem>
                <PopItem onClick={() => startTagManage(it)}><FiTag /> {t("user-data.m-add-remove-tags")}</PopItem>
                <Divider />
                <PopItem onClick={() => deleteItem(it.id)}><FiTrash2 color="#ff8a8a" /> {t("user-data.m-delete")}</PopItem>
              </Popover>
            )}
          </ResponseCard>
        ))}
      </Container>

      {editingModal && (
        <Backdrop onClick={() => setEditingModal(null)}>
          <EditModalCard onClick={(e) => e.stopPropagation()}>
            <EditModalTitle>{t("user-data.edit-modal-title")}</EditModalTitle>

            <EditModalBody>
              <EditField>
                <EditLabel>{t("user-data.edit-question-label")}</EditLabel>
                <EditInput
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  maxLength={inputMaxLength.question}
                />
              </EditField>

              <EditField>
                <EditLabel>{t("user-data.edit-answer-label")}</EditLabel>
                <EditTextArea
                  value={editResponse}
                  onChange={(e) => setEditResponse(e.target.value)}
                  maxLength={inputMaxLength.response}
                />
              </EditField>
            </EditModalBody>

            <EditModalActions>
              <Button onClick={() => setEditingModal(null)}>{t("user-data.edit-cancel")}</Button>
              <Button variant='primary' onClick={saveEdit}>{t("user-data.edit-save")}</Button>
            </EditModalActions>
          </EditModalCard>
        </Backdrop>
      )}

      {editingTags && (
        <Backdrop onClick={() => setEditingTags(null)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalClose onClick={() => setEditingTags(null)} />

            <ModalTitle>{t("user-data.tags-modal-title")}</ModalTitle>

            <ModalTags>
              {editingTags.tags.length === 0 &&
                <TagPill>
                  <FiTag size={12} /> {t("user-data.tags-none")}
                </TagPill>
              }
              {editingTags.tags.map(tag => (
                <TagPill key={tag}>
                  <FiTag size={12} /> {tag}
                  <SmallIconBtn title={t("user-data.tags-remove")} onClick={() => removeTagFromItem(tag)}>
                    <FiTrash2 size={12} />
                  </SmallIconBtn>
                </TagPill>
              ))}
            </ModalTags>

            <Row>
              <TextInput
                placeholder={t("user-data.tags-new")}
                maxLength={inputMaxLength.tag}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (editingTags.tags.length < 5 && e.key === 'Enter') addTagToItem(); }}
              />
              <Button variant='primary' onClick={addTagToItem} disabled={editingTags.tags.length >= 5}>
                {t("user-data.tags-add")}
              </Button>
            </Row>
          </ModalCard>
        </Backdrop>
      )}
    </>
  )
}

export default UserData;