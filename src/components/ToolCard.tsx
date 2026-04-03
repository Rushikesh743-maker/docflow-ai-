import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: "primary" | "accent" | "warm";
  delay?: number;
}

const gradientMap = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  warm: "gradient-warm",
};

const ToolCard = ({ title, description, icon: Icon, href, gradient, delay = 0 }: ToolCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Link to={href}>
        <div className="tool-card bg-card group">
          <div className={`w-12 h-12 rounded-xl ${gradientMap[gradient]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ToolCard;
