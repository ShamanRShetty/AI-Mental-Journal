import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type TFn = (key: any) => any;

type LinkInfo = { name: string; url: string };
type CountryInfo = { links: ReadonlyArray<LinkInfo> };

export default function ResourcesSection({
  t: _t,
  activeCountry,
}: {
  t: TFn;
  activeCountry: CountryInfo;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crisis Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeCountry.links.map((link, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{link.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{link.url}</p>
              </div>
              <Button onClick={() => window.open(link.url, "_blank", "noopener")} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>International Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Find a Helpline (IASP)</h4>
              <p className="text-sm text-gray-600">Global directory of crisis helplines</p>
            </div>
            <Button onClick={() => window.open("https://findahelpline.com", "_blank", "noopener")} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}