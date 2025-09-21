import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

type Props = {
  entries: Array<{ _id: any; _creationTime: number; text: string }> | undefined;
};

export default function RecentEntries({ entries }: Props) {
  if (!entries || entries.length === 0) return null;

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">
          Recent Entries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {entries.slice(0, 5).map((entry) => (
            <div key={String(entry._id)} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                {new Date(entry._creationTime).toLocaleDateString()}
              </p>
              <p className="text-gray-800 text-sm line-clamp-3">{entry.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}