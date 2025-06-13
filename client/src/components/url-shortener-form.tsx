import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link2, Copy, ExternalLink } from "lucide-react";

const urlSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  customCode: z.string().optional(),
  tags: z.string().optional(),
  expiresAt: z.string().optional(),
});

type UrlFormData = z.infer<typeof urlSchema>;

export default function URLShortenerForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const form = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      originalUrl: "",
      customCode: "",
      tags: "",
      expiresAt: "",
    },
  });

  const shortenMutation = useMutation({
    mutationFn: async (data: UrlFormData) => {
      const response = await apiRequest("POST", "/api/shorten", data);
      return response.json();
    },
    onSuccess: (data) => {
      setShortenedUrl(data.shortUrl);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "URL shortened successfully!",
        description: "Your short link is ready to use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to shorten URL",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UrlFormData) => {
    shortenMutation.mutate(data);
  };

  const handleCopyLink = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      });
    }
  };

  return (
    <div className="mb-8">
      <Card className="border border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-medium text-slate-900">Create Short Link</CardTitle>
          <p className="text-sm text-slate-600">Generate a shortened URL with optional customization</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="originalUrl" className="text-sm font-medium text-slate-700">
                  Original URL
                </Label>
                <Input
                  id="originalUrl"
                  type="url"
                  placeholder="https://example.com/very-long-url"
                  {...form.register("originalUrl")}
                  className="mt-1"
                />
                {form.formState.errors.originalUrl && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.originalUrl.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="customCode" className="text-sm font-medium text-slate-700">
                  Custom Short Code (Optional)
                </Label>
                <Input
                  id="customCode"
                  placeholder="my-link"
                  {...form.register("customCode")}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="tags" className="text-sm font-medium text-slate-700">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="marketing, social, campaign"
                  {...form.register("tags")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="expiresAt" className="text-sm font-medium text-slate-700">
                  Expiry Date (Optional)
                </Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  {...form.register("expiresAt")}
                  className="mt-1"
                />
              </div>
            </div>
            
            {shortenedUrl && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Your shortened URL:</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <code className="text-sm text-green-700 bg-white px-2 py-1 rounded border">
                        {shortenedUrl}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Test
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={shortenMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <Link2 className="mr-2 h-4 w-4" />
                {shortenMutation.isPending ? "Shortening..." : "Shorten URL"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
