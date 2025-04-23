import Link from "next/link";

interface SelectionCardProps {
  imgSrc: string;
  title: string;
  description: string;
  onClick: string;
}

export default function SelectionCard(props: SelectionCardProps) {
  return (
    <Link href={props.onClick} className="block">
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 w-64 mx-4">
        <div className="w-full h-40 mb-4 overflow-hidden rounded-md">
          <img 
            src={props.imgSrc} 
            alt={props.title}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{props.title}</h3>
        <p className="text-gray-600">{props.description}</p>
      </div>
    </Link>
  );
}