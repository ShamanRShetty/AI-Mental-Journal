import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  currentReflection: string | null;
};

export default function ReflectionPanel({ currentReflection }: Props) {
  return (
    <Card className="shadow-lg h-fit">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          AI Reflection
        </CardTitle>
        <p className="text-gray-600">
          Receive empathetic insights about your journal entry.
        </p>
      </CardHeader>
      <CardContent>
        {currentReflection ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"
          >
            <p className="text-gray-800 leading-relaxed">{currentReflection}</p>
          </motion.div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-lg text-center">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Submit a journal entry to receive your personalized reflection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
