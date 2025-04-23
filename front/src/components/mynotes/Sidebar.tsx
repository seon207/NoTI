import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { FileNode } from "@/types/noteType";

interface SidebarProps {
  activeComponent: string;
  setActiveComponent: Dispatch<SetStateAction<string>>;
}

// 폴더 아이콘 컴포넌트
function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return <svg 
    className="w-5 h-5 mr-2" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {isOpen ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    )}
  </svg>
}

// 노트 아이콘 컴포넌트
function NoteIcon() {
  return <svg 
    className="w-5 h-5 mr-2" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
}

// 재귀적으로 파일 구조를 표시하는 컴포넌트
function FileTreeItem({ node, depth = 0, handleFileClick }: { 
  node: FileNode; 
  depth?: number; 
  // eslint-disable-next-line no-unused-vars
  handleFileClick: (id: string | undefined, isNote: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.data && node.data.length > 0;
  
  const toggleFolder = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <li>
      <button
        onClick={() => {
          if (node.isNote) {
            handleFileClick(node.id, true);
          } else {
            toggleFolder();
          }
        }}
        className={`flex items-center w-full px-6 py-2 text-left text-gray-600 hover:bg-gray-50`}
        style={{ paddingLeft: `${24 + depth * 16}px` }}
      >
        {node.isNote ? <NoteIcon /> : <FolderIcon isOpen={isOpen} />}
        <span>{node.title}</span>
      </button>
      
      {hasChildren && isOpen && (
        <ul>
          {node.data?.map((childNode, index) => (
            <FileTreeItem 
              key={childNode.id || `${childNode.title}-${index}`} 
              node={childNode} 
              depth={depth + 1}
              handleFileClick={handleFileClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar(props: SidebarProps) {
  const router = useRouter();
  
  // 파일 구조 데이터 예시
  const fileStructure: Array<FileNode> = [
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
  ];

  const menuItems = [
    { id: 'recentNotes', label: '홈'},
    { id: 'bookmarks', label: '북마크' },
    { id: 'quizzes', label: '퀴즈' },
    { id: 'recentlyDeleted', label: '최근 삭제된 내역' }
  ];

  const handleFileClick = (id: string | undefined, isNote: boolean) => {
    if (isNote && id) {
      router.push(`/note/${id}`);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">NoTI</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => props.setActiveComponent(item.id)}
                className={`flex items-center w-full px-6 py-3 text-left ${
                  props.activeComponent === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-6 border-t border-gray-200">
        <h2 className="px-6 py-3 text-sm font-medium text-gray-500">내 파일</h2>
        <ul>
          {fileStructure.map((node, index) => (
            <FileTreeItem 
              key={node.id || `${node.title}-${index}`} 
              node={node} 
              handleFileClick={handleFileClick}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}