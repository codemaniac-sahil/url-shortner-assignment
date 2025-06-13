import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, Copy, Edit, Trash2, Download, Link2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { UrlWithStats } from "@shared/schema";

interface LinksTableProps {
  searchQuery: string;
}

export default function LinksTable({ searchQuery }: LinksTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string>("all-tags");

  const { data: urls, isLoading } = useQuery({
    queryKey: ['/api/urls'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/urls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/s/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short URL copied to clipboard",
    });
  };

  const handleDeleteLink = (id: number) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredUrls = urls ? urls.filter((url: UrlWithStats) => {
    const matchesSearch = searchQuery === "" || 
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === "all-tags" || 
      (url.tags && url.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase()));
    
    return matchesSearch && matchesTag;
  }) : [];

  // Get all unique tags for filter
  const allTags = urls ? urls.flatMap((url: UrlWithStats) => url.tags || []) : [];
  const uniqueTags = Array.from(new Set(allTags));

  if (isLoading) {
    return (
      <Card className="border border-slate-200 shadow-sm rounded-xl mb-8">
        <CardHeader>
          <CardTitle>Loading links...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl mb-8">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-slate-900">Recent Links</CardTitle>
            <p className="text-sm text-slate-600">Manage and analyze your shortened URLs</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-tags">All Tags</SelectItem>
                {uniqueTags.map((tag: string) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Original URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Unique
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUrls?.map((url: UrlWithStats) => (
                <tr key={url.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                          <Link2 className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{url.shortCode}</div>
                        <div className="text-sm text-slate-500">
                          {window.location.origin}/s/{url.shortCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-xs truncate">
                      {url.originalUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {url.tags && url.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {url.totalVisits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {url.uniqueVisitors.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {format(new Date(url.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {url.expiresAt ? format(new Date(url.expiresAt), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link href={`/analytics/${url.shortCode}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-600"
                        onClick={() => handleCopyLink(url.shortCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteLink(url.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUrls?.length === 0 && (
          <div className="text-center py-12">
            <Link2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No links found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery || selectedTag ? "Try adjusting your filters" : "Get started by creating your first short link"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
