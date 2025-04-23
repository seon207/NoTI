import { DeletedNoteItemData, FileNode, NoteItemData } from "@/types/noteType";

export const noteList: Array<NoteItemData> = [
    {
        id: "1",
        title: "김픽셀과 함께 픽셀 그래픽 만들기",
        date: "2044-04-04",
        lectureUrl: "https://youtu.be/DHEOF_rcND8?si=1P_n7XlnvUP50lcm",
        imgSrc: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_656/b_white/f_auto/q_auto/ncom/software/switch/70010000068673/94e7e930658b4970c3e98eeb8f8fff34de4b43067874c1968a607bc2c78bfd9d",
        bookmark: false
    },
    {
        id: "2",
        title: "이화상과 함께 화상 화면에 그리기",
        date: "2044-04-04",
        lectureUrl: "https://youtu.be/DHEOF_rcND8?si=1P_n7XlnvUP50lcm",
        imgSrc: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_656/b_white/f_auto/q_auto/ncom/software/switch/70010000068673/94e7e930658b4970c3e98eeb8f8fff34de4b43067874c1968a607bc2c78bfd9d",
        bookmark: true
    },
    {
        id: "3",
        title: "박도트와 함께 도트 그래픽 다루기",
        date: "2044-04-04",
        lectureUrl: "https://youtu.be/DHEOF_rcND8?si=1P_n7XlnvUP50lcm",
        imgSrc: "https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_656/b_white/f_auto/q_auto/ncom/software/switch/70010000068673/94e7e930658b4970c3e98eeb8f8fff34de4b43067874c1968a607bc2c78bfd9d",
        bookmark: false
    }
]

export const deletedNoteList: Array<DeletedNoteItemData> = [
    {
        id: "4",
        title: "멋지게 삭제 당하는 법",
        deadline: 20
    },
    {
        id: "5",
        title: "나는 살아남다",
        deadline: 4
    }
]

export const fileStructure: Array<FileNode> = [
    {
        title: "folder1",
        data: [
            {
                title: "folder1-1",
                data: [
                    {
                        title: "folder1-1-1",
                        data: [],
                        isNote: false
                    },
                    {
                        id: "1",
                        title: "노노트트",
                        isNote: true
                    }
                ],
                isNote: false
            },
            {
                id: "2",
                title: "nonotete",
                isNote: true
            }
        ],
        isNote: false
    },
    {
        id: "3",
        title: "노no트te",
        isNote: true
    }
]