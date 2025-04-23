export type NoteItemData = {
    id: string;
    title: string;
    date: string;
    lectureUrl: string;
    imgSrc: string;
    bookmark: boolean;
}

export type DeletedNoteItemData = {
    id: string;
    title: string;
    deadline: number;
}

export type NoteData = {
  id: string;
  title: string;
  date: string;
  content: any[];
  lectureUrl?: string;
}

export type FileNode = {
  title: string;
  id?: string;
  data?: FileNode[];
  isNote: boolean;
};