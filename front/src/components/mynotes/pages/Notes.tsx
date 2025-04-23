import { noteList } from "@/mockdata/noteData";
import NoteItem from "../items/NoteItem";

export default function Notes() {
    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">내 노트</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {noteList.map((note) => (
                    <NoteItem
                        key={note.id}
                        note={note}
                    />
                ))}
            </div>
        </div>
    );
}