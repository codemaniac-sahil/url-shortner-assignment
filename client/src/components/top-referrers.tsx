import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitter, Facebook, MessageCircle, Globe, Linkedin } from "lucide-react";

// Mock data for top referrers
const topReferrers = [
  { name: 'Twitter', domain: 'twitter.com', clicks: 3247, percentage: 18.2, icon: Twitter, color: 'text-blue-500' },
  { name: 'Facebook', domain: 'facebook.com', clicks: 2891, percentage: 16.1, icon: Facebook, color: 'text-blue-600' },
  { name: 'WhatsApp', domain: 'whatsapp.com', clicks: 1567, percentage: 8.7, icon: MessageCircle, color: 'text-green-500' },
  { name: 'Direct', domain: 'direct access', clicks: 1234, percentage: 6.9, icon: Globe, color: 'text-slate-500' },
  { name: 'LinkedIn', domain: 'linkedin.com', clicks: 987, percentage: 5.5, icon: Linkedin, color: 'text-blue-700' },
];

export default function TopReferrers() {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-medium text-slate-900">Top Referrers</CardTitle>
        <p className="text-sm text-slate-600">Traffic sources for your links</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {topReferrers.map((referrer) => (
            <div key={referrer.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <referrer.icon className={`h-4 w-4 ${referrer.color}`} />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{referrer.name}</p>
                  <p className="text-xs text-slate-500">{referrer.domain}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{referrer.clicks.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{referrer.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
