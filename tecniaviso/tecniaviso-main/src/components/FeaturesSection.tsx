import React from "react";
import { motion } from "framer-motion";
import { FeatureCard } from "@/components/ui/feature-card";
import { MessageCircle, ClipboardList, Bell } from "lucide-react";

const features = [
  {
    icon: <ClipboardList size={18} />,
    title: "Registra reparaciones",
    description:
      "Anota el equipo, cliente y teléfono en segundos. Todo queda guardado y organizado.",
  },
  {
    icon: <Bell size={18} />,
    title: "Marca como listo",
    description:
      "Con un toque cambias el estado del equipo a 'listo para recoger' y el aviso se prepara al instante.",
  },
  {
    icon: <MessageCircle size={18} />,
    title: "WhatsApp automático",
    description:
      "El cliente recibe un mensaje de WhatsApp sin que tengas que escribir ni llamar. Cero esfuerzo.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const FeaturesSection = () => {
  return (
    <div className="mb-7">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
        ¿Cómo funciona?
      </p>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeaturesSection;
