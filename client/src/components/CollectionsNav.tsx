import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Sparkles } from "lucide-react";

export function CollectionsNav() {
  const { data: collections = [] } = trpc.collections.listPublished.useQuery();
  
  if (collections.length === 0) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          Collections
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {collections.map((collection: any) => (
          <DropdownMenuItem key={collection.id} asChild>
            <Link href={`/collections/${collection.slug}`} className="cursor-pointer">
              <div>
                <div className="font-medium">{collection.name}</div>
                {collection.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {collection.description}
                  </div>
                )}
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
