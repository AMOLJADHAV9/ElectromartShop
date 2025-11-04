import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  productCount: number;
  color: "blue" | "orange" | "green" | "purple";
}

export default function CategoryCard({
  name,
  icon,
  description,
  productCount,
  color,
}: CategoryCardProps) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <Link to={`/products?category=${name.toLowerCase()}`}>
      <div
        className={`${colorMap[color]} border rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
        </div>

        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <p className="text-sm opacity-75 mb-3">{description}</p>

        <p className="text-xs font-semibold opacity-60">
          {productCount} products
        </p>
      </div>
    </Link>
  );
}
