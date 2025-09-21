import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  onOpenCrisisSupport: () => void;
  onDismiss: () => void;
};

export default function CrisisAlertBanner({ onOpenCrisisSupport, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">We're here for you</h3>
              <p className="text-orange-800 mb-4">
                It sounds like you're going through a difficult time. Remember that you're not alone, and help is available.
              </p>
              <div className="space-y-2 text-sm mb-4">
                <p><strong>Emergency (India):</strong> 112</p>
                <p><strong>Vandrevala Foundation (24x7):</strong> 9152987821</p>
                <p><strong>Global Directory:</strong> findahelpline.com</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  size="sm"
                  onClick={onOpenCrisisSupport}
                  className="bg-red-600 hover:bg-red-700 whitespace-normal break-words text-center flex-wrap"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Open Crisis Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('tel:112')}
                  className="whitespace-normal break-words text-center flex-wrap"
                >
                  Call Emergency (112)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('tel:9152987821')}
                  className="whitespace-normal break-words text-center flex-wrap"
                >
                  Call Crisis Line (9152987821)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDismiss}
                  className="whitespace-normal break-words text-center flex-wrap"
                >
                  I understand
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
